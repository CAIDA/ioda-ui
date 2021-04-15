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

        const displayCountShowing = T.translate("table.displayCountShowing");
        const displayCountOf = T.translate("table.displayCountOf");
        const displayCountEntries = T.translate("table.displayCountEntries");
        const prevButtonText = T.translate("table.prevButtonText");
        const nextButtonText = T.translate("table.nextButtonText");

        console.log(this.props);
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
                                                this.props.genRegionalSignalsTable()
                                            }
                                        </div>
                                        <h3 className="heading-h3">{regionalMapTitle}</h3>
                                        <div className="modal__map" style={{display: 'block', height: '47.5rem'}}>
                                            {
                                                this.props.populateGeoJsonMap()
                                            }
                                        </div>
                                    </div>
                                    <div className="col-2-of-3">
                                        <h3 className="heading-h3">{pingSlash24HtsLabel}</h3>
                                        <div id="regional-horizon-chart--pingSlash24" ref={this.configPingSlash24} className="modal__chart">
                                            {
                                                this.configPingSlash24.current ?
                                                this.props.populateRegionalHtsChart(this.configPingSlash24.current.offsetWidth, 'ping-slash24') : null
                                            }
                                        </div>
                                        <h3 className="heading-h3">{bgpHtsLabel}</h3>
                                        <div id="regional-horizon-chart--bgp" ref={this.configBgp} className="modal__chart">
                                            {
                                                this.configBgp.current ?
                                                this.props.populateRegionalHtsChart(this.configBgp.current.offsetWidth, 'bgp') : null
                                            }
                                        </div>
                                        <h3 className="heading-h3">{ucsdNtHtsLabel}</h3>
                                        <div id="regional-horizon-chart--ucsdNt" ref={this.configUcsdNt} className="modal__chart">
                                            {
                                                this.configUcsdNt.current ?
                                                this.props.populateRegionalHtsChart(this.configUcsdNt.current.offsetWidth, 'ucsd-nt') : null
                                            }
                                        </div>
                                        <div className="table__page">
                                            <p className="table__page-text">{displayCountShowing} {this.props.rawRegionalSignalsHtsCurrentDisplayLow + 1} - {this.props.rawRegionalSignalsHtsCurrentDisplayHigh} {displayCountOf} {this.props.rawRegionalSignalsHtsTotalCount} {displayCountEntries}</p>
                                            <div className="table__page-controls">
                                                <button onClick={() => this.props.prevPageRawRegionalSignalsHts()} className="table__page-button">{prevButtonText}</button>
                                                <button onClick={() => this.props.nextPageRawRegionalSignalsHts()} className="table__page-button">{nextButtonText}</button>
                                            </div>
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
                                                this.props.genSignalsTable()
                                            }
                                        </div>
                                    </div>
                                    <div className="col-2-of-3">
                                        <h3 className="heading-h3">{pingSlash24HtsLabel}</h3>
                                        <div id="asn-horizon-chart--pingSlash24" ref={this.configPingSlash24} className="modal__chart">
                                            {
                                                this.configPingSlash24.current ?
                                                this.props.populateAsnHtsChart(this.configPingSlash24.current.offsetWidth, 'ping-slash24') : null
                                            }
                                        </div>
                                        <h3 className="heading-h3">{bgpHtsLabel}</h3>
                                        <div id="asn-horizon-chart--bgp" ref={this.configBgp} className="modal__chart">
                                            {
                                                this.configBgp.current ?
                                                this.props.populateAsnHtsChart(this.configBgp.current.offsetWidth, 'bgp') : null
                                            }
                                        </div>
                                        <h3 className="heading-h3">{ucsdNtHtsLabel}</h3>
                                        <div id="asn-horizon-chart--ucsdNt" ref={this.configUcsdNt} className="modal__chart">
                                            {
                                                this.configUcsdNt.current ?
                                                this.props.populateAsnHtsChart(this.configUcsdNt.current.offsetWidth, 'ucsd-nt') : null
                                            }
                                        </div>
                                        <div className="table__page">
                                            <p className="table__page-text">{displayCountShowing} {this.props.rawAsnSignalsHtsCurrentDisplayLow + 1} - {this.props.rawAsnSignalsHtsCurrentDisplayHigh} {displayCountOf} {this.props.rawAsnSignalsHtsTotalCount} {displayCountEntries}</p>
                                            <div className="table__page-controls">
                                                <button onClick={() => this.props.prevPageRawAsnSignalsHts()} className="table__page-button">{prevButtonText}</button>
                                                <button onClick={() => this.props.nextPageRawAsnSignalsHts()} className="table__page-button">{nextButtonText}</button>
                                            </div>
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
