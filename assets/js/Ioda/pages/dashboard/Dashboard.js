// React Imports
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
// Internationalization
import T from 'i18n-react';
// Data Hooks
import { searchEntities } from "../../data/ActionEntities";
import { getTopoAction } from "../../data/ActionTopo";
import { searchSummary } from "../../data/ActionOutages";
// Components
import ControlPanel from '../../components/controlPanel/ControlPanel';
import Tabs from '../../components/tabs/Tabs';
import DashboardTab from "./DashboardTab";
import { Searchbar } from 'caida-components-library'
import TopoMap from "../../components/map/Map";
import * as topojson from 'topojson';
// Constants
import {tabOptions, country, region, as} from "./DashboardConstants";
import {connect} from "react-redux";






class Dashboard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            mounted: false,
            // Tabs
            activeTab: country.tab,
            activeTabType: country.type,
            tab: "Country View",
            // Search bar
            suggestedSearchResults: null,
            searchTerm: null,
            // Map data
            topoData: null,
            // Table data
            outageSummaryData: null
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
    }

    componentDidMount() {
        this.setState({
            mounted: true
        },() => {
            // Set initial tab to load
            this.handleSelectTab(this.tabs[this.props.match.params.tab]);
            // Get topo and outage data to populate map
            this.getDataTopo(country.type);
            this.getDataOutageSummary(country.type);
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

        if (this.state.activeTabType && this.state.activeTabType !== prevState.activeTabType) {
            // Get updated topo and outage data to populate map
            this.getDataTopo(this.state.activeTabType);
            this.getDataOutageSummary(this.state.activeTabType);
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
                outageSummaryData: this.props.summary
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
    }

// Tabbing
    // Function to map active tab to state and manage url
    handleSelectTab = selectedKey => {
        const { history } = this.props;

        if (selectedKey === as.tab) {
            this.setState({
                activeTab: selectedKey,
                tab: this.asTab,
                activeTabType: as.type
            });
            if (history.location.pathname !== as.url) {history.push(as.url);}
        }
        else if (selectedKey === region.tab) {
            this.setState({
                activeTab: selectedKey,
                tab: this.regionTab,
                activeTabType: region.type
            });
            if (history.location.pathname !== region.url) {history.push(region.url);}
        }
        else if (selectedKey === country.tab || !selectedKey) {
            this.setState({
                activeTab: country.tab,
                tab: this.countryTab,
                activeTabType: country.type
            });
            history.push(country.url);
        }
    };

// Outage Data
    // Make API  call to retrieve summary data to populate on map
    getDataOutageSummary(entityType) {
        if (this.state.mounted) {
            console.log(entityType);
            let until = Math.round(new Date().getTime() / 1000);
            let from = Math.round((new Date().getTime()  - (24 * 60 * 60 * 1000)) / 1000);
            console.log(from, until);
            this.props.searchSummaryAction(from, until, entityType);
        }
    }

// Map
    // Populate JSX that creates the map once topographic data is available
    populateGeoJsonMap() {
        if (this.state.topoData && this.state.outageSummaryData && this.state.outageSummaryData[0]["entity"]["type"] === this.state.activeTabType) {
            // console.log(this.state.outageSummaryData[0]["entity"]["type"]);
            let topoData = this.state.topoData;

            // get Topographic info for a country if it has outages
            this.state.outageSummaryData.map(outage => {
                let topoItemIndex = this.state.topoData.features.findIndex(topoItem => topoItem.properties.usercode === outage.entity.code);

                if (topoItemIndex > 0) {
                    let item = topoData.features[topoItemIndex];
                    item.properties.score = outage.scores.overall;
                    topoData.features[topoItemIndex] = item;
                }
            });
            console.log(topoData);
            return <TopoMap topoData={topoData}/>;
        }
    }

    // Make API call to retrieve topographic data
    getDataTopo(entityType) {
        if (this.state.mounted) {
            console.log(entityType);
            this.props.getTopoAction(entityType);
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
        console.log(query);
        // query.name ? history.push(`/search?query=${query.name}`) : history.push(`/search?query=${query}`);
    };

    // Reset searchbar with searchterm value when a selection is made, no customizations needed here.
    handleQueryUpdate = (query) => {
        this.forceUpdate();
        this.setState({
            searchTerm: query
        });
    }

    render() {
        let { tab, activeTab } = this.state;
        return(
            <div className="dashboard">
                <div className="row title">
                    <div className="col-1-of-1">
                        {/*ToDo: Update today to be dynamic*/}
                        <h2>Outages Occuring Today</h2>
                    </div>
                </div>
                <ControlPanel />
                <div className="row tabs">
                    <div className="col-1-of-1">
                        <Tabs
                            tabOptions={tabOptions}
                            activeTab={activeTab}
                            handleSelectTab={this.handleSelectTab}
                        />
                        {tab === this.countryTab && <DashboardTab type={this.state.activeTabType} populateGeoJsonMap={() => this.populateGeoJsonMap()}/>}
                        {tab === this.regionTab && <DashboardTab type={this.state.activeTabType} populateGeoJsonMap={() => this.populateGeoJsonMap()}/>}
                        {tab === this.asTab && <DashboardTab type={this.state.activeTabType} populateGeoJsonMap={() => this.populateGeoJsonMap()}/>}
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
        topoData: state.iodaApi.topo
    }
};

const mapDispatchToProps = (dispatch) => {
    return {
        searchEntitiesAction: (searchQuery, limit=15) => {
            searchEntities(dispatch, searchQuery, limit);
        },
        searchSummaryAction: (from, until, entityType, entityCode=null, limit=null, page=null) => {
            searchSummary(dispatch, from, until, entityType, entityCode, limit, page);
        },
        getTopoAction: (entityType) => {
            getTopoAction(dispatch, entityType);
        }
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);
