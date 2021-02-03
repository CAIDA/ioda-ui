// React Imports
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
// Internationalization
import T from 'i18n-react';
// Data Hooks
import { searchEntities } from "../../data/ActionEntities";
import { getTopoAction } from "../../data/ActionTopo";
import { searchOverallEvents, searchSummary, totalOutages } from "../../data/ActionOutages";
import { getSignalsAction, getEventSignalsAction } from "../../data/ActionSignals";
// Components
import ControlPanel from '../../components/controlPanel/ControlPanel';
import { Searchbar } from 'caida-components-library'
import Tabs from '../../components/tabs/Tabs';
import DashboardTab from "./DashboardTab";
import TopoMap from "../../components/map/Map";
import * as topojson from 'topojson';
import Table from "../../components/table/Table";
import HorizonTSChart from 'horizon-timeseries-chart';
// Constants
import {tabOptions, country, region, as} from "./DashboardConstants";
import {connect} from "react-redux";
// Helper Functions
import {convertValuesForSummaryTable, humanizeNumber, sortByKey, nextPage, prevPage} from "../../utils";



class Dashboard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            mounted: false,
            // Control Panel
            from: window.location.search.split("?")[1]
                ? window.location.search.split("?")[1].split("&")[0].split("=")[1]
                : Math.round((new Date().getTime()  - (24 * 60 * 60 * 1000)) / 1000),
            until: window.location.search.split("?")[1]
                ? window.location.search.split("?")[1].split("&")[1].split("=")[1]
                : Math.round(new Date().getTime() / 1000),
            // Tabs
            activeTab: country.tab,
            activeTabType: country.type,
            tab: "Country View",
            // Search Bar
            suggestedSearchResults: null,
            searchTerm: null,
            // Map Data
            topoData: null,
            // Summary Table
            summaryDataRaw: null,
            summaryDataProcessed: [],
            totalOutages: 0,
            // Summary Table Pagination
            pageNumber: 0,
            apiPageNumber: 1,
            currentDisplayLow: 0,
            currentDisplayHigh: 10,
            // Event Data for Time Series
            eventDataRaw: [],
            eventDataProcessed: [],
            eventOrderByAttr: "score",
            eventOrderByOrder: "desc"
        };
        this.tabs = {
            country: country.tab,
            region: region.tab,
            as: as.tab
        };
        // Add to internationalization
        this.countryTab = "Country View";
        this.regionTab = "Region View";
        this.asTab = "AS/ISP View";
        this.handleTimeFrame = this.handleTimeFrame.bind(this);
    }

    componentDidMount() {
        let timeEntryInUrl = window.location.pathname.split("?");
        if (timeEntryInUrl[1]){
            this.setState({
                from: timeEntryInUrl[1].split("&")[0].split("=")[1],
                until: timeEntryInUrl[1].split("&")[1].split("=")[1],
            })
        }

        this.setState({
            mounted: true
        },() => {
            // Set initial tab to load
            this.handleSelectTab(this.tabs[this.props.match.params.tab]);
            // Get topo and outage data to populate map and table
            this.getDataTopo(this.state.activeTabType);
            this.getDataOutageSummary(this.state.activeTabType);
            this.getTotalOutages(this.state.activeTabType);
            this.getDataEvents(this.state.activeTabType);
        });
    }

    componentWillUnmount() {
        this.setState({
            mounted: false
        })
    }

    componentDidUpdate(prevProps, prevState) {
        // A check to prevent repetitive selection of the same tab
        if (this.props.match.params.tab !== prevProps.match.params.tab) {
            this.handleSelectTab(this.tabs[prevProps.match.params.tab]);
        }

        // Update visualizations when tabs are changed
        if (this.state.activeTabType && this.state.activeTabType !== prevState.activeTabType) {
            // Get updated topo and outage data to populate map, no topo for asns
            this.state.activeTabType !== as.type
                ? this.getDataTopo(this.state.activeTabType)
                : null;
            this.getDataOutageSummary(this.state.activeTabType);
            this.getTotalOutages(this.state.activeTabType);
            this.getDataEvents(this.state.activeTabType);
        }

        // After API call for suggested search results completes, update suggestedSearchResults state with fresh data
        if (this.props.suggestedSearchResults !== prevProps.suggestedSearchResults) {
            this.setState({
                suggestedSearchResults: this.props.suggestedSearchResults
            });
        }

        // After API call for outage summary data completes, pass summary data to map function for data merging
        if (this.props.summary !== prevProps.summary) {
            this.setState({
                summaryDataRaw: this.props.summary
            },() => {
                console.log(this.props.summary)
                this.convertValuesForSummaryTable();
                // Make API calls to get event signal data
                this.getDataEvents(this.state.activeTabType);
            })
        }

        // After API call for total outages summary data completes, pass total count to table to populate in UI
        if (this.props.totalOutages !== prevProps.totalOutages) {
            if (this.props.totalOutages.length < 10) {
                this.setState({currentDisplayHigh: this.props.totalOutages.length});
            }
            this.setState({
                totalOutages: this.props.totalOutages.length
            })
        }

        // After API call for topographic data completes, update topoData state with fresh data
        if (this.props.topoData !== prevProps.topoData) {
            let topoObjects;
            if (this.state.activeTabType === country.type) {
                topoObjects = topojson.feature(this.props.topoData.country.topology, this.props.topoData.country.topology.objects["ne_10m_admin_0.countries.v3.1.0"]);
            } else if (this.state.activeTabType === region.type) {
                topoObjects = topojson.feature(this.props.topoData.region.topology, this.props.topoData.region.topology.objects["ne_10m_admin_1.regions.v3.0.0"]);
            }

            this.setState({
                topoData: topoObjects
            }, () => {
                this.populateGeoJsonMap();
            });
        }

        // Make API call for data to populate time series stacked horizon view
        // if (this.props.overallEvents !== prevProps.overallEvents) {
        //     this.setState({
        //         eventDataRaw: this.props.overallEvents
        //     }, () => {
        //         this.convertValuesForHtsViz()
        //     });
        // }

        if (this.props.eventSignals !== prevProps.eventSignals) {
            let newEventData = this.props.eventSignals[0];
            // console.log(newEventData);
            this.setState(prevState => ({
                eventDataRaw: [...prevState.eventDataRaw, newEventData]
            }), () => {
                // const result = this.state.eventDataRaw.reduce( (acc, o) => (acc[o.entityCode] = (acc[o.entityCode] || 0)+1, acc), {} );
                const result = this.state.eventDataRaw;
                // console.log(Object.keys(result).length, "/", this.state.summaryDataRaw.length);
                console.log(this.state.summaryDataRaw);
                console.log(this.state.eventDataRaw);
                if (Object.keys(result).length === this.state.summaryDataRaw.length) {
                    // this.convertValuesForHtsViz();
                }
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
        // // Adjust for timezone?
        // dStart = new Date(dStart) - new Date(dStart).getTimezoneOffset() * 60;
        // dEnd = new Date(dStart) - new Date(dStart).getTimezoneOffset() * 60;

        const { history } = this.props;
        history.push(`/dashboard?from=${dStart}&until=${dEnd}`);

        this.setState({
            from: dStart,
            until: dEnd,
            summaryDataRaw: null,
            topoData: null,
            summaryDataProcessed: []
        }, () => {
            // Get topo and outage data to repopulate map and table
            this.getDataTopo(this.state.activeTabType);
            this.getDataOutageSummary(this.state.activeTabType);
            this.getTotalOutages(this.state.activeTabType);
        })
    }

// Tabbing
    // Function to map active tab to state and manage url
    handleSelectTab = selectedKey => {
        const { history } = this.props;

        if (selectedKey === as.tab) {
            this.setState({
                activeTab: selectedKey,
                tab: this.asTab,
                activeTabType: as.type,
                // Trigger Data Update for new tab
                topoData: null,
                summaryDataRaw: null,
                eventDataRaw: [],
                eventDataProcessed: null,
                // Reset Table Page Count
                pageNumber: 0,
                currentDisplayLow: 0,
                currentDisplayHigh: 10
            });
            if (history.location.pathname !== as.url) {history.push(as.url);}
        }
        else if (selectedKey === region.tab) {
            this.setState({
                activeTab: selectedKey,
                tab: this.regionTab,
                activeTabType: region.type,
                // Trigger Data Update for new tab
                topoData: null,
                summaryDataRaw: null,
                eventDataRaw: [],
                eventDataProcessed: null,
                // Reset Table Page Count
                pageNumber: 0,
                currentDisplayLow: 0,
                currentDisplayHigh: 10
            });
            if (history.location.pathname !== region.url) {history.push(region.url);}
        }
        else if (selectedKey === country.tab || !selectedKey) {
            this.setState({
                activeTab: country.tab,
                tab: this.countryTab,
                activeTabType: country.type,
                // Trigger Data Update for new tab
                topoData: null,
                summaryDataRaw: null,
                eventDataRaw: [],
                eventDataProcessed: null,
                // Reset Table Page Count
                pageNumber: 0,
                currentDisplayLow: 0,
                currentDisplayHigh: 10
            });
            if (history.location.pathname !== country.url) {history.push(country.url);}
        }
    };

// Outage Data
    // Make API call to retrieve summary data to populate on map
    getDataOutageSummary(entityType) {
        if (this.state.mounted) {
            let until = this.state.until;
            let from = this.state.from;
            const limit = 170;
            const includeMetadata = true;
            let page = this.state.pageNumber;
            // let page = null;
            const entityCode = null;
            this.props.searchSummaryAction(from, until, entityType, entityCode, limit, page, includeMetadata);
        }
    }
    getTotalOutages(entityType) {
        if (this.state.mounted) {
            let until = this.state.until;
            let from = this.state.from;
            this.props.totalOutagesAction(from, until, entityType);
        }
    }

// Map
    // Process Geo data, attribute outage scores to a new topoData property where possible, then render Map
    populateGeoJsonMap() {
        if (this.state.topoData && this.state.summaryDataRaw && this.state.summaryDataRaw[0] && this.state.summaryDataRaw[0]["entity"] && this.state.summaryDataRaw[0]["entity"]["type"] === this.state.activeTabType) {
            let topoData = this.state.topoData;

            // get Topographic info for a country if it has outages
            this.state.summaryDataRaw.map(outage => {
                let topoItemIndex;
                this.state.activeTabType === 'country'
                    ? topoItemIndex = this.state.topoData.features.findIndex(topoItem => topoItem.properties.usercode === outage.entity.code)
                    : this.state.activeTabType === 'region'
                    ? topoItemIndex = this.state.topoData.features.findIndex(topoItem => topoItem.properties.name === outage.entity.name)
                    : null;

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

// Event Time Series
    getDataEvents(entityType) {
        // If using /outages/events endpoint
        // let until = this.state.until;
        // let from = this.state.from;
        // let attr = this.state.eventOrderByAttr;
        // let order = this.state.eventOrderByOrder;
        //
        // this.props.searchOverallEventsAction(from, until, entityType, null, attr, order);

        // If using /signals/events endpoint
        let until = this.state.until;
        let from = this.state.from;
        let attr = this.state.eventOrderByAttr;
        let order = this.state.eventOrderByOrder;

        if (this.state.summaryDataRaw) {

            const anAsyncFunction = async entityCode => {
                if (entityCode) {
                    return Promise.resolve(this.props.getEventSignalsAction(entityType, entityCode, from, until, attr, order))
                }
            };

            const getData = async () => {
                return Promise.all(this.state.summaryDataRaw.map(entity => anAsyncFunction(entity.entity.code)))
            };

            // I need to try to figure out a way to trigger the convertValuesForHtsViz function after both
            // the Promise resolves and the eventDataRaw finishes updating in the componentDidUpdate function.

            // Check to see if the number of unique entities reporting events matches the number of entities listed in the summary table
            getData().then(() => {
                // let result =
                // console.log(result);
                // if (this.state.summaryDataRaw.length === this.state.eventDataRaw.filter(obj => obj.entityCode)) {

                // }
                // Need a way to figure out how to determin
                // console.log(this.state.eventDataRaw);
            });


            // const promises = this.state.summaryDataRaw.map(entity => {
            //         return new Promise(((resolve, reject) => {
            //             resolve(this.props.getEventSignalsAction(entityType, entity.entity.code, from, until, attr, order));
            //         }));
            //     });
            //
            // console.log(promises);
            //
            // Promise.all(promises).then((events) => {
            //     console.log(events);
            //     // this.convertValuesForHtsViz();
            // });


        }

    }
    convertValuesForHtsViz() {
        let tsDataConverted = [];
        console.log(this.state.eventDataRaw);
        this.state.eventDataRaw.map(tsData => {
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

            // console.log(tsDataConverted[2]);

            // Add data objects to state for each data source
            this.setState(prevState => ({
                eventDataProcessed: {
                    ...prevState.tsDataProcessed,
                    activeProbing: tsDataConverted[2],
                    bgp: tsDataConverted[1],
                    darknet: tsDataConverted[0]
                }
            }));
        })


        // let tsDataConverted = [];
        //
        // let eventDataSorted = sortByKey(this.state.eventDataRaw, 'location');
        // // console.log(this.state.eventDataRaw);
        // // console.log(eventDataSorted);
        //
        // this.state.eventDataRaw && this.state.eventDataRaw.slice(0, 100).map(tsData => {
        //     // Create visualization-friendly data objects
        //     // console.log(tsData);
        //     let singleEntryConverted = [];
        //     const initialPlotPoint = {
        //         entityCode: tsData.entity.name,
        //         ts: new Date(tsData.from * 1000),
        //         val: tsData.score
        //     };
        //     tsDataConverted.push(initialPlotPoint);
        //     // console.log(initialPlotPoint);
        //
        //     // Create additional plot points to fill in event data
        //     for (let i = tsData.from * 1000; i < (tsData.until * 1000);  i = i + 1000 * 60 * 5) {
        //         const fillerPlotPoint = {
        //             entityCode: tsData.entity.name,
        //             ts: i,
        //             val: tsData.score
        //         }
        //         tsDataConverted.push(fillerPlotPoint);
        //     }
        //
        //     const endingPlotPoint = {
        //         entityCode: tsData.entity.name,
        //         ts: new Date(tsData.until * 1000),
        //         val: tsData.score
        //     };
        //
        //     tsDataConverted.push(endingPlotPoint);
        //
        // });
        // // console.log(tsDataConverted);
        //
        // // Add data objects to state for each data source
        // this.setState( {
        //     eventDataProcessed: tsDataConverted
        // });


    }
    populateHtsChart(width) {
        if (this.state.eventDataProcessed) {
            const myChart = HorizonTSChart()(document.getElementById(`horizon-chart`));
            myChart
                .data(this.state.eventDataProcessed)
                .series('entityCode')
                .yNormalize(false)
                .useUtc(true)
                .use24h(false)
                // Will need to detect column width to populate height
                .width(width)
                .height(400)
                .enableZoom(true)
                .toolTipContent=({ series, ts, val }) => `${series}<br>${ts}: ${humanizeNumber(val)}`
                .showRuler(true);
        }


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

// Summary Table
    convertValuesForSummaryTable() {
        let summaryData = convertValuesForSummaryTable(this.state.summaryDataRaw);
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
                nextPage={() => this.nextPage()}
                prevPage={() => this.prevPage()}
                currentDisplayLow={this.state.currentDisplayLow}
                currentDisplayHigh={this.state.currentDisplayHigh}
                totalCount={this.state.totalOutages}
            />
        )
    }
    nextPage() {

        if (this.state.totalOutages && this.state.totalOutages > this.state.currentDisplayHigh) {
            let nextPageValues = nextPage(!!this.state.summaryDataProcessed, this.state.totalOutages, this.state.currentDisplayHigh, this.state.currentDisplayLow);
            this.setState({
                PageNumber: nextPageValues.newPageNumber,
                currentDisplayLow: nextPageValues.newCurrentDisplayLow,
                currentDisplayHigh: nextPageValues.newCurrentDisplayHigh
            }, () => {
                if (this.state.currentDisplayHigh > 170) {

                }
            });
        }
    }
    prevPage() {
        if (this.state.summaryDataProcessed && this.state.pageNumber > 0) {
            let prevPageValues = prevPage(!!this.state.summaryDataProcessed, this.state.totalOutages, this.state.currentDisplayHigh, this.state.currentDisplayLow);
            this.setState({
                pageNumber: prevPageValues.newPageNumber,
                currentDisplayLow: prevPageValues.newCurrentDisplayLow,
                currentDisplayHigh: prevPageValues.newCurrentDisplayHigh
            });
        }
    }

    render() {
        let { tab, activeTab } = this.state;
        return(
            <div className="dashboard">
                <div className="row title">
                    <div className="col-1-of-1">
                        {/*ToDo: Update today to be dynamic*/}
                        <h2>Outages Occurring Today</h2>
                    </div>
                </div>
                <ControlPanel
                    timeFrame={this.handleTimeFrame}
                    searchbar={() => this.populateSearchBar()}
                    from={this.state.from}
                    until={this.state.until}
                />
                <div className="row tabs">
                    <div className="col-1-of-1">
                        <Tabs
                            tabOptions={tabOptions}
                            activeTab={activeTab}
                            handleSelectTab={this.handleSelectTab}
                        />
                        {tab === this.countryTab && <DashboardTab
                            type={this.state.activeTabType}
                            populateGeoJsonMap={() => this.populateGeoJsonMap()}
                            genSummaryTable={() => this.genSummaryTable()}
                            populateHtsChart={(width) => this.populateHtsChart(width)}
                        />}
                        {tab === this.regionTab && <DashboardTab
                            type={this.state.activeTabType}
                            populateGeoJsonMap={() => this.populateGeoJsonMap()}
                            genSummaryTable={() => this.genSummaryTable()}
                            populateHtsChart={(width) => this.populateHtsChart(width)}
                        />}
                        {tab === this.asTab && <DashboardTab
                            type={this.state.activeTabType}
                            genSummaryTable={() => this.genSummaryTable()}
                            populateHtsChart={(width) => this.populateHtsChart(width)}
                        />}
                    </div>
                </div>
            </div>
        );
    }
}




const mapStateToProps = (state) => {
    return {
        suggestedSearchResults: state.iodaApi.entities,
        summary: state.iodaApi.summary,
        topoData: state.iodaApi.topo,
        totalOutages: state.iodaApi.summaryTotalCount,
        overallEvents: state.iodaApi.overallEvents,
        signals: state.iodaApi.signals,
        eventSignals: state.iodaApi.eventSignals
    }
};

const mapDispatchToProps = (dispatch) => {
    return {
        searchEntitiesAction: (searchQuery, limit=15) => {
            searchEntities(dispatch, searchQuery, limit);
        },
        searchSummaryAction: (from, until, entityType, entityCode=null, limit, page, includeMetaData) => {
            searchSummary(dispatch, from, until, entityType, entityCode, limit, page, includeMetaData);
        },
        totalOutagesAction: (from, until, entityType) => {
          totalOutages(dispatch, from, until, entityType);
        },
        getTopoAction: (entityType) => {
            getTopoAction(dispatch, entityType);
        },
        searchOverallEventsAction: (from, until, entityType=null, entityCode=null, datasource=null, includeAlerts=null, format=null, limit=null, page=null) => {
            searchOverallEvents(dispatch, from, until, entityType, entityCode, datasource, includeAlerts, format, limit, page);
        },
        getSignalsAction: (entityType, entityCode, from, until, datasource=null, maxPoints=null) => {
            getSignalsAction(dispatch, entityType, entityCode, from, until, datasource, maxPoints);
        },
        getEventSignalsAction:(entityType, entityCode, from, until, datasource=null, maxPoints=null) => {
            getEventSignalsAction(dispatch, entityType, entityCode, from, until, datasource, maxPoints);
        }
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);
