// React Imports
import React, { Component } from 'react';
import {connect} from "react-redux";
import { withRouter } from 'react-router-dom';
// Internationalization
import T from 'i18n-react';
// Data Hooks
import { searchEntities, getEntityMetadata, regionalSignalsTableSummaryDataAction, asnSignalsTableSummaryDataAction } from "../../data/ActionEntities";
import { getTopoAction } from "../../data/ActionTopo";
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
    convertTsDataForHtsViz,
    getOutageCoords,
    dateRangeToSeconds,
    normalize
} from "../../utils";
import CanvasJSChart from "../../libs/canvasjs-non-commercial-3.2.5/canvasjs.react";

import TopoMap from "../../components/map/Map";
import * as topojson from 'topojson';
import * as d3 from "d3-shape";


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
            lastFetched: 0,
            // XY Plot Time Series
            xyDataOptions: null,
            tsDataRaw: null,
            tsDataNormalized: true,
            tsDataDisplayOutageBands: true,
            // Used for responsively styling the xy chart
            tsDataScreenBelow760: false,
            // Used to track which series have visibility, needed for when switching between normalized/absolute values to maintain state
            tsDataSeriesVisiblePingSlash24: true,
            tsDataSeriesVisibleBgp: true,
            tsDataSeriesVisibleUcsdNt: true,
            // Event/Table Data
            currentTable: 'alert',
            eventDataRaw: null,
            eventDataProcessed: [],
            alertDataRaw: null,
            alertDataProcessed: [],
            // relatedTo entity Map
            topoData: null,
            relatedToMapSummary: null,
            summaryDataMapRaw: null,
            // relatedTo entity Table
            relatedToTableApiPageNumber: 0,
            relatedToTableSummary: null,
            relatedToTableSummaryProcessed: null,
            relatedToTablePageNumber: 0,
            // Modal window display status
            showMapModal: false,
            showTableModal: false,
            // Signals Modal Table on Map Panel
            regionalSignalsTableSummaryData: [],
            regionalSignalsTableSummaryDataProcessed: [],
            regionalSignalsTableTotalCount: 0,
            regionalSignalsTableEntitiesChecked: 0,
            // Signals Modal Table on Table Panel
            asnSignalsTableSummaryData: [],
            asnSignalsTableSummaryDataProcessed: [],
            asnSignalsTableTotalCount: 0,
            asnSignalsTableEntitiesChecked: 0,
            // Stacked Horizon Visual on Region Map Panel
            rawRegionalSignalsRawBgp: [],
            rawRegionalSignalsRawPingSlash24: [],
            rawRegionalSignalsRawUcsdNt: [],
            rawRegionalSignalsProcessedBgp: null,
            rawRegionalSignalsProcessedPingSlash24: null,
            rawRegionalSignalsProcessedUcsdNt: null,
            rawRegionalSignalsLoadedBgp: true,
            rawRegionalSignalsLoadedPingSlash24: true,
            rawRegionalSignalsLoadedUcsdNt: true,
            // Stacked Horizon Visual on ASN Table Panel
            rawAsnSignalsRawBgp: [],
            rawAsnSignalsRawPingSlash24: [],
            rawAsnSignalsRawUcsdNt: [],
            rawAsnSignalsProcessedBgp: null,
            rawAsnSignalsProcessedPingSlash24: null,
            rawAsnSignalsProcessedUcsdNt: null,
            rawAsnSignalsLoadedBgp: true,
            rawAsnSignalsLoadedPingSlash24: true,
            rawAsnSignalsLoadedUcsdNt: true,
            // Shared between Modals
            rawSignalsMaxEntitiesHtsError: "",
            regionalRawSignalsLoadAllButtonClicked: false,
            asnRawSignalsLoadAllButtonClicked: false,
            loadAllButtonEntitiesLoading: false,
            checkMaxButtonLoading: false,
            uncheckAllButtonLoading: false,
            // manage loading bar for when loadAll button is clicked and
            // additional raw signals are requested beyond what was initially loaded
            additionalRawSignalRequestedPingSlash24: false,
            additionalRawSignalRequestedBgp: false,
            additionalRawSignalRequestedUcsdNt: false,
            currentEntitiesChecked: 100
        };
        this.handleTimeFrame = this.handleTimeFrame.bind(this);
        this.toggleModal = this.toggleModal.bind(this);
        this.handleEntityShapeClick = this.handleEntityShapeClick.bind(this);
        this.handleEntityClick = this.handleEntityClick.bind(this);
        this.initialTableLimit = 300;
        this.initialHtsLimit = 100;
        this.maxHtsLimit = 150;
    }

    componentDidMount() {
        // Monitor screen width
        window.addEventListener("resize", this.resize.bind(this));
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
        window.removeEventListener("resize", this.resize.bind(this));
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
            this.setState({
                eventDataRaw: this.props.events,
            }, () => {
                this.convertValuesForEventTable();
            });
        }

        // After API call for Alert Table data completes, check for lengths to set display counts and then process to populate
        if (this.props.alerts !== prevProps.alerts) {
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
            })
        }

        // After API call for outage summary data completes, pass summary data to table component for data merging
        if (this.props.relatedToTableSummary !== prevProps.relatedToTableSummary) {
            this.setState({
                relatedToTableSummary: this.props.relatedToTableSummary
            },() => {
                this.convertValuesForSummaryTable();
            })
        }

        if (this.props.regionalSignalsTableSummaryData !== prevProps.regionalSignalsTableSummaryData) {
            this.setState({
                regionalSignalsTableSummaryData: this.props.regionalSignalsTableSummaryData
            }, () => {
                this.combineValuesForSignalsTable("region");
            })
        }

        if (this.props.asnSignalsTableSummaryData !== prevProps.asnSignalsTableSummaryData) {
            this.setState({
                asnSignalsTableSummaryData: this.props.asnSignalsTableSummaryData
            }, () => {
                this.combineValuesForSignalsTable("asn");
            })
        }

        // data for regional signals table Ping-Slash24 Source
        if (this.props.rawRegionalSignalsPingSlash24 !== prevProps.rawRegionalSignalsPingSlash24) {
            let rawRegionalSignals = [];
            this.props.rawRegionalSignalsPingSlash24.map(signal => {

                //Remove empty items and assign to proper state. Then call next function
                signal.length ? rawRegionalSignals.push(signal[0]): null;
            });
            this.setState({
                rawRegionalSignalsRawPingSlash24: rawRegionalSignals
            }, () => {
                this.convertValuesForHtsViz("ping-slash24", "region");
            });
        }

        // data for regional signals table BGP Source
        if (this.props.rawRegionalSignalsBgp !== prevProps.rawRegionalSignalsBgp) {
            // assign to respective state
            let rawRegionalSignals = [];
            this.props.rawRegionalSignalsBgp.map(signal => {
                //Remove empty items and assign to proper state. Then call next function
                signal.length ? rawRegionalSignals.push(signal[0]): null;
            });
            this.setState({
                rawRegionalSignalsRawBgp: rawRegionalSignals
            }, () => {
                this.convertValuesForHtsViz("bgp", "region");
            });
        }

        // data for regional signals table UCSD-NT Source
        if (this.props.rawRegionalSignalsUcsdNt !== prevProps.rawRegionalSignalsUcsdNt) {
            // assign to respective state
            let rawRegionalSignals = [];
            this.props.rawRegionalSignalsUcsdNt.map(signal => {
                //Remove empty items and assign to proper state. Then call next function
                signal.length ? rawRegionalSignals.push(signal[0]): null;
            });
            this.setState({
                rawRegionalSignalsRawUcsdNt: rawRegionalSignals
            }, () => {
                this.convertValuesForHtsViz("ucsd-nt", "region");
            });
        }


        // data for asn signals table Ping-Slash24 Source
        if (this.props.rawAsnSignalsPingSlash24 !== prevProps.rawAsnSignalsPingSlash24) {
            let rawAsnSignals = [];
            this.props.rawAsnSignalsPingSlash24.map(signal => {

                //Remove empty items and assign to proper state. Then call next function
                signal.length ? rawAsnSignals.push(signal[0]): null;
            });
            this.setState({
                rawAsnSignalsRawPingSlash24: rawAsnSignals
            }, () => {
                this.convertValuesForHtsViz("ping-slash24", "asn");
            });
        }

        // data for asn signals table BGP Source
        if (this.props.rawAsnSignalsBgp !== prevProps.rawAsnSignalsBgp) {
            // assign to respective state
            let rawAsnSignals = [];
            this.props.rawAsnSignalsBgp.map(signal => {
                //Remove empty items and assign to proper state. Then call next function
                signal.length ? rawAsnSignals.push(signal[0]): null;
            });
            this.setState({
                rawAsnSignalsRawBgp: rawAsnSignals
            }, () => {
                this.convertValuesForHtsViz("bgp", "asn");
            });
        }

        // data for asn signals table UCSD-NT Source
        if (this.props.rawAsnSignalsUcsdNt !== prevProps.rawAsnSignalsUcsdNt) {
            // assign to respective state
            let rawAsnSignals = [];
            this.props.rawAsnSignalsUcsdNt.map(signal => {
                //Remove empty items and assign to proper state. Then call next function
                signal.length ? rawAsnSignals.push(signal[0]): null;
            });
            this.setState({
                rawAsnSignalsRawUcsdNt: rawAsnSignals
            }, () => {
                this.convertValuesForHtsViz("ucsd-nt", "asn");
            });
        }

        // data for additional raw feed signals to use after load all button is clicked
        if (this.props.additionalRawSignal !== prevProps.additionalRawSignal) {
            switch (this.props.additionalRawSignal[0][0]["entityType"]) {
                case "region":
                    switch (this.props.additionalRawSignal[0][0]["datasource"]) {
                        case "ping-slash24":
                            let rawRegionalSignalsRawPingSlash24 = this.state.rawRegionalSignalsRawPingSlash24.concat(this.props.additionalRawSignal[0]);
                            this.setState({
                                rawRegionalSignalsRawPingSlash24: rawRegionalSignalsRawPingSlash24
                            }, () => this.convertValuesForHtsViz("ping-slash24", "asn"));
                            break;
                        case "bgp":
                            let rawRegionalSignalsRawBgp = this.state.rawRegionalSignalsRawBgp.concat(this.props.additionalRawSignal[0]);
                            this.setState({
                                rawRegionalSignalsRawBgp: rawRegionalSignalsRawBgp
                            }, () => this.convertValuesForHtsViz("bgp", "asn"));
                            break;
                        case "ucsd-nt":
                            let rawRegionalSignalsRawUcsdNt = this.state.rawRegionalSignalsRawUcsdNt.concat(this.props.additionalRawSignal[0]);
                            this.setState({
                                rawRegionalSignalsRawUcsdNt: rawRegionalSignalsRawUcsdNt
                            }, () => this.convertValuesForHtsViz("ucsd-nt", "asn"));
                            break;
                    }
                    break;
                case "asn":
                    switch (this.props.additionalRawSignal[0][0]["datasource"]) {
                        case "ping-slash24":
                            let rawAsnSignalsRawPingSlash24 = this.state.rawAsnSignalsRawPingSlash24.concat(this.props.additionalRawSignal[0]);
                            this.setState({
                                rawAsnSignalsRawPingSlash24: rawAsnSignalsRawPingSlash24
                            }, () => this.convertValuesForHtsViz("ping-slash24", "asn"));
                            break;
                        case "bgp":
                            let rawAsnSignalsRawBgp = this.state.rawAsnSignalsRawBgp.concat(this.props.additionalRawSignal[0]);
                            this.setState({
                                rawAsnSignalsRawBgp: rawAsnSignalsRawBgp
                            }, () => this.convertValuesForHtsViz("bgp", "asn"));
                            break;
                        case "ucsd-nt":
                            let rawAsnSignalsRawUcsdNt = this.state.rawAsnSignalsRawUcsdNt.concat(this.props.additionalRawSignal[0]);
                            this.setState({
                                rawAsnSignalsRawUcsdNt: rawAsnSignalsRawUcsdNt
                            }, () => this.convertValuesForHtsViz("ucsd-nt", "asn"));
                            break;
                    }
                    break;
            }
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
                    // XY Plot Time Series states
                    xyDataOptions: null,
                    tsDataRaw: null,
                    tsDataNormalized: true,
                    tsDataDisplayOutageBands: true,
                    // Search Bar
                    suggestedSearchResults: null,
                    searchTerm: null,
                    lastFetched: 0,
                    // Event/Table Data
                    currentTable: 'alert',
                    eventDataRaw: null,
                    eventDataProcessed: [],
                    alertDataRaw: null,
                    alertDataProcessed: [],
                    // relatedTo entity Map
                    summaryDataMapRaw: null,
                    // relatedTo entity Table
                    relatedToTableApiPageNumber: 0,
                    relatedToTableSummary: null,
                    relatedToTableSummaryProcessed: null,
                    relatedToTablePageNumber: 0,
                    // Modal window display status
                    showMapModal: false,
                    showTableModal: false,
                    // Signals Modal Table on Map Panel
                    regionalSignalsTableSummaryData: [],
                    regionalSignalsTableSummaryDataProcessed: [],
                    regionalSignalsTableTotalCount: 0,
                    regionalSignalsTableEntitiesChecked: 0,
                    // Signals Modal Table on Table Panel
                    asnSignalsTableSummaryData: [],
                    asnSignalsTableSummaryDataProcessed: [],
                    asnSignalsTableTotalCount: 0,
                    asnSignalsTableEntitiesChecked: 0,
                    // Stacked Horizon Visual on Region Map Panel
                    rawRegionalSignalsRawBgp: [],
                    rawRegionalSignalsRawPingSlash24: [],
                    rawRegionalSignalsRawUcsdNt: [],
                    rawRegionalSignalsProcessedBgp: null,
                    rawRegionalSignalsProcessedPingSlash24: null,
                    rawRegionalSignalsProcessedUcsdNt: null,
                    rawRegionalSignalsLoadedBgp: true,
                    rawRegionalSignalsLoadedPingSlash24: true,
                    rawRegionalSignalsLoadedUcsdNt: true,
                    rawRegionalSignalsLoadAllButtonClicked: false,
                    // Stacked Horizon Visual on ASN Table Panel
                    rawAsnSignalsRawBgp: [],
                    rawAsnSignalsRawPingSlash24: [],
                    rawAsnSignalsRawUcsdNt: [],
                    rawAsnSignalsProcessedBgp: null,
                    rawAsnSignalsProcessedPingSlash24: null,
                    rawAsnSignalsProcessedUcsdNt: null,
                    rawAsnSignalsLoadAllButtonClicked: false
                }, () => {
                    // Get topo and outage data to repopulate map and table
                    this.props.searchEventsAction(this.state.from, this.state.until, this.state.entityType, this.state.entityCode);
                    this.props.searchAlertsAction(this.state.from, this.state.until, this.state.entityType, this.state.entityCode, null, null, null);
                    this.props.getSignalsAction( this.state.entityType, this.state.entityCode, this.state.from, this.state.until, null, null);
                    this.getDataTopo("region");
                    this.getDataRelatedToMapSummary("region");
                    this.getDataRelatedToTableSummary("asn");
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
                    searchTerm: null,
                    lastFetched: 0,
                    // XY Plot Time Series states
                    xyDataOptions: null,
                    tsDataRaw: null,
                    tsDataNormalized: true,
                    tsDataDisplayOutageBands: true,
                    // Event/Table Data
                    currentTable: 'alert',
                    eventDataRaw: null,
                    eventDataProcessed: [],
                    alertDataRaw: null,
                    alertDataProcessed: [],
                    // relatedTo entity Map
                    summaryDataMapRaw: null,
                    // relatedTo entity Table
                    relatedToTableApiPageNumber: 0,
                    relatedToTableSummary: null,
                    relatedToTableSummaryProcessed: null,
                    relatedToTablePageNumber: 0,
                    // Modal window display status
                    showMapModal: false,
                    showTableModal: false,
                    // Signals Modal Table on Map Panel
                    regionalSignalsTableSummaryData: [],
                    regionalSignalsTableSummaryDataProcessed: [],
                    regionalSignalsTableTotalCount: 0,
                    // Signals Modal Table on Table Panel
                    asnSignalsTableSummaryData: [],
                    asnSignalsTableSummaryDataProcessed: [],
                    asnSignalsTableTotalCount: 0,
                    // Stacked Horizon Visual on Region Map Panel
                    rawRegionalSignalsRawBgp: [],
                    rawRegionalSignalsRawPingSlash24: [],
                    rawRegionalSignalsRawUcsdNt: [],
                    rawRegionalSignalsProcessedBgp: null,
                    rawRegionalSignalsProcessedPingSlash24: null,
                    rawRegionalSignalsProcessedUcsdNt: null,
                    // Stacked Horizon Visual on ASN Table Panel
                    rawAsnSignalsRawBgp: [],
                    rawAsnSignalsRawPingSlash24: [],
                    rawAsnSignalsRawUcsdNt: [],
                    rawAsnSignalsProcessedBgp: null,
                    rawAsnSignalsProcessedPingSlash24: null,
                    rawAsnSignalsProcessedUcsdNt: null,
                    rawAsnSignalsLoadedBgp: true,
                    rawAsnSignalsLoadedPingSlash24: true,
                    rawAsnSignalsLoadedUcsdNt: true,
                    rawRegionalSignalsLoadedBgp: true,
                    rawRegionalSignalsLoadedPingSlash24: true,
                    rawRegionalSignalsLoadedUcsdNt: true,
                    rawRegionalSignalsLoadAllButtonClicked: false,
                    rawAsnSignalsLoadAllButtonClicked: false,
                    rawSignalsMaxEntitiesHtsError: "",
                    regionalRawSignalsLoadAllButtonClicked: false,
                    asnRawSignalsLoadAllButtonClicked: false
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
        history.push(`/${this.state.entityType}/${this.state.entityCode}?from=${range[0]}&until=${range[1]}`);
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
        const entity = this.state.suggestedSearchResults.filter(result => {
            return result.name === query || query.name;
        });
        history.push(`/${entity[0].type}/${entity[0].code}`);
        this.handleStateReset("newEntity", null, entity[0].type, entity[0].code);
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

// 1st Row
// XY Chart Functions
    // XY Plot Graph Functions
    createXyVizDataObject(networkTelescopeValues, bgpValues, activeProbingValues) {
        let networkTelescope, bgp, activeProbing;
        if (networkTelescopeValues) {
            networkTelescope = {
                type: "line",
                lineThickness: 1,
                color: "#E31A1C",
                lineColor: "#E31A1C",
                markerType: "circle",
                markerSize: 2,
                name: "Network Telescope",
                visible: this.state.tsDataSeriesVisibleUcsdNt,
                axisYType: this.state.tsDataNormalized ? 'primary' : "secondary",
                showInLegend: true,
                xValueFormatString: "DDD, MMM DD - HH:MM",
                yValueFormatString: "##",
                dataPoints: networkTelescopeValues,
                legendMarkerColor: "#E31A1C",
                toolTipContent: "{x} <br/> Network Telescope (# Unique Source IPs): {y}"
            }
        }
        if (bgpValues) {
            bgp = {
                type: "line",
                lineThickness: 1,
                color: "#33A02C",
                lineColor: "#33A02C",
                markerType: "circle",
                markerSize: 2,
                name: "BGP",
                visible: this.state.tsDataSeriesVisibleBgp,
                showInLegend: true,
                xValueFormatString: "DDD, MMM DD - HH:MM",
                yValueFormatString: "##",
                dataPoints: bgpValues,
                legendMarkerColor: "#33A02C",
                toolTipContent: "{x} <br/> BGP (# Visbile /24s): {y}"
            }
        }

        if (activeProbingValues) {
            activeProbing = {
                type: "line",
                lineThickness: 1,
                color: "#1F78B4",
                lineColor: "#1F78B4",
                markerType: "circle",
                markerSize: 2,
                name: "Active Probing",
                visible: this.state.tsDataSeriesVisiblePingSlash24,
                showInLegend: true,
                xValueFormatString: "DDD, MMM DD - HH:MM",
                yValueFormatString: "##",
                dataPoints: activeProbingValues,
                legendMarkerColor: "#1F78B4",
                toolTipContent: "{x} <br/> Active Probing (# /24s Up): {y}",

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
            let min, max;
            switch (datasource.datasource) {
                case "ucsd-nt":
                    min = Math.min(...datasource.values);
                    max = Math.max(...datasource.values);

                    datasource.values && datasource.values.map((value, index) => {
                        let x, y;
                        x = toDateTime(datasource.from + (datasource.step * index));
                        y = this.state.tsDataNormalized ? normalize(value, min, max) : value;
                        networkTelescopeValues.push({x: x, y: y, color: "#E31A1C"});
                    });
                    break;
                case "bgp":
                    min = Math.min(...datasource.values);
                    max = Math.max(...datasource.values);

                    datasource.values && datasource.values.map((value, index) => {
                        let x, y;
                        x = toDateTime(datasource.from + (datasource.step * index));
                        y = this.state.tsDataNormalized ? normalize(value, min, max) : value;
                        bgpValues.push({x: x, y: y, color: "#33A02C"});
                    });
                    break;
                case "ping-slash24":
                    min = Math.min(...datasource.values);
                    max = Math.max(...datasource.values);

                    datasource.values && datasource.values.map((value, index) => {
                        let x, y;
                        x = toDateTime(datasource.from + (datasource.step * index));
                        y = this.state.tsDataNormalized ? normalize(value, min, max) : value;
                        activeProbingValues.push({x: x, y: y, color: "#1F78B4"});
                    });
            }
        });

        // Create Alert band objects
        let stripLines = [];
        if (this.state.tsDataDisplayOutageBands) {
            this.state.eventDataRaw && this.state.eventDataRaw.map(event => {
                const stripLine = {
                    startValue: toDateTime(event.start),
                    endValue: toDateTime(event.start + event.duration),
                    color:"#BE1D2D",
                    opacity: .2
                };
                stripLines.push(stripLine);
            });
        }

        // get time span considered, using network telescope first as that data source has the most up to time data, then Ping-slash24, then bgp
        const timeBegin = networkTelescopeValues[0].x;
        const timeEnd = networkTelescopeValues[networkTelescopeValues.length -1].x;
        // Add 5% padding to the right edge of the Chart
        const extraPadding = (timeEnd - timeBegin) * 0.05;
        const viewportMaximum = new Date(timeEnd.getTime() + extraPadding);

        activeProbingValues.push({x: viewportMaximum, y: null});
        bgpValues.push({x: viewportMaximum, y: null});
        networkTelescopeValues.push({x: viewportMaximum, y: null});


        this.setState({
            xyDataOptions: {
                theme: "light2",
                height: 620,
                animationEnabled: true,
                zoomEnabled: true,
                crosshair: {
                    enabled: true,
                    snapToDataPoint: true
                },
                axisX: {
                    title: "Time (UTC)",
                    stripLines: stripLines,
                    titleFontSize: 12,
                    labelFontSize: 10,
                    margin: 2
                },
                axisY: {
                    // title: "Active Probing and BGP",
                    titleFontsColor: "#666666",
                    labelFontColor: "#666666",
                    labelFontSize: 12,
                    maximum: this.state.tsDataNormalized ? 100 : null,
                    gridDashType: "dash",
                    gridColor: "#E6E6E6"
                },
                axisY2: {
                    // title: "Network Telescope",
                    titleFontsColor: "#666666",
                    labelFontColor: "#666666",
                    labelFontSize: 12
                },
                toolTip: {
                    shared: false,
                    enabled: true,
                    animationEnabled: true
                },
                legend: {
                    cursor: "pointer",
                    fontSize: 14,
                    verticalAlign: this.state.tsDataScreenBelow760 ? "top" : "bottom",
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
                        switch (e.dataSeries.name) {
                            case "Active Probing":
                                this.setState({ tsDataSeriesVisiblePingSlash24: e.dataSeries.visible }, e.chart.render());
                                break;
                            case "BGP":
                                this.setState({ tsDataSeriesVisibleBgp: e.dataSeries.visible }, e.chart.render());
                                break;
                            case "Network Telescope":
                                this.setState({ tsDataSeriesVisibleUcsdNt: e.dataSeries.visible }, e.chart.render());
                                break;
                        }
                    }
                },
                data: this.createXyVizDataObject(networkTelescopeValues, bgpValues, activeProbingValues)
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
    // Track screen width to shift around legend
    resize() {
        let tsDataScreenBelow760 = (window.innerWidth <= 760);
        if (tsDataScreenBelow760 !== this.state.tsDataScreenBelow760) {

            this.setState({
                tsDataScreenBelow760: tsDataScreenBelow760
            }, () => {
                this.convertValuesForXyViz();
            });
        }
    }

// Event Table
    // Take values from api and format for Event table
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
    // Generate the Event table that will display in the UI with the formatted values
    genEventTable() {
        // this.state.eventDataProcessed && console.log(this.state.eventDataProcessed);
        return (
            this.state.eventDataProcessed &&
            <Table
                type={"event"}
                data={this.state.eventDataProcessed}
                totalCount={this.state.eventDataProcessed.length}
            />
        )
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
    // Take values from api and format for Alert table
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
            alertDataProcessed: alertData.reverse()
        }, () => {
            this.genAlertTable();
        });
    }
    // Generate the Alert table that will display in the UI with the formatted values
    genAlertTable() {
        return (
            this.state.alertDataProcessed &&
            <Table
                type="alert"
                data={this.state.alertDataProcessed}
                totalCount={this.state.alertDataProcessed.length}
            />
        )
    }

// 2nd Row
// EntityRelated
    // Populate 2nd Row UI objects (managed in EntityRelated Component)
    genEntityRelatedRow() {
        return <EntityRelated
            entityName={this.state.entityName}
            entityType={this.state.entityType}
            parentEntityName={this.state.parentEntityName}
            toggleModal={this.toggleModal}
            showMapModal={this.state.showMapModal}
            showTableModal={this.state.showTableModal}
            relatedToTableSummary={this.state.relatedToTableSummary}
            populateGeoJsonMap={() => this.populateGeoJsonMap()}
            genSummaryTable={() => this.genSummaryTable()}
            genSignalsTable={(entityType) => this.genSignalsTable(entityType)}
            handleSelectAndDeselectAllButtons={(event) => this.handleSelectAndDeselectAllButtons(event)}
            // Regional HTS methods
            regionalSignalsTableEntitiesChecked={this.state.regionalSignalsTableEntitiesChecked}
            asnSignalsTableEntitiesChecked={this.state.asnSignalsTableEntitiesChecked}
            initialTableLimit={this.initialTableLimit}

            populateHtsChart={(width, dataSource, entityType) => this.populateHtsChart(width, dataSource, entityType)}

            // to detect when loading bar should appear in modal
            regionalSignalsTableSummaryDataProcessed={this.state.regionalSignalsTableSummaryDataProcessed}
            asnSignalsTableSummaryDataProcessed={this.state.asnSignalsTableSummaryDataProcessed}

            rawRegionalSignalsProcessedPingSlash24={this.state.rawRegionalSignalsProcessedPingSlash24}
            rawRegionalSignalsProcessedBgp={this.state.rawRegionalSignalsProcessedBgp}
            rawRegionalSignalsProcessedUcsdNt={this.state.rawRegionalSignalsProcessedUcsdNt}
            rawAsnSignalsProcessedPingSlash24={this.state.rawAsnSignalsProcessedPingSlash24}
            rawAsnSignalsProcessedBgp={this.state.rawAsnSignalsProcessedBgp}
            rawAsnSignalsProcessedUcsdNt={this.state.rawAsnSignalsProcessedUcsdNt}
            summaryDataMapRaw={this.state.summaryDataMapRaw}
            rawSignalsMaxEntitiesHtsError={this.state.rawSignalsMaxEntitiesHtsError}
            // count used to determine if text to populate remaining entities beyond the initial Table load limit should display
            asnSignalsTableTotalCount={this.state.asnSignalsTableTotalCount}
            regionalSignalsTableTotalCount={this.state.regionalSignalsTableTotalCount}
            // function used to call api to load remaining entities
            handleLoadAllEntitiesButton={event => this.handleLoadAllEntitiesButton(event)}
            // Used to determine if load all message should display or not
            regionalRawSignalsLoadAllButtonClicked={this.state.regionalRawSignalsLoadAllButtonClicked}
            asnRawSignalsLoadAllButtonClicked={this.state.asnRawSignalsLoadAllButtonClicked}
            // modal loading icon for load all button
            loadAllButtonEntitiesLoading={this.state.loadAllButtonEntitiesLoading}
            handleAdditionalEntitiesLoading={() => this.handleAdditionalEntitiesLoading()}
            additionalRawSignalRequestedPingSlash24={this.state.additionalRawSignalRequestedPingSlash24}
            additionalRawSignalRequestedBgp={this.state.additionalRawSignalRequestedBgp}
            additionalRawSignalRequestedUcsdNt={this.state.additionalRawSignalRequestedUcsdNt}
            // used for tracking when check max/uncheck all loading icon should appear and not
            checkMaxButtonLoading={this.state.checkMaxButtonLoading}
            uncheckAllButtonLoading={this.state.uncheckAllButtonLoading}

        />;
    }
    // Show/hide modal when button is clicked on either panel
    toggleModal(modalLocation) {
        if (modalLocation === 'map') {
            this.props.regionalSignalsTableSummaryDataAction("region", window.location.pathname.split("/")[1], window.location.pathname.split("/")[2]);
            // Get related entities used on table in map modal
            this.setState({
                showMapModal: !this.state.showMapModal
            },() => {
                if (!this.state.showMapModal) {
                    this.setState({
                        rawRegionalSignalsLoadedBgp: true,
                        rawRegionalSignalsLoadedPingSlash24: true,
                        rawRegionalSignalsLoadedUcsdNt: true
                    })
                }
            });

        } else if (modalLocation === 'table') {
            this.props.asnSignalsTableSummaryDataAction("asn", window.location.pathname.split("/")[1], window.location.pathname.split("/")[2]);
            this.setState({
                showTableModal: !this.state.showTableModal
            },() => {
                if (!this.state.showTableModal) {
                    this.setState({
                        rawAsnSignalsLoadedBgp: true,
                        rawAsnSignalsLoadedPingSlash24: true,
                        rawAsnSignalsLoadedUcsdNt: true
                    })
                }
            });
        }
    }

// RelatedTo Map
    // Make API call to retrieve topographic data
    getDataTopo(entityType) {
        if (this.state.mounted) {
            this.props.getTopoAction(entityType);
        }
    }
    // Process Geo data from api, attribute outage scores to a new topoData property where possible, then render Map
    populateGeoJsonMap() {
        if (this.state.topoData && this.state.summaryDataMapRaw && this.state.summaryDataMapRaw[0] && this.state.summaryDataMapRaw[0]["entity"]) {
            let topoData = this.state.topoData;
            let features = [];
            let scores = [];
            let outageCoords;

            // get Topographic info for a country if it has outages
            this.state.summaryDataMapRaw.map(outage => {
                let topoItemIndex = this.state.topoData.features.findIndex(topoItem => topoItem.properties.name === outage.entity.name);

                if (topoItemIndex > 0) {
                    let item = topoData.features[topoItemIndex];
                    item.properties.score = outage.scores.overall;
                    topoData.features[topoItemIndex] = item;
                    features.push(item);
                    // Used to determine coloring on map objects
                    scores.push(outage.scores.overall);
                    scores.sort((a, b) => {
                        return a - b;
                    });
                }
            });

            // get impacted coordinates to determine zoom location based on affected entities, if any
            if (features.length > 0) {
                outageCoords = getOutageCoords(features);
            }

            return <TopoMap topoData={topoData} bounds={outageCoords} scores={scores} handleEntityShapeClick={this.handleEntityShapeClick}/>;
        } else if (this.state.summaryDataMapRaw && this.state.summaryDataMapRaw.length === 0) {
            const noOutagesOnMapMessage = T.translate("entityModal.noOutagesOnMapMessage");
            return <div className="related__no-outages">
                <h2 className="related__no-outages-title">{noOutagesOnMapMessage}</h2>
            </div>
        } else {
            return <Loading/>
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
    // function to manage when a user clicks a country in the map
    handleEntityShapeClick(entity) {
        const { history } = this.props;
        history.push(
            window.location.search.split("?")[1]
                ? `/region/${entity.properties.id}?from=${window.location.search.split("?")[1].split("&")[0].split("=")[1]}&until=${window.location.search.split("?")[1].split("&")[1].split("=")[1]}`
                : `/region/${entity.properties.id}`
        );
        this.handleStateReset("newEntity", null, "region", entity.properties.id);
    }

// Summary Table for related ASNs
    // Make API call to retrieve summary data to populate on map
    getDataRelatedToTableSummary(entityType) {
        if (this.state.mounted) {
            let until = this.state.until;
            let from = this.state.from;
            const limit = this.initialTableLimit;
            const includeMetadata = true;
            let page = this.state.relatedToTableApiPageNumber;
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
                    entityType = 'country';
                    break;
            }
            // console.log(entityType, relatedToEntityType, relatedToEntityCode);
            this.props.searchRelatedToTableSummary(from, until, entityType, relatedToEntityType, relatedToEntityCode, entityCode, limit, page, includeMetadata);
        }
    }
    // Make raw values from api compatible with table component
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
        // If the end of the data list is hit but more data exists, fetch it and tack it on
        if (this.state.relatedToTableApiPageNumber > 0) {
            this.setState({
                relatedToTableSummaryProcessed: this.state.relatedToTableSummaryProcessed.concat(summaryData)
            }, () => {
                this.genSummaryTable();
            })
        }

    }
    // Populate Summary table in the UI for Related ASNs
    genSummaryTable() {
        return (
            this.state.relatedToTableSummaryProcessed &&
            <Table
                type="summary"
                data={this.state.relatedToTableSummaryProcessed}
                totalCount={this.state.relatedToTableSummaryProcessed.length}
                entityType={this.state.entityType === "asn" ? "country" : "asn"}
                handleEntityClick={(entityType, entityCode) => this.handleEntityClick(entityType, entityCode)}
            />
        )
    }
    // function to manage what happens when a linked entity in the table is clicked
    handleEntityClick(entityType, entityCode) {
        this.handleStateReset("newEntity", null, entityType, entityCode);
    }


// Modal Windows
    // Display the table in the UI if the data is available
    genSignalsTable(entityType) {
        switch (entityType) {
            case "region":
                return (
                    this.state.regionalSignalsTableSummaryDataProcessed &&
                    <Table
                        type="signal"
                        data={this.state.regionalSignalsTableSummaryDataProcessed}
                        totalCount={this.state.regionalSignalsTableSummaryDataProcessed.length}
                        toggleEntityVisibilityInHtsViz={event => this.toggleEntityVisibilityInHtsViz(event, "region")}
                        handleEntityClick={(entityType, entityCode) => this.handleEntityClick(entityType, entityCode)}
                    />
                );
            case "asn":
                return (
                    this.state.asnSignalsTableSummaryDataProcessed &&
                    <Table
                        type="signal"
                        data={this.state.asnSignalsTableSummaryDataProcessed}
                        totalCount={this.state.asnSignalsTableTotalCount}
                        entityType={this.state.entityType === "asn" ? "country" : "asn"}
                        toggleEntityVisibilityInHtsViz={event => this.toggleEntityVisibilityInHtsViz(event, "asn")}
                        handleEntityClick={(entityType, entityCode) => this.handleEntityClick(entityType, entityCode)}
                    />
                );
        }
    }
    // Make API call that gets raw signals for a group of entities
    getSignalsHtsDataEvents(entityType, dataSource) {
        let until = this.state.until;
        let from = this.state.from;
        let attr = null;
        let order = this.state.eventOrderByOrder;
        let entities;

        switch (entityType) {
            case "region":
                entities = this.state.regionalSignalsTableSummaryDataProcessed.map(entity => {
                    // some entities don't return a code to be used in an api call, seem to default to '??' in that event
                    if (entity.code !== "??") {
                        return entity.entityCode;
                    }
                }).toString();
                switch (dataSource) {
                    case "ping-slash24":
                        this.props.getRawRegionalSignalsPingSlash24Action(entityType, entities, from, until, attr=null, order, dataSource);
                        break;
                    case "bgp":
                        this.props.getRawRegionalSignalsBgpAction(entityType, entities, from, until, attr, order, dataSource);
                        break;
                    case "ucsd-nt":
                        this.props.getRawRegionalSignalsUcsdNtAction(entityType, entities, from, until, attr, order, dataSource);
                        break;
                }
                break;
            case "asn":
            case "country":
                entities = this.state.asnSignalsTableSummaryDataProcessed.map(entity => {
                    // some entities don't return a code to be used in an api call, seem to default to '??' in that event
                    if (entity.code !== "??") {
                        return entity.entityCode;
                    }
                }).toString();
                switch (dataSource) {
                    case "ping-slash24":
                        this.props.getRawAsnSignalsPingSlash24Action(entityType, entities, from, until, attr, order, dataSource);
                        break;
                    case "bgp":
                        this.props.getRawAsnSignalsBgpAction(entityType, entities, from, until, attr, order, dataSource);
                        break;
                    case "ucsd-nt":
                        this.props.getRawAsnSignalsUcsdNtAction(entityType, entities, from, until, attr, order, dataSource);
                        break;
                }
                break;
        }


    }
    // Combine summary outage data with other raw signal data for populating Raw Signal Table
    combineValuesForSignalsTable(entityType) {
        switch (entityType) {
            case "region":
                if (this.state.summaryDataMapRaw && this.state.regionalSignalsTableSummaryData) {
                    let signalsTableData = combineValuesForSignalsTable(this.state.summaryDataMapRaw, this.state.regionalSignalsTableSummaryData, this.initialHtsLimit);
                    this.setState({
                        regionalSignalsTableSummaryDataProcessed: signalsTableData,
                        regionalSignalsTableTotalCount: signalsTableData.length
                    }, () => {
                        // Get data for Stacked horizon series raw signals with all regions if data is not yet available
                        this.getSignalsHtsDataEvents("region", "ping-slash24");
                        this.getSignalsHtsDataEvents("region", "bgp");
                        this.getSignalsHtsDataEvents("region", "ucsd-nt");
                    })
                }
                break;
            case "asn":
                if (this.state.relatedToTableSummary && this.state.asnSignalsTableSummaryData) {
                    let signalsTableData = combineValuesForSignalsTable(this.state.relatedToTableSummary, this.state.asnSignalsTableSummaryData, this.initialHtsLimit);
                    this.setState({
                        asnSignalsTableSummaryDataProcessed: signalsTableData.slice(0, this.initialTableLimit),
                        asnSignalsTableTotalCount: signalsTableData.length
                    }, () => {
                        // Populate Stacked horizon graph with all regions
                        if (this.state.entityType !== 'asn') {
                            this.getSignalsHtsDataEvents("asn", "ping-slash24");
                            this.getSignalsHtsDataEvents("asn", "ucsd-nt");
                            this.getSignalsHtsDataEvents("asn", "bgp");
                        } else {
                            this.getSignalsHtsDataEvents("country", "ping-slash24");
                            this.getSignalsHtsDataEvents("country", "ucsd-nt");
                            this.getSignalsHtsDataEvents("country", "bgp");
                        }
                    })
                }
                break;
        }
    }
    // function that decides what data will populate in the horizon time series
    convertValuesForHtsViz(dataSource, entityType) {
        let visibilityChecked = [];
        let entitiesChecked = 0;
        let rawSignalsNew = [];
        let signalsTableSummaryDataProcessed, rawSignals;
        switch (entityType) {
            case "region":
                signalsTableSummaryDataProcessed = this.state.regionalSignalsTableSummaryDataProcessed;
                switch (dataSource) {
                    case "ping-slash24":
                        rawSignals = this.state.rawRegionalSignalsRawPingSlash24;
                        break;
                    case "bgp":
                        rawSignals = this.state.rawRegionalSignalsRawBgp;
                        break;
                    case "ucsd-nt":
                        rawSignals = this.state.rawRegionalSignalsRawUcsdNt;
                        break;
                }
                break;
            case "asn":
                signalsTableSummaryDataProcessed = this.state.asnSignalsTableSummaryDataProcessed;
                switch (dataSource) {
                    case "ping-slash24":
                        rawSignals = this.state.rawAsnSignalsRawPingSlash24;
                        break;
                    case "bgp":
                        rawSignals = this.state.rawAsnSignalsRawBgp;
                        break;
                    case "ucsd-nt":
                        rawSignals = this.state.rawAsnSignalsRawUcsdNt;
                        break;
                }
                break;
        }

        // Get list of entities that should be visible
        signalsTableSummaryDataProcessed.map(obj => {
            if (obj.visibility || obj.visibility === true) {
                visibilityChecked.push(obj.entityCode);
                entitiesChecked = entitiesChecked + 1;
            }
        });

        // Set count on current visible items
        switch (entityType) {
            case 'region':
                this.setState({
                    regionalSignalsTableEntitiesChecked: entitiesChecked
                });
                break;
            case 'asn':
                this.setState({
                    asnSignalsTableEntitiesChecked: entitiesChecked
                });
                break;
        }

        // Remove other entities from array that shouldn't be displayed
        visibilityChecked.map(entityCode => {
            rawSignals.filter(obj => {
                if (obj.entityCode === entityCode) {
                    rawSignalsNew.push(obj);
                }
            });
        });

        // Set state with new array that dictates what populates
        switch (entityType) {
            case "region":
                switch (dataSource) {
                    case "ping-slash24":
                        this.setState({
                            rawRegionalSignalsProcessedPingSlash24: convertTsDataForHtsViz(rawSignalsNew),
                            rawRegionalSignalsLoadedPingSlash24: true,
                            additionalRawSignalRequestedPingSlash24: false

                        });
                        break;
                    case "bgp":
                        this.setState({
                            rawRegionalSignalsProcessedBgp: convertTsDataForHtsViz(rawSignalsNew),
                            rawRegionalSignalsLoadedBgp: true,
                            additionalRawSignalRequestedBgp: false
                        });
                        break;
                    case "ucsd-nt":
                        this.setState({
                            rawRegionalSignalsProcessedUcsdNt: convertTsDataForHtsViz(rawSignalsNew),
                            rawRegionalSignalsLoadedUcsdNt: true,
                            additionalRawSignalRequestedUcsdNt: false
                        });
                        break;
                }
                break;
            case "asn":
                switch (dataSource) {
                    case "ping-slash24":
                        this.setState({
                            rawAsnSignalsProcessedPingSlash24: convertTsDataForHtsViz(rawSignalsNew),
                            rawAsnSignalsLoadedPingSlash24: true,
                            additionalRawSignalRequestedPingSlash24: false
                        });
                        break;
                    case "bgp":
                        this.setState({
                            rawAsnSignalsProcessedBgp: convertTsDataForHtsViz(rawSignalsNew),
                            rawAsnSignalsLoadedBgp: true,
                            additionalRawSignalRequestedBgp: false
                        });
                        break;
                    case "ucsd-nt":
                        this.setState({
                            rawAsnSignalsProcessedUcsdNt: convertTsDataForHtsViz(rawSignalsNew),
                            rawAsnSignalsLoadedUcsdNt: true,
                            additionalRawSignalRequestedUcsdNt: false
                        });
                        break;
                }
                break;
        }
    }
    // Display the horizon time series in the UI if the data is available
    populateHtsChart(width, dataSource, entityType) {
        // set variables
        let dataSourceForCSS, rawSignalsLoadedBoolean, rawSignalsProcessedArray;

        switch (entityType) {
            case 'region':
                switch (dataSource) {
                    case 'ping-slash24':
                        dataSourceForCSS = "pingSlash24";
                        rawSignalsLoadedBoolean = this.state.rawRegionalSignalsLoadedPingSlash24;
                        rawSignalsProcessedArray = this.state.rawRegionalSignalsProcessedPingSlash24;
                        break;
                    case 'bgp':
                        dataSourceForCSS = "bgp";
                        rawSignalsLoadedBoolean = this.state.rawRegionalSignalsLoadedBgp;
                        rawSignalsProcessedArray = this.state.rawRegionalSignalsProcessedBgp;
                        break;
                    case 'ucsd-nt':
                        dataSourceForCSS = "ucsdNt";
                        rawSignalsLoadedBoolean = this.state.rawRegionalSignalsLoadedUcsdNt;
                        rawSignalsProcessedArray = this.state.rawRegionalSignalsProcessedUcsdNt;
                        break;
                }
                break;
            case 'asn':
                switch (dataSource) {
                    case 'ping-slash24':
                        dataSourceForCSS = "pingSlash24";
                        rawSignalsLoadedBoolean = this.state.rawAsnSignalsLoadedPingSlash24;
                        rawSignalsProcessedArray = this.state.rawAsnSignalsProcessedPingSlash24;
                        break;
                    case 'bgp':
                        dataSourceForCSS = "bgp";
                        rawSignalsLoadedBoolean = this.state.rawAsnSignalsLoadedBgp;
                        rawSignalsProcessedArray = this.state.rawAsnSignalsProcessedBgp;
                        break;
                    case 'ucsd-nt':
                        dataSourceForCSS = "ucsdNt";
                        rawSignalsLoadedBoolean = this.state.rawAsnSignalsLoadedUcsdNt;
                        rawSignalsProcessedArray = this.state.rawAsnSignalsProcessedUcsdNt;
                        break;
                }
                break;
        }

        // set state to track loading status
        if (rawSignalsProcessedArray && rawSignalsLoadedBoolean) {
            switch (entityType) {
                case 'region':
                    switch (dataSource) {
                        case 'ping-slash24':
                            this.setState({rawRegionalSignalsLoadedPingSlash24: !this.state.rawRegionalSignalsLoadedPingSlash24});
                            break;
                        case 'bgp':
                            this.setState({rawRegionalSignalsLoadedBgp: !this.state.rawRegionalSignalsLoadedBgp});
                            break;
                        case 'ucsd-nt':
                            this.setState({rawRegionalSignalsLoadedUcsdNt: !this.state.rawRegionalSignalsLoadedUcsdNt});
                            break;
                    }
                    break;
                case 'asn':
                    switch (dataSource) {
                        case 'ping-slash24':
                            this.setState({rawAsnSignalsLoadedPingSlash24: !this.state.rawAsnSignalsLoadedPingSlash24});
                            break;
                        case 'bgp':
                            this.setState({rawAsnSignalsLoadedBgp: !this.state.rawAsnSignalsLoadedBgp});
                            break;
                        case 'ucsd-nt':
                            this.setState({rawAsnSignalsLoadedUcsdNt: !this.state.rawAsnSignalsLoadedUcsdNt});
                            break;
                    }
                    break;
            }

            // draw viz
            const myChart = HorizonTSChart()(document.getElementById(`${entityType}-horizon-chart--${dataSourceForCSS}`));
            myChart
                .data(rawSignalsProcessedArray)
                .series('entityName')
                .yNormalize(false)
                .useUtc(true)
                .use24h(false)
                // Will need to detect column width to populate height
                .width(width)
                .height(360)
                .enableZoom(false)
                .showRuler(true)
                .interpolationCurve(d3.curveStepAfter)
                .positiveColors(['white', '#006D2D'])
                // .positiveColorStops([.01])
                .toolTipContent = ({series, ts, val}) => `${series}<br>${ts}:&nbsp;${humanizeNumber(val)}`;
        }
    }
    // function to manage what happens when a checkbox is changed in the raw signals table
    toggleEntityVisibilityInHtsViz(event, entityType) {
        let indexValue = 0;
        let signalsTableSummaryDataProcessed;
        let maxEntitiesPopulatedMessage = T.translate("entityModal.maxEntitiesPopulatedMessage");

        switch (entityType) {
            case "region":
                signalsTableSummaryDataProcessed = this.state.regionalSignalsTableSummaryDataProcessed;
                break;
            case "asn":
                signalsTableSummaryDataProcessed = this.state.asnSignalsTableSummaryDataProcessed;
                break;
        }

        // Get the index of where the checkmark was that was clicked
        signalsTableSummaryDataProcessed.filter((entity, index) => {
            if (entity.entityCode === event.target.name) {
                indexValue = index;
            }
        });

        // Determine if max number of checkboxes are checked
        if (signalsTableSummaryDataProcessed[indexValue]["visibility"] === false) {
            // If checkbox is false, determine if adding it will breach the limit
            if (this.maxHtsLimit > this.state.currentEntitiesChecked) {
                this.setState({
                    currentEntitiesChecked: this.state.currentEntitiesChecked + 1,
                    additionalRawSignalRequestedPingSlash24: signalsTableSummaryDataProcessed[indexValue]["initiallyLoaded"] === false,
                    additionalRawSignalRequestedBgp: signalsTableSummaryDataProcessed[indexValue]["initiallyLoaded"] === false,
                    additionalRawSignalRequestedUcsdNt: signalsTableSummaryDataProcessed[indexValue]["initiallyLoaded"] === false
                }, () => {
                    setTimeout(() => {
                        // Update visibility boolean property in copied object to update table
                        signalsTableSummaryDataProcessed[indexValue]["visibility"] = !signalsTableSummaryDataProcessed[indexValue]["visibility"];

                        // Check if raw signals data is already loaded for particular entity, get it if not
                        if (this.state.asnRawSignalsLoadAllButtonClicked && signalsTableSummaryDataProcessed[indexValue]["initiallyLoaded"] === false) {
                            // update property that manages if raw signal data has loaded or not
                            signalsTableSummaryDataProcessed[indexValue]["initiallyLoaded"] = true;
                            // call api for additional data on entity
                            let until = this.state.until;
                            let from = this.state.from;
                            let attr = this.state.eventOrderByAttr;
                            let order = this.state.eventOrderByOrder;
                            let entity = signalsTableSummaryDataProcessed[indexValue]["entityCode"];
                            let entityType = signalsTableSummaryDataProcessed[indexValue]["entityType"];

                            if (entityType && entity) {
                                this.props.getAdditionalRawSignalAction(entityType, entity, from, until, attr, order, "ping-slash24");
                                this.props.getAdditionalRawSignalAction(entityType, entity, from, until, attr, order, "bgp");
                                this.props.getAdditionalRawSignalAction(entityType, entity, from, until, attr, order, "ucsd-nt");
                                // Update state with freshly updated object list, then redraw the chart with new visibility values
                                switch (entityType) {
                                    case "region":
                                        this.setState({
                                            regionalSignalsTableSummaryDataProcessed: signalsTableSummaryDataProcessed,
                                            rawSignalsMaxEntitiesHtsError: ""
                                        }, () => {
                                            this.convertValuesForHtsViz("ping-slash24", "region");
                                            this.convertValuesForHtsViz("bgp", "region");
                                            this.convertValuesForHtsViz("ucsd-nt", "region");
                                        });
                                        break;
                                    case "asn":
                                        this.setState({
                                            asnSignalsTableSummaryDataProcessed: signalsTableSummaryDataProcessed,
                                            rawSignalsMaxEntitiesHtsError: ""
                                        }, () => {
                                            this.convertValuesForHtsViz("ping-slash24", "asn");
                                            this.convertValuesForHtsViz("bgp", "asn");
                                            this.convertValuesForHtsViz("ucsd-nt", "asn");
                                        });
                                        break;
                                }
                            }
                        } else {
                            // Update state with freshly updated object list, then redraw the chart with new visibility values
                            switch (entityType) {
                                case "region":
                                    this.setState({
                                        regionalSignalsTableSummaryDataProcessed: signalsTableSummaryDataProcessed,
                                        rawSignalsMaxEntitiesHtsError: ""
                                    }, () => {
                                        this.convertValuesForHtsViz("ping-slash24", "region");
                                        this.convertValuesForHtsViz("bgp", "region");
                                        this.convertValuesForHtsViz("ucsd-nt", "region");
                                    });
                                    break;
                                case "asn":
                                    this.setState({
                                        asnSignalsTableSummaryDataProcessed: signalsTableSummaryDataProcessed,
                                        rawSignalsMaxEntitiesHtsError: ""
                                    }, () => {
                                        this.convertValuesForHtsViz("ping-slash24", "asn");
                                        this.convertValuesForHtsViz("bgp", "asn");
                                        this.convertValuesForHtsViz("ucsd-nt", "asn");
                                    });
                                    break;
                            }
                        }
                    }, 1000);
                });
            } else {
                // Show error message
                this.setState({
                    rawSignalsMaxEntitiesHtsError: maxEntitiesPopulatedMessage
                });
            }
        } else {
            // Update visibility boolean property in copied object to update table
            signalsTableSummaryDataProcessed[indexValue]["visibility"] = !signalsTableSummaryDataProcessed[indexValue]["visibility"];
            this.setState({ currentEntitiesChecked: this.state.currentEntitiesChecked - 1});

            switch (entityType) {
                case "region":
                    this.setState({
                        regionalSignalsTableSummaryDataProcessed: signalsTableSummaryDataProcessed,
                        rawSignalsMaxEntitiesHtsError: ""
                    }, () => {
                        this.convertValuesForHtsViz("ping-slash24", "region");
                        this.convertValuesForHtsViz("bgp", "region");
                        this.convertValuesForHtsViz("ucsd-nt", "region");
                    });
                    break;
                case "asn":
                    this.setState({
                        asnSignalsTableSummaryDataProcessed: signalsTableSummaryDataProcessed,
                        rawSignalsMaxEntitiesHtsError: ""
                    }, () => {
                        this.convertValuesForHtsViz("ping-slash24", "asn");
                        this.convertValuesForHtsViz("bgp", "asn");
                        this.convertValuesForHtsViz("ucsd-nt", "asn");
                    });
                    break;
            }
        }
    }
    // function to manage what happens when the select max/uncheck all buttons are clicked
    handleSelectAndDeselectAllButtons(event) {
        if (event.target.name === "checkMaxRegional") {
            this.setState({
                checkMaxButtonLoading: true
            }, () => {
                setTimeout(() => {
                    let regionalSignalsTableSummaryDataProcessed = this.state.regionalSignalsTableSummaryDataProcessed;
                    // Count how many entities are currently checked
                    let entitiesCurrentlyChecked = 0;
                    regionalSignalsTableSummaryDataProcessed.map(entity => {
                        if (entity.visibility === true) {
                            entitiesCurrentlyChecked = entitiesCurrentlyChecked + 1;
                        }
                    });
                    // Check off additional entities to get to max allowed
                    regionalSignalsTableSummaryDataProcessed.map((entity, index) => {
                        entity.visibility = index < this.maxHtsLimit;
                    });

                    this.setState({
                        regionalSignalsTableSummaryDataProcessed: regionalSignalsTableSummaryDataProcessed,
                        regionalSignalsTableEntitiesChecked: regionalSignalsTableSummaryDataProcessed.length < this.maxHtsLimit ? regionalSignalsTableSummaryDataProcessed.length : this.maxHtsLimit,
                        currentEntitiesChecked: this.maxHtsLimit,
                        checkMaxButtonLoading: false

                    }, () => {
                        this.convertValuesForHtsViz("ping-slash24", "region");
                        this.convertValuesForHtsViz("bgp", "region");
                        this.convertValuesForHtsViz("ucsd-nt", "region");
                    });
                }, 500)
            });
        }
        if (event.target.name === "uncheckAllRegional") {
            this.setState({
                uncheckAllButtonLoading: true
            },() => {
                setTimeout(() => {
                    let regionalSignalsTableSummaryDataProcessed = this.state.regionalSignalsTableSummaryDataProcessed;
                    regionalSignalsTableSummaryDataProcessed.map(entity => {
                        entity.visibility = false;
                    });
                    this.setState({
                        regionalSignalsTableSummaryDataProcessed: regionalSignalsTableSummaryDataProcessed,
                        regionalSignalsTableEntitiesChecked: 0,
                        currentEntitiesChecked: 0,
                        uncheckAllButtonLoading: false
                    }, () => {
                        this.convertValuesForHtsViz("ping-slash24", "region");
                        this.convertValuesForHtsViz("bgp", "region");
                        this.convertValuesForHtsViz("ucsd-nt", "region");
                    });
                }, 500)
            });
        }
        if (event.target.name === "checkMaxAsn") {
            // Check if all entities are loaded
            // if (this.state.asnRawSignalsLoadAllButtonClicked) {
                this.setState({
                    checkMaxButtonLoading: true
                }, () => {
                    setTimeout(() => {
                        let asnSignalsTableSummaryDataProcessed = this.state.asnSignalsTableSummaryDataProcessed;
                        // Count how many entities are currently checked
                        let entitiesCurrentlyChecked = 0;
                        asnSignalsTableSummaryDataProcessed.map(entity => {
                            if (entity.visibility === true) {
                                entitiesCurrentlyChecked = entitiesCurrentlyChecked + 1;
                            }
                        });
                        // Check off additional entities to get to max allowed
                        asnSignalsTableSummaryDataProcessed.map((entity, index) => {
                            entity.visibility = index < this.maxHtsLimit;
                        });
                        this.setState({
                            asnSignalsTableSummaryDataProcessed: asnSignalsTableSummaryDataProcessed,
                            asnSignalsTableEntitiesChecked: asnSignalsTableSummaryDataProcessed.length < this.maxHtsLimit ? asnSignalsTableSummaryDataProcessed.length : this.maxHtsLimit,
                            currentEntitiesChecked: this.maxHtsLimit,
                            checkMaxButtonLoading: false
                        }, () => {
                            this.convertValuesForHtsViz("ping-slash24", "asn");
                            this.convertValuesForHtsViz("bgp", "asn");
                            this.convertValuesForHtsViz("ucsd-nt", "asn");
                        });
                    }, 500);
                });
        }
        if (event.target.name === "uncheckAllAsn") {
            this.setState({
                    uncheckAllButtonLoading: true
                },() => {
                    setTimeout(() => {
                        let asnSignalsTableSummaryDataProcessed = this.state.asnSignalsTableSummaryDataProcessed;
                        asnSignalsTableSummaryDataProcessed.map(entity => {
                            entity.visibility = false;
                        });
                        this.setState({
                            asnSignalsTableSummaryDataProcessed: asnSignalsTableSummaryDataProcessed,
                            asnSignalsTableEntitiesChecked: 0,
                            currentEntitiesChecked: 0,
                            uncheckAllButtonLoading: false
                        }, () => {
                            this.convertValuesForHtsViz("ping-slash24", "asn");
                            this.convertValuesForHtsViz("bgp", "asn");
                            this.convertValuesForHtsViz("ucsd-nt", "asn");
                        });
                    }, 500)
            });
        }
    }
    // function to manage what happens when the load all entities button is clicked
    handleLoadAllEntitiesButton(name) {

        if (name === 'regionLoadAllEntities') {
            this.setState({
                loadAllButtonEntitiesLoading: true
            });
            let signalsTableData = combineValuesForSignalsTable(this.state.summaryDataMapRaw, this.state.regionalSignalsTableSummaryData, 0);
            this.setState({
                regionalSignalsTableSummaryDataProcessed: this.state.regionalSignalsTableSummaryDataProcessed.concat(signalsTableData.slice(this.initialTableLimit))
            }, () => {
                this.genSignalsTable("region");
                this.setState({loadAllButtonEntitiesLoading: false, regionalRawSignalsLoadAllButtonClicked: true});
            });
        }

        if (name === 'asnLoadAllEntities') {
            this.setState({
                asnRawSignalsLoadAllButtonClicked: true
            }, () => {
                let signalsTableData = combineValuesForSignalsTable(this.state.relatedToTableSummary, this.state.asnSignalsTableSummaryData, 0);
                this.setState({
                    asnSignalsTableSummaryDataProcessed: this.state.asnSignalsTableSummaryDataProcessed.concat(signalsTableData.slice(this.initialTableLimit)),
                }, () => {
                    this.genSignalsTable("asn");
                    this.setState({
                        loadAllButtonEntitiesLoading: false
                    });

                })
            });
        }
    }
    handleAdditionalEntitiesLoading() {
        this.setState({
            loadAllButtonEntitiesLoading: true
        });
    }

    render() {
        const xyChartTitle = T.translate("entity.xyChartTitle");
        const eventAlertButtonText1 = T.translate("entity.eventAlertButtonText1");
        const eventAlertButtonText2 = T.translate("entity.eventAlertButtonText2");
        const eventFeedTitle = T.translate("entity.eventFeedTitle");
        const alertFeedTitle = T.translate("entity.alertFeedTitle");
        const xyChartAbsoluteButtonText = T.translate("entity.xyChartAbsoluteButtonText");
        const xyChartNormalizeButtonText = T.translate("entity.xyChartNormalizeButtonText");
        const xyChartToggleBandsOnText = T.translate("entity.xyChartToggleBandsOnText");
        const xyChartToggleBandsOffText = T.translate("entity.xyChartToggleBandsOffText");

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
                            <h3 className="heading-h2">
                                {xyChartTitle}
                                {this.state.entityName}
                            </h3>
                            <div className="overview__buttons">
                                <button className="overview__config-button"
                                        onClick={() => this.changeXyChartNormalization()}
                                >
                                    {this.state.tsDataNormalized ? xyChartAbsoluteButtonText : xyChartNormalizeButtonText}
                                </button>
                                <button className="overview__config-button overview__config-button--alertBands"
                                        onClick={() => this.handleDisplayAlertBands()}
                                >
                                    {this.state.tsDataDisplayOutageBands ? xyChartToggleBandsOffText : xyChartToggleBandsOnText}
                                </button>
                                {/*<button className="overview__config-button">Modal</button>*/}
                            </div>
                        </div>
                        {
                            this.state.xyDataOptions
                                ? this.genXyChart()
                                : <Loading/>
                        }
                    </div>
                    <div className="col-2-of-5">
                        <div className="overview__table-config">
                            <h3 className="heading-h2">
                                {this.state.currentTable === 'event' ? `${eventFeedTitle} ${this.state.entityName}` : `${alertFeedTitle} ${this.state.entityName}`}
                            </h3>
                            <button className="overview__config-button"
                                    onClick={() => this.changeCurrentTable()}
                                    style={this.props.type === 'asn' ? {display: 'none'} : null}
                            >
                                {eventAlertButtonText1}{this.state.currentTable === 'event' ? 'Alert' : 'Event'}{eventAlertButtonText2}
                            </button>
                        </div>

                        <div className="overview__table">
                            <div style={this.state.currentTable === 'event' ? {display: 'block'} : {display: 'none'}}>
                                {
                                    this.state.eventDataRaw ?
                                        this.genEventTable() : <Loading/>
                                }
                            </div>
                            <div style={this.state.currentTable === 'alert' ? {display: 'block'} : {display: 'none'}}>
                                {
                                    this.state.alertDataRaw ?
                                    this.genAlertTable() : <Loading/>
                                }
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

export default connect(mapStateToProps, mapDispatchToProps)(Entity);
