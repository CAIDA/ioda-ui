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
import {tabOptions, country, region, asn} from "./DashboardConstants";
import {connect} from "react-redux";
// Helper Functions
import {
    convertValuesForSummaryTable,
    humanizeNumber,
    convertTsDataForHtsViz,
    dateRangeToSeconds,
    controlPanelTimeRangeLimit,
    convertTimeToSecondsForURL
} from "../../utils";
import Loading from "../../components/loading/Loading";
import * as d3 from 'd3-shape';



class Dashboard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            mounted: false,
            // Control Panel
            from: window.location.search.split("?")[1]
                ? convertTimeToSecondsForURL(window.location.search.split("?")[1].split("&")[0].split("=")[1])
                : Math.round((new Date().getTime()  - (24 * 60 * 60 * 1000)) / 1000),
            until: window.location.search.split("?")[1]
                ? convertTimeToSecondsForURL(window.location.search.split("?")[1].split("&")[1].split("=")[1])
                : Math.round(new Date().getTime() / 1000),
            // Tabs
            activeTab: typeof window.location.pathname.split("/")[2] !== 'undefined' && window.location.pathname.split("/")[2].split("?")[0] === region.type ? region.tab :
                typeof window.location.pathname.split("/")[2] !== 'undefined' && window.location.pathname.split("/")[2].split("?")[0] === asn.type ? asn.tab : country.tab,
            activeTabType: typeof window.location.pathname.split("/")[2] !== 'undefined' && window.location.pathname.split("/")[2].split("?")[0] === region.type ? region.type :
                typeof window.location.pathname.split("/")[2] !== 'undefined' && window.location.pathname.split("/")[2].split("?")[0] === asn.type ? asn.type : country.type,
            tab: typeof window.location.pathname.split("/")[2] !== 'undefined' && window.location.pathname.split("/")[2].split("?")[0] === "region" ? T.translate("dashboard.regionTabTitle") :
                typeof window.location.pathname.split("/")[2] !== 'undefined' && window.location.pathname.split("/")[2].split("?")[0] === "asn" ? T.translate("dashboard.asnTabTitle") : T.translate("dashboard.countryTabTitle"),
            //Tab View Changer Button
            tabCurrentView: typeof window.location.pathname.split("/")[2] !== 'undefined' && window.location.pathname.split("/").length === 2 && window.location.pathname.split("/")[2].split("?")[0] === asn.type ? 'timeSeries' : "map",
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
            apiPageNumber: 0,
            // Event Data for Time Series
            eventDataRaw: [],
            eventDataProcessed: [],
            eventOrderByAttr: "score",
            eventOrderByOrder: "desc",
            eventEndpointCalled: false,
            totalEventCount: 0
        };
        this.tabs = {
            country: country.tab,
            region: region.tab,
            asn: asn.tab
        };
        this.countryTab = T.translate("dashboard.countryTabTitle");
        this.regionTab = T.translate("dashboard.regionTabTitle");
        this.asnTab = T.translate("dashboard.asnTabTitle");
        this.handleTimeFrame = this.handleTimeFrame.bind(this);
        this.handleEntityShapeClick = this.handleEntityShapeClick.bind(this);
        this.apiQueryLimit = 170;
    }

    componentDidMount() {
        // Check if time parameters are provided
        if (window.location.search) {
            let providedFrom = window.location.search.split("&")[0].split("=")[1];
            let providedUntil = window.location.search.split("&")[1].split("=")[1];

            let newFrom = convertTimeToSecondsForURL(providedFrom);
            let newUntil = convertTimeToSecondsForURL(providedUntil);

            this.setState({
                from: newFrom,
                until: newUntil
            })
        }

        this.setState({
            mounted: true,
        },() => {
            if (this.state.until - this.state.from < controlPanelTimeRangeLimit) {
                // Set initial tab to load
                this.handleSelectTab(this.tabs[this.props.match.params.tab]);
                // Get topo and outage data to populate map and table
                window.location.pathname.split("/")[2] && window.location.pathname.split("/")[2].split("?")[0] !== "asn" ?
                    this.getDataTopo(this.state.activeTabType) :
                    window.location.pathname.split("/").length === 2 ? this.getDataTopo(this.state.activeTabType) :
                        window.location.pathname.split("/").length === 3 && window.location.pathname.split("/")[2] === "" ? this.getDataTopo(this.state.activeTabType) :
                            null;

                this.getDataOutageSummary(this.state.activeTabType);
                this.getTotalOutages(this.state.activeTabType);
            }
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
            this.state.activeTabType !== asn.type
                ? this.getDataTopo(this.state.activeTabType)
                : null;
            this.getDataOutageSummary(this.state.activeTabType);
            this.getTotalOutages(this.state.activeTabType);
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
                this.convertValuesForSummaryTable();
                if (this.state.activeTabType === 'asn') {
                    this.getDataEvents(this.state.activeTabType);
                }

                if (!this.state.eventEndpointCalled) {
                    this.setState({
                        eventEndpointCalled: !this.state.eventEndpointCalled
                    }, () => {
                        //Get total event count to reference with event data
                        let totalEventCount = 0;
                        let eventCnt = 0;
                        this.state.summaryDataRaw.map(obj => {
                            eventCnt = eventCnt + obj.event_cnt;
                            totalEventCount += obj.event_cnt;
                        });
                        this.setState({
                            totalEventCount: totalEventCount
                        });
                    });
                }
            })
        }

        // After API call for total outages summary data completes, pass total count to table to populate in UI
        if (this.props.totalOutages !== prevProps.totalOutages) {
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
        if (this.props.eventSignals !== prevProps.eventSignals) {
            let newEventData = this.props.eventSignals;
            this.setState(prevState => ({
                eventDataRaw: [...prevState.eventDataRaw, newEventData]
            }), () => {
                this.convertValuesForHtsViz();
            });
        }
    }

// Control Panel
    // manage the date selected in the input
    handleTimeFrame(dateRange, timeRange) {
        const range = dateRangeToSeconds(dateRange, timeRange);
        const { history } = this.props;
        if (this.state.from !== range[0] || this.state.until !== range[1]) {
            history.push(`/dashboard?from=${range[0]}&until=${range[1]}`);
        }

        this.setState({
            from: range[0],
            until: range[1],
            summaryDataRaw: null,
            topoData: null,
            summaryDataProcessed: [],
            tabCurrentView: "map",
            eventDataRaw: [],
            eventDataProcessed: [],
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

        if (selectedKey === asn.tab) {
            this.setState({
                activeTab: selectedKey,
                tab: this.asnTab,
                activeTabType: asn.type,
                // Trigger Data Update for new tab
                tabCurrentView: "map",
                topoData: null,
                summaryDataRaw: null,
                eventDataRaw: [],
                eventDataProcessed: null,
                eventEndpointCalled: false,
                totalEventCount: 0
            });
            if (history.location.pathname !== asn.url) {
                if (window.location.search) {
                    history.push(`${asn.url}/?from=${window.location.search.split("?")[1].split("&")[0].split("=")[1]}&until=${window.location.search.split("?")[1].split("&")[1].split("=")[1]}`);
                } else {
                    history.push(asn.url);
                }
            }
        }
        else if (selectedKey === region.tab) {
            this.setState({
                activeTab: selectedKey,
                tab: this.regionTab,
                activeTabType: region.type,
                // Trigger Data Update for new tab
                tabCurrentView: "map",
                topoData: null,
                summaryDataRaw: null,
                eventDataRaw: [],
                eventDataProcessed: null,
                eventEndpointCalled: false,
                totalEventCount: 0
            });
            if (window.location.search) {
                history.push(`${region.url}/?from=${window.location.search.split("?")[1].split("&")[0].split("=")[1]}&until=${window.location.search.split("?")[1].split("&")[1].split("=")[1]}`);
            } else {
                history.push(region.url);
            }

        }
        else if (selectedKey === country.tab) {
            this.setState({
                activeTab: country.tab,
                tab: this.countryTab,
                activeTabType: country.type,
                // Trigger Data Update for new tab
                tabCurrentView: "map",
                topoData: null,
                summaryDataRaw: null,
                eventDataRaw: [],
                eventDataProcessed: null,
                eventEndpointCalled: false,
                totalEventCount: 0
            });
            if (history.location.pathname !== country.url) {
                if (window.location.search) {
                    history.push(`${country.url}/?from=${window.location.search.split("?")[1].split("&")[0].split("=")[1]}&until=${window.location.search.split("?")[1].split("&")[1].split("=")[1]}`);
                } else {
                    history.push(country.url);
                }
            }
        }
    }
    handleTabChangeViewButton() {
        if (this.state.tabCurrentView === 'map') {
            this.setState({tabCurrentView: 'timeSeries'}, () => {
                this.getDataEvents(this.state.activeTabType);
            });
        } else if (this.state.tabCurrentView === 'timeSeries') {
            this.setState({tabCurrentView: 'map'});
        }
    }

// Outage Data
    // Make API call to retrieve summary data to populate on map
    getDataOutageSummary(entityType) {
        if (this.state.mounted) {
            let until = this.state.until;
            let from = this.state.from;
            let page = this.state.apiPageNumber;
            let limit = this.apiQueryLimit;
            const includeMetadata = true;
            // let page = null;
            const entityCode = null;
            if (until - from < controlPanelTimeRangeLimit) {
                this.props.searchSummaryAction(from, until, entityType, entityCode, limit, page, includeMetadata);
            }
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
            let scores = [];

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

                    // Used to determine coloring on map objects
                    scores.push(outage.scores.overall);
                    scores.sort((a, b) => {
                        return a - b;
                    });
                }
            });
            return <TopoMap topoData={topoData} scores={scores} handleEntityShapeClick={this.handleEntityShapeClick}/>;
        }

    }
    // Make API call to retrieve topographic data
    getDataTopo(entityType) {
        if (this.state.mounted) {
            this.props.getTopoAction(entityType);
        }
    }
    // function to manage when a user clicks a country in the map
    handleEntityShapeClick(entity) {
        const { history } = this.props;
        this.state.activeTabType === 'country'
            ? history.push(
            window.location.search.split("?")[1]
                ? `/country/${entity.properties.usercode}?from=${window.location.search.split("?")[1].split("&")[0].split("=")[1]}&until=${window.location.search.split("?")[1].split("&")[1].split("=")[1]}`
                : `/country/${entity.properties.usercode}`
            ) :
            history.push(
                window.location.search.split("?")[1]
                    ? `/region/${entity.properties.id}?from=${window.location.search.split("?")[1].split("&")[0].split("=")[1]}&until=${window.location.search.split("?")[1].split("&")[1].split("=")[1]}`
                    : `/region/${entity.properties.id}`
            )
    }

// Event Time Series
    getDataEvents(entityType) {
        // If using /signals/events endpoint
        let until = this.state.until;
        let from = this.state.from;
        let attr = this.state.eventOrderByAttr;
        let order = this.state.eventOrderByOrder;
        let entities = this.state.summaryDataRaw.map(entity => {
            // some entities don't return a code to be used in an api call, seem to default to '??' in that event
            if (entity.entity.code !== "??") {
                return entity.entity.code;
            }
        }).toString();
        this.props.getEventSignalsAction(entityType, entities, from, until, attr, order)
    }
    convertValuesForHtsViz() {
        let eventDataProcessed = [];
        // Create visualization-friendly data objects
        this.state.eventDataRaw.map(entity => {
                let series;
                series = convertTsDataForHtsViz(entity);
                eventDataProcessed = eventDataProcessed.concat(series);
        });
        // Add data objects to state for each data source
        this.setState({
            eventDataProcessed: eventDataProcessed
        });
    }
    populateHtsChart(width) {
        if (this.state.eventDataProcessed) {
            const myChart = HorizonTSChart()(document.getElementById(`horizon-chart`));
            myChart
                .data(this.state.eventDataProcessed)
                .series('entityName')
                .yNormalize(false)
                .useUtc(true)
                .use24h(false)
                // Will need to detect column width to populate height
                .width(width)
                .height(570)
                .enableZoom(false)
                .showRuler(true)
                .interpolationCurve(d3.curveStepAfter)
                .positiveColors(['white', '#006D2D'])
                // .positiveColorStops([.99])
                .toolTipContent=({ series, ts, val }) => `${series}<br>${ts}: ${humanizeNumber(val)}`;
        }
    }

// Search bar
    // get data for search results that populate in suggested search list
    getDataSuggestedSearchResults(searchTerm) {
        if (this.state.mounted) {
            // Set searchTerm to the value of nextProps, nextProps refers to the current search string value in the field.
            this.setState({ searchTerm: searchTerm });
            // Make api call
            this.props.searchEntitiesAction(searchTerm, 11);
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
        history.push(`/${entity.type}/${entity.code}`);
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
        />
    }

// Summary Table
    convertValuesForSummaryTable() {
        let summaryData = convertValuesForSummaryTable(this.state.summaryDataRaw);
        if (this.state.apiPageNumber === 0) {
            this.setState({
                summaryDataProcessed: summaryData
            }, () => {
                this.genSummaryTable();
            })
        }

        if (this.state.apiPageNumber > 0) {
            this.setState({
                summaryDataProcessed: this.state.summaryDataProcessed.concat(summaryData)
            }, () => {
                this.genSummaryTable();
            })
        }


    }
    genSummaryTable() {
        return (
            <Table
                type={"summary"}
                data={this.state.summaryDataProcessed}
                totalCount={this.state.totalOutages}
                entityType={this.state.activeTabType}
            />
        )
    }

    render() {
        let { tab, activeTab } = this.state;
        const title = T.translate("entity.pageTitle");
        return(
            <div className="dashboard">
                <ControlPanel
                    timeFrame={this.handleTimeFrame}
                    searchbar={() => this.populateSearchBar()}
                    from={this.state.from}
                    until={this.state.until}
                    title={title}
                    history={this.props.history}
                />
                <div className="row tabs">

                    <div className="col-1-of-1">
                        <Tabs
                            tabOptions={tabOptions}
                            activeTab={activeTab}
                            handleSelectTab={this.handleSelectTab}
                        />
                        {
                            tab === this.countryTab
                                ? this.state.topoData || this.state.until - this.state.from > controlPanelTimeRangeLimit
                                ? <DashboardTab
                                    type={this.state.activeTabType}
                                    populateGeoJsonMap={() => this.populateGeoJsonMap()}
                                    genSummaryTable={() => this.genSummaryTable()}
                                    populateHtsChart={(width) => this.populateHtsChart(width)}
                                    handleTabChangeViewButton={() => this.handleTabChangeViewButton()}
                                    tabCurrentView={this.state.tabCurrentView}
                                    from={this.state.from}
                                    until={this.state.until}
                                />
                                : <Loading/>
                                : null
                        }
                        {
                            tab === this.regionTab
                                ? this.state.topoData || this.state.until - this.state.from > controlPanelTimeRangeLimit
                                ? <DashboardTab
                                    type={this.state.activeTabType}
                                    populateGeoJsonMap={() => this.populateGeoJsonMap()}
                                    genSummaryTable={() => this.genSummaryTable()}
                                    populateHtsChart={(width) => this.populateHtsChart(width)}
                                    handleTabChangeViewButton={() => this.handleTabChangeViewButton()}
                                    tabCurrentView={this.state.tabCurrentView}
                                    from={this.state.from}
                                    until={this.state.until}
                                />
                                : <Loading/>
                                : null
                        }
                        {
                            tab === this.asnTab
                                ? this.state.eventDataProcessed || this.state.until - this.state.from > controlPanelTimeRangeLimit
                                ? <DashboardTab
                                    type={this.state.activeTabType}
                                    genSummaryTable={() => this.genSummaryTable()}
                                    populateHtsChart={(width) => this.populateHtsChart(width)}
                                    handleTabChangeViewButton={() => this.handleTabChangeViewButton()}
                                    tabCurrentView={this.state.tabCurrentView}
                                    from={this.state.from}
                                    until={this.state.until}
                                />
                                : <Loading/>
                                : null
                        }
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
