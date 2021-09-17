// React Imports
import React, { Component } from 'react';
import {connect} from "react-redux";
// Internationalization
import T from 'i18n-react';
// Data Hooks
import { searchEntities, getEntityMetadata, regionalSignalsTableSummaryDataAction, asnSignalsTableSummaryDataAction } from "../../data/ActionEntities";
import { getTopoAction } from "../../data/ActionTopo";
import { getDatasourcesAction } from "../../data/ActionDatasources";
import {searchAlerts, searchEvents, searchRelatedToMapSummary, searchRelatedToTableSummary, totalOutages} from "../../data/ActionOutages";
import {getSignalsAction,
    getRawRegionalSignalsPingSlash24Action,
    getRawRegionalSignalsBgpAction,
    getRawRegionalSignalsUcsdNtAction,
    getRawAsnSignalsPingSlash24Action,
    getRawAsnSignalsBgpAction,
    getRawAsnSignalsUcsdNtAction,
    getAdditionalRawSignalAction
} from "../../data/ActionSignals";
// Components
import ControlPanel from '../../components/controlPanel/ControlPanel';
import { Searchbar } from 'caida-components-library'
import Loading from "../../components/loading/Loading";
import ToggleButton from "../../components/toggleButton/ToggleButton";
import TimeStamp from "../../components/timeStamp/TimeStamp";
import Tooltip from "../../components/tooltip/Tooltip";

// Helper Functions
import {
    convertSecondsToDateValues,
    humanizeNumber,
    toDateTime,
    convertValuesForSummaryTable,
    combineValuesForSignalsTable,
    convertTsDataForHtsViz,
    getOutageCoords,
    dateRangeToSeconds,
    normalize,
    secondsToDhms,
    controlPanelTimeRangeLimit,
    alertBandColor,
    xyChartBackgroundLineColor,
    bgpColor,
    activeProbingColor,
    ucsdNtColor,
    convertTimeToSecondsForURL, horizonChartSeriesColor
} from "../../utils";
import CanvasJSChart from "../../libs/canvasjs-non-commercial-3.2.5/canvasjs.react";
import Error from "../../components/error/Error";
import DashboardTab from "../dashboard/DashboardTab";
import {Helmet} from "react-helmet";


class ChartShare extends Component {
    constructor(props) {
        super(props);
        this.state = {
            // Global
            mounted: false,
            entityType: window.location.pathname.split("/")[2],
            entityCode: window.location.pathname.split("/")[3],
            entityName: "",
            parentEntityName: "",
            parentEntityCode: "",
            displayTimeRangeError: false,
            // Data Sources Available
            dataSources: null,
            // Control Panel
            from: window.location.search.split("?")[1]
                ? convertTimeToSecondsForURL(window.location.search.split("?")[1].split("&")[0].split("=")[1])
                : Math.round((new Date().getTime()  - (24 * 60 * 60 * 1000)) / 1000),
            until: window.location.search.split("?")[1]
                ? convertTimeToSecondsForURL(window.location.search.split("?")[1].split("&")[1].split("=")[1])
                : Math.round(new Date().getTime() / 1000),
            // Search Bar
            suggestedSearchResults: null,
            searchTerm: "",
            lastFetched: 0,
            // XY Plot Time Series
            xyDataOptions: null,
            tsDataRaw: null,
            tsDataNormalized: true,
            tsDataDisplayOutageBands: true,
            tsDataLegendRangeFrom: window.location.search.split("?")[1]
                ? convertTimeToSecondsForURL(window.location.search.split("?")[1].split("&")[0].split("=")[1])
                : Math.round((new Date().getTime()  - (24 * 60 * 60 * 1000)) / 1000),
            tsDataLegendRangeUntil: window.location.search.split("?")[1]
                ? convertTimeToSecondsForURL(window.location.search.split("?")[1].split("&")[1].split("=")[1])
                : Math.round(new Date().getTime() / 1000),
            // Used for responsively styling the xy chart
            tsDataScreenBelow970: window.innerWidth <= 970,
            tsDataScreenBelow640: window.innerWidth <= 640,
            // Used to track which series have visibility, needed for when switching between normalized/absolute values to maintain state
            tsDataSeriesVisiblePingSlash24: true,
            tsDataSeriesVisibleBgp: true,
            tsDataSeriesVisibleUcsdNt: true,
        };
        this.handleTimeFrame = this.handleTimeFrame.bind(this);
        // this.handleEntityClick = this.handleEntityClick.bind(this);
    }

    componentDidMount() {
        console.log("update4");
        // Monitor screen width
        window.addEventListener("resize", this.resize.bind(this));

        // Check if time parameters are provided
        if (window.location.search) {
            let providedFrom = window.location.search.split("&")[0].split("=")[1];
            let providedUntil = window.location.search.split("&")[1].split("=")[1];

            let newFrom = convertTimeToSecondsForURL(providedFrom);
            let newUntil = convertTimeToSecondsForURL(providedUntil);

            if (newUntil - newFrom > 0) {
                this.setState({
                    from: newFrom,
                    until: newUntil
                });

                this.setState({
                    mounted: true
                },() => {
                    if (this.state.until - this.state.from < controlPanelTimeRangeLimit) {
                        this.props.getSignalsAction(window.location.pathname.split("/")[2], window.location.pathname.split("/")[3], this.state.from, this.state.until, null, 3000);
                        this.props.getEntityMetadataAction(window.location.pathname.split("/")[2], window.location.pathname.split("/")[3]);
                    }
                });
            } else {
                this.setState({
                    displayTimeRangeError: true
                });
            }
        } else {
            this.setState({
                mounted: true,
            },() => {
                if (this.state.until - this.state.from < controlPanelTimeRangeLimit) {
                    this.props.getSignalsAction(window.location.pathname.split("/")[2], window.location.pathname.split("/")[3], this.state.from, this.state.until, null, 3000);
                    this.props.getEntityMetadataAction(window.location.pathname.split("/")[2], window.location.pathname.split("/")[3]);
                }
            });
        }
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.resize.bind(this));
        this.setState({
            mounted: false
        })
    }

    componentDidUpdate(prevProps, prevState) {
        // After API call for available data sources completes, update dataSources state with fresh data
        if (this.props.datasources !== prevProps.datasources) {
            this.setState({
                dataSources: this.props.datasources
            });
        }

        // After API call for getting entity name from url
        if (this.props.entityMetadata !== prevProps.entityMetadata) {
            this.props.entityMetadata.length && this.setState({
                entityName: this.props.entityMetadata[0]["name"],
                parentEntityName: this.props.entityMetadata[0]["attrs"]["country_name"] ? this.props.entityMetadata[0]["attrs"]["country_name"] : this.state.parentEntityName,
                parentEntityCode: this.props.entityMetadata[0]["attrs"]["country_code"] ? this.props.entityMetadata[0]["attrs"]["country_code"] : this.state.parentEntityCode
            });
        }

        // After API call for suggested search results completes, update suggestedSearchResults state with fresh data
        if (this.props.suggestedSearchResults !== prevProps.suggestedSearchResults) {
            this.setState({
                suggestedSearchResults: this.props.suggestedSearchResults
            });
        }

        // Make API call for data to populate XY Chart
        if (this.props.signals !== prevProps.signals) {
            // Map props to state and initiate data processing
            this.setState({
                tsDataRaw: this.props.signals
            }, () => {
                // For XY Plotted Graph
                this.convertValuesForXyViz();
            })
        }
    }

// Global reset State function, called whenever a link that's destination also uses the entity page template is used
// - an entity name is clicked from the summary/signals table
// - an entity name is clicked/hit ENTER from the searchbar drop down
// - the time range input is updated with new values
// - an entity is clicked on from the map
    handleStateReset(resetType, range, entityType, entityCode) {
        switch (resetType) {
            case "newTimeFrame":
                this.setState({
                    from: range[0],
                    until: range[1],
                    displayTimeRangeError: false,
                    // XY Plot Time Series states
                    xyDataOptions: null,
                    tsDataRaw: null,
                    tsDataNormalized: true,
                    tsDataDisplayOutageBands: true,
                    tsDataLegendRangeFrom: range[0],
                    tsDataLegendRangeUntil: range[1],
                    // Search Bar
                    suggestedSearchResults: null,
                    searchTerm: "",
                    lastFetched: 0
                }, () => {
                    this.props.getSignalsAction( this.state.entityType, this.state.entityCode, this.state.from, this.state.until, null, null);
                });
                break;
            case "newEntity":
                this.setState({
                    mounted: false,
                    entityType: entityType,
                    entityCode: entityCode,
                    entityName: "",
                    parentEntityName: "",
                    parentEntityCode: "",
                    // Search Bar
                    suggestedSearchResults: null,
                    searchTerm: "",
                    lastFetched: 0,
                    // XY Plot Time Series states
                    xyDataOptions: null,
                    tsDataRaw: null,
                    tsDataNormalized: true,
                    tsDataDisplayOutageBands: true,
                }, () => {
                    window.scrollTo(0, 0);
                    this.componentDidMount();
                });
                break
        }
    }

// Control Panel
    // manage the date selected in the input
    handleTimeFrame(dateRange, timeRange) {
        const range = dateRangeToSeconds(dateRange, timeRange);
        const { history } = this.props;
        history.push(`/chart/${this.state.entityType}/${this.state.entityCode}?from=${range[0]}&until=${range[1]}`);
        this.handleStateReset("newTimeFrame", range, null, null);
    }
// Search bar
    // get data for search results that populate in suggested search list
    getDataSuggestedSearchResults(searchTerm) {
        if (this.state.mounted) {
            // Set searchTerm to the value of nextProps, nextProps refers to the current search string value in the field.
            this.setState({ searchTerm: searchTerm });
            // Make api call
            if (searchTerm.length >= 2 && (new Date() - new Date(this.state.lastFetched)) > 0) {
                this.setState({
                    lastFetched: Date.now()
                }, () => {
                    this.props.searchEntitiesAction(searchTerm, 11);
                })
            }
        }
    }
    // Define what happens when user clicks suggested search result entry
    handleResultClick = (query) => {
        const { history } = this.props;
        let entity;
        typeof query === 'object' && query !== null
            ? entity = this.state.suggestedSearchResults.filter(result => {
                return result.name === query.name
            })
            : entity = this.state.suggestedSearchResults.filter(result => {
                return result.name === query
            });
        entity = entity[0];
        history.push(`/chart/${entity.type}/${entity.code}`);
        this.handleStateReset("newEntity", null, entity.type, entity.code);
    };
    // Reset search bar with search term value when a selection is made, no customizations needed here.
    handleQueryUpdate = (query) => {
        this.forceUpdate();
        this.setState({
            searchTerm: query
        });
    }
    // Function that returns search bar passed into control panel
    populateSearchBar() {
        return <Searchbar placeholder={T.translate("controlPanel.searchBarPlaceholder")}
                          getData={this.getDataSuggestedSearchResults.bind(this)}
                          itemPropertyName={'name'}
                          handleResultClick={(event) => this.handleResultClick(event)}
                          searchResults={this.state.suggestedSearchResults}
                          handleQueryUpdate={this.handleQueryUpdate}
                          searchTerm={this.state.searchTerm}
        />
    }

// XY Chart Functions
    // XY Plot Graph Functions
    createXyVizDataObject(networkTelescopeValues, bgpValues, activeProbingValues) {
        let networkTelescope, bgp, activeProbing;
        const activeProbingLegendText = T.translate("entity.activeProbingLegendText");
        const bgpLegendText = T.translate("entity.bgpLegendText");
        const darknetLegendText = T.translate("entity.darknetLegendText");

        if (activeProbingValues) {
            activeProbing = {
                type: "line",
                lineThickness: 1,
                color: activeProbingColor,
                lineColor: activeProbingColor,
                markerType: "circle",
                markerSize: 2,
                name: activeProbingLegendText,
                visible: this.state.tsDataSeriesVisiblePingSlash24,
                showInLegend: true,
                xValueFormatString: "DDD, MMM DD - HH:mm",
                yValueFormatString: "0",
                dataPoints: activeProbingValues,
                legendMarkerColor: activeProbingColor,
                toolTipContent: this.state.tsDataNormalized ? "{x} <br/> {name}: {y}%" : "{x} <br/> {name}: {y}"

            }
        }
        if (bgpValues) {
            bgp = {
                type: "line",
                lineThickness: 1,
                color: bgpColor,
                lineColor: bgpColor,
                markerType: "circle",
                markerSize: 2,
                name: bgpLegendText,
                visible: this.state.tsDataSeriesVisibleBgp,
                showInLegend: true,
                xValueFormatString: "DDD, MMM DD - HH:mm",
                yValueFormatString: "0",
                dataPoints: bgpValues,
                legendMarkerColor: bgpColor,
                toolTipContent: this.state.tsDataNormalized ? "{x} <br/> {name}: {y}%" : "{x} <br/> {name}: {y}"
            }
        }
        if (networkTelescopeValues) {
            networkTelescope = {
                type: "line",
                lineThickness: 1,
                color: ucsdNtColor,
                lineColor: ucsdNtColor,
                markerType: "circle",
                markerSize: 2,
                name: darknetLegendText,
                visible: this.state.tsDataSeriesVisibleUcsdNt,
                axisYType: this.state.tsDataNormalized ? 'primary' : "secondary",
                showInLegend: true,
                xValueFormatString: "DDD, MMM DD - HH:mm",
                yValueFormatString: "0",
                dataPoints: networkTelescopeValues,
                legendMarkerColor: ucsdNtColor,
                toolTipContent: this.state.tsDataNormalized ? "{x} <br/> {name}: {y}%" : "{x} <br/> {name}: {y}"
            }
        }

        return [activeProbing, bgp, networkTelescope]
    }
    // function for when zoom/pan
    xyPlotRangeChanged(e) {
        // let beginningRangeDate = Math.floor(e.axisX[0].viewportMinimum / 1000);
        // let endRangeDate = Math.floor(e.axisX[0].viewportMaximum / 1000);

        if (Math.floor(e.axisX[0].viewportMinimum / 1000) !== 0 || Math.floor(e.axisX[0].viewportMaximum / 1000) !== 0) {
            this.setState({
                tsDataLegendRangeFrom: Math.floor(e.axisX[0].viewportMinimum / 1000),
                tsDataLegendRangeUntil: Math.floor(e.axisX[0].viewportMaximum / 1000)
            });
        } else {
            // case when hitting reset zoom, both values return 0 from event.
            this.setState({
                tsDataLegendRangeFrom: window.location.search.split("?")[1]
                    ? window.location.search.split("?")[1].split("&")[0].split("=")[1]
                    : Math.round((new Date().getTime()  - (24 * 60 * 60 * 1000)) / 1000),
                tsDataLegendRangeUntil: window.location.search.split("?")[1]
                    ? window.location.search.split("?")[1].split("&")[1].split("=")[1]
                    : Math.round(new Date().getTime() / 1000)
            });
        }
    }
    convertValuesForXyViz() {
        let networkTelescopeValues = [];
        let bgpValues = [];
        let activeProbingValues = [];
        let absoluteMax = [];
        let absoluteMaxY2 = 0;
        const xyChartXAxisTitle = T.translate("entity.xyChartXAxisTitle");

        // Loop through available datasources to collect plot points
        this.state.tsDataRaw[0].map(datasource => {
            let max;
            switch (datasource.datasource) {
                case "ucsd-nt":
                    max = Math.max.apply(null, datasource.values);
                    absoluteMax.push(max);
                    absoluteMaxY2 = max;
                    datasource.values && datasource.values.map((value, index) => {
                        let x, y;
                        x = toDateTime(datasource.from + (datasource.step * index));
                        y = this.state.tsDataNormalized ? normalize(value, max) : value;
                        networkTelescopeValues.push({x: x, y: y, color: ucsdNtColor});
                    });
                    // the last two values populating are the min value, and the max value. Removing these from the coordinates.
                    networkTelescopeValues.length > 2 ? networkTelescopeValues.splice(-1,2) : networkTelescopeValues;
                    break;
                case "bgp":
                    max = Math.max.apply(null, datasource.values);
                    absoluteMax.push(max);

                    datasource.values && datasource.values.map((value, index) => {
                        let x, y;
                        x = toDateTime(datasource.from + (datasource.step * index));
                        y = this.state.tsDataNormalized ? normalize(value, max) : value;
                        bgpValues.push({x: x, y: y, color: bgpColor});
                    });
                    // the last two values populating are the min value, and the max value. Removing these from the coordinates.
                    bgpValues.length > 2 ? bgpValues.splice(-1,2) : bgpValues;
                    break;
                case "ping-slash24":
                    max = Math.max.apply(null, datasource.values);
                    absoluteMax.push(max);

                    datasource.values && datasource.values.map((value, index) => {
                        let x, y;
                        x = toDateTime(datasource.from + (datasource.step * index));
                        y = this.state.tsDataNormalized ? normalize(value, max) : value;
                        activeProbingValues.push({x: x, y: y, color: activeProbingColor});
                    });
                    // the last two values populating are the min value, and the max value. Removing these from the coordinates.
                    activeProbingValues.length > 2 ? activeProbingValues.splice(-1,2) : activeProbingValues;
            }
        });

        // Create Alert band objects
        let stripLines = [];
        if (this.state.tsDataDisplayOutageBands) {
            this.state.eventDataRaw && this.state.eventDataRaw.map(event => {
                const stripLine = {
                    startValue: toDateTime(event.start),
                    endValue: toDateTime(event.start + event.duration),
                    color: alertBandColor,
                    opacity: .2
                };
                stripLines.push(stripLine);
            });
        }

        // get time span considered, using network telescope first as that data source has the most up to time data, then Ping-slash24, then bgp
        const timeBegin =
            networkTelescopeValues && networkTelescopeValues[0]
                ? networkTelescopeValues[0].x
                : activeProbingValues && activeProbingValues[0]
                ? activeProbingValues[0].x
                : bgpValues && bgpValues[0]
                    ? bgpValues[0].x
                    : window.location.search.split("?")[1]
                        ? new Date(window.location.search.split("?")[1].split("&")[0].split("=")[1])
                        : new Date(Math.round((new Date().getTime()  - (24 * 60 * 60 * 1000)) / 1000));
        const timeEnd =
            networkTelescopeValues && networkTelescopeValues[networkTelescopeValues.length -1]
                ? networkTelescopeValues[networkTelescopeValues.length -1].x
                : activeProbingValues && activeProbingValues[activeProbingValues.length -1]
                ? activeProbingValues[activeProbingValues.length -1].x
                : bgpValues && bgpValues[bgpValues.length -1]
                    ? bgpValues[bgpValues.length -1].x
                    : window.location.search.split("?")[1]
                        ? new Date(window.location.search.split("?")[1].split("&")[1].split("=")[1])
                        : new Date(Math.round(new Date().getTime() / 1000));
        // Add 1% padding to the right edge of the Chart
        const extraPadding = (timeEnd - timeBegin) * 0.01;
        const viewportMaximum = new Date(timeEnd.getTime() + extraPadding);

        activeProbingValues.push({x: viewportMaximum, y: null});
        bgpValues.push({x: viewportMaximum, y: null});
        networkTelescopeValues.push({x: viewportMaximum, y: null});

        // create top padding in chart area for normalized/absolute views
        const normalizedStripline = [
            {
                value: 110,
                color: xyChartBackgroundLineColor,
                lineDashType: "dash"
            }
        ];

        this.setState({
            xyDataOptions: {
                theme: "light2",
                height: this.state.tsDataScreenBelow640 ? 360 : 514,
                animationEnabled: true,
                zoomEnabled: true,
                rangeChanged: (e) => this.xyPlotRangeChanged(e),
                axisX: {
                    title: xyChartXAxisTitle,
                    stripLines: stripLines,
                    titleFontSize: 12,
                    labelFontSize: 10,
                    margin: 2,
                    crosshair: {
                        enabled: true,
                        snapToDataPoint: true,
                        lineDashType: "solid",
                        color: "#c5c5c5"
                    }
                },
                axisY: {
                    // title: "Active Probing and BGP",
                    titleFontsColor: "#666666",
                    labelFontColor: "#666666",
                    labelFontSize: 12,
                    minimum: 0,
                    maximum: this.state.tsDataNormalized ? 110 : Math.max.apply(null, absoluteMax) * 1.1,
                    gridDashType: "dash",
                    gridColor: "#E6E6E6",
                    stripLines: this.state.tsDataNormalized ? normalizedStripline : null,
                    labelFormatter: (event) => {
                        if (this.state.tsDataNormalized) {
                            return event.value <= 100 ? `${event.value}%` : ""
                        } else {
                            return event.value;
                        }
                    }
                },
                axisY2: {
                    // title: "Network Telescope",
                    titleFontsColor: "#666666",
                    labelFontColor: "#666666",
                    labelFontSize: 12,
                    maximum: this.state.tsDataNormalized ? 110 : absoluteMaxY2 * 1.1,
                },
                toolTip: {
                    shared: false,
                    enabled: true,
                    animationEnabled: true
                },
                legend: {
                    cursor: "pointer",
                    fontSize: this.state.tsDataScreenBelow640 ? 10 : 12,
                    verticalAlign: this.state.tsDataScreenBelow970 ? "top" : "bottom",
                    itemclick: (e) => {
                        // console.log("legend click: " + e.dataPointIndex);
                        // console.log(e);
                        // console.log(e.dataSeries.name);

                        // toggle series visibility
                        if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
                            e.dataSeries.visible = false;
                        } else {
                            e.dataSeries.visible = true;
                        }
                        // track state of which series are visible
                        const activeProbingLegendText = T.translate("entity.activeProbingLegendText");
                        const bgpLegendText = T.translate("entity.bgpLegendText");
                        const darknetLegendText = T.translate("entity.darknetLegendText");
                        switch (e.dataSeries.name) {
                            case activeProbingLegendText:
                                this.setState({ tsDataSeriesVisiblePingSlash24: e.dataSeries.visible }, e.chart.render());
                                break;
                            case bgpLegendText:
                                this.setState({ tsDataSeriesVisibleBgp: e.dataSeries.visible }, e.chart.render());
                                break;
                            case darknetLegendText:
                                this.setState({ tsDataSeriesVisibleUcsdNt: e.dataSeries.visible }, e.chart.render());
                                break;
                        }
                    }
                },
                data: this.createXyVizDataObject(networkTelescopeValues.length > 1 ? networkTelescopeValues : [], bgpValues.length > 1 ? bgpValues : [], activeProbingValues.length > 1 ? activeProbingValues : [])
            }
        }, () => {
            this.genXyChart();
        });
    }
    genXyChart() {
        return (
            this.state.xyDataOptions && <div className="overview__xy-wrapper">
                <CanvasJSChart options={this.state.xyDataOptions}
                               onRef={ref => this.chart = ref}
                />
                {/*You can get reference to the chart instance as shown above using onRef. This allows you to access all chart properties and methods*/}
            </div>
        );
    }
    changeXyChartNormalization() {
        this.setState({
            tsDataNormalized: !this.state.tsDataNormalized
        }, () => this.convertValuesForXyViz())
    }
    handleDisplayAlertBands() {
        this.setState({
            tsDataDisplayOutageBands: !this.state.tsDataDisplayOutageBands
        }, () => this.convertValuesForXyViz())
    }
    // Track screen width to shift around legend, adjust height of xy chart
    resize() {
        let tsDataScreenBelow970 = (window.innerWidth <= 970);
        if (tsDataScreenBelow970 !== this.state.tsDataScreenBelow970) {
            this.setState({
                tsDataScreenBelow970: tsDataScreenBelow970
            }, () => {
                let tsDataScreenBelow640 = (window.innerWidth <= 640);
                if (tsDataScreenBelow640 !== this.state.tsDataScreenBelow640) {

                    this.setState({
                        tsDataScreenBelow640: tsDataScreenBelow640
                    }, () => {
                        this.convertValuesForXyViz();
                    });
                }
            });
        }
    }


    render() {
        const xyChartTitle = T.translate("entity.xyChartTitle");
        const xyChartAlertToggleLabel = T.translate("entity.xyChartAlertToggleLabel");
        const xyChartNormalizedToggleLabel = T.translate("entity.xyChartNormalizedToggleLabel");
        const tooltipXyPlotTimeSeriesTitle = T.translate("tooltip.xyPlotTimeSeriesTitle.title");
        const tooltipXyPlotTimeSeriesText = T.translate("tooltip.xyPlotTimeSeriesTitle.text");
        const timeDurationTooHighErrorMessage = T.translate("dashboard.timeDurationTooHighErrorMessage");
        return(
            <div className="entity">
                <Helmet>
                    <title>IODA | Internet Outages for {this.state.entityName}</title>
                    <meta name="description" content={`Visualizations and Alerts for ${this.state.entityName} Internet Outages Detected by IODA`} />
                    <meta name="robots" content="noindex"/>
                </Helmet>
                <ControlPanel
                    from={this.state.from}
                    until={this.state.until}
                    timeFrame={this.handleTimeFrame}
                    searchbar={() => this.populateSearchBar()}
                    title={this.state.entityName}
                    history={this.props.history}
                />
                {
                    this.state.displayTimeRangeError
                        ? <Error/>
                        : this.state.until - this.state.from < controlPanelTimeRangeLimit
                        ? <React.Fragment>
                            <div className="row overview">
                                <div className="col-1-of-1">
                                    <div className="overview__config" ref={this.config}>
                                        <div className="overview__config-heading">
                                            <h3 className="heading-h3">
                                                {xyChartTitle}
                                                {this.state.entityName}
                                            </h3>
                                            <Tooltip
                                                title={tooltipXyPlotTimeSeriesTitle}
                                                text={tooltipXyPlotTimeSeriesText}
                                            />
                                        </div>
                                        <div className="overview__buttons">
                                            <ToggleButton
                                                selected={this.state.tsDataDisplayOutageBands}
                                                toggleSelected={() => this.handleDisplayAlertBands()}
                                                label={xyChartAlertToggleLabel}
                                            />
                                            <ToggleButton
                                                selected={this.state.tsDataNormalized}
                                                toggleSelected={() => this.changeXyChartNormalization()}
                                                label={xyChartNormalizedToggleLabel}
                                            />
                                        </div>
                                    </div>
                                    {
                                        this.state.xyDataOptions
                                            ? this.genXyChart()
                                            : <Loading/>
                                    }
                                    <div className="overview__timestamp">
                                        <TimeStamp from={convertSecondsToDateValues(this.state.tsDataLegendRangeFrom)}
                                                   until={convertSecondsToDateValues(this.state.tsDataLegendRangeUntil)} />
                                    </div>
                                </div>
                            </div>
                        </React.Fragment>
                        : <div className="row overview">
                            <div className="col-1-of-1">
                                <p className="overview__time-range-error">
                                    {timeDurationTooHighErrorMessage}
                                    {secondsToDhms(this.state.until - this.state.from)}.
                                </p>
                            </div>
                        </div>
                }
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        datasources: state.iodaApi.datasources,
        suggestedSearchResults: state.iodaApi.entities,
        relatedEntities: state.iodaApi.relatedEntities,
        entityMetadata: state.iodaApi.entityMetadata,
        relatedToMapSummary: state.iodaApi.relatedToMapSummary,
        relatedToTableSummary: state.iodaApi.relatedToTableSummary,
        topoData: state.iodaApi.topo,
        totalOutages: state.iodaApi.summaryTotalCount,
        events: state.iodaApi.events,
        alerts: state.iodaApi.alerts,
        signals: state.iodaApi.signals,
        mapModalSummary: state.iodaApi.mapModalSummary,
        mapModalTopoData: state.iodaApi.mapModalTopoData,
        regionalSignalsTableSummaryData: state.iodaApi.regionalSignalsTableSummaryData,
        asnSignalsTableSummaryData: state.iodaApi.asnSignalsTableSummaryData,
        rawRegionalSignalsPingSlash24: state.iodaApi.rawRegionalSignalsPingSlash24,
        rawRegionalSignalsBgp: state.iodaApi.rawRegionalSignalsBgp,
        rawRegionalSignalsUcsdNt: state.iodaApi.rawRegionalSignalsUcsdNt,
        rawAsnSignalsPingSlash24: state.iodaApi.rawRegionalSignalsPingSlash24,
        rawAsnSignalsBgp: state.iodaApi.rawRegionalSignalsBgp,
        rawAsnSignalsUcsdNt: state.iodaApi.rawRegionalSignalsUcsdNt,
        additionalRawSignal: state.iodaApi.additionalRawSignal
    }
};

const mapDispatchToProps = (dispatch) => {
    return {
        getDatasourcesAction: () => {
            getDatasourcesAction(dispatch);
        },
        searchEntitiesAction: (searchQuery, limit=15) => {
            searchEntities(dispatch, searchQuery, limit);
        },
        getEntityMetadataAction: (entityType, entityCode) => {
            getEntityMetadata(dispatch, entityType, entityCode);
        },
        searchEventsAction: (from, until, entityType, entityCode, datasource=null, includeAlerts=null, format=null, limit=null, page=null) => {
            searchEvents(dispatch, from, until, entityType, entityCode, datasource, includeAlerts, format, limit, page);
        },
        searchAlertsAction: (from, until, entityType, entityCode, datasource=null, limit=null, page=null) => {
            searchAlerts(dispatch, from, until, entityType, entityCode, datasource, limit, page);
        },
        getSignalsAction: (entityType, entityCode, from, until, datasource=null, maxPoints) => {
            getSignalsAction(dispatch, entityType, entityCode, from, until, datasource, maxPoints);
        },

        searchRelatedToMapSummary: (from, until, entityType, relatedToEntityType, relatedToEntityCode, entityCode, limit, page, includeMetaData) => {
            searchRelatedToMapSummary(dispatch, from, until, entityType, relatedToEntityType, relatedToEntityCode, entityCode, limit, page, includeMetaData);
        },
        getTopoAction: (entityType) => {
            getTopoAction(dispatch, entityType);
        },
        searchRelatedToTableSummary: (from, until, entityType, relatedToEntityType, relatedToEntityCode, entityCode, limit, page, includeMetaData) => {
            searchRelatedToTableSummary(dispatch, from, until, entityType, relatedToEntityType, relatedToEntityCode, entityCode, limit, page, includeMetaData);
        },
        totalOutagesAction: (from, until, entityType) => {
            totalOutages(dispatch, from, until, entityType);
        },
        regionalSignalsTableSummaryDataAction: (entityType, relatedToEntityType, relatedToEntityCode) => {
            regionalSignalsTableSummaryDataAction(dispatch, entityType, relatedToEntityType, relatedToEntityCode);
        },
        asnSignalsTableSummaryDataAction: (entityType, relatedToEntityType, relatedToEntityCode) => {
            asnSignalsTableSummaryDataAction(dispatch, entityType, relatedToEntityType, relatedToEntityCode);
        },
        getRawRegionalSignalsPingSlash24Action: (entityType, entities, from, until, attr=null, order=null, dataSource, maxPoints=null) => {
            getRawRegionalSignalsPingSlash24Action(dispatch, entityType, entities, from, until, attr, order, dataSource, maxPoints);
        },
        getRawRegionalSignalsBgpAction: (entityType, entities, from, until, attr=null, order=null, dataSource, maxPoints=null) => {
            getRawRegionalSignalsBgpAction(dispatch, entityType, entities, from, until, attr, order, dataSource, maxPoints);
        },
        getRawRegionalSignalsUcsdNtAction: (entityType, entities, from, until, attr=null, order=null, dataSource, maxPoints=null) => {
            getRawRegionalSignalsUcsdNtAction(dispatch, entityType, entities, from, until, attr, order, dataSource, maxPoints);
        },
        getRawAsnSignalsPingSlash24Action: (entityType, entities, from, until, attr=null, order=null, dataSource, maxPoints=null) => {
            getRawAsnSignalsPingSlash24Action(dispatch, entityType, entities, from, until, attr, order, dataSource, maxPoints);
        },
        getRawAsnSignalsBgpAction: (entityType, entities, from, until, attr=null, order=null, dataSource, maxPoints=null) => {
            getRawAsnSignalsBgpAction(dispatch, entityType, entities, from, until, attr, order, dataSource, maxPoints);
        },
        getRawAsnSignalsUcsdNtAction: (entityType, entities, from, until, attr=null, order=null, dataSource, maxPoints=null) => {
            getRawAsnSignalsUcsdNtAction(dispatch, entityType, entities, from, until, attr, order, dataSource, maxPoints);
        },
        getAdditionalRawSignalAction: (entityType, entity, from, until, attr=null, order=null, dataSource, maxPoints=null) => {
            getAdditionalRawSignalAction(dispatch, entityType, entity, from, until, attr, order, dataSource, maxPoints);
        }
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(ChartShare);
