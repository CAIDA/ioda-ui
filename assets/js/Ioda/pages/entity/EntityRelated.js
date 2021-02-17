import React, {Component} from 'react';
import Modal from '../../components/modal/Modal';

class EntityRelated extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showMapModal: false,
            showTableModal: false
        };
        this.toggleModal = this.toggleModal.bind(this);
    }

    toggleModal(modalLocation) {
        if (modalLocation === 'map') {
            this.setState({
                showMapModal: !this.state.showMapModal
            });
        } else if (modalLocation === 'table') {
            this.setState({
                showTableModal: !this.state.showTableModal
            });
        }

    }

    render() {
        return(
            <div className="row related">
                <div className="col-1-of-2">
                    <h2>
                        {
                            this.props.entityType === 'country'
                                ? `Regional Outages in ${this.props.entityName}`
                                : this.props.entityType === 'region'
                                    ? `Other Regions Affected in ${this.props.parentEntityName}`
                                    : this.props.entityType === 'asn'
                                        ? `Regional Outages Related to ${this.props.entityName}`
                                        : null
                        }

                    </h2>
                    <div className="related__modal--region related__modal">
                        <button className="related__modal-button" onClick={() => this.toggleModal("map")}>
                            View Details
                        </button>
                        <Modal
                            modalLocation={"map"}
                            showModal={this.state.showMapModal}
                            toggleModal={this.toggleModal}
                            populateGeoJsonMap={this.props.populateGeoJsonMap}
                            genSignalsTable={() => this.props.genSignalsTable()}
                        />
                    </div>
                    <div className="map" style={{display: 'block', height: '400px'}}>
                    {
                        this.props.populateGeoJsonMap()
                    }
                    </div>
                </div>
                <div className="col-1-of-2">
                    <h2>
                        {
                            this.props.entityType === 'country'
                                ? `ASNs/ISPs affected by ${this.props.entityName} Outages`
                                : this.props.entityType === 'region'
                                ? `ASNs/ISPs affected by ${this.props.parentEntityName} Outages`
                                : this.props.entityType === 'asn'
                                    ? `Countries affected by ${this.props.entityName} Outages`
                                    : null
                        }

                    </h2>
                    <div className="related__modal--region related__modal">
                        <button className="related__modal-button" onClick={() => this.toggleModal("table")}>
                            View Details
                        </button>
                        <Modal
                            modalLocation={"table"}
                            showModal={this.state.showTableModal}
                            toggleModal={this.toggleModal}
                        />
                    </div>
                    <div className="tab__table">
                        {
                            this.props.genSummaryTable()
                        }
                    </div>
                </div>
            </div>
        );
    }
}

export default EntityRelated;
