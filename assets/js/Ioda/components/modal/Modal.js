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
                    this.props.children
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
