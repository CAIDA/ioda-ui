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
import Table from "../../components/table/Table";
import EntityRelated from "./EntityRelated";
import HorizonTSChart from 'horizon-timeseries-chart';
import Loading from "../../components/loading/Loading";
import ToggleButton from "../../components/toggleButton/ToggleButton";
import TimeStamp from "../../components/timeStamp/TimeStamp";
import TopoMap from "../../components/map/Map";
import * as topojson from 'topojson';
import * as d3 from "d3-shape";
import Tooltip from "../../components/tooltip/Tooltip";
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
    normalize,
    secondsToDhms,
    controlPanelTimeRangeLimit,
    alertBandColor,
    xyChartBackgroundLineColor,
    bgpColor,
    activeProbingColor,
    ucsdNtColor,
    convertTimeToSecondsForURL
} from "../../utils";
import CanvasJSChart from "../../libs/canvasjs-non-commercial-3.2.5/canvasjs.react";
import Error from "../../components/error/Error";
import {Helmet} from "react-helmet";
import XyChartModal from "../../components/modal/XyChartModal";


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
            // display export modal
            showXyChartModal: false,
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
            topoScores: null,
            bounds: null,
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
            // tracking when to dump states if a new entity is chosen
            rawRegionalSignalsLoaded: false,
            // Stacked Horizon Visual on ASN Table Panel
            rawAsnSignalsRawBgp: [],
            rawAsnSignalsRawPingSlash24: [],
            rawAsnSignalsRawUcsdNt: [],
            rawAsnSignalsProcessedBgp: null,
            rawAsnSignalsProcessedPingSlash24: null,
            rawAsnSignalsProcessedUcsdNt: null,
            rawAsnSignalsLoaded: false,
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
        this.handleCheckboxEventLoading = this.handleCheckboxEventLoading.bind(this);
        this.toggleXyChartModal = this.toggleXyChartModal.bind(this);
        this.changeXyChartNormalization = this.changeXyChartNormalization.bind(this);
        this.handleDisplayAlertBands = this.handleDisplayAlertBands.bind(this);
        this.initialTableLimit = 300;
        this.initialHtsLimit = 100;
        this.maxHtsLimit = 150;
    }
    componentDidMount() {
        console.log("update8");
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
                        // Overview Panel
                        this.props.searchEventsAction(this.state.from, this.state.until, window.location.pathname.split("/")[1], window.location.pathname.split("/")[2]);
                        this.props.searchAlertsAction(this.state.from, this.state.until, window.location.pathname.split("/")[1], window.location.pathname.split("/")[2], null, null, null);
                        this.props.getSignalsAction(window.location.pathname.split("/")[1], window.location.pathname.split("/")[2], this.state.from, this.state.until, null, 3000);
                        // Get entity name from code provided in url
                        this.props.getEntityMetadataAction(window.location.pathname.split("/")[1], window.location.pathname.split("/")[2]);
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
                    // Overview Panel
                    this.props.searchEventsAction(this.state.from, this.state.until, window.location.pathname.split("/")[1], window.location.pathname.split("/")[2]);
                    this.props.searchAlertsAction(this.state.from, this.state.until, window.location.pathname.split("/")[1], window.location.pathname.split("/")[2], null, null, null);
                    this.props.getSignalsAction(window.location.pathname.split("/")[1], window.location.pathname.split("/")[2], this.state.from, this.state.until, null, 3000);
                    // Get entity name from code provided in url
                    this.props.getEntityMetadataAction(window.location.pathname.split("/")[1], window.location.pathname.split("/")[2]);
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
            }, this.getMapScores);
        }

        // After API call for outage summary data completes, pass summary data to map function for data merging
        if (this.props.relatedToMapSummary !== prevProps.relatedToMapSummary) {
            this.setState({
                summaryDataMapRaw: this.props.relatedToMapSummary
            }, this.getMapScores)
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
        if (this.props.rawRegionalSignalsPingSlash24 !== prevProps.rawRegionalSignalsPingSlash24 && this.props.rawRegionalSignalsPingSlash24 && this.state.showMapModal ) {
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
        if (this.props.rawRegionalSignalsBgp !== prevProps.rawRegionalSignalsBgp && this.props.rawRegionalSignalsBgp && this.state.showMapModal) {
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
        if (this.props.rawRegionalSignalsUcsdNt !== prevProps.rawRegionalSignalsUcsdNt && this.props.rawRegionalSignalsUcsdNt && this.state.showMapModal) {
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
        if (this.props.rawAsnSignalsPingSlash24 !== prevProps.rawAsnSignalsPingSlash24 && this.props.rawAsnSignalsPingSlash24 && this.state.showTableModal) {
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
        if (this.props.rawAsnSignalsBgp !== prevProps.rawAsnSignalsBgp && this.props.rawAsnSignalsBgp && this.state.showTableModal) {
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
        if (this.props.rawAsnSignalsUcsdNt !== prevProps.rawAsnSignalsUcsdNt && this.props.rawAsnSignalsUcsdNt && this.state.showTableModal) {
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
            if (this.props.additionalRawSignal[0][0] !== undefined) {
                switch (this.props.additionalRawSignal[0][0]["entityType"]) {
                    case "region":
                        switch (this.props.additionalRawSignal[0][0]["datasource"]) {
                            case "ping-slash24":
                                let rawRegionalSignalsRawPingSlash24 = this.state.rawRegionalSignalsRawPingSlash24.concat(this.props.additionalRawSignal[0]);
                                this.setState({
                                    rawRegionalSignalsRawPingSlash24: rawRegionalSignalsRawPingSlash24
                                }, () => {
                                    this.convertValuesForHtsViz("ping-slash24", "asn");
                                });
                                break;
                            case "bgp":
                                let rawRegionalSignalsRawBgp = this.state.rawRegionalSignalsRawBgp.concat(this.props.additionalRawSignal[0]);
                                this.setState({
                                    rawRegionalSignalsRawBgp: rawRegionalSignalsRawBgp
                                }, () => {
                                    this.convertValuesForHtsViz("bgp", "asn");
                                });
                                break;
                            case "ucsd-nt":
                                let rawRegionalSignalsRawUcsdNt = this.state.rawRegionalSignalsRawUcsdNt.concat(this.props.additionalRawSignal[0]);
                                this.setState({
                                    rawRegionalSignalsRawUcsdNt: rawRegionalSignalsRawUcsdNt
                                }, () => {
                                    this.convertValuesForHtsViz("ucsd-nt", "asn")
                                });
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
                    lastFetched: 0,
                    // Event/Table Data
                    currentTable: 'alert',
                    eventDataRaw: null,
                    eventDataProcessed: [],
                    alertDataRaw: null,
                    alertDataProcessed: [],
                    // relatedTo entity Map
                    topoScores: null,
                    summaryDataMapRaw: null,
                    bounds: null,
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
                    rawRegionalSignalsLoaded: false,
                    rawRegionalSignalsLoadAllButtonClicked: false,
                    // Stacked Horizon Visual on ASN Table Panel
                    rawAsnSignalsRawBgp: [],
                    rawAsnSignalsRawPingSlash24: [],
                    rawAsnSignalsRawUcsdNt: [],
                    rawAsnSignalsProcessedBgp: null,
                    rawAsnSignalsProcessedPingSlash24: null,
                    rawAsnSignalsProcessedUcsdNt: null,
                    rawAsnSignalsLoaded: false,
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
                    searchTerm: "",
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
                    topoScores: null,
                    bounds: null,
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
                    rawRegionalSignalsLoaded: false,
                    rawRegionalSignalsLoadAllButtonClicked: false,
                    regionalRawSignalsLoadAllButtonClicked: false,
                    // Stacked Horizon Visual on ASN Table Panel
                    rawAsnSignalsRawBgp: [],
                    rawAsnSignalsRawPingSlash24: [],
                    rawAsnSignalsRawUcsdNt: [],
                    rawAsnSignalsProcessedBgp: null,
                    rawAsnSignalsProcessedPingSlash24: null,
                    rawAsnSignalsProcessedUcsdNt: null,
                    rawAsnSignalsLoaded: false,
                    asnRawSignalsLoadAllButtonClicked: false,
                    rawSignalsMaxEntitiesHtsError: "",
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

// 1st Row
// XY Chart Functions
    // format data used to draw the lines in the chart
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
    // function for when zoom/pan is used
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
    // format data from api to be compatible with chart visual
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
                animationEnabled: false,
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
                    },
                    minimum: new Date(this.state.from * 1000 + (new Date(this.state.from * 1000).getTimezoneOffset() * 60000)),
                    maximum: new Date(this.state.until * 1000 + (new Date(this.state.until * 1000).getTimezoneOffset() * 60000))
                },
                axisY: {
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
    // populate xy chart UI
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
    // toggle normalized values and absolute values
    changeXyChartNormalization() {
        this.setState({
            tsDataNormalized: !this.state.tsDataNormalized
        }, () => this.convertValuesForXyViz())
    }
    // toggle any populated alert bands to be displayed in chart
    handleDisplayAlertBands(status) {
        this.setState({
            tsDataDisplayOutageBands: status === "off" ? false : !this.state.tsDataDisplayOutageBands
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
    // display modal used for annotation/download
    toggleXyChartModal() {
        // force alert bands off
        this.handleDisplayAlertBands("off");
        // open modal and reset time range at the bottom of the chart
        this.setState({
            showXyChartModal: !this.state.showXyChartModal,
            tsDataLegendRangeFrom: window.location.search.split("?")[1]
                ? convertTimeToSecondsForURL(window.location.search.split("?")[1].split("&")[0].split("=")[1])
                : Math.round((new Date().getTime()  - (24 * 60 * 60 * 1000)) / 1000),
            tsDataLegendRangeUntil: window.location.search.split("?")[1]
                ? convertTimeToSecondsForURL(window.location.search.split("?")[1].split("&")[1].split("=")[1])
                : Math.round(new Date().getTime() / 1000),
        })
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
        });
    }
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
        });
    }
    // Switching between Events and Alerts
    changeCurrentTable() {
        if (this.state.currentTable === 'event') {
            this.setState({currentTable: 'alert'});
        } else if (this.state.currentTable === 'alert') {
            this.setState({currentTable: 'event'});
        }
    }


// 2nd Row
// RelatedTo Map
    // Make API call to retrieve topographic data
    getDataTopo(entityType) {
        if (this.state.mounted) {
            this.props.getTopoAction(entityType);
        }
    }
    // Process Geo data from api, attribute outage scores to a new topoData property where possible, then render Map
    getMapScores() {
        if (this.state.topoData && this.state.summaryDataMapRaw) {
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

            this.setState({topoScores: scores, bounds: outageCoords});
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
    // Show/hide modal when button is clicked on either panel
    toggleModal(modalLocation) {
        if (modalLocation === 'map') {
            // Get related entities used on table in map modal
            this.setState({
                showMapModal: !this.state.showMapModal
            },() => {
                if (this.state.showMapModal) {
                    if (!this.state.rawRegionalSignalsLoaded) {
                        this.props.regionalSignalsTableSummaryDataAction("region", window.location.pathname.split("/")[1], window.location.pathname.split("/")[2]);
                    }
                }
                if (!this.state.showMapModal) {
                    this.setState({
                        rawRegionalSignalsLoaded: true
                    })
                }
            });
        } else if (modalLocation === 'table') {
            this.setState({
                showTableModal: !this.state.showTableModal
            },() => {
                if (this.state.showTableModal) {
                    if (!this.state.rawAsnSignalsLoaded) {
                        this.props.asnSignalsTableSummaryDataAction("asn", window.location.pathname.split("/")[1], window.location.pathname.split("/")[2]);
                    }
                }
                if (!this.state.showTableModal) {
                    this.setState({
                        rawAsnSignalsLoaded: true
                    })
                }
            });
        }
    }

// Summary Table for related ASNs
    // Make API call to retrieve summary data to populate on map
    getDataRelatedToTableSummary(entityType) {
        if (this.state.mounted) {
            let until = this.state.until;
            let from = this.state.from;
            const limit = this.initialTableLimit;
            let page = this.state.relatedToTableApiPageNumber;
            const includeMetadata = true;
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
            })
        }
        // If the end of the data list is hit but more data exists, fetch it and tack it on
        if (this.state.relatedToTableApiPageNumber > 0) {
            this.setState({
                relatedToTableSummaryProcessed: this.state.relatedToTableSummaryProcessed.concat(summaryData)
            })
        }

    }
    // function to manage what happens when a linked entity in the table is clicked
    handleEntityClick(entityType, entityCode) {
        this.handleStateReset("newEntity", null, entityType, entityCode);
    }


// Modal Windows
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
                        this.props.getRawRegionalSignalsPingSlash24Action(entityType, entities, from, until, attr, order, dataSource);
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
                            additionalRawSignalRequestedPingSlash24: false

                        });
                        break;
                    case "bgp":
                        this.setState({
                            rawRegionalSignalsProcessedBgp: convertTsDataForHtsViz(rawSignalsNew),
                            additionalRawSignalRequestedBgp: false
                        });
                        break;
                    case "ucsd-nt":
                        this.setState({
                            rawRegionalSignalsProcessedUcsdNt: convertTsDataForHtsViz(rawSignalsNew),
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
                            additionalRawSignalRequestedPingSlash24: false
                        });
                        break;
                    case "bgp":
                        this.setState({
                            rawAsnSignalsProcessedBgp: convertTsDataForHtsViz(rawSignalsNew),
                            additionalRawSignalRequestedBgp: false
                        });
                        break;
                    case "ucsd-nt":
                        this.setState({
                            rawAsnSignalsProcessedUcsdNt: convertTsDataForHtsViz(rawSignalsNew),
                            additionalRawSignalRequestedUcsdNt: false
                        });
                        break;
                }
                break;
        }
    }
    // function to manage what happens when a checkbox is changed in the raw signals table
    toggleEntityVisibilityInHtsViz(entity, entityType) {
        let maxEntitiesPopulatedMessage = T.translate("entityModal.maxEntitiesPopulatedMessage");
        let signalsTableSummaryDataProcessed, indexValue;
        switch (entityType) {
            case "region":
                signalsTableSummaryDataProcessed = this.state.regionalSignalsTableSummaryDataProcessed;
                break;
            case "asn":
                signalsTableSummaryDataProcessed = this.state.asnSignalsTableSummaryDataProcessed;
                break;
        }

        signalsTableSummaryDataProcessed.filter((obj, index) => {
            if (obj.entityCode === entity.entityCode) {
                indexValue = index;
            }
        });

        switch (signalsTableSummaryDataProcessed[indexValue]["visibility"]) {
            case true:
                // If checkbox is now set to true, determine if adding it will breach the limit
                if (this.maxHtsLimit > this.state.currentEntitiesChecked) {
                    this.setState({
                        currentEntitiesChecked: this.state.currentEntitiesChecked + 1
                    }, () => {
                        // check if entity data is already available
                        switch (signalsTableSummaryDataProcessed[indexValue]["initiallyLoaded"]) {
                            case false:
                                // Update visibility boolean property in copied object to update table
                                signalsTableSummaryDataProcessed[indexValue]["visibility"] = true;
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
                                                });
                                                break;
                                            case "asn":
                                                this.setState({
                                                    asnSignalsTableSummaryDataProcessed: signalsTableSummaryDataProcessed,
                                                    rawSignalsMaxEntitiesHtsError: ""
                                                });
                                                break;
                                        }
                                    }
                                }
                                break;
                            case true:
                                // set new data
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
                                break;
                        }
                    });
                } else {
                    // Show error message
                    this.setState({
                        rawSignalsMaxEntitiesHtsError: maxEntitiesPopulatedMessage,
                        additionalRawSignalRequestedPingSlash24: false,
                        additionalRawSignalRequestedBgp: false,
                        additionalRawSignalRequestedUcsdNt: false
                    });
                }
                break;
            case false:
                // // Update currently checked item count and set new data to populate
                this.setState({ currentEntitiesChecked: this.state.currentEntitiesChecked - 1});
                switch (entityType) {
                    case "region":
                        this.setState({
                            regionalSignalsTableSummaryDataProcessed: signalsTableSummaryDataProcessed,
                            rawSignalsMaxEntitiesHtsError: "",
                            additionalRawSignalRequestedPingSlash24: false,
                            additionalRawSignalRequestedBgp: false,
                            additionalRawSignalRequestedUcsdNt: false
                        }, () => {
                            this.convertValuesForHtsViz("ping-slash24", "region");
                            this.convertValuesForHtsViz("bgp", "region");
                            this.convertValuesForHtsViz("ucsd-nt", "region");
                        });
                        break;
                    case "asn":
                        this.setState({
                            asnSignalsTableSummaryDataProcessed: signalsTableSummaryDataProcessed,
                            rawSignalsMaxEntitiesHtsError: "",
                            additionalRawSignalRequestedPingSlash24: false,
                            additionalRawSignalRequestedBgp: false,
                            additionalRawSignalRequestedUcsdNt: false
                        }, () => {
                            this.convertValuesForHtsViz("ping-slash24", "asn");
                            this.convertValuesForHtsViz("bgp", "asn");
                            this.convertValuesForHtsViz("ucsd-nt", "asn");
                        });
                        break;
                }
                break;
        }
    }
    // function to manage what happens when the select max/uncheck all buttons are clicked
    handleSelectAndDeselectAllButtons(event) {
        if (event.target.name === "checkMaxRegional") {
            this.setState({
                checkMaxButtonLoading: true
            }, () => {
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
            });
        }
        if (event.target.name === "uncheckAllRegional") {
            this.setState({
                uncheckAllButtonLoading: true
            },() => {
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
    // to trigger loading bars on raw signals horizon time series when a checkbox event occurs in the signals table
    handleCheckboxEventLoading(item) {
        let maxEntitiesPopulatedMessage = T.translate("entityModal.maxEntitiesPopulatedMessage");
        // Set checkbox visibility
        let signalsTableSummaryDataProcessed, indexValue;
        switch (item.entityType) {
            case "region":
                signalsTableSummaryDataProcessed = this.state.regionalSignalsTableSummaryDataProcessed;
                break;
            case "asn":
                signalsTableSummaryDataProcessed = this.state.asnSignalsTableSummaryDataProcessed;
                break;
        }

        signalsTableSummaryDataProcessed.filter((obj, index) => {
            if (obj.entityCode === item.entityCode) {
                indexValue = index;
            }
        });

        // Update visibility boolean property in copied object to match updated table
        if ((signalsTableSummaryDataProcessed[indexValue]["visibility"] === false && this.maxHtsLimit > this.state.currentEntitiesChecked) || signalsTableSummaryDataProcessed[indexValue]["visibility"] === true) {
            signalsTableSummaryDataProcessed[indexValue]["visibility"] = !signalsTableSummaryDataProcessed[indexValue]["visibility"];

            // set loading bars and updated table data
            switch (item.entityType) {
                case "region":
                    this.setState({
                        additionalRawSignalRequestedPingSlash24: true,
                        additionalRawSignalRequestedBgp: true,
                        additionalRawSignalRequestedUcsdNt: true,
                        regionalSignalsTableSummaryDataProcessed: signalsTableSummaryDataProcessed
                    }, () => {
                        setTimeout(() => {
                            this.toggleEntityVisibilityInHtsViz(item, item["entityType"]);
                        }, 700)
                    });
                    break;
                case "asn":
                    this.setState({
                        additionalRawSignalRequestedPingSlash24: true,
                        additionalRawSignalRequestedBgp: true,
                        additionalRawSignalRequestedUcsdNt: true,
                        asnSignalsTableSummaryDataProcessed: signalsTableSummaryDataProcessed
                    }, () => {
                        setTimeout(() => {
                            this.toggleEntityVisibilityInHtsViz(item, item["entityType"]);
                        }, 700)
                    });
                    break;
            }
        } else {
            this.setState({
                rawSignalsMaxEntitiesHtsError: maxEntitiesPopulatedMessage
            });
        }
    }

    render() {
        const xyChartTitle = T.translate("entity.xyChartTitle");
        const eventAlertButtonText1 = T.translate("entity.eventAlertButtonText1");
        const eventAlertButtonText2 = T.translate("entity.eventAlertButtonText2");
        const eventAlertButtonOption1 = T.translate("entity.eventAlertButtonOption1");
        const eventAlertButtonOption2 = T.translate("entity.eventAlertButtonOption2");
        const eventFeedTitle = T.translate("entity.eventFeedTitle");
        const alertFeedTitle = T.translate("entity.alertFeedTitle");
        const xyChartAlertToggleLabel = T.translate("entity.xyChartAlertToggleLabel");
        const xyChartNormalizedToggleLabel = T.translate("entity.xyChartNormalizedToggleLabel");

        const tooltipXyPlotTimeSeriesTitle = T.translate("tooltip.xyPlotTimeSeriesTitle.title");
        const tooltipXyPlotTimeSeriesText = T.translate("tooltip.xyPlotTimeSeriesTitle.text");
        const tooltipAlertFeedTitle = T.translate("tooltip.alertFeed.title");
        const tooltipAlertFeedText = T.translate("tooltip.alertFeed.text");

        const timeDurationTooHighErrorMessage = T.translate("dashboard.timeDurationTooHighErrorMessage");

        return(
            <div className="entity">
                <Helmet>
                    <title>IODA | Internet Outages for {this.state.entityName}</title>
                    <meta name="description" content={`Visualizations and Alerts for ${this.state.entityName} Internet Outages Detected by IODA`} />
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
                                    <div className="col-3-of-5">
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
                                                <div className="overview__buttons-col">
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
                                                <div className="overview__buttons-col">
                                                    <button className="related__modal-button" onClick={this.toggleXyChartModal}>
                                                        Export Chart
                                                    </button>
                                                    {
                                                        this.state.showXyChartModal && <XyChartModal
                                                            entityName={this.state.entityName}
                                                            toggleModal={this.toggleXyChartModal}
                                                            xyDataOptions={this.state.xyDataOptions}
                                                            modalStatus={this.state.showXyChartModal}
                                                            // for toggles in chart, data and onToggle functions
                                                            handleDisplayAlertBands={this.handleDisplayAlertBands}
                                                            changeXyChartNormalization={this.changeXyChartNormalization}
                                                            tsDataDisplayOutageBands={this.state.tsDataDisplayOutageBands}
                                                            tsDataNormalized={this.state.tsDataNormalized}
                                                            // for datestamp below chart
                                                            tsDataLegendRangeFrom={this.state.tsDataLegendRangeFrom}
                                                            tsDataLegendRangeUntil={this.state.tsDataLegendRangeUntil}
                                                        />
                                                    }
                                                </div>
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
                                    <div className="col-2-of-5">
                                        <div className="overview__table-config">
                                            <div className="overview__config-heading">
                                                <h3 className="heading-h3">
                                                    {this.state.currentTable === 'event' ? `${eventFeedTitle} ${this.state.entityName}` : `${alertFeedTitle} ${this.state.entityName}`}
                                                </h3>
                                                <Tooltip
                                                    title={tooltipAlertFeedTitle}
                                                    text={tooltipAlertFeedText}
                                                />
                                            </div>
                                            <button className="overview__config-button"
                                                    onClick={() => this.changeCurrentTable()}
                                                    style={this.props.type === 'asn' ? {display: 'none'} : null}
                                            >
                                                {eventAlertButtonText1}{this.state.currentTable === 'event' ? eventAlertButtonOption1 : eventAlertButtonOption2}{eventAlertButtonText2}
                                            </button>
                                        </div>

                                        <div className="overview__table">
                                            <div style={this.state.currentTable === 'event' ? {display: 'block'} : {display: 'none'}}>
                                                {
                                                    this.state.eventDataProcessed ?
                                                        <Table
                                                            type={"event"}
                                                            data={this.state.eventDataProcessed}
                                                            totalCount={this.state.eventDataProcessed.length}
                                                        /> : <Loading/>
                                                }
                                            </div>
                                            <div style={this.state.currentTable === 'alert' ? {display: 'block'} : {display: 'none'}}>
                                                {

                                                        this.state.alertDataProcessed ?
                                                        <Table
                                                            type="alert"
                                                            data={this.state.alertDataProcessed}
                                                            totalCount={this.state.alertDataProcessed.length}
                                                        /> : <Loading/>
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <EntityRelated
                                    entityName={this.state.entityName}
                                    entityType={this.state.entityType}
                                    parentEntityName={this.state.parentEntityName}
                                    toggleModal={this.toggleModal}
                                    showMapModal={this.state.showMapModal}
                                    showTableModal={this.state.showTableModal}
                                    // to populate map
                                    topoData={this.state.topoData}
                                    topoScores={this.state.topoScores}
                                    bounds={this.state.bounds}
                                    handleEntityShapeClick={(entity) => this.handleEntityShapeClick(entity)}
                                    summaryDataRaw={this.state.summaryDataRaw}
                                    // to populate asn summary table
                                    relatedToTableSummaryProcessed={this.state.relatedToTableSummaryProcessed}
                                    relatedToTableSummary={this.state.relatedToTableSummary}
                                    // handleEntityClick={(entity) => this.handleEntityClick(entity)}
                                    // raw signals tables for region modal
                                    handleSelectAndDeselectAllButtons={(event) => this.handleSelectAndDeselectAllButtons(event)}
                                    regionalSignalsTableSummaryDataProcessed={this.state.regionalSignalsTableSummaryDataProcessed}
                                    toggleEntityVisibilityInHtsViz={event => this.toggleEntityVisibilityInHtsViz(event, "region")}
                                    handleEntityClick={(entityType, entityCode) => this.handleEntityClick(entityType, entityCode)}
                                    handleCheckboxEventLoading={(item) => this.handleCheckboxEventLoading(item)}
                                    asnSignalsTableSummaryDataProcessed={this.state.asnSignalsTableSummaryDataProcessed}
                                    // Regional HTS methods
                                    regionalSignalsTableEntitiesChecked={this.state.regionalSignalsTableEntitiesChecked}
                                    asnSignalsTableEntitiesChecked={this.state.asnSignalsTableEntitiesChecked}
                                    initialTableLimit={this.initialTableLimit}
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
                                    // used to check if there are no entities available to load (to control when loading bar disappears)
                                    rawRegionalSignalsRawBgpLength = {this.state.rawRegionalSignalsRawBgp.length}
                                    rawRegionalSignalsRawPingSlash24Length = {this.state.rawRegionalSignalsRawPingSlash24.length}
                                    rawRegionalSignalsRawUcsdNtLength = {this.state.rawRegionalSignalsRawUcsdNt.length}
                                    rawAsnSignalsRawBgpLength = {this.state.rawAsnSignalsRawBgp.length}
                                    rawAsnSignalsRawPingSlash24Length = {this.state.rawAsnSignalsRawPingSlash24.length}
                                    rawAsnSignalsRawUcsdNtLength = {this.state.rawAsnSignalsRawUcsdNt.length}
                                />
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

export default connect(mapStateToProps, mapDispatchToProps)(Entity);
