// React Imports
import React, { Component } from 'react';
import {connect} from "react-redux";
import { withRouter } from 'react-router-dom';
// Internationalization
import T from 'i18n-react';
// Data Hooks
import { searchEntities, searchRelatedEntities } from "../../data/ActionEntities";
import { getTopoAction } from "../../data/ActionTopo";
import {searchAlerts, searchEvents, searchSummary, totalOutages} from "../../data/ActionOutages";
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
import {convertSecondsToDateValues, humanizeNumber, toDateTime} from "../../utils"
import {as} from "../dashboard/DashboardConstants";
import CanvasJSChart from "../../libs/canvasjs/canvasjs.react";



class Entity extends Component {
    constructor(props) {
        super(props);
        this.state = {
            // Global
            mounted: false,
            entityType: window.location.pathname.split("/")[1],
            entityCode: window.location.pathname.split("/")[2],
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
            pageNumber: 0,
            currentDisplayLow: 0,
            currentDisplayHigh: 10,
            // Event/Table Data
            currentTable: 'alert',
            eventDataRaw: null,
            eventDataProcessed: [],
            alertDataRaw: null,
            alertDataProcessed: [],

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
            this.props.getSignalsAction( window.location.pathname.split("/")[1],window.location.pathname.split("/")[2], this.state.from, this.state.until, null, null);
        });
    }

    componentWillUnmount() {
        this.setState({
            mounted: false
        })
    }

    componentDidUpdate(prevProps, prevState) {
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
                this.setState({currentDisplayHigh: this.props.events.length});
            }
            this.setState({
                eventDataRaw: this.props.events
            }, () => {
                this.convertValuesForEventTable();
            });
        }

        // Make API call for data to populate Alert Table
        if (this.props.alerts !== prevProps.alerts) {
            this.setState({
                alertDataRaw: this.props.alerts
            }, () => {
                this.convertValuesForAlertTable();
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
        // set time stamp on date
        dStart = dStart.setHours(tStart[0], tStart[1], tStart[2]);
        dEnd = dEnd.setHours(tEnd[0], tEnd[1], tEnd[2]);
        // convert to seconds
        dStart = Math.round(new Date(dStart).getTime() / 1000);
        dEnd = Math.round(new Date(dEnd).getTime() / 1000);

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
        let bgp = this.state.tsDataRaw[1];
        let bgpValues = [];
        bgp.values && bgp.values.map((value, index) => {
            let x, y;
            x = toDateTime(bgp.from + (bgp.step * index));
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
                title: {
                    text: `IODA Signals for ${activeProbing.entityCode}`
                },
                axisX: {
                    title: "Time (UTC)",
                    stripLines: stripLines
                },
                axisY: {
                    title: "Active Probing and BGP",
                    titleFontsColor: "#2c3e50",
                    lineColor: "#34a02c",
                    labelFontColor: "#34a02c",
                    tickColor: "#34a02c"
                },
                axisY2: {
                    title: "Network Telescope",
                    titleFontsColor: "#2c3e50",
                    lineColor: "#00a9e0",
                    labelFontColor: "#00a9e0",
                    tickColor: "#00a9e0"
                },
                toolTip: {
                    shared: true,
                    enabled: true,
                    animationEnabled: true
                },
                legend: {
                    cursor: "pointer"
                },
                data: [
                    {
                        type: "spline",
                        name: bgp.datasource,
                        showInLegend: true,
                        xValueFormatString: "HH:MM - MMM DD, YYYY",
                        yValueFormatString: "##",
                        dataPoints: bgpValues,
                        toolTipContent: "{x} <br/> BGP: {y}"
                    },
                    {
                        type: "spline",
                        name: activeProbing.datasource,
                        showInLegend: true,
                        xValueFormatString: "HH:MM - MMM DD, YYYY",
                        yValueFormatString: "##",
                        dataPoints: activeProbingValues,
                        toolTipContent: "{x} <br/> Active Probing: {y}"
                    },
                    {
                        type: "spline",
                        name: networkTelescope.datasource,
                        axisYType: "secondary",
                        showInLegend: true,
                        xValueFormatString: "HH:MM - MMM DD, YYYY",
                        yValueFormatString: "##",
                        dataPoints: networkTelescopeValues,
                        toolTipContent: "{x} <br/> Network Telescope: {y}"
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
                <CanvasJSChart options = {this.state.xyDataOptions}
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
                nextPage={() => this.nextPage()}
                prevPage={() => this.prevPage()}
                currentDisplayLow={this.state.currentDisplayLow}
                currentDisplayHigh={this.state.currentDisplayHigh}
                totalCount={this.state.eventDataProcessed.length}
            />
        )
    }
    nextPage() {
        if (this.state.totalOutages && this.state.totalOutages > this.state.pageNumber + 1 * this.state.currentDisplayHigh) {
            this.setState({
                pageNumber: this.state.pageNumber + 1,
                currentDisplayLow: this.state.currentDisplayLow + 10,
                currentDisplayHigh: this.state.currentDisplayHigh + 10 < this.state.totalOutages
                    ? this.state.currentDisplayHigh + 10
                    : this.state.summaryDataProcessed.length,
                topoData: null,
            }, () => {
                this.getDataOutageSummary(this.state.activeTabType);
                this.state.activeTabType !== as.type
                    ? this.getDataTopo(this.state.activeTabType)
                    : null;
            })
        }
    }
    prevPage() {
        if (this.state.summaryDataProcessed && this.state.pageNumber > 0) {
            this.setState({
                pageNumber: this.state.pageNumber - 1,
                currentDisplayLow: this.state.currentDisplayLow - 10,
                currentDisplayHigh: this.state.currentDisplayHigh + 10 > this.state.totalOutages
                    ? 10 * this.state.pageNumber - 10
                    : this.state.currentDisplayHigh - 10,
                topoData: null,
            }, () => {
                this.getDataOutageSummary(this.state.activeTabType);
                this.state.activeTabType !== as.type
                    ? this.getDataTopo(this.state.activeTabType)
                    : null;
            })
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
                nextPage={() => this.nextPage()}
                prevPage={() => this.prevPage()}
                currentDisplayLow={this.state.currentDisplayLow}
                currentDisplayHigh={this.state.currentDisplayHigh}
                totalCount={this.state.eventDataProcessed.length}
            />
        )
    }

    render() {
        return(
            <div className="entity">
                <div className="row title">
                    <div className="col-1-of-1">
                        {/*ToDo: Update today to be dynamic*/}
                        <h2>Outages Occurring Today</h2>
                    </div>
                </div>
                <ControlPanel
                    from={this.state.from}
                    until={this.state.until}
                    timeFrame={this.handleTimeFrame}
                    searchbar={() => this.populateSearchBar()}
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
                {/*<EntityRelated*/}
                {/*    entity={this.state.entityCode}*/}
                {/*/>*/}
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        suggestedSearchResults: state.iodaApi.entities,
        relatedEntities: state.iodaApi.relatedEntities,
        summary: state.iodaApi.summary,
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
        searchRelatedEntitiesAction: (from, until, entityType, relatedToEntityType, relatedToEntityCode) => {
            searchRelatedEntities(dispatch, from, until, entityType, relatedToEntityType, relatedToEntityCode);
        },
        searchSummaryAction: (from, until, entityType, entityCode, limit, page, includeMetaData) => {
            searchSummary(dispatch, from, until, entityType, entityCode, limit, page, includeMetaData);
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
