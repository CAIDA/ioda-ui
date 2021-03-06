import React, {Component} from 'react';
import PropTypes from "prop-types";
import T from 'i18n-react';
import Loading from "../../components/loading/Loading";
import LoadingIcon from 'images/icons/icon-loading.png';
import Tooltip from "../tooltip/Tooltip";

class Modal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            additionalEntitiesLoading: false
        };
        this.configPingSlash24 = React.createRef();
        this.configBgp = React.createRef();
        this.configUcsdNt = React.createRef();
        this.additionalEntitiesLoading = false;
    }

    genRegionalPingSlash24 = () => {
        this.props.populateHtsChart(this.configPingSlash24.current.offsetWidth,"ping-slash24", "region");
    };
    genRegionalBgp = () => {
        this.props.populateHtsChart(this.configBgp.current.offsetWidth, "bgp", "region");
    };
    genRegionalUcsdNt = () => {
        this.props.populateHtsChart(this.configUcsdNt.current.offsetWidth, "ucsd-nt", "region");
    };
    genAsnPingSlash24 = () => {
        this.props.populateHtsChart(this.configPingSlash24.current.offsetWidth, "ping-slash24", "asn");
    };
    genAsnBgp = () => {
        this.props.populateHtsChart(this.configBgp.current.offsetWidth, "bgp", "asn");
    };
    genAsnUcsdNt = () => {
        this.props.populateHtsChart(this.configUcsdNt.current.offsetWidth, "ucsd-nt", "asn");
    };

    handleAdditionalEntitiesLoading(event) {
        let name = event.target.name;
        this.setState({
            additionalEntitiesLoading: true
        }, () => {
            setTimeout(() => {
                this.props.handleLoadAllEntitiesButton(name)
            }, 1000);
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

        return(
            <div className="modal">
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
                                                                {checkMaxButton}
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
                                                    this.props.regionalSignalsTableSummaryDataProcessed.length ?
                                                        this.props.genSignalsTable("region") : <Loading/>
                                                }
                                            </div>
                                        </div>
                                        <div className="modal__map-container">
                                            <h3 className="heading-h3">{regionalMapTitle}</h3>
                                            <div className="modal__map">
                                                {
                                                    this.props.summaryDataMapRaw
                                                        ? this.props.summaryDataMapRaw.length > 0
                                                            ? this.props.populateGeoJsonMap()
                                                            : noOutagesOnMapMessage
                                                        : <Loading/>
                                                }
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
                                                <div id="region-horizon-chart--pingSlash24" ref={this.configPingSlash24}
                                                     className="modal__chart">
                                                    {
                                                        this.configPingSlash24.current ?
                                                            this.genRegionalPingSlash24() : null
                                                    }
                                                </div>
                                        }
                                        <h3 className="heading-h3">{bgpHtsLabel}</h3>
                                        {
                                            this.props.rawRegionalSignalsProcessedBgp ? null : <Loading/>
                                        }
                                        {
                                            this.props.additionalRawSignalRequestedBgp === true ? <Loading/> :
                                                <div id="region-horizon-chart--bgp" ref={this.configBgp}
                                                     className="modal__chart">
                                                    {
                                                        this.configBgp.current ?
                                                            this.genRegionalBgp() : null
                                                    }
                                                </div>
                                        }
                                        <h3 className="heading-h3">{ucsdNtHtsLabel}</h3>
                                        {
                                            this.props.rawRegionalSignalsProcessedUcsdNt ? null : <Loading/>
                                        }
                                        {
                                            this.props.additionalRawSignalRequestedUcsdNt === true ? <Loading/> :

                                                <div id="region-horizon-chart--ucsdNt" ref={this.configUcsdNt}
                                                     className="modal__chart">
                                                    {
                                                        this.configUcsdNt.current ?
                                                            this.genRegionalUcsdNt() : null
                                                    }
                                                </div>
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
                                                                {checkMaxButton}
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
                                                    this.props.asnSignalsTableSummaryDataProcessed.length ?
                                                        this.props.genSignalsTable("asn") : <Loading/>
                                                }
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-2-of-3">
                                        <h3 className="heading-h3">{pingSlash24HtsLabel}</h3>
                                        {
                                            this.props.rawAsnSignalsProcessedPingSlash24 ? null : <Loading/>
                                        }
                                        {
                                            this.props.additionalRawSignalRequestedPingSlash24 === true ? <Loading/> :
                                                <div id="asn-horizon-chart--pingSlash24" ref={this.configPingSlash24}
                                                     className="modal__chart">
                                                    {
                                                        this.configPingSlash24.current ?
                                                            this.genAsnPingSlash24() : null
                                                    }
                                                </div>
                                        }
                                        <h3 className="heading-h3">{bgpHtsLabel}</h3>
                                        {
                                            this.props.rawAsnSignalsProcessedBgp ? null : <Loading/>
                                        }
                                        {
                                            this.props.additionalRawSignalRequestedBgp === true ? <Loading/> :

                                                <div id="asn-horizon-chart--bgp" ref={this.configBgp}
                                                     className="modal__chart">
                                                    {
                                                        this.configBgp.current ?
                                                            this.genAsnBgp() : null
                                                    }
                                                </div>
                                        }
                                        <h3 className="heading-h3">{ucsdNtHtsLabel}</h3>
                                        {
                                            this.props.rawAsnSignalsProcessedUcsdNt ? null : <Loading/>
                                        }
                                        {
                                            this.props.additionalRawSignalRequestedUcsdNt === true ? <Loading/> :

                                                <div id="asn-horizon-chart--ucsdNt" ref={this.configUcsdNt}
                                                     className="modal__chart">
                                                    {
                                                        this.configUcsdNt.current ?
                                                            this.genAsnUcsdNt() : null
                                                    }
                                                </div>
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
