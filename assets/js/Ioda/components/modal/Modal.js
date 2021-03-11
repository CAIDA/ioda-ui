import React, {Component} from 'react';
import PropTypes from "prop-types";

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
        // console.log(this.configPingSlash24);
        return(
            <div className="modal">
                {
                    this.props.modalLocation === 'map'
                        ? <h2>modal window from map</h2>
                        : this.props.modalLocation === 'table'
                            ? <h2>modal window from table</h2>
                            : null
                }
                <button onClick={() => this.props.toggleModal(this.props.modalLocation)}>
                    Close
                </button>
                <p>{this.props.showModal}</p>
                {
                    this.props.modalLocation === 'map'
                        ? <div className="modal__content">
                            <div className="row">
                                <div className="col-1-of-3">
                                    Table displaying all regions regardless of score
                                    <div className="modal__table">
                                        {
                                            this.props.genSignalsTable()
                                        }
                                    </div>
                                </div>
                                <div className="col-2-of-3">
                                    <h3>Active Probing</h3>
                                    <div id="regional-horizon-chart--pingSlash24">

                                        {
                                            this.props.populateRegionalHtsChart('900', 'ping-slash24')
                                        }
                                    </div>
                                    <h3>BGP</h3>
                                    <div id="regional-horizon-chart--bgp">

                                        {
                                            this.props.populateRegionalHtsChart('900', 'bgp')
                                        }
                                    </div>
                                    <h3>Network Telescope</h3>
                                    <div id="regional-horizon-chart--ucsdNt">

                                        {
                                            this.props.populateRegionalHtsChart('900', 'ucsd-nt')
                                        }
                                    </div>

                                    <h3>Map of Regional Outages</h3>
                                    <div className="modal__map" style={{display: 'block', height: '400px'}}>
                                        {
                                            this.props.populateGeoJsonMap()
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
                                    Table displaying all ASes regardless of score
                                    <div className="modal__table">
                                        {
                                            this.props.genSignalsTable()
                                        }
                                    </div>
                                </div>
                                <div className="col-2-of-3">
                                    <h3>Active Probing</h3>
                                    <div id="asn-horizon-chart--pingSlash24">

                                        {
                                            this.props.populateAsnHtsChart('900', 'ping-slash24')
                                        }
                                    </div>
                                    <h3>BGP</h3>
                                    <div id="asn-horizon-chart--bgp">

                                        {
                                            this.props.populateAsnHtsChart('900', 'bgp')
                                        }
                                    </div>
                                    <h3>Network Telescope</h3>
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
        );
    }
}

Modal.propTypes = {
    modalLocation: PropTypes.string.isRequired,
    toggleModal: PropTypes.func.isRequired,
    showModal: PropTypes.bool.isRequired
};

export default Modal;
