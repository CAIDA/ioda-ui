import React, {Component} from 'react';
import PropTypes from "prop-types";
import T from 'i18n-react';
import Loading from "../../components/loading/Loading";

class Modal extends Component {
    constructor(props) {
        super(props);
        this.configPingSlash24 = React.createRef();
        this.configBgp = React.createRef();
        this.configUcsdNt = React.createRef();
    }

    genRegionalPingSlash24 = () => {
        this.props.populateRegionalHtsChartPingSlash24(this.configPingSlash24.current.offsetWidth);
    };
    genRegionalBgp = () => {
        this.props.populateRegionalHtsChartBgp(this.configBgp.current.offsetWidth);
    };
    genRegionalUcsdNt = () => {
        this.props.populateRegionalHtsChartUcsdNt(this.configUcsdNt.current.offsetWidth);
    };

    genAsnPingSlash24 = () => {
        this.props.populateAsnHtsChart(this.configPingSlash24.current.offsetWidth, 'ping-slash24');
    };
    genAsnBgp = () => {
        this.props.populateAsnHtsChart(this.configBgp.current.offsetWidth, 'bgp');
    };
    genAsnUcsdNt = () => {
        this.props.populateAsnHtsChart(this.configUcsdNt.current.offsetWidth, 'ucsd-nt');
    };

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
        const pingSlash24HtsLabel = T.translate("entityModal.pingSlash24HtsLabel");
        const bgpHtsLabel = T.translate("entityModal.bgpHtsLabel");
        const ucsdNtHtsLabel = T.translate("entityModal.ucsdNtHtsLabel");

        return(
            <div className="modal">
                <div className="modal__background"></div>
                <div className="modal__window">
                    <div className="modal__heading">
                        {
                            this.props.modalLocation === 'map'
                                ? <h2 className="heading-h2">{regionTitle} {this.props.entityName}</h2>
                                : this.props.modalLocation === 'table'
                                ? <h2 className="heading-h2">{asnTitle} {this.props.entityName}</h2>
                                : null
                        }
                        <button className="modal__button" onClick={() => this.props.toggleModal(this.props.modalLocation)}>
                            ×
                        </button>
                    </div>
                    {
                        this.props.modalLocation === 'map'
                            ? <div className="modal__content">
                                <div className="row">
                                    <div className="col-1-of-3">
                                        <h3 className="heading-h3">{regionalTableTitle}</h3>
                                        <div className="modal__table">
                                            {
                                                this.props.regionalSignalsTableSummaryDataProcessed.length ?
                                                this.props.genRegionalSignalsTable() : <Loading/>
                                            }
                                        </div>
                                        <h3 className="heading-h3">{regionalMapTitle}</h3>
                                        <div className="modal__map" style={{display: 'block', height: '47.5rem'}}>
                                            {
                                                this.props.summaryDataMapRaw
                                                    ? this.props.summaryDataMapRaw.length > 0
                                                        ? this.props.populateGeoJsonMap()
                                                        : "No Outages to display"
                                                    : <Loading/>
                                            }
                                        </div>
                                    </div>
                                    <div className="col-2-of-3">
                                        <h3 className="heading-h3">{pingSlash24HtsLabel}</h3>
                                        {
                                            this.props.rawRegionalSignalsProcessedPingSlash24.length === 0 ? <Loading/> : null
                                        }
                                        <div id="regional-horizon-chart--pingSlash24" ref={this.configPingSlash24} className="modal__chart">
                                            {
                                                this.configPingSlash24.current ?
                                                this.genRegionalPingSlash24() : null
                                            }
                                        </div>

                                        <h3 className="heading-h3">{bgpHtsLabel}</h3>
                                        {
                                            this.props.rawRegionalSignalsProcessedBgp.length === 0 ? <Loading/> : null
                                        }
                                        <div id="regional-horizon-chart--bgp" ref={this.configBgp} className="modal__chart">
                                            {
                                                this.configBgp.current ?
                                                this.genRegionalBgp() : null
                                            }
                                        </div>
                                        <h3 className="heading-h3">{ucsdNtHtsLabel}</h3>
                                        {
                                            this.props.rawRegionalSignalsProcessedUcsdNt.length === 0 ? <Loading/> : null
                                        }
                                        <div id="regional-horizon-chart--ucsdNt" ref={this.configUcsdNt} className="modal__chart">
                                            {
                                                this.configUcsdNt.current ?
                                                this.genRegionalUcsdNt() : null
                                            }
                                        </div>
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
                                        <h3 className="heading-h3">{asnTableTitle}</h3>
                                        <div className="modal__table">
                                            {
                                                this.props.asnSignalsTableSummaryDataProcessed.length ?
                                                this.props.genSignalsTable() : <Loading/>
                                            }
                                        </div>
                                    </div>
                                    <div className="col-2-of-3">
                                        <h3 className="heading-h3">{pingSlash24HtsLabel}</h3>
                                        {
                                            this.props.rawAsnSignalsProcessedPingSlash24.length === 0 ? <Loading/> : null
                                        }
                                        <div id="asn-horizon-chart--pingSlash24" ref={this.configPingSlash24} className="modal__chart">
                                            {
                                                this.configPingSlash24.current ?
                                                this.genAsnPingSlash24() : null
                                            }
                                        </div>
                                        <h3 className="heading-h3">{bgpHtsLabel}</h3>
                                        {
                                            this.props.rawAsnSignalsProcessedBgp.length === 0 ? <Loading/> : null
                                        }
                                        <div id="asn-horizon-chart--bgp" ref={this.configBgp} className="modal__chart">
                                            {
                                                this.configBgp.current ?
                                                this.genAsnBgp() : null
                                            }
                                        </div>
                                        <h3 className="heading-h3">{ucsdNtHtsLabel}</h3>
                                        {
                                            this.props.rawAsnSignalsProcessedUcsdNt.length === 0 ? <Loading/> : null
                                        }
                                        <div id="asn-horizon-chart--ucsdNt" ref={this.configUcsdNt} className="modal__chart">
                                            {
                                                this.configUcsdNt.current ?
                                                this.genAsnUcsdNt() : null
                                            }
                                        </div>
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
