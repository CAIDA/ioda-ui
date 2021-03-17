// React Imports
import React, { Component } from 'react';
import {connect} from "react-redux";
import { withRouter } from 'react-router-dom';
// Internationalization
import T from 'i18n-react';
// Data Hooks
import { searchEntities, getEntityMetadata, regionalSignalsTableSummaryDataAction, asnSignalsTableSummaryDataAction } from "../../data/ActionEntities";
import { getTopoAction } from "../../data/ActionTopo";
import {searchAlerts, searchEvents, searchSummary, searchRelatedToMapSummary, searchRelatedToTableSummary, totalOutages} from "../../data/ActionOutages";
import {getSignalsAction, getRawRegionalSignalsAction, getRawAsnSignalsAction} from "../../data/ActionSignals";
// Components
import ControlPanel from '../../components/controlPanel/ControlPanel';
import { Searchbar } from 'caida-components-library'
import Table from "../../components/table/Table";
import EntityRelated from "./EntityRelated";
import HorizonTSChart from 'horizon-timeseries-chart';
import Loading from "../../components/loading/Loading";
// Event Table Dependencies
import * as sd from 'simple-duration'
// Helper Functions
import {
    convertSecondsToDateValues,
    humanizeNumber,
    toDateTime,
    convertValuesForSummaryTable,
    combineValuesForSignalsTable,
    nextPage,
    prevPage,
    convertTsDataForHtsViz
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
            eventTableCurrentDisplayHigh: 0,
            alertTablePageNumber: 0,
            alertTableCurrentDisplayLow: 0,
            alertTableCurrentDisplayHigh: 0,
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
            relatedToTableApiPageNumber: 0,
            relatedToTableSummary: null,
            relatedToTableSummaryProcessed: null,
            relatedToTablePageNumber: 0,
            relatedToTableCurrentDisplayLow: 0,
            relatedToTableCurrentDisplayHigh: 10,
            // Modal window display status
            showMapModal: false,
            showTableModal: false,
            // Signals Modal Table on Map Panel
            regionalSignalsTableSummaryData: [],
            regionalSignalsTableSummaryDataProcessed: [],
            regionalSignalsTablePageNumber: 0,
            regionalSignalsTableCurrentDisplayLow: 0,
            regionalSignalsTableCurrentDisplayHigh: 10,
            // Signals Modal Table on Table Panel
            asnSignalsTableSummaryData: [],
            asnSignalsTableSummaryDataProcessed: [],
            asnSignalsTablePageNumber: 0,
            asnSignalsTableCurrentDisplayLow: 0,
            asnSignalsTableCurrentDisplayHigh: 10,
            // Stacked Horizon Visual on Region Map Panel
            rawRegionalSignals: [],
            rawRegionalSignalsProcessedBgp: [],
            rawRegionalSignalsProcessedPingSlash24: [],
            rawRegionalSignalsProcessedUcsdNt: [],
            // Stacked Horizon Visual on ASN Table Panel
            rawAsnSignals: [],
            rawAsnSignalsProcessedBgp: [],
            rawAsnSignalsProcessedPingSlash24: [],
            rawAsnSignalsProcessedUcsdNt: [],
        };
        this.handleTimeFrame = this.handleTimeFrame.bind(this);
        this.toggleModal = this.toggleModal.bind(this);
        this.apiQueryLimit = 170;
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
                // this.combineValuesForRegionalSignalsTable();
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
                // this.combineValuesForAsnSignalsTable();
            })
        }

        if (this.props.regionalSignalsTableSummaryData !== prevProps.regionalSignalsTableSummaryData) {
            this.setState({
                regionalSignalsTableSummaryData: this.props.regionalSignalsTableSummaryData
            }, () => {
                this.combineValuesForRegionalSignalsTable();
            })
        }

        if (this.props.asnSignalsTableSummaryData !== prevProps.asnSignalsTableSummaryData) {
            this.setState({
                asnSignalsTableSummaryData: this.props.asnSignalsTableSummaryData
            }, () => {
                this.combineValuesForAsnSignalsTable();
            })
        }

        // data for regional signals table
        if (this.props.rawRegionalSignals !== prevProps.rawRegionalSignals) {
            this.props.rawRegionalSignals.map(signal => {
                let rawRegionalSignals = this.state.rawRegionalSignals;
                rawRegionalSignals.push(signal);
                this.setState({
                    rawRegionalSignals: rawRegionalSignals
                }, () => {
                    this.convertValuesForRegionalHtsViz();
                })
            });
        }

        if (this.props.rawAsnSignals !== prevProps.rawAsnSignals) {
            this.props.rawAsnSignals.map(signal => {
                let rawAsnSignals = this.state.rawAsnSignals;
                rawAsnSignals.push(signal);
                this.setState({
                    rawAsnSignals: rawAsnSignals
                }, () => {
                    this.convertValuesForAsnHtsViz();
                })
            });
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
        this.setState({
            mounted: false,
            entityType: window.location.pathname.split("/")[1],
            entityCode: window.location.pathname.split("/")[2],
            entityName: "",
            parentEntityName: "",
            parentEntityCode: "",
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
            relatedToTableApiPageNumber: 0,
            relatedToTableSummary: null,
            relatedToTableSummaryProcessed: null,
            relatedToTablePageNumber: 0,
            relatedToTableCurrentDisplayLow: 0,
            relatedToTableCurrentDisplayHigh: 10,
            // Modal window display status
            showMapModal: false,
            showTableModal: false,
            // Signals Modal Table on Map Panel
            regionalSignalsTableSummaryData: [],
            regionalSignalsTableSummaryDataProcessed: [],
            regionalSignalsTablePageNumber: 0,
            regionalSignalsTableCurrentDisplayLow: 0,
            regionalSignalsTableCurrentDisplayHigh: 10,
            // Signals Modal Table on Table Panel
            asnSignalsTableSummaryData: [],
            asnSignalsTableSummaryDataProcessed: [],
            asnSignalsTablePageNumber: 0,
            asnSignalsTableCurrentDisplayLow: 0,
            asnSignalsTableCurrentDisplayHigh: 10,
            // Stacked Horizon Visual on Region Map Panel
            rawRegionalSignals: [],
            rawRegionalSignalsProcessedBgp: [],
            rawRegionalSignalsProcessedPingSlash24: [],
            rawRegionalSignalsProcessedUcsdNt: [],
            // Stacked Horizon Visual on ASN Table Panel
            rawAsnSignals: [],
            rawAsnSignalsProcessedBgp: [],
            rawAsnSignalsProcessedPingSlash24: [],
            rawAsnSignalsProcessedUcsdNt: [],
        }, () => {
            this.componentDidMount();
        });

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

// 1st Row
// XY Chart Functions
    // XY Plot Graph Functions
    createXyVizDataObject(networkTelescopeValues, bgpValues, activeProbingValues) {
        let networkTelescope, bgp, activeProbing;
        if (networkTelescopeValues) {
            networkTelescope = {
                type: "line",
                lineThickness: 1,
                markerType: "circle",
                markerSize: 2,
                name: "Network Telescope",
                axisYType: "secondary",
                showInLegend: true,
                xValueFormatString: "DDD, MMM DD - HH:MM",
                yValueFormatString: "##",
                dataPoints: networkTelescopeValues,
                toolTipContent: "{x} <br/> Network Telescope (# Unique Source IPs): {y}"
            }
        }
        if (bgpValues) {
            bgp = {
                type: "line",
                lineThickness: 1,
                markerType: "circle",
                markerSize: 2,
                name: "BGP",
                showInLegend: true,
                xValueFormatString: "DDD, MMM DD - HH:MM",
                yValueFormatString: "##",
                dataPoints: bgpValues,
                toolTipContent: "{x} <br/> BGP (# Visbile /24s): {y}"
            }
        }

        if (activeProbingValues) {
            activeProbing = {
                type: "line",
                lineThickness: 1,
                markerType: "circle",
                markerSize: 2,
                name: "Active Probing",
                showInLegend: true,
                xValueFormatString: "DDD, MMM DD - HH:MM",
                yValueFormatString: "##",
                dataPoints: activeProbingValues,
                toolTipContent: "{x} <br/> Active Probing (# /24s Up): {y}"
            }
        }

        return [networkTelescope, bgp, activeProbing]
    }
    convertValuesForXyViz() {
        // ToDo: Set x values to local time zone initially
        let networkTelescopeValues = [];
        let bgpValues = [];
        let activeProbingValues = [];

        // Loop through available datasources to collect plot points
        this.state.tsDataRaw[0].map(datasource => {
            switch (datasource.datasource) {
                case "ucsd-nt":
                    datasource.values && datasource.values.map((value, index) => {
                        let x, y;
                        x = toDateTime(datasource.from + (datasource.step * index));
                        y = value;
                        networkTelescopeValues.push({x: x, y: y});
                    });
                    break;
                case "bgp":
                    datasource.values && datasource.values.map((value, index) => {
                        let x, y;
                        x = toDateTime(datasource.from + (datasource.step * index));
                        y = value;
                        bgpValues.push({x: x, y: y});
                    });
                    break;
                case "ping-slash24":
                    datasource.values && datasource.values.map((value, index) => {
                        let x, y;
                        x = toDateTime(datasource.from + (datasource.step * index));
                        y = value;
                        activeProbingValues.push({x: x, y: y});
                    });
            }
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
                height: 650,
                animationEnabled: true,
                zoomEnabled: true,
                title: {
                    text: `IODA Signals for ${this.state.entityName}`,
                    fontSize: 18,
                    horizontalAlign: "left",
                },
                crosshair: {
                    enabled: true,
                    snapToDataPoint: true
                },
                axisX: {
                    title: "Time (UTC)",
                    stripLines: stripLines,
                    labelFontSize: 12,
                },
                axisY: {
                    // title: "Active Probing and BGP",
                    titleFontsColor: "#666666",
                    lineColor: "#34a02c",
                    labelFontColor: "#666666",
                    tickColor: "#34a02c",
                    labelFontSize: 12,
                },
                axisY2: {
                    // title: "Network Telescope",
                    titleFontsColor: "#666666",
                    lineColor: "#00a9e0",
                    labelFontColor: "#666666",
                    tickColor: "#00a9e0",
                    labelFontSize: 12,
                },
                toolTip: {
                    shared: false,
                    enabled: true,
                    animationEnabled: true
                },
                legend: {
                    cursor: "pointer"
                },
                data: this.createXyVizDataObject(networkTelescopeValues, bgpValues, activeProbingValues)
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
    // Take values from api and format for table
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
    // Generate the table that will display in the UI with the formatted values
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
    // Table controls
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
    // Switching between Events and Alerts
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

// 2nd Row
// EntityRelated
    genEntityRelatedRow() {
        return <EntityRelated
            entityName={this.state.entityName}
            entityType={this.state.entityType}
            parentEntityName={this.state.parentEntityName}
            toggleModal={this.toggleModal}
            showMapModal={this.state.showMapModal}
            showTableModal={this.state.showTableModal}
            populateGeoJsonMap={() => this.populateGeoJsonMap()}
            genSummaryTable={() => this.genSummaryTable()}
            genRegionalSignalsTable={() => this.genRegionalSignalsTable()}
            genAsnSignalsTable={() => this.genAsnSignalsTable()}
            populateRegionalHtsChart={(width, datasource) => this.populateRegionalHtsChart(width, datasource)}
            populateAsnHtsChart={(width, datasource) => this.populateAsnHtsChart(width, datasource)}
        />;
    }
    toggleModal(modalLocation) {
        if (modalLocation === 'map') {
            this.props.regionalSignalsTableSummaryDataAction("region", window.location.pathname.split("/")[1], window.location.pathname.split("/")[2]);
            // Get related entities used on table in map modal
            this.convertValuesForRegionalHtsViz();
            this.setState({
                showMapModal: !this.state.showMapModal
            });

        } else if (modalLocation === 'table') {
            this.props.asnSignalsTableSummaryDataAction("asn", window.location.pathname.split("/")[1], window.location.pathname.split("/")[2]);
            this.convertValuesForAsnHtsViz();
            // this.combineValuesForAsnSignalsTable();
            // this.convertValuesForAsnHtsViz();
            this.setState({
                showTableModal: !this.state.showTableModal
            });
        }
    }

// RelatedTo Map
    // Process Geo data, attribute outage scores to a new topoData property where possible, then render Map
    populateGeoJsonMap() {
        if (this.state.topoData && this.state.summaryDataMapRaw && this.state.summaryDataMapRaw[0] && this.state.summaryDataMapRaw[0]["entity"]) {
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

// Summary Table for related ASNs
    // Make API call to retrieve summary data to populate on map
    getDataRelatedToTableSummary(entityType) {
        if (this.state.mounted) {
            let until = this.state.until;
            let from = this.state.from;
            const limit = this.apiQueryLimit;
            const includeMetadata = true;
            let page = this.state.relatedToTableApiPageNumber;
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

        if (this.state.relatedToTableApiPageNumber === 0) {
            // console.log(summaryData);
            this.setState({
                relatedToTableSummaryProcessed: summaryData
            }, () => {
                this.genSummaryTable();
            })
        }

        if (this.state.relatedToTableApiPageNumber > 0) {
            this.setState({
                relatedToTableSummaryProcessed: this.state.relatedToTableSummaryProcessed.concat(summaryData)
            }, () => {
                this.genSummaryTable();
            })
        }

    }
    genSummaryTable() {
        return (
            this.state.relatedToTableSummaryProcessed &&
            <Table
                type="summary"
                data={this.state.relatedToTableSummaryProcessed}
                nextPage={() => this.nextPageRelatedToTableSummary()}
                prevPage={() => this.prevPageRelatedToTableSummary()}
                currentDisplayLow={this.state.relatedToTableCurrentDisplayLow}
                currentDisplayHigh={this.state.relatedToTableCurrentDisplayHigh}
                totalCount={this.state.relatedToTableSummaryProcessed.length}
                entityType={this.state.entityType === "asn" ? "country" : "asn"}
            />
        )
    }
    nextPageRelatedToTableSummary() {
        let nextPageValues = nextPage(!!this.state.relatedToTableSummaryProcessed, this.state.relatedToTableSummaryProcessed.length, this.state.relatedToTablePageNumber, this.state.relatedToTableCurrentDisplayHigh, this.state.relatedToTableCurrentDisplayLow);
        this.setState({
            relatedToTablePageNumber: nextPageValues.newPageNumber,
            relatedToTableCurrentDisplayLow: nextPageValues.newCurrentDisplayLow,
            relatedToTableCurrentDisplayHigh: nextPageValues.newCurrentDisplayHigh
        }, () => {
            // load more entries if user browses beyond initial amount loaded, defined at this.apiQueryLimit
            if (this.state.relatedToTableCurrentDisplayHigh > (this.state.relatedToTableApiPageNumber + 1) * this.apiQueryLimit) {

                this.setState({
                    apiPageNumber: this.state.relatedToTableApiPageNumber + 1,
                }, () => {
                    this.getDataRelatedToTableSummary("asn");
                });

            }
        });
    }
    prevPageRelatedToTableSummary() {
        let prevPageValues = prevPage(!!this.state.relatedToTableSummaryProcessed, this.state.relatedToTableSummaryProcessed.length, this.state.relatedToTablePageNumber, this.state.relatedToTableCurrentDisplayHigh, this.state.relatedToTableCurrentDisplayLow);
        this.setState({
            relatedToTablePageNumber: prevPageValues.newPageNumber,
            relatedToTableCurrentDisplayLow: prevPageValues.newCurrentDisplayLow,
            relatedToTableCurrentDisplayHigh: prevPageValues.newCurrentDisplayHigh
        });

    }


// Map Modal
    // Table displaying all regions regardless of score
    combineValuesForRegionalSignalsTable() {
        if (this.state.summaryDataMapRaw && this.state.regionalSignalsTableSummaryData) {
            let signalsTableData = combineValuesForSignalsTable(this.state.summaryDataMapRaw, this.state.regionalSignalsTableSummaryData);
            this.setState({
                regionalSignalsTableSummaryDataProcessed: signalsTableData
            }, () => {
                this.genRegionalSignalsTable();
                // Populate Stacked horizon graph with all regions
                this.getRegionalSignalsHtsDataEvents("region");
            })
        }
    }
    genRegionalSignalsTable() {
        if (this.state.regionalSignalsTableSummaryDataProcessed) {
            return (
                this.state.regionalSignalsTableSummaryDataProcessed && <Table
                    type="signal"
                    data={this.state.regionalSignalsTableSummaryDataProcessed}
                    nextPage={() => this.nextPageRegionalSignalsTableSummary()}
                    prevPage={() => this.prevPageRegionalSignalsTableSummary()}
                    currentDisplayLow={this.state.regionalSignalsTableCurrentDisplayLow}
                    currentDisplayHigh={this.state.regionalSignalsTableCurrentDisplayHigh}
                    totalCount={this.state.regionalSignalsTableSummaryDataProcessed.length}
                    toggleEntityVisibilityInHtsViz={event => this.toggleEntityVisibilityInHtsViz(event)}
                />
            )
        }
    }
    nextPageRegionalSignalsTableSummary() {
        let nextPageValues = nextPage(!!this.state.regionalSignalsTableSummaryDataProcessed, this.state.regionalSignalsTableSummaryDataProcessed.length, this.state.regionalSignalsTablePageNumber, this.state.regionalSignalsTableCurrentDisplayHigh, this.state.regionalSignalsTableCurrentDisplayLow);
        this.setState({
            regionalSignalsTablePageNumber: nextPageValues.newPageNumber,
            regionalSignalsTableCurrentDisplayLow: nextPageValues.newCurrentDisplayLow,
            regionalSignalsTableCurrentDisplayHigh: nextPageValues.newCurrentDisplayHigh
        });
    }
    prevPageRegionalSignalsTableSummary() {
        let prevPageValues = prevPage(!!this.state.regionalSignalsTableSummaryDataProcessed, this.state.regionalSignalsTableSummaryDataProcessed.length, this.state.regionalSignalsTablePageNumber, this.state.regionalSignalsTableCurrentDisplayHigh, this.state.regionalSignalsTableCurrentDisplayLow);
        this.setState({
            regionalSignalsTablePageNumber: prevPageValues.newPageNumber,
            regionalSignalsTableCurrentDisplayLow: prevPageValues.newCurrentDisplayLow,
            regionalSignalsTableCurrentDisplayHigh: prevPageValues.newCurrentDisplayHigh
        });

    }
    toggleEntityVisibilityInHtsViz(event) {
        let indexValue;
        let regionalSignalsTableSummaryDataProcessed = this.state.regionalSignalsTableSummaryDataProcessed;
        let rawRegionalSignals = this.props.rawRegionalSignals;

        let visibilityFalseEntities = [];

        // Get the index of where the checkmark was that was clicked
        regionalSignalsTableSummaryDataProcessed.filter((entity, index) => {
            if (entity.entityCode === event.target.name) {
                indexValue = index;
            }
        });
        // Update visibility boolean property in copied object to update table
        regionalSignalsTableSummaryDataProcessed[indexValue]["visibility"] = !regionalSignalsTableSummaryDataProcessed[indexValue]["visibility"];

        // Group IDs for items that have visibility set to false, remove items from group that are now set to true
        regionalSignalsTableSummaryDataProcessed.map((regionalSignalsTableEntity, index) => {
            if (regionalSignalsTableEntity.visibility === false || !regionalSignalsTableEntity.visibility) {
                visibilityFalseEntities.push(regionalSignalsTableEntity.entityCode);
            } else {
                visibilityFalseEntities.splice(index, index + 1);
            }
        });

        // Update rawRegionalSignals state removing selected items with visibility set to false in regionalSignalsTableSummaryDataProcessed
        if (visibilityFalseEntities.length > 0) {
            visibilityFalseEntities.map(entityCode => {
                rawRegionalSignals = rawRegionalSignals.filter(regionalSignal => regionalSignal[0].entityCode !== entityCode)
            }, this);
        } else {
            rawRegionalSignals = this.props.rawRegionalSignals;
        }

        // Update new state with visibility checked and new hts data that reflects that, then redraw the chart
        this.setState({
            rawRegionalSignals: rawRegionalSignals,
            regionalSignalsTableSummaryDataProcessed: regionalSignalsTableSummaryDataProcessed
        }, () => {
            this.convertValuesForRegionalHtsViz();
        });
    }

    // Time Series for displaying regional signals
    getRegionalSignalsHtsDataEvents(entityType) {
        let until = this.state.until;
        let from = this.state.from;
        let attr = this.state.eventOrderByAttr;
        let order = this.state.eventOrderByOrder;
        let entities = this.state.regionalSignalsTableSummaryDataProcessed.slice(0, 30).map(entity => {
            // some entities don't return a code to be used in an api call, seem to default to '??' in that event
            if (entity.code !== "??") {
                return entity.entityCode;
            }
        }).toString();
        this.props.getRawRegionalSignalsAction(entityType, entities, from, until, attr, order);
    }
    convertValuesForRegionalHtsViz() {
        let rawRegionalSignalsProcessedPingSlash24 = [];
        let rawRegionalSignalsProcessedBgp = [];
        let rawRegionalSignalsProcessedUcsdNt = [];
        // Create visualization-friendly data objects
        this.state.rawRegionalSignals.map(tsData => {
            tsData.map(datasource => {
                let series;
                switch(datasource.datasource) {
                    case 'ping-slash24':
                        series = convertTsDataForHtsViz(datasource);
                        rawRegionalSignalsProcessedPingSlash24 = rawRegionalSignalsProcessedPingSlash24.concat(series);
                        break;
                    case 'bgp':
                        series = convertTsDataForHtsViz(datasource);
                        rawRegionalSignalsProcessedBgp = rawRegionalSignalsProcessedBgp.concat(series);
                        break;
                    case 'ucsd-nt':
                        series = convertTsDataForHtsViz(datasource);
                        rawRegionalSignalsProcessedUcsdNt = rawRegionalSignalsProcessedUcsdNt.concat(series);
                        break;
                    default:
                        break;
                }
            });
        });
        // Add data objects to state for each data source
        this.setState({
            rawRegionalSignalsProcessedPingSlash24: rawRegionalSignalsProcessedPingSlash24,
            rawRegionalSignalsProcessedBgp: rawRegionalSignalsProcessedBgp,
            rawRegionalSignalsProcessedUcsdNt: rawRegionalSignalsProcessedUcsdNt
        }, () => {
            // console.log(this.state.rawRegionalSignalsProcessedPingSlash24);
            // console.log(this.state.rawRegionalSignalsProcessedBgp);
            // console.log(this.state.rawRegionalSignalsProcessedUcsdNt);
            this.populateRegionalHtsChart(900, 'ping-slash24');
            this.populateRegionalHtsChart(900, 'bgp');
            this.populateRegionalHtsChart(900, 'ucsd-nt');
        });
    }
    populateRegionalHtsChart(width, datasource) {
        switch(datasource) {
            case 'ping-slash24':
                if (this.state.rawAsnSignalsProcessedPingSlash24) {
                    const myChart = HorizonTSChart()(document.getElementById(`regional-horizon-chart--pingSlash24`));
                    myChart
                        .data(this.state.rawRegionalSignalsProcessedPingSlash24)
                        .series('entityCode')
                        .yNormalize(false)
                        .useUtc(true)
                        .use24h(false)
                        // Will need to detect column width to populate height
                        .width(width)
                        .height(200)
                        .enableZoom(false)
                        .toolTipContent = ({series, ts, val}) => `${series}<br>${ts}: ${humanizeNumber(val)}`
                        .showRuler(true);

                    break;
                }
            case 'bgp':
                if (this.state.rawRegionalSignalsProcessedBgp) {
                    const myChart = HorizonTSChart()(document.getElementById(`regional-horizon-chart--bgp`));
                    myChart
                        .data(this.state.rawRegionalSignalsProcessedBgp)
                        .series('entityCode')
                        .yNormalize(false)
                        .useUtc(true)
                        .use24h(false)
                        // Will need to detect column width to populate height
                        .width(width)
                        .height(400)
                        .enableZoom(false)
                        .toolTipContent=({ series, ts, val }) => `${series}<br>${ts}: ${humanizeNumber(val)}`
                        .showRuler(true);
                }
                break;
            case 'ucsd-nt':
                if (this.state.rawRegionalSignalsProcessedUcsdNt) {
                    const myChart = HorizonTSChart()(document.getElementById(`regional-horizon-chart--ucsdNt`));
                    myChart
                        .data(this.state.rawRegionalSignalsProcessedUcsdNt)
                        .series('entityCode')
                        .yNormalize(false)
                        .useUtc(true)
                        .use24h(false)
                        // Will need to detect column width to populate height
                        .width(width)
                        .height(400)
                        .enableZoom(false)
                        .toolTipContent=({ series, ts, val }) => `${series}<br>${ts}: ${humanizeNumber(val)}`
                        .showRuler(true);
                }
                break;
            default:
                break;
        }
    }


// Table Modal
    // Table displaying all ASes regardless of score
    combineValuesForAsnSignalsTable() {
        if (this.state.relatedToTableSummary && this.state.asnSignalsTableSummaryData) {
            let signalsTableData = combineValuesForSignalsTable(this.state.relatedToTableSummary, this.state.asnSignalsTableSummaryData);
            this.setState({
                asnSignalsTableSummaryDataProcessed: signalsTableData
            }, () => {
                this.genAsnSignalsTable();
                // Populate Stacked horizon graph with all regions
                this.state.entityType !== 'asn'
                    ? this.getAsnSignalsHtsDataEvents("asn")
                    : this.getAsnSignalsHtsDataEvents("country");
            })
        }
    }
    genAsnSignalsTable() {
        return (
            this.state.asnSignalsTableSummaryDataProcessed &&
            <Table
                type="signal"
                data={this.state.asnSignalsTableSummaryDataProcessed}
                nextPage={() => this.nextPageAsnSignalsTableSummary()}
                prevPage={() => this.prevPageAsnSignalsTableSummary()}
                currentDisplayLow={this.state.asnSignalsTableCurrentDisplayLow}
                currentDisplayHigh={this.state.asnSignalsTableCurrentDisplayHigh}
                totalCount={this.state.asnSignalsTableSummaryDataProcessed.length}
                entityType={this.state.entityType === "asn" ? "country" : "asn"}
            />
        )
    }
    nextPageAsnSignalsTableSummary() {
        let nextPageValues = nextPage(!!this.state.asnSignalsTableSummaryDataProcessed, this.state.asnSignalsTableSummaryDataProcessed.length, this.state.asnSignalsTablePageNumber, this.state.asnSignalsTableCurrentDisplayHigh, this.state.asnSignalsTableCurrentDisplayLow);
        this.setState({
            asnSignalsTablePageNumber: nextPageValues.newPageNumber,
            asnSignalsTableCurrentDisplayLow: nextPageValues.newCurrentDisplayLow,
            asnSignalsTableCurrentDisplayHigh: nextPageValues.newCurrentDisplayHigh
        });
    }
    prevPageAsnSignalsTableSummary() {
        let prevPageValues = prevPage(!!this.state.asnSignalsTableSummaryDataProcessed, this.state.asnSignalsTableSummaryDataProcessed.length, this.state.asnSignalsTablePageNumber, this.state.asnSignalsTableCurrentDisplayHigh, this.state.asnSignalsTableCurrentDisplayLow);
        this.setState({
            asnSignalsTablePageNumber: prevPageValues.newPageNumber,
            asnSignalsTableCurrentDisplayLow: prevPageValues.newCurrentDisplayLow,
            asnSignalsTableCurrentDisplayHigh: prevPageValues.newCurrentDisplayHigh
        });

    }

    // Time Series for displaying regional signals
    getAsnSignalsHtsDataEvents(entityType) {
        let until = this.state.until;
        let from = this.state.from;
        let attr = this.state.eventOrderByAttr;
        let order = this.state.eventOrderByOrder;
        let entities = this.state.asnSignalsTableSummaryDataProcessed.slice(0, 30).map(entity => {
            // some entities don't return a code to be used in an api call, seem to default to '??' in that event
            if (entity.code !== "??") {
                return entity.entityCode;
            }
        }).toString();
        this.props.getRawAsnSignalsAction(entityType, entities, from, until, attr, order);
    }
    convertValuesForAsnHtsViz() {
        let rawAsnSignalsProcessedPingSlash24 = [];
        let rawAsnSignalsProcessedBgp = [];
        let rawAsnSignalsProcessedUcsdNt = [];

        // console.log(this.state.rawAsnSignals);

        // console.log(this.state.rawRegionalSignals);
        this.state.rawAsnSignals.map(tsData => {
            tsData.map(datasource => {
                // Create visualization-friendly data objects
                let series;
                switch(datasource.datasource) {
                    case 'ping-slash24':
                        series = convertTsDataForHtsViz(datasource);
                        rawAsnSignalsProcessedPingSlash24 = rawAsnSignalsProcessedPingSlash24.concat(series);
                        break;
                    case 'bgp':
                        series = convertTsDataForHtsViz(datasource);
                        rawAsnSignalsProcessedBgp = rawAsnSignalsProcessedBgp.concat(series);
                        break;
                    case 'ucsd-nt':
                        series = convertTsDataForHtsViz(datasource);
                        rawAsnSignalsProcessedUcsdNt = rawAsnSignalsProcessedUcsdNt.concat(series);
                        break;
                    default:
                        break;
                }
            });

        });
        // Add data objects to state for each data source
        this.setState({
            rawAsnSignalsProcessedPingSlash24: rawAsnSignalsProcessedPingSlash24,
            rawAsnSignalsProcessedBgp: rawAsnSignalsProcessedBgp,
            rawAsnSignalsProcessedUcsdNt: rawAsnSignalsProcessedUcsdNt
        }, () => {
            // console.log(this.state.rawAsnSignalsProcessedPingSlash24);
            // console.log(this.state.rawAsnSignalsProcessedBgp);
            // console.log(this.state.rawAsnSignalsProcessedUcsdNt);
            this.populateAsnHtsChart(900, 'ping-slash24');
            this.populateAsnHtsChart(900, 'bgp');
            this.populateAsnHtsChart(900, 'ucsd-nt');
        });
    }
    populateAsnHtsChart(width, datasource) {
        switch(datasource) {
            case 'ping-slash24':
                if (this.state.rawAsnSignalsProcessedPingSlash24) {
                    // console.log(this.state.rawRegionalSignalsProcessedPingSlash24);
                    const myChart = HorizonTSChart()(document.getElementById(`asn-horizon-chart--pingSlash24`));
                    myChart
                        .data(this.state.rawAsnSignalsProcessedPingSlash24)
                        .series('entityCode')
                        .yNormalize(false)
                        .useUtc(true)
                        .use24h(false)
                        // Will need to detect column width to populate height
                        .width(width)
                        .height(200)
                        .enableZoom(false)
                        .toolTipContent=({ series, ts, val }) => `${series}<br>${ts}: ${humanizeNumber(val)}`
                        .showRuler(true);
                }
                break;
            case 'bgp':
                if (this.state.rawAsnSignalsProcessedBgp) {
                    const myChart = HorizonTSChart()(document.getElementById(`asn-horizon-chart--bgp`));
                    myChart
                        .data(this.state.rawAsnSignalsProcessedBgp)
                        .series('entityCode')
                        .yNormalize(false)
                        .useUtc(true)
                        .use24h(false)
                        // Will need to detect column width to populate height
                        .width(width)
                        .height(400)
                        .enableZoom(false)
                        .toolTipContent=({ series, ts, val }) => `${series}<br>${ts}: ${humanizeNumber(val)}`
                        .showRuler(true);
                }
                break;
            case 'ucsd-nt':
                if (this.state.rawAsnSignalsProcessedUcsdNt) {
                    const myChart = HorizonTSChart()(document.getElementById(`asn-horizon-chart--ucsdNt`));
                    myChart
                        .data(this.state.rawAsnSignalsProcessedUcsdNt)
                        .series('entityCode')
                        .yNormalize(false)
                        .useUtc(true)
                        .use24h(false)
                        // Will need to detect column width to populate height
                        .width(width)
                        .height(400)
                        .enableZoom(false)
                        .toolTipContent=({ series, ts, val }) => `${series}<br>${ts}: ${humanizeNumber(val)}`
                        .showRuler(true);
                }
                break;
            default:
                break;
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
        signals: state.iodaApi.signals,
        mapModalSummary: state.iodaApi.mapModalSummary,
        mapModalTopoData: state.iodaApi.mapModalTopoData,
        regionalSignalsTableSummaryData: state.iodaApi.regionalSignalsTableSummaryData,
        asnSignalsTableSummaryData: state.iodaApi.asnSignalsTableSummaryData,
        rawRegionalSignals: state.iodaApi.rawRegionalSignals,
        rawAsnSignals: state.iodaApi.rawAsnSignals
    }
};

const mapDispatchToProps = (dispatch) => {
    return {
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
        getSignalsAction: (entityType, entityCode, from, until, datasource=null, maxPoints=null) => {
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
        getRawRegionalSignalsAction: (entityType, entityCode, from, until, datasource=null, maxPoints=null) => {
            getRawRegionalSignalsAction(dispatch, entityType, entityCode, from, until, datasource, maxPoints);
        },
        getRawAsnSignalsAction: (entityType, entityCode, from, until, datasource=null, maxPoints=null) => {
            getRawAsnSignalsAction(dispatch, entityType, entityCode, from, until, datasource, maxPoints);
        }


        // searchRelatedEntitiesAction: (from, until, entityType, relatedToEntityType, relatedToEntityCode) => {
        //     searchRelatedEntities(dispatch, from, until, entityType, relatedToEntityType, relatedToEntityCode);
        // },



    }
};

export default connect(mapStateToProps, mapDispatchToProps)(Entity);
