/*
 * This software is Copyright (c) 2013 The Regents of the University of
 * California. All Rights Reserved. Permission to copy, modify, and distribute this
 * software and its documentation for academic research and education purposes,
 * without fee, and without a written agreement is hereby granted, provided that
 * the above copyright notice, this paragraph and the following three paragraphs
 * appear in all copies. Permission to make use of this software for other than
 * academic research and education purposes may be obtained by contacting:
 *
 * Office of Innovation and Commercialization
 * 9500 Gilman Drive, Mail Code 0910
 * University of California
 * La Jolla, CA 92093-0910
 * (858) 534-5815
 * invent@ucsd.edu
 *
 * This software program and documentation are copyrighted by The Regents of the
 * University of California. The software program and documentation are supplied
 * "as is", without any accompanying services from The Regents. The Regents does
 * not warrant that the operation of the program will be uninterrupted or
 * error-free. The end-user understands that the program was developed for research
 * purposes and is advised not to rely exclusively on the program for any reason.
 *
 * IN NO EVENT SHALL THE UNIVERSITY OF CALIFORNIA BE LIABLE TO ANY PARTY FOR
 * DIRECT, INDIRECT, SPECIAL, INCIDENTAL, OR CONSEQUENTIAL DAMAGES, INCLUDING LOST
 * PROFITS, ARISING OUT OF THE USE OF THIS SOFTWARE AND ITS DOCUMENTATION, EVEN IF
 * THE UNIVERSITY OF CALIFORNIA HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH
 * DAMAGE. THE UNIVERSITY OF CALIFORNIA SPECIFICALLY DISCLAIMS ANY WARRANTIES,
 * INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
 * FITNESS FOR A PARTICULAR PURPOSE. THE SOFTWARE PROVIDED HEREUNDER IS ON AN "AS
 * IS" BASIS, AND THE UNIVERSITY OF CALIFORNIA HAS NO OBLIGATIONS TO PROVIDE
 * MAINTENANCE, SUPPORT, UPDATES, ENHANCEMENTS, OR MODIFICATIONS.
 */

// React Components
import React, { Component } from 'react';
import {connect} from "react-redux";
import {Link} from "react-router-dom";

// Actions
import {searchEntities} from "../../data/ActionEntities";
import {getDatasourcesAction} from "../../data/ActionDatasources";
import {getTopoAction} from "../../data/ActionTopo";
import {searchAlerts, searchEvents, searchSummary} from "../../data/ActionOutages";
import {getSignalsAction} from "../../data/ActionSignals";

// XY Graph Dependencies
import CanvasJSChart from '../../libs/canvasjs/canvasjs.react';

// Time Series Chart Dependencies
import HorizonTSChart from 'horizon-timeseries-chart';
import Table from "../../components/table/Table";

// Event Table Dependencies
import * as sd from 'simple-duration'
import { convertSecondsToDateValues, humanizeNumber, toDateTime } from "../../utils"

class TestAPI extends Component {
    constructor(props) {
        super(props);
        this.state = {
            mounted: false,
            // Search Bar states
            suggestedSearchResults: null,
            searchTerm: null,
            // Time Series states
            tsDataRaw: null,
            tsDataProcessed: {
                activeProbing: [],
                bgp: [],
                darknet: []
            },
            tsDataChartTitle: "",
            tsParentColumnWidth: 0,
            // XY Graph states
            xyDataOptions: null,
            // Alert table
            alertDataRaw: null,
            alertDataProcessed: [],
            // Event table
            eventDataRaw: null,
            eventDataProcessed: [],
            // Summary table
            summaryDataRaw: null,
            summaryDataProcessed: []
        };
    }

    componentDidMount() {
        this.setState({mounted: true});
        this.props.searchEntitiesAction("united states");
        this.props.getDatasourcesAction();
        // this.props.getTopoAction("country");
        this.props.searchAlertsAction(1602544098, 1602630498, "country", "TM", null, 30, null);
        this.props.searchEventsAction(1602544098, 1602630498, "country", "TM", null, false, null, 30, null);
        this.props.searchSummaryAction(1602544098, 1602630498, "region", null, 30, null);
        // this.props.getSignalsAction("country", "TM", 1602544098, 1602630498, null, null);
    }

    componentDidUpdate(prevProps) {
        // After API call for suggested search results completes, update suggestedSearchResults state with fresh data
        if (this.props.iodaApi.entities !== prevProps.iodaApi.entities) {
            // console.assert(this.props.iodaApi.entities[0].code==="US")
            // console.log("entities test passed")
            console.log(this.props.iodaApi.entities);
        }
        if (this.props.iodaApi.datasources !== prevProps.iodaApi.datasources) {
            console.assert(this.props.iodaApi.datasources.length===3)
            // console.log("datasources test passed");
        }
        if (this.props.iodaApi.topo !== prevProps.iodaApi.topo) {
            console.assert("country" in this.props.iodaApi.topo)
            // console.log("topology data test passed");
        }

        if (this.props.iodaApi.alerts !== prevProps.iodaApi.alerts) {
            // console.assert(this.props.iodaApi.alerts.length===14);
            // console.log("alerts search test passed");
            // console.log(this.props.iodaApi.alerts);
            this.setState({
                alertDataRaw: this.props.iodaApi.alerts
            }, () => {
                this.convertValuesForAlertTable();
            });
        }
        if (this.props.iodaApi.events !== prevProps.iodaApi.events) {
            // console.assert(this.props.iodaApi.events.length===9);
            // console.log("events search test passed");

            console.log(this.props.iodaApi);

            this.setState({
                eventDataRaw: this.props.iodaApi.events
            }, () => {
                this.convertValuesForEventTable();
            });
        }
        if (this.props.iodaApi.summary !== prevProps.iodaApi.summary) {
            // console.assert(this.props.iodaApi.summary.length===8);
            // console.log("summary search test passed");
            console.log(this.props.iodaApi.summary);
            this.setState({
                summaryDataRaw: this.props.iodaApi.summary
            },() => {
                this.convertValuesForSummaryTable();
            })

        }
        if (this.props.iodaApi.signals !== prevProps.iodaApi.signals) {
            // console.assert(this.props.iodaApi.signals.length===3);
            // console.log("signals search test passed");
            // console.log(this.props.iodaApi.signals);

            // Map props to state and initiate data processing
            this.setState({
                tsDataRaw: this.props.iodaApi.signals
            }, () => {
                // For Stacked Horizon Chart
                this.convertValuesForHtsViz();

                // For XY Plotted Graph
                this.convertValuesForXyViz();
            })
        }
    }

    // Horizon Time Series Functions
    convertValuesForHtsViz() {
        let tsDataConverted = [];
        this.state.tsDataRaw.map(tsData => {
            // Create visualization-friendly data objects
            let tsDatumConverted = [];
            tsData.values.map((value, index) => {
                const plotPoint = {
                    entityCode: tsData.entityCode,
                    datasource: tsData.datasource,
                    ts: new Date(tsData.from + tsData.step * index),
                    val: value
                };
                tsDatumConverted.push(plotPoint);
            });
            tsDataConverted.push(tsDatumConverted);

            // Add data objects to state for each data source
            this.setState(prevState => ({
                tsDataProcessed: {
                    ...prevState.tsDataProcessed,
                    activeProbing: tsDataConverted[2],
                    bgp: tsDataConverted[1],
                    darknet: tsDataConverted[0]
                }
            }));
        })
    }
    genHtsChart(dataSource) {
        const myChart = HorizonTSChart()(document.getElementById(`horizon-chart--${dataSource}`));
        myChart
            .data(this.state.tsDataProcessed[dataSource])
            .series('entityCode')
            .yNormalize(true)
            // Will need to detect column width to populate height
            .width(363.33)
            .height(100);
    }

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

        stripLines.length > 0 && this.setState({
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
            />
        )
    }

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
        return (
            this.state.eventDataProcessed &&
            <Table
                type={"event"}
                data={this.state.eventDataProcessed}
            />
        )
    }

    // Summary Table Functions
    convertValuesForSummaryTable() {
        let summaryData = [];
        this.state.summaryDataRaw.map(summary => {
            // console.log(summary["scores"]);
            let overallScore = null;

            let summaryScores = [];

            Object.entries(summary["scores"]).map((entry) => {
                // console.log(entry);
                if (entry[0] !== "overall") {
                    const entryItem = {
                        source: entry[0],
                        score: entry[1]
                    };
                    summaryScores.push(entryItem);
                } else {
                    overallScore = entry[1]
                }
            });

            // console.log(summaryScores);

            // console.log(summary);
            const summaryItem = {
                entityType: summary["entity"].type,
                name: summary["entity"].name,
                score: overallScore,
                scores: summaryScores
            };
            summaryData.push(summaryItem);
        });
        this.setState({
            summaryDataProcessed: summaryData
        }, () => {
            this.genSummaryTable();
        })
    }

    genSummaryTable() {
        return (
            this.state.summaryDataProcessed &&
            <Table
                type={"summary"}
                data={this.state.summaryDataProcessed}
            />
        )
    }

    render() {
        return (
            <div className='home'>
                <div className="row">
                    <h1>TestAPI</h1>
                </div>
                <div className="row">
                    <h2>Horizon Time Series Chart</h2>
                    <div className="col-1-of-3">
                        <h3>Active Probing</h3>
                        <div id="horizon-chart--activeProbing">
                            {
                                this.genHtsChart("activeProbing")
                            }
                        </div>
                    </div>
                    <div className="col-1-of-3">
                        <h3>BGP</h3>
                        <div id="horizon-chart--bgp">
                            {
                                this.genHtsChart("bgp")
                            }
                        </div>
                    </div>
                    <div className="col-1-of-3">
                        <h3>Darknet</h3>
                        <div id="horizon-chart--darknet">
                            {
                                this.genHtsChart("darknet")
                            }
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col-1-of-1">
                        <h2>Horizon Time Series Chart</h2>
                        <p><Link to="/">Working on Home page</Link></p>
                    </div>
                </div>
                <div className="row">
                    <div className="col-1-of-1">
                        <h2>XY Outage Signals Graph with CanvasJS</h2>
                        <div className="xy-graph--bgp">
                            {
                                this.genXyChart()
                            }
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col-1-of-2">
                        <h2>Alert Table</h2>
                        {
                            this.genAlertTable()
                        }
                    </div>
                    <div className="col-1-of-2">
                        <h2>Event Table</h2>
                        {
                            this.genEventTable()
                        }
                    </div>

                </div>
                <div className="row">
                    <div className="col-1-of-2">
                        <h2>Summary Table</h2>
                        {
                            this.genSummaryTable()
                        }
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        iodaApi: state.iodaApi,
    }
};

const mapDispatchToProps = (dispatch) => {
    return {
        searchEntitiesAction: (searchQuery, limit=15) => {
            searchEntities(dispatch, searchQuery, limit);
        },
        getDatasourcesAction: () => {
            getDatasourcesAction(dispatch);
        },
        getTopoAction: (type) => {
            getTopoAction(dispatch, type);
        },
        searchAlertsAction: (from, until, entityType=null, entityCode=null, datasource=null, limit=null, page=null) => {
            searchAlerts(dispatch, from, until, entityType, entityCode, datasource, limit, page);
        },
        searchEventsAction: (from, until, entityType=null, entityCode=null, datasource=null,
                             includeAlerts=null, format=null, limit=null, page=null) => {
            searchEvents(dispatch, from, until, entityType, entityCode, datasource, includeAlerts, format, limit, page);
        },
        searchSummaryAction: (from, until, entityType=null, entityCode=null, limit=null, page=null) => {
            searchSummary(dispatch, from, until, entityType, entityCode, limit, page);
        },
        getSignalsAction: (entityType, entityCode, from, until, datasource=null, maxPoints=null) => {
            getSignalsAction(dispatch, entityType, entityCode, from, until, datasource, maxPoints);
        }
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(TestAPI);
