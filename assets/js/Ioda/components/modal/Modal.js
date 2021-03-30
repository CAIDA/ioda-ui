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

        return(
            <div className="modal">
                <div className="modal__background"></div>
                <div className="modal__window">
                    <div className="modal__heading">
                        {
                            this.props.modalLocation === 'map'
                                ? <h2>{regionTitle} {this.props.entityName}</h2>
                                : this.props.modalLocation === 'table'
                                ? <h2>{asnTitle} {this.props.entityName}</h2>
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
                                        <h3>{regionalTableTitle}</h3>
                                        <div className="modal__table">
                                            {
                                                this.props.genRegionalSignalsTable()
                                            }
                                        </div>
                                        <h3>{regionalMapTitle}</h3>
                                        <div className="modal__map" style={{display: 'block', height: '400px'}}>
                                            {
                                                this.props.populateGeoJsonMap()
                                            }
                                        </div>
                                    </div>
                                    <div className="col-2-of-3">
                                        <h3>{pingSlash24HtsLabel}</h3>
                                        <div id="regional-horizon-chart--pingSlash24">
                                            {
                                                this.props.populateRegionalHtsChart('900', 'ping-slash24')
                                            }
                                        </div>
                                        <h3>{bgpHtsLabel}</h3>
                                        <div id="regional-horizon-chart--bgp">

                                            {
                                                this.props.populateRegionalHtsChart('900', 'bgp')
                                            }
                                        </div>
                                        <h3>{ucsdNtHtsLabel}</h3>
                                        <div id="regional-horizon-chart--ucsdNt">

                                            {
                                                this.props.populateRegionalHtsChart('900', 'ucsd-nt')
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
                                        <h3>{asnTableTitle}</h3>
                                        <div className="modal__table">
                                            {
                                                this.props.genSignalsTable()
                                            }
                                        </div>
                                    </div>
                                    <div className="col-2-of-3">
                                        <h3>{pingSlash24HtsLabel}</h3>
                                        <div id="asn-horizon-chart--pingSlash24">
                                            {
                                                this.props.populateAsnHtsChart('900', 'ping-slash24')
                                            }
                                        </div>
                                        <h3>{bgpHtsLabel}</h3>
                                        <div id="asn-horizon-chart--bgp">
                                            {
                                                this.props.populateAsnHtsChart('900', 'bgp')
                                            }
                                        </div>
                                        <h3>{ucsdNtHtsLabel}</h3>
                                        <div id="asn-horizon-chart--ucsdNt">
                                            {
                                                this.props.populateAsnHtsChart('900', 'ucsd-nt')
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
