// React Imports
import React, { Component } from 'react';
import {connect} from "react-redux";
import { withRouter } from 'react-router-dom';
// Internationalization
import T from 'i18n-react';
// Data Hooks
import { searchEntities, searchRelatedEntities, getEntityMetadata } from "../../data/ActionEntities";
import { getTopoAction } from "../../data/ActionTopo";
import {searchAlerts, searchEvents, searchSummary, searchRelatedToMapSummary, searchRelatedToTableSummary, totalOutages} from "../../data/ActionOutages";
import {getSignalsAction} from "../../data/ActionSignals";
// Components
import ControlPanel from '../../components/controlPanel/ControlPanel';
import { Searchbar } from 'caida-components-library'
import Table from "../../components/table/Table";
import EntityRelated from "./EntityRelated";
import HorizonTSChart from 'horizon-timeseries-chart';
// Event Table Dependencies
import * as sd from 'simple-duration'
// Helper Functions
import {
    convertSecondsToDateValues,
    humanizeNumber,
    toDateTime,
    convertValuesForSummaryTable,
    nextPage,
    prevPage
} from "../../utils";
import {as} from "../dashboard/DashboardConstants";
import CanvasJSChart from "../../libs/canvasjs-non-commercial-3.2.5/canvasjs.react";

import TopoMap from "../../components/map/Map";
import * as topojson from 'topojson';


class Entity extends Component {
    constructor(props) {
        super(props);
        this.state = {
            // Global
            mounted: false,
            entityType: window.location.pathname.split("/")[1],
            entityCode: window.location.pathname.split("/")[2],
            entityName: "",
            parentEntityName: "",
            parentEntityCode: "",
            // Control Panel
            from: window.location.search.split("?")[1]
                ? window.location.search.split("?")[1].split("&")[0].split("=")[1]
                : Math.round((new Date().getTime()  - (24 * 60 * 60 * 1000)) / 1000),
            until: window.location.search.split("?")[1]
                ? window.location.search.split("?")[1].split("&")[1].split("=")[1]
                : Math.round(new Date().getTime() / 1000),
            // Search Bar
            suggestedSearchResults: null,
            searchTerm: null,
            // Time Series states
            tsDataRaw: null,
            tsDataProcessed: {
                activeProbing: [],
                bgp: [],
                darknet: []
            },
            // Table Pagination
            eventTablePageNumber: 0,
            eventTableCurrentDisplayLow: 0,
            eventTableCurrentDisplayHigh: 10,

            alertTablePageNumber: 0,
            alertTableCurrentDisplayLow: 0,
            alertTableCurrentDisplayHigh: 10,
            // Event/Table Data
            currentTable: 'alert',
            eventDataRaw: null,
            eventDataProcessed: [],
            alertDataRaw: null,
            alertDataProcessed: [],
            // relatedTo entity Map
            topoData: null,
            relatedToMapSummary: null,
            // relatedTo entity Table
            relatedToTableSummary: null,
            relatedToTableSummaryProcessed: null,
            relatedToTablePageNumber: 0,
            relatedToTableCurrentDisplayLow: 0,
            relatedToTableCurrentDisplayHigh: 10,



        };
        this.handleTimeFrame = this.handleTimeFrame.bind(this);
    }

    componentDidMount() {
        this.setState({
            mounted: true
        },() => {
            // Overview Panel
            this.props.searchEventsAction(this.state.from, this.state.until, window.location.pathname.split("/")[1], window.location.pathname.split("/")[2]);
            this.props.searchAlertsAction(this.state.from, this.state.until, window.location.pathname.split("/")[1], window.location.pathname.split("/")[2], null, null, null);
            this.props.getSignalsAction(window.location.pathname.split("/")[1], window.location.pathname.split("/")[2], this.state.from, this.state.until, null, null);
            // Get entity name from code provided in url
            this.props.getEntityMetadataAction(window.location.pathname.split("/")[1], window.location.pathname.split("/")[2]);
        });
    }

    componentWillUnmount() {
        this.setState({
            mounted: false
        })
    }

    componentDidUpdate(prevProps, prevState) {
        // After API call for getting entity name from url
        if (this.props.entityMetadata !== prevProps.entityMetadata) {
            this.setState({
                entityName: this.props.entityMetadata[0]["name"],
                parentEntityName: this.props.entityMetadata[0]["attrs"]["country_name"] ? this.props.entityMetadata[0]["attrs"]["country_name"] : this.state.parentEntityName,
                parentEntityCode: this.props.entityMetadata[0]["attrs"]["country_code"] ? this.props.entityMetadata[0]["attrs"]["country_code"] : this.state.parentEntityCode
            }, () => {
                // Get Topo Data for relatedTo Map
                // ToDo: update parameter to base value off of url entity type
                // if (window.location.pathname.split("/")[1] === 'country' || window.location.pathname.split("/")[1] === 'region') {
                    this.getDataTopo("region");
                    this.getDataRelatedToMapSummary("region");
                    this.getDataRelatedToTableSummary("asn");
                // }
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

        // Make API call for data to populate event table
        if (this.props.events !== prevProps.events) {
            if (this.props.events.length < 10) {
                this.setState({eventTableCurrentDisplayHigh: this.props.events.length});
            }
            this.setState({
                eventDataRaw: this.props.events,
            }, () => {
                this.convertValuesForEventTable();
            });
        }

        // Make API call for data to populate Alert Table
        if (this.props.alerts !== prevProps.alerts) {
            if (this.props.alerts.length < 10) {
                this.setState({alertTableCurrentDisplayHigh: this.props.alerts.length});
            }
            this.setState({
                alertDataRaw: this.props.alerts
            }, () => {
                this.convertValuesForAlertTable();
            });
        }

        if (this.state.entityCode !== prevState.entityCode) {
            this.genEntityRelatedRow();
        }

        // After API call for topographic data completes, update topoData state with fresh data
        if (this.props.topoData !== prevProps.topoData) {
            let topoObjects = topojson.feature(this.props.topoData.region.topology, this.props.topoData.region.topology.objects["ne_10m_admin_1.regions.v3.0.0"]);
            this.setState({
                topoData: topoObjects
            }, () => {
                this.populateGeoJsonMap();
            });
        }

        // After API call for outage summary data completes, pass summary data to map function for data merging
        if (this.props.relatedToMapSummary !== prevProps.relatedToMapSummary) {
            this.setState({
                summaryDataMapRaw: this.props.relatedToMapSummary
            },() => {
                // this.convertValuesForSummaryTable();
            })
        }

        // After API call for outage summary data completes, pass summary data to table component for data merging
        if (this.props.relatedToTableSummary !== prevProps.relatedToTableSummary) {
            if (this.props.relatedToTableSummary.length < 10) {
                this.setState({relatedToTableCurrentDisplayHigh: this.props.relatedToTableSummary.length});
            }
            this.setState({
                relatedToTableSummary: this.props.relatedToTableSummary
            },() => {
                this.convertValuesForSummaryTable();
            })
        }
    }

// Control Panel
    // manage the date selected in the input
    handleTimeFrame(dateRange, timeRange) {
        // initialize values from parameters
        let dStart = dateRange.startDate;
        let tStart = timeRange[0].split(":");
        let dEnd = dateRange.endDate;
        let tEnd = timeRange[1].split(":");
        // set time stamp on date with timezone offset
        dStart = dStart.setHours(tStart[0], tStart[1], tStart[2]);
        dEnd = dEnd.setHours(tEnd[0], tEnd[1], tEnd[2]);
        // convert to seconds
        dStart = Math.round(dStart / 1000);
        dEnd = Math.round(dEnd / 1000);
        // // Adjust for timezone (only needed on entity page)
        dStart = new Date(dStart) - new Date(dStart).getTimezoneOffset() * 60;
        dEnd = new Date(dEnd) - new Date(dEnd).getTimezoneOffset() * 60;

        const { history } = this.props;
        history.push(`/${this.state.entityType}/${this.state.entityCode}?from=${dStart}&until=${dEnd}`);

        this.setState({
            from: dStart,
            until: dEnd
        }, () => {
            // Get topo and outage data to repopulate map and table
            this.props.searchEventsAction(this.state.from, this.state.until, this.state.entityType, this.state.entityCode);
            this.props.searchAlertsAction(this.state.from, this.state.until, this.state.entityType, this.state.entityCode, null, null, null);
            this.props.getSignalsAction( this.state.entityType, this.state.entityCode, this.state.from, this.state.until, null, null);
        })
    }
// Search bar
    // get data for search results that populate in suggested search list
    getDataSuggestedSearchResults(searchTerm) {
        if (this.state.mounted) {
            // Set searchTerm to the value of nextProps, nextProps refers to the current search string value in the field.
            this.setState({ searchTerm: searchTerm });
            // // Make api call
            this.props.searchEntitiesAction(searchTerm, 11);
        }
    }
    // Define what happens when user clicks suggested search result entry
    handleResultClick = (query) => {
        const { history } = this.props;
        const entity = this.state.suggestedSearchResults.filter(result => {
            return result.name === query;
        });
        history.push(`/${entity[0].type}/${entity[0].code}`);
        this.componentDidMount();
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
        return <Searchbar placeholder={'Search for a Country, Region, or AS/ISP'}
                          getData={this.getDataSuggestedSearchResults.bind(this)}
                          itemPropertyName={'name'}
                          handleResultClick={(event) => this.handleResultClick(event)}
                          searchResults={this.state.suggestedSearchResults}
                          handleQueryUpdate={this.handleQueryUpdate}
        />
    }

// XY Chart Functions
    // XY Plot Graph Functions
    convertValuesForXyViz() {
        // ToDo: Set x values to local time zone initially
        let bgp = this.state.tsDataRaw[1];
        let bgpValues = [];
        bgp.values && bgp.values.map((value, index) => {
            let x, y;
            x = toDateTime(bgp.from + (bgp.step * index));
            // console.log(x);
            y = value;
            bgpValues.push({x: x, y: y});
        });

        let activeProbing = this.state.tsDataRaw[2];
        let activeProbingValues = [];
        activeProbing.values && activeProbing.values.map((value, index) => {
            let x, y;
            x = toDateTime(activeProbing.from + (activeProbing.step * index));
            y = value;
            activeProbingValues.push({x: x, y: y});
        });

        let networkTelescope = this.state.tsDataRaw[0];
        let networkTelescopeValues = [];
        networkTelescope.values && networkTelescope.values.map((value, index) => {
            let x, y;
            x = toDateTime(networkTelescope.from + (networkTelescope.step * index));
            y = value;
            networkTelescopeValues.push({x: x, y: y});
        });

        // Create Alert band objects
        let stripLines = [];
        this.state.eventDataRaw && this.state.eventDataRaw.map(event => {
            const stripLine = {
                startValue: toDateTime(event.start),
                endValue: toDateTime(event.start + event.duration),
                color:"#BE1D2D",
                opacity: .2
            };
            stripLines.push(stripLine);
        });

        this.setState({
            xyDataOptions: {
                theme: "light2",
                animationEnabled: true,
                zoomEnabled: true,
                title: {
                    text: `IODA Signals for ${this.state.entityName}`
                },
                crosshair: {
                    enabled: true,
                    snapToDataPoint: true
                },
                axisX: {
                    title: "Time (UTC)",
                    stripLines: stripLines
                },
                axisY: {
                    // title: "Active Probing and BGP",
                    titleFontsColor: "#666666",
                    lineColor: "#34a02c",
                    labelFontColor: "#666666",
                    tickColor: "#34a02c"
                },
                axisY2: {
                    // title: "Network Telescope",
                    titleFontsColor: "#666666",
                    lineColor: "#00a9e0",
                    labelFontColor: "#666666",
                    tickColor: "#00a9e0"
                },
                toolTip: {
                    shared: false,
                    enabled: true,
                    animationEnabled: true
                },
                legend: {
                    cursor: "pointer"
                },
                data: [
                    {
                        type: "spline",
                        lineThickness: 1,
                        markerType: "circle",
                        markerSize: 2,
                        name: bgp.datasource,
                        showInLegend: true,
                        xValueFormatString: "DDD, MMM DD - HH:MM",
                        yValueFormatString: "##",
                        dataPoints: bgpValues,
                        toolTipContent: "{x} <br/> BGP (# Visbile /24s): {y}"
                    },
                    {
                        type: "spline",
                        lineThickness: 1,
                        markerType: "circle",
                        markerSize: 2,
                        name: activeProbing.datasource,
                        showInLegend: true,
                        xValueFormatString: "DDD, MMM DD - HH:MM",
                        yValueFormatString: "##",
                        dataPoints: activeProbingValues,
                        toolTipContent: "{x} <br/> Active Probing (# /24s Up): {y}"
                    },
                    {
                        type: "spline",
                        lineThickness: 1,
                        markerType: "circle",
                        markerSize: 2,
                        name: networkTelescope.datasource,
                        axisYType: "secondary",
                        showInLegend: true,
                        xValueFormatString: "DDD, MMM DD - HH:MM",
                        yValueFormatString: "##",
                        dataPoints: networkTelescopeValues,
                        toolTipContent: "{x} <br/> Network Telescope (# Unique Source IPs): {y}"
                    }
                ]
            }
        }, () => {
            this.genXyChart();
        });
    }
    genXyChart() {
        return (
            this.state.xyDataOptions && <div>
                <CanvasJSChart options={this.state.xyDataOptions}
                               onRef={ref => this.chart = ref}
                />
                {/*You can get reference to the chart instance as shown above using onRef. This allows you to access all chart properties and methods*/}
            </div>
        );
    }

// Event Table
    // Event Table Functions
    convertValuesForEventTable()  {
        // Get the relevant values to populate table with
        let eventData = [];
        this.state.eventDataRaw.map(event => {
            const eventItem = {
                age: sd.stringify((event.start + event.duration) / 1000, 's'),
                from: {
                    month: convertSecondsToDateValues(event.start).month,
                    day: convertSecondsToDateValues(event.start).day,
                    year: convertSecondsToDateValues(event.start).year,
                    hours: convertSecondsToDateValues(event.start).hours,
                    minutes: convertSecondsToDateValues(event.start).minutes,
                    meridian: convertSecondsToDateValues(event.start).meridian
                },
                fromDate: new Date(event.start * 1000),
                until: {
                    month: convertSecondsToDateValues(event.start + event.duration).month,
                    day: convertSecondsToDateValues(event.start + event.duration).day,
                    year: convertSecondsToDateValues(event.start + event.duration).year,
                    hours: convertSecondsToDateValues(event.start + event.duration).hours,
                    minutes: convertSecondsToDateValues(event.start + event.duration).minutes,
                    meridian: convertSecondsToDateValues(event.start + event.duration).meridian
                },
                untilDate: new Date(event.start * 1000 + event.duration * 1000),
                duration: sd.stringify(event.duration, 's'),
                score: humanizeNumber(event.score)
            };
            eventData.push(eventItem);
        });

        this.setState({
            eventDataProcessed: eventData
        }, () => {
            this.genEventTable();
        });
    }
    genEventTable() {
        // this.state.eventDataProcessed && console.log(this.state.eventDataProcessed);
        return (
            this.state.eventDataProcessed &&
            <Table
                type={"event"}
                data={this.state.eventDataProcessed}
                nextPage={(type) => this.nextPage(type)}
                prevPage={(type) => this.prevPage(type)}
                currentDisplayLow={this.state.eventTableCurrentDisplayLow}
                currentDisplayHigh={this.state.eventTableCurrentDisplayHigh}
                totalCount={this.state.eventDataProcessed.length}
            />
        )
    }
    nextPage(type) {
        if (type === 'alert') {
            let nextPageValues = nextPage(!!this.state.alertDataProcessed, this.state.alertDataProcessed.length, this.state.alertTableCurrentDisplayHigh, this.state.alertTableCurrentDisplayLow);
            this.setState({
                alertPageNumber: nextPageValues.newPageNumber,
                alertTableCurrentDisplayLow: nextPageValues.newCurrentDisplayLow,
                alertTableCurrentDisplayHigh: nextPageValues.newCurrentDisplayHigh
            });
        }

        if (type === 'event') {
            let nextPageValues = nextPage(!!this.state.eventDataProcessed, this.state.eventDataProcessed.length, this.state.eventTableCurrentDisplayHigh, this.state.alertTableCurrentDisplayLow);
            this.setState({
                eventTablePageNumber: nextPageValues.newPageNumber,
                eventTableCurrentDisplayLow: nextPageValues.newCurrentDisplayLow,
                eventTableCurrentDisplayHigh: nextPageValues.newCurrentDisplayHigh
            });
        }
    }
    prevPage(type) {
        if (type === 'alert') {
            let prevPageValues = prevPage(!!this.state.alertDataProcessed, this.state.alertDataProcessed.length, this.state.alertTableCurrentDisplayHigh, this.state.alertTableCurrentDisplayLow);
            this.setState({
                alertPageNumber: prevPageValues.newPageNumber,
                alertTableCurrentDisplayLow: prevPageValues.newCurrentDisplayLow,
                alertTableCurrentDisplayHigh: prevPageValues.newCurrentDisplayHigh
            });
        }

        if (type === 'event') {
            let prevPageValues = prevPage(!!this.state.eventDataProcessed, this.state.eventDataProcessed.length, this.state.eventTableCurrentDisplayHigh, this.state.alertTableCurrentDisplayLow);
            this.setState({
                eventTablePageNumber: prevPageValues.newPageNumber,
                eventTableCurrentDisplayLow: prevPageValues.newCurrentDisplayLow,
                eventTableCurrentDisplayHigh: prevPageValues.newCurrentDisplayHigh
            });
        }

    }
    changeCurrentTable() {
        if (this.state.currentTable === 'event') {
            this.setState({currentTable: 'alert'}, () => {
                this.genAlertTable()
            });
        } else if (this.state.currentTable === 'alert') {
            this.setState({currentTable: 'event'}, () => {
                this.genEventTable()
            });
        }
    }
// Alert Table Functions
    convertValuesForAlertTable() {
        // Get the relevant values to populate table with
        let alertData = [];
        this.state.alertDataRaw.map(alert => {
            const alertItem = {
                entityName: alert.entity.name,
                level: alert.level,
                date: {
                    month: convertSecondsToDateValues(alert.time).month,
                    day: convertSecondsToDateValues(alert.time).day,
                    year: convertSecondsToDateValues(alert.time).year,
                    hours: convertSecondsToDateValues(alert.time).hours,
                    minutes: convertSecondsToDateValues(alert.time).minutes,
                    meridian: convertSecondsToDateValues(alert.time).meridian
                },
                dateStamp: new Date(alert.time * 1000),
                dataSource: alert.datasource,
                actualValue: alert.value,
                baselineValue: alert.historyValue
            };
            alertData.push(alertItem);
        });

        this.setState({
            alertDataProcessed: alertData
        }, () => {
            this.genAlertTable();
        });
    }
    genAlertTable() {
        return (
            this.state.alertDataProcessed &&
            <Table
                type={"alert"}
                data={this.state.alertDataProcessed}
                nextPage={(type) => this.nextPage(type)}
                prevPage={(type) => this.prevPage(type)}
                currentDisplayLow={this.state.alertTableCurrentDisplayLow}
                currentDisplayHigh={this.state.alertTableCurrentDisplayHigh}
                totalCount={this.state.alertDataProcessed.length}
            />
        )
    }

// EntityRelated Row
    genEntityRelatedRow() {
        return <EntityRelated
            entityName={this.state.entityName}
            entityType={this.state.entityType}
            parentEntityName={this.state.parentEntityName}
            populateGeoJsonMap={() => this.populateGeoJsonMap()}
            genSummaryTable={() => this.genSummaryTable()}
        />;
    }
// RelatedTo Map
    // Process Geo data, attribute outage scores to a new topoData property where possible, then render Map
    populateGeoJsonMap() {
        if (this.state.topoData && this.state.summaryDataMapRaw && this.state.summaryDataMapRaw[0] && this.state.summaryDataMapRaw[0]["entity"]) {
            // console.log(this.state.summaryDataMapRaw);
            let topoData = this.state.topoData;

            // get Topographic info for a country if it has outages
            this.state.summaryDataMapRaw.map(outage => {
                // let topoItemIndex;
                // this.state.activeTabType === 'country'
                //     ? topoItemIndex = this.state.topoData.features.findIndex(topoItem => topoItem.properties.usercode === outage.entity.code)
                //     : this.state.activeTabType === 'region'
                //     ? topoItemIndex = this.state.topoData.features.findIndex(topoItem => topoItem.properties.name === outage.entity.name)
                //     : null;

                let topoItemIndex = this.state.topoData.features.findIndex(topoItem => topoItem.properties.name === outage.entity.name);

                if (topoItemIndex > 0) {
                    let item = topoData.features[topoItemIndex];
                    item.properties.score = outage.scores.overall;
                    topoData.features[topoItemIndex] = item;
                }
            });

            // console.log(topoData);
            return <TopoMap topoData={topoData}/>;
        }

    }
    // Make API call to retrieve topographic data
    getDataTopo(entityType) {
        if (this.state.mounted) {
            this.props.getTopoAction(entityType);
        }
    }
    // Make API call to retrieve summary data to populate on map
    getDataRelatedToMapSummary(entityType) {
        if (this.state.mounted) {
            let until = this.state.until;
            let from = this.state.from;
            const limit = 170;
            const includeMetadata = true;
            let page = this.state.pageNumber;
            const entityCode = null;
            let relatedToEntityType, relatedToEntityCode;
            switch (this.state.entityType) {
                case 'country':
                    relatedToEntityType = this.state.entityType;
                    relatedToEntityCode = this.state.entityCode;
                    break;
                case 'region':
                    relatedToEntityType = 'country';
                    relatedToEntityCode = this.props.entityMetadata[0]["attrs"]["fqid"].split(".")[3];
                    break;
                case 'asn':
                    relatedToEntityType = 'asn';
                    relatedToEntityCode = this.props.entityMetadata[0]["attrs"]["fqid"].split(".")[1];
                    break;
            }
            // console.log(entityType, relatedToEntityType, relatedToEntityCode);
            this.props.searchRelatedToMapSummary(from, until, entityType, relatedToEntityType, relatedToEntityCode, entityCode, limit, page, includeMetadata);
        }
    }
// Summary Table
    // Make API call to retrieve summary data to populate on map
    getDataRelatedToTableSummary(entityType) {
        if (this.state.mounted) {
            let until = this.state.until;
            let from = this.state.from;
            const limit = 170;
            const includeMetadata = true;
            let page = this.state.pageNumber;
            const entityCode = null;
            let relatedToEntityType, relatedToEntityCode;
            // console.log(this.props.entityMetadata[0]["attrs"]);
            switch (this.state.entityType) {
                case 'country':
                    relatedToEntityType = this.state.entityType;
                    relatedToEntityCode = this.state.entityCode;
                    break;
                case 'region':
                    relatedToEntityType = 'country';
                    relatedToEntityCode = this.props.entityMetadata[0]["attrs"]["fqid"].split(".")[3];
                    break;
                case 'asn':
                    relatedToEntityType = 'asn';
                    relatedToEntityCode = this.props.entityMetadata[0]["attrs"]["fqid"].split(".")[1];
                    entityType = 'country';
                    break;
            }
            // console.log(entityType, relatedToEntityType, relatedToEntityCode);
            this.props.searchRelatedToTableSummary(from, until, entityType, relatedToEntityType, relatedToEntityCode, entityCode, limit, page, includeMetadata);
        }
    }
    convertValuesForSummaryTable() {
        let summaryData = convertValuesForSummaryTable(this.state.relatedToTableSummary);
        this.setState({
            relatedToTableSummaryProcessed: summaryData
        }, () => {
            this.genSummaryTable();
        })
    }
    genSummaryTable() {
        return (
            this.state.relatedToTableSummaryProcessed &&
            <Table
                type={"summary"}
                data={this.state.relatedToTableSummaryProcessed}
                nextPage={() => this.nextPageRelatedToTableSummary()}
                prevPage={() => this.prevPageRelatedToTableSummary()}
                currentDisplayLow={this.state.relatedToTableCurrentDisplayLow}
                currentDisplayHigh={this.state.relatedToTableCurrentDisplayHigh}
                totalCount={this.state.relatedToTableSummaryProcessed.length}
            />
        )
    }
    nextPageRelatedToTableSummary(type) {
        if (type === 'summary') {
            let nextPageValues = nextPage(!!this.state.relatedToTableSummaryProcessed, this.state.relatedToTableSummaryProcessed.length, this.state.relatedToTableCurrentDisplayHigh, this.state.relatedToTableCurrentDisplayLow);
            this.setState({
                relatedToTablePageNumber: nextPageValues.newPageNumber,
                relatedToTableCurrentDisplayLow: nextPageValues.newCurrentDisplayLow,
                relatedToTableCurrentDisplayHigh: nextPageValues.newCurrentDisplayHigh
            });
        }
    }
    prevPageRelatedToTableSummary(type) {
        if (type === 'summary') {
            let prevPageValues = prevPage(!!this.state.relatedToTableSummaryProcessed, this.state.relatedToTableSummaryProcessed.length, this.state.relatedToTableCurrentDisplayHigh, this.state.relatedToTableCurrentDisplayLow);
            this.setState({
                relatedToTablePageNumber: prevPageValues.newPageNumber,
                relatedToTableCurrentDisplayLow: prevPageValues.newCurrentDisplayLow,
                relatedToTableCurrentDisplayHigh: prevPageValues.newCurrentDisplayHigh
            });
        }
    }

    render() {
        return(
            <div className="entity">
                <ControlPanel
                    from={this.state.from}
                    until={this.state.until}
                    timeFrame={this.handleTimeFrame}
                    searchbar={() => this.populateSearchBar()}
                    entityName={this.state.entityName}
                />
                <div className="row overview">
                    <div className="col-3-of-5">
                        <div className="overview__config" ref={this.config}>
                            <button className="overview__config-button">Modal</button>
                        </div>
                        {
                            this.genXyChart()
                        }
                    </div>
                    <div className="col-2-of-5">
                        <button className="overview__config-button"
                                onClick={() => this.changeCurrentTable()}
                                style={this.props.type === 'asn' ? {display: 'none'} : null}
                        >View {this.state.currentTable === 'event' ? 'alert' : 'event'} Table</button>
                        <h3>
                            {this.state.currentTable === 'event' ? 'Event' : 'Alert'}
                        </h3>
                        <div className="overview__table">
                            <div style={this.state.currentTable === 'event' ? {display: 'block'} : {display: 'none'}}>
                                {this.genEventTable() }
                            </div>
                            <div style={this.state.currentTable === 'alert' ? {display: 'block'} : {display: 'none'}}>
                                {this.genAlertTable() }
                            </div>
                        </div>
                    </div>
                </div>
                {
                    this.genEntityRelatedRow()
                }
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        suggestedSearchResults: state.iodaApi.entities,
        relatedEntities: state.iodaApi.relatedEntities,
        entityMetadata: state.iodaApi.entityMetadata,
        relatedToMapSummary: state.iodaApi.relatedToMapSummary,
        relatedToTableSummary: state.iodaApi.relatedToTableSummary,
        topoData: state.iodaApi.topo,
        totalOutages: state.iodaApi.summaryTotalCount,
        events: state.iodaApi.events,
        alerts: state.iodaApi.alerts,
        signals: state.iodaApi.signals
    }
};

const mapDispatchToProps = (dispatch) => {
    return {
        searchEntitiesAction: (searchQuery, limit=15) => {
            searchEntities(dispatch, searchQuery, limit);
        },
        // searchRelatedEntitiesAction: (from, until, entityType, relatedToEntityType, relatedToEntityCode) => {
        //     searchRelatedEntities(dispatch, from, until, entityType, relatedToEntityType, relatedToEntityCode);
        // },
        searchRelatedToMapSummary: (from, until, entityType, relatedToEntityType, relatedToEntityCode, entityCode, limit, page, includeMetaData) => {
            searchRelatedToMapSummary(dispatch, from, until, entityType, relatedToEntityType, relatedToEntityCode, entityCode, limit, page, includeMetaData);
        },
        searchRelatedToTableSummary: (from, until, entityType, relatedToEntityType, relatedToEntityCode, entityCode, limit, page, includeMetaData) => {
            searchRelatedToTableSummary(dispatch, from, until, entityType, relatedToEntityType, relatedToEntityCode, entityCode, limit, page, includeMetaData);
        },
        getEntityMetadataAction: (entityType, entityCode) => {
            getEntityMetadata(dispatch, entityType, entityCode);
        },
        totalOutagesAction: (from, until, entityType) => {
            totalOutages(dispatch, from, until, entityType);
        },
        getTopoAction: (entityType) => {
            getTopoAction(dispatch, entityType);
        },
        searchEventsAction: (from, until, entityType, entityCode, datasource=null, includeAlerts=null, format=null, limit=null, page=null) => {
            searchEvents(dispatch, from, until, entityType, entityCode, datasource, includeAlerts, format, limit, page);
        },
        searchAlertsAction: (from, until, entityType, entityCode, datasource=null, limit=null, page=null) => {
            searchAlerts(dispatch, from, until, entityType, entityCode, datasource, limit, page);
        },
        getSignalsAction: (entityType, entityCode, from, until, datasource=null, maxPoints=null) => {
            getSignalsAction(dispatch, entityType, entityCode, from, until, datasource, maxPoints);
        }
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(Entity);
