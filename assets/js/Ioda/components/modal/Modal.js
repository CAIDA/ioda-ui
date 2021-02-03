import React, {Component} from 'react';
import PropTypes from "prop-types";

class Modal extends Component {
    constructor(props) {
        super(props);
        this.state = {
        }
    }

    render() {
        if (this.props.modalLocation === 'map' && !this.props.showModal) {
            return null;
        }
        if (this.props.modalLocation === 'table' && !this.props.showModal) {
            return null;
        }
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
                                </div>
                                <div className="col-2-of-3">
                                    <p>Stacked Horizon Graph of all regions sorted by score</p>
                                    <p>Map of Regional Outages</p>
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
                                </div>
                                <div className="col-2-of-3">
                                    <p>Stacked Horizon Graph of all ASes sorted by score</p>
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
