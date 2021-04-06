import React, {Component} from 'react';
import Modal from '../../components/modal/Modal';
import T from "i18n-react";

class EntityRelated extends Component {
    render() {

        const regionalModalButtonText = T.translate("entity.regionalModalButtonText");
        const asnModalButtonText = T.translate("entity.asnModalButtonText");
        return(
            <div className="row related">
                <div className="col-1-of-2">
                    <div className="related__title">
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
                            {

                            }
                            <button className="related__modal-button" onClick={() => this.props.toggleModal("map")}>
                                {regionalModalButtonText}
                            </button>

                            <Modal
                                modalLocation={"map"}
                                entityName={this.props.entityName}
                                showModal={this.props.showMapModal}
                                toggleModal={this.props.toggleModal}
                                populateGeoJsonMap={() => this.props.populateGeoJsonMap()}
                                genRegionalSignalsTable={this.props.genRegionalSignalsTable}
                                populateRegionalHtsChart={(width, datasource) => this.props.populateRegionalHtsChart(width, datasource)}
                                bgpRef={this.props.bgpRef}
                            />
                        </div>
                    </div>
                    <div className="map" style={{display: 'block', height: '400px'}}>
                        {
                            this.props.populateGeoJsonMap()
                        }
                    </div>
                </div>
                <div className="col-1-of-2">
                    <div className="related__title">
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
                            <button className="related__modal-button" onClick={() => this.props.toggleModal("table")}>
                                {asnModalButtonText}
                            </button>
                            <Modal
                                modalLocation={"table"}
                                showModal={this.props.showTableModal}
                                toggleModal={this.props.toggleModal}
                                genSignalsTable={() => this.props.genAsnSignalsTable()}
                                populateAsnHtsChart={(width, datasource) => this.props.populateAsnHtsChart(width, datasource)}

                            />
                        </div>
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
