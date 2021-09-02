import React, {PureComponent} from 'react';
import PropTypes from "prop-types";
import T from 'i18n-react';
import Loading from "../../components/loading/Loading";
import LoadingIcon from 'images/icons/icon-loading.png';
import Tooltip from "../tooltip/Tooltip";
import TopoMap from "../map/Map";
import Table from "../table/Table";
import * as d3 from "d3-shape";
import {
    horizonChartSeriesColor,
    humanizeNumber,
    secondaryColor,
    secondaryColorDark,
    secondaryColorLight
} from "../../utils";
import HorizonTSChart from "horizon-timeseries-chart";
import Style from "react-style-tag/lib/Style";

class Modal extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            additionalEntitiesLoading: false,
            renderingDataPingSlash24: false,
            renderingDataBgp: false,
            renderingDataUcsdNt: false
        };
        this.configPingSlash24 = React.createRef();
        this.configBgp = React.createRef();
        this.configUcsdNt = React.createRef();
        this.additionalEntitiesLoading = false;

        this.titlePingSlash24 = React.createRef();
        this.titleBgp = React.createRef();
        this.titleUcsdNt = React.createRef();
    }

    componentDidUpdate(prevProps) {
        if (this.props.rawRegionalSignalsProcessedUcsdNt !== prevProps.rawRegionalSignalsProcessedUcsdNt && this.configUcsdNt.current) {
            this.genChart(this.configUcsdNt.current.offsetWidth, "ucsd-nt", "region")
        }
        if (this.props.rawAsnSignalsProcessedUcsdNt !== prevProps.rawAsnSignalsProcessedUcsdNt && this.configUcsdNt.current) {
            this.genChart(this.configUcsdNt.current.offsetWidth, "ucsd-nt", "asn")
        }

        if (this.configPingSlash24 && this.configPingSlash24.current && this.configPingSlash24.current.clientHeight === 0) {
            this.setState({ renderingDataPingSlash24: true })
        }

        if (this.configPingSlash24 && this.configPingSlash24.current && this.configPingSlash24.current.clientHeight !== 0) {
            this.setState({ renderingDataPingSlash24: false })
        }

        if (this.configBgp && this.configBgp.current && this.configBgp.current.clientHeight === 0) {
            this.setState({ renderingDataBgp: true })
        }

        if (this.configBgp && this.configBgp.current && this.configBgp.current.clientHeight !== 0) {
            this.setState({ renderingDataBgp: false })
        }

        if (this.configUcsdNt && this.configUcsdNt.current && this.configUcsdNt.current.clientHeight === 0) {
            this.setState({ renderingDataUcsdNt: true })
        }

        if (this.configUcsdNt && this.configUcsdNt.current && this.configUcsdNt.current.clientHeight !== 0) {
            this.setState({ renderingDataUcsdNt: false })
        }
    }

    genChart(width, dataSource, entityType) {
        // set variables
        let dataSourceForCSS, rawSignalsLoadedBoolean, rawSignalsProcessedArray;
        switch (entityType) {
            case 'region':
                switch (dataSource) {
                    case 'ping-slash24':
                        if (this.props.rawRegionalSignalsProcessedPingSlash24 && this.props.rawRegionalSignalsProcessedPingSlash24.length > 0) {
                            dataSourceForCSS = "pingSlash24";
                            rawSignalsLoadedBoolean = this.props.rawRegionalSignalsLoadedPingSlash24;
                            rawSignalsProcessedArray = this.props.rawRegionalSignalsProcessedPingSlash24;
                        }
                        break;
                    case 'bgp':
                        if (this.props.rawRegionalSignalsProcessedBgp && this.props.rawRegionalSignalsProcessedBgp.length > 0) {
                            dataSourceForCSS = "bgp";
                            rawSignalsLoadedBoolean = this.props.rawRegionalSignalsLoadedBgp;
                            rawSignalsProcessedArray = this.props.rawRegionalSignalsProcessedBgp;
                        }
                        break;
                    case 'ucsd-nt':
                        if (this.props.rawRegionalSignalsProcessedUcsdNt && this.props.rawRegionalSignalsProcessedUcsdNt.length > 0) {
                            dataSourceForCSS = "ucsdNt";
                            rawSignalsLoadedBoolean = this.props.rawRegionalSignalsLoadedUcsdNt;
                            rawSignalsProcessedArray = this.props.rawRegionalSignalsProcessedUcsdNt;
                        }
                        break;
                }
                break;
            case 'asn':
                switch (dataSource) {
                    case 'ping-slash24':
                        if (this.props.rawAsnSignalsProcessedPingSlash24 && this.props.rawAsnSignalsProcessedPingSlash24.length > 0) {
                            dataSourceForCSS = "pingSlash24";
                            rawSignalsLoadedBoolean = this.props.rawAsnSignalsLoadedPingSlash24;
                            rawSignalsProcessedArray = this.props.rawAsnSignalsProcessedPingSlash24;
                        }
                        break;
                    case 'bgp':
                        if (this.props.rawAsnSignalsProcessedBgp && this.props.rawAsnSignalsProcessedBgp.length > 0) {
                            dataSourceForCSS = "bgp";
                            rawSignalsLoadedBoolean = this.props.rawAsnSignalsLoadedBgp;
                            rawSignalsProcessedArray = this.props.rawAsnSignalsProcessedBgp;
                        }
                        break;
                    case 'ucsd-nt':
                        if (this.props.rawAsnSignalsProcessedUcsdNt && this.props.rawAsnSignalsProcessedUcsdNt.length > 0) {
                            dataSourceForCSS = "ucsdNt";
                            rawSignalsLoadedBoolean = this.props.rawAsnSignalsLoadedUcsdNt;
                            rawSignalsProcessedArray = this.props.rawAsnSignalsProcessedUcsdNt;
                        }
                        break;
                }
                break;
        }
        if (rawSignalsProcessedArray && rawSignalsProcessedArray.length > 0) {
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
                .positiveColors(['white', horizonChartSeriesColor])
                // .positiveColorStops([.01])
                .toolTipContent = ({series, ts, val}) => `${series}<br>${ts}:&nbsp;${humanizeNumber(val)}`;
        } else {
            return null
        }
    }

    handleAdditionalEntitiesLoading(event) {
        let name = event.target.name;
        this.setState({
            additionalEntitiesLoading: true
        }, () => {
            setTimeout(() => {
                this.props.handleLoadAllEntitiesButton(name)
            }, 600);
        });
    }

    render() {
        if (this.props.modalLocation === 'map' && !this.props.showModal) {
            return null;
        }
        if (this.props.modalLocation === 'table' && !this.props.showModal) {
            return null;
        }

        const regionTitle = T.translate("entityModal.regionTitle");
        const asnTitle = T.translate("entityModal.asnTitle");
        const regionalTableTitle = T.translate("entityModal.regionalTableTitle");
        const asnTableTitle = T.translate("entityModal.asnTableTitle");
        const regionalMapTitle = T.translate("entityModal.regionalMapTitle");
        const noOutagesOnMapMessage = T.translate("entityModal.noOutagesOnMapMessage");
        const pingSlash24HtsLabel = T.translate("entityModal.pingSlash24HtsLabel");
        const bgpHtsLabel = T.translate("entityModal.bgpHtsLabel");
        const ucsdNtHtsLabel = T.translate("entityModal.ucsdNtHtsLabel");
        const checkMaxButton = T.translate("entityModal.checkMaxButton");
        const checkMaxButtonBelow150_1 = T.translate("entityModal.checkMaxButtonBelow150_1");
        const checkMaxButtonBelow150_2 = T.translate("entityModal.checkMaxButtonBelow150_2");
        const uncheckAllButton = T.translate("entityModal.uncheckAllButton");
        const currentCountInHts1 = T.translate("entityModal.currentCountInHts1");
        const regionSingular = T.translate("entityModal.regionSingular");
        const regionPlural = T.translate("entityModal.regionPlural");
        const asnSingular = T.translate("entityModal.asnSingular");
        const asnPlural = T.translate("entityModal.asnPlural");
        const currentCountInHts2 = T.translate("entityModal.currentCountInHts2");
        const currentCountInHts3 = T.translate("entityModal.currentCountInHts3");
        const loadRemainingEntities1 = T.translate("entityModal.loadRemainingEntities1");
        const loadRemainingEntities2 = T.translate("entityModal.loadRemainingEntities2");
        const loadRemainingEntities3 = T.translate("entityModal.loadRemainingEntities3");
        const loadRemainingEntities4 = T.translate("entityModal.loadRemainingEntities4");
        const loadRemainingEntities5 = T.translate("entityModal.loadRemainingEntities5");
        const tooltipEntityRawSignalsHeadingTitle = T.translate("tooltip.entityRawSignalsHeading.title");
        const tooltipEntityRawSignalsHeadingText = T.translate("tooltip.entityRawSignalsHeading.text");

        console.log(this.titleBgp);
        console.log(this.configBgp);

        const activeCSS = `display: block;`;
        const inactiveCSS = `display: none;`;

        return(
            <div className="modal">
                <Style>{`
                    .renderingDataPingSlash24 {
                        ${this.state.renderingDataPingSlash24 ? activeCSS : inactiveCSS}
                    }
                    .renderingDataBgp {
                        ${this.state.renderingDataBgp ? activeCSS : inactiveCSS}
                    }
                    .renderingDataUcsdNt {
                        ${this.state.renderingDataUcsdNt ? activeCSS : inactiveCSS}
                    }
                `}</Style>
                <div className="modal__background"></div>
                <div className="modal__window">
                    <div className="modal__row">
                        <div className="modal__heading">
                            <div className="modal__heading-title">
                                {
                                    this.props.modalLocation === 'map'
                                        ? <h2 className="heading-h2">{regionTitle} {this.props.entityName}</h2>
                                        : this.props.modalLocation === 'table'
                                        ? <h2 className="heading-h2">{asnTitle} {this.props.entityName}</h2>
                                        : null
                                }
                                <Tooltip
                                    title={tooltipEntityRawSignalsHeadingTitle}
                                    text={tooltipEntityRawSignalsHeadingText}
                                />
                            </div>
                            <button className="modal__button" onClick={() => this.props.toggleModal(this.props.modalLocation)}>
                                ×
                            </button>
                        </div>
                        {
                            this.props.modalLocation === "map" ? <p className="modal__hts-count">
                                    {currentCountInHts1}
                                    {this.props.regionalSignalsTableEntitiesChecked}
                                    {this.props.regionalSignalsTableEntitiesChecked === 1 ? regionSingular : regionPlural}
                                    {currentCountInHts2}
                                    {regionSingular}
                                    {currentCountInHts3}
                                </p> :
                                <p className="modal__hts-count">
                                    {currentCountInHts1}
                                    {this.props.asnSignalsTableEntitiesChecked}
                                    {this.props.asnSignalsTableEntitiesChecked === 1 ? asnSingular : asnPlural}
                                    {currentCountInHts2}
                                    {asnSingular}
                                    {currentCountInHts3}
                                </p>
                        }
                    </div>
                    {
                        this.props.modalLocation === 'map'
                            ? <div className="modal__content">
                                <div className="row">
                                    <div className="col-1-of-3">
                                        <div className="modal__table-container">
                                            <div className="modal__table-heading">
                                                <h3 className="heading-h3">{regionalTableTitle}</h3>
                                                {
                                                    this.props.regionalSignalsTableTotalCount > this.props.initialTableLimit && this.props.regionalRawSignalsLoadAllButtonClicked === false
                                                        ? <div className="modal__loadAll">
                                                            {loadRemainingEntities1}
                                                            {asnPlural}
                                                            {loadRemainingEntities2}
                                                            <strong>{this.props.initialTableLimit}</strong>
                                                            {loadRemainingEntities3}
                                                            {
                                                                this.state.additionalEntitiesLoading
                                                                    ? <img className="modal__loadAll-spinner" src={LoadingIcon} alt="Loading"/>
                                                                    : <button className="modal__text-link" name="asnLoadAllEntities" onClick={event => this.handleAdditionalEntitiesLoading(event)}>
                                                                        {loadRemainingEntities4}
                                                                    </button>
                                                            }
                                                            {loadRemainingEntities5}
                                                        </div>
                                                        : null
                                                }
                                                <div className="modal__table-buttons">
                                                    {
                                                        this.props.checkMaxButtonLoading ? <img src={LoadingIcon} className="modal__loadAll-spinner" alt="Loading"/>
                                                            : <button className="modal__button--table" name="checkMaxRegional" onClick={event => this.props.handleSelectAndDeselectAllButtons(event)}>
                                                                {
                                                                    this.props.regionalSignalsTableSummaryDataProcessed.length < 150
                                                                        ? `${checkMaxButtonBelow150_1}${this.props.regionalSignalsTableSummaryDataProcessed.length}${checkMaxButtonBelow150_2}`
                                                                        : checkMaxButton
                                                                }
                                                            </button>
                                                    }
                                                    {
                                                        this.props.uncheckAllButtonLoading ? <img src={LoadingIcon} className="modal__loadAll-spinner" alt="Loading"/>
                                                            : <button className="modal__button--table" name="uncheckAllRegional" onClick={event => this.props.handleSelectAndDeselectAllButtons(event)}>
                                                                {uncheckAllButton}
                                                            </button>
                                                    }
                                                </div>
                                            </div>
                                            {
                                                this.props.rawSignalsMaxEntitiesHtsError ? <p>{this.props.rawSignalsMaxEntitiesHtsError}</p> : null
                                            }
                                            <div className="modal__table">
                                                {
                                                    this.props.regionalSignalsTableSummaryDataProcessed ?
                                                    <Table
                                                        type="signal"
                                                        data={this.props.regionalSignalsTableSummaryDataProcessed}
                                                        totalCount={this.props.regionalSignalsTableSummaryDataProcessed.length}
                                                        toggleEntityVisibilityInHtsViz={event => this.props.toggleEntityVisibilityInHtsViz(event, "region")}
                                                        handleEntityClick={(entityType, entityCode) => this.props.handleEntityClick(entityType, entityCode)}
                                                        handleCheckboxEventLoading={(item) => this.props.handleCheckboxEventLoading(item)}
                                                    />
                                                    : <Loading/>
                                                }
                                            </div>
                                        </div>
                                        <div className="modal__map-container">
                                            <h3 className="heading-h3">{regionalMapTitle}</h3>
                                            <div className="modal__map">
                                                <div className="modal__map" style={{display: 'block', height: '40.5rem'}}>
                                                    {
                                                        this.props.topoData && this.props.bounds && this.props.topoScores
                                                            ? <TopoMap topoData={this.props.topoData} bounds={this.props.bounds} scores={this.props.topoScores} handleEntityShapeClick={(entity) => this.props.handleEntityShapeClick(entity)}/>
                                                            : this.props.summaryDataMapRaw && this.props.topoScores && this.props.topoScores.length === 0
                                                            ? <div className="related__no-outages">
                                                                <h2 className="related__no-outages-title">{noOutagesOnMapMessage}</h2>
                                                            </div>
                                                            : <Loading/>
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-2-of-3">
                                        <h3 className="heading-h3">{pingSlash24HtsLabel}</h3>
                                        {
                                            this.props.rawRegionalSignalsProcessedPingSlash24 ? null : <Loading/>
                                        }
                                        {
                                            this.props.additionalRawSignalRequestedPingSlash24 === true ? <Loading/> :
                                                this.props.rawRegionalSignalsProcessedPingSlash24
                                                    ? <div id="region-horizon-chart--pingSlash24" ref={this.configPingSlash24}
                                                           className="modal__chart">
                                                        {
                                                            this.configPingSlash24.current ?
                                                                this.genChart(this.configPingSlash24.current.offsetWidth, "ping-slash24", "region") : null
                                                        }
                                                    </div>
                                                    : null
                                        }
                                        <h3 className="heading-h3">{bgpHtsLabel}</h3>
                                        {
                                            this.props.rawRegionalSignalsProcessedBgp ? null : <Loading/>
                                        }
                                        {
                                            this.props.additionalRawSignalRequestedBgp === true ? <Loading/> :
                                                this.props.rawRegionalSignalsProcessedBgp
                                                    ? <div id="region-horizon-chart--bgp" ref={this.configBgp}
                                                           className="modal__chart">
                                                        {
                                                            this.configBgp.current ?
                                                                this.genChart(this.configBgp.current.offsetWidth, "bgp", "region") : null
                                                        }
                                                    </div>
                                                    : null
                                        }
                                        <h3 className="heading-h3">{ucsdNtHtsLabel}</h3>
                                        {
                                            this.props.rawRegionalSignalsProcessedUcsdNt ? null : <Loading/>
                                        }
                                        {
                                            this.props.additionalRawSignalRequestedUcsdNt === true ? <Loading/> :
                                                this.props.rawRegionalSignalsProcessedUcsdNt
                                                    ? <div id="region-horizon-chart--ucsdNt" ref={this.configUcsdNt}
                                                           className="modal__chart">
                                                        {
                                                            this.configUcsdNt.current ?
                                                                this.genChart(this.configUcsdNt.current.offsetWidth, "ucsd-nt", "region") : null
                                                        }
                                                    </div>
                                                    : null
                                        }
                                    </div>
                                </div>
                            </div>
                            : null
                    }
                    {
                        this.props.modalLocation === 'table'
                            ? <div className="modal__content">
                                <div className="row">
                                    <div className="col-1-of-3">
                                        <div className="modal__table-container">
                                            <div className="modal__table-heading">
                                                <h3 className="heading-h3">{asnTableTitle}</h3>
                                                <div className="modal__table-buttons">
                                                    {
                                                        this.props.checkMaxButtonLoading ? <img src={LoadingIcon} className="modal__loadAll-spinner" alt="Loading"/>
                                                            : <button className="modal__button--table" name="checkMaxAsn" onClick={event => this.props.handleSelectAndDeselectAllButtons(event)}>
                                                                {
                                                                    this.props.asnSignalsTableSummaryDataProcessed.length < 150
                                                                        ? `${checkMaxButtonBelow150_1}${this.props.asnSignalsTableSummaryDataProcessed.length}${checkMaxButtonBelow150_2}`
                                                                        : checkMaxButton
                                                                }
                                                            </button>
                                                    }
                                                    {
                                                        this.props.uncheckAllButtonLoading ? <img src={LoadingIcon} className="modal__loadAll-spinner" alt="Loading"/>
                                                            : <button className="modal__button--table" name="uncheckAllAsn" onClick={event => this.props.handleSelectAndDeselectAllButtons(event)}>
                                                                {uncheckAllButton}
                                                            </button>
                                                    }
                                                </div>
                                            </div> 
                                            {
                                                this.props.asnSignalsTableTotalCount > this.props.initialTableLimit && this.props.asnRawSignalsLoadAllButtonClicked === false
                                                    ? <div className="modal__loadAll">
                                                        {loadRemainingEntities1}
                                                        {asnPlural}
                                                        {loadRemainingEntities2}
                                                        <strong>{this.props.initialTableLimit}</strong>
                                                        {loadRemainingEntities3}
                                                        {
                                                            this.state.additionalEntitiesLoading
                                                                ? <img src={LoadingIcon} className="modal__loadAll-spinner" alt="Loading"/>
                                                                : <button className="modal__loadAll-button" name="asnLoadAllEntities" onClick={event => this.handleAdditionalEntitiesLoading(event)}>
                                                                    {loadRemainingEntities4}
                                                                </button>
                                                        }
                                                        {loadRemainingEntities5}
                                                    </div>
                                                    : null
                                            }
                                            {
                                                this.props.rawSignalsMaxEntitiesHtsError ? <p className="modal__table-error">{this.props.rawSignalsMaxEntitiesHtsError}</p> : null
                                            }
                                            <div className="modal__table modal__table--asn">
                                                {
                                                    this.props.asnSignalsTableSummaryDataProcessed && this.props.asnSignalsTableTotalCount ?
                                                    <Table
                                                        type="signal"
                                                        data={this.props.asnSignalsTableSummaryDataProcessed}
                                                        totalCount={this.props.asnSignalsTableTotalCount}
                                                        entityType={this.props.entityType === "asn" ? "country" : "asn"}
                                                        toggleEntityVisibilityInHtsViz={event => this.props.toggleEntityVisibilityInHtsViz(event, "asn")}
                                                        handleEntityClick={(entityType, entityCode) => this.props.handleEntityClick(entityType, entityCode)}
                                                        handleCheckboxEventLoading={(item) => this.props.handleCheckboxEventLoading(item)}
                                                    /> : <Loading/>
                                                }
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-2-of-3">
                                        <h3 className="heading-h3" ref={this.titlePingSlash24}>{pingSlash24HtsLabel}</h3>
                                        {
                                            this.props.rawAsnSignalsRawPingSlash24Length === 0 && !this.props.rawAsnSignalsProcessedPingSlash24 ? <Loading text="Retrieving Data..."/> :
                                            this.props.rawAsnSignalsRawPingSlash24Length !== 0 && this.titlePingSlash24 && this.titlePingSlash24.current && this.titlePingSlash24.current.nextElementSibling !== "div#asn-horizon-chart--pingSlash24.modal__chart" ? <div className="renderingDataPingSlash24"><Loading text="Rendering Data..."/></div> :
                                            null
                                        }
                                        {
                                            this.props.additionalRawSignalRequestedPingSlash24 === true ? <Loading/> :
                                                this.props.rawAsnSignalsProcessedPingSlash24 && this.props.rawAsnSignalsProcessedPingSlash24.length !== 0 ?
                                                    <div id="asn-horizon-chart--pingSlash24" ref={this.configPingSlash24}
                                                         className="modal__chart">
                                                        {
                                                            this.configPingSlash24.current ?
                                                                this.genChart(this.configPingSlash24.current.offsetWidth, "ping-slash24", "asn") : null
                                                        }
                                                    </div> : null
                                        }
                                        <h3 className="heading-h3" ref={this.titleBgp}>{bgpHtsLabel}</h3>
                                        {
                                            this.props.rawAsnSignalsRawBgpLength !== 0 && this.props.rawAsnSignalsProcessedBgp && this.props.rawAsnSignalsProcessedBgp.length === 0 ? null :
                                            this.props.rawAsnSignalsRawBgpLength === 0 && !this.props.rawAsnSignalsProcessedBgp ? <Loading text="Retrieving Data..."/> :
                                            this.props.rawAsnSignalsRawBgpLength !== 0 && this.titleBgp && this.titleBgp.current && this.titleBgp.current.nextElementSibling !== "div#asn-horizon-chart--bgp.modal__chart" ? <div className="renderingDataBgp"><Loading text="Rendering Data..."/></div> :
                                            null
                                            // this.props.rawAsnSignalsProcessedBgp ? null : <Loading/>
                                        }
                                        {
                                            this.props.additionalRawSignalRequestedBgp === true ? <Loading/> :
                                                this.props.rawAsnSignalsProcessedBgp && this.props.rawAsnSignalsProcessedBgp.length !== 0 ?
                                                <div id="asn-horizon-chart--bgp" ref={this.configBgp}
                                                     className="modal__chart">
                                                    {
                                                        this.configBgp.current ?
                                                            this.genChart(this.configBgp.current.offsetWidth, "bgp", "asn") : null
                                                    }
                                                </div> : null
                                        }
                                        <h3 className="heading-h3" ref={this.titleUcsdNt}>{ucsdNtHtsLabel}</h3>
                                        {
                                            this.props.rawAsnSignalsRawUcsdNtLength === 0 && !this.props.rawAsnSignalsProcessedUcsdNt ? <Loading text="Retrieving Data..."/> :
                                            this.props.rawAsnSignalsRawUcsdNtLength !== 0 &&  this.titleUcsdNt && this.titleUcsdNt.current && this.titleUcsdNt.current.nextElementSibling !== "div#asn-horizon-chart--ucsdNt.modal__chart" ? <div className="renderingDataUcsdNt"><Loading text="Rendering Data..."/></div> :
                                            null
                                            // this.props.rawAsnSignalsProcessedUcsdNt ? null : <Loading/>
                                        }
                                        {
                                            this.props.additionalRawSignalRequestedUcsdNt === true ? <Loading/> :
                                                this.props.rawAsnSignalsProcessedUcsdNt && this.props.rawAsnSignalsProcessedUcsdNt.length !== 0 ?
                                                <div id="asn-horizon-chart--ucsdNt" ref={this.configUcsdNt}
                                                     className="modal__chart">
                                                    {
                                                        this.configUcsdNt.current ?
                                                            this.genChart(this.configUcsdNt.current.offsetWidth, "ucsd-nt", "asn") : null
                                                    }
                                                </div> : null
                                        }
                                    </div>
                                </div>
                            </div>
                            : null
                    }
                </div>
            </div>
        );
    }
}

Modal.propTypes = {
    modalLocation: PropTypes.string.isRequired,
    toggleModal: PropTypes.func.isRequired,
    showModal: PropTypes.bool.isRequired
};

export default Modal;
