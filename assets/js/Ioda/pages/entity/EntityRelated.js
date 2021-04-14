import React, {Component} from 'react';
import Modal from '../../components/modal/Modal';
import T from "i18n-react";

class EntityRelated extends Component {
    constructor(props) {
        super(props);
        this.relatedTableConfig = React.createRef();
    }

    render() {
        const regionalModalButtonText = T.translate("entity.regionalModalButtonText");
        const asnModalButtonText = T.translate("entity.asnModalButtonText");

        return(
            <div className="row related">

                {/* Region Panel */}
                <div className="col-1-of-2">
                    <div className="related__heading">
                        <h3 className="heading-h3">
                            {
                                this.props.entityType === 'country'
                                    ? `Regional Outages in ${this.props.entityName}`
                                    : this.props.entityType === 'region'
                                    ? `Other Regions Affected in ${this.props.parentEntityName}`
                                    : this.props.entityType === 'asn'
                                        ? `Regional Outages Related to ${this.props.entityName}`
                                        : null
                            }

                        </h3>
                        <div className="related__modal--region related__modal">
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
                                prevPageRawRegionalSignalsHts={() => this.props.prevPageRawRegionalSignalsHts()}
                                nextPageRawRegionalSignalsHts={() => this.props.nextPageRawRegionalSignalsHts()}
                                rawRegionalSignalsHtsCurrentDisplayLow={this.props.rawRegionalSignalsHtsCurrentDisplayLow}
                                rawRegionalSignalsHtsCurrentDisplayHigh={this.props.rawRegionalSignalsHtsCurrentDisplayHigh}
                                rawRegionalSignalsHtsTotalCount={this.props.rawRegionalSignalsHtsTotalCount}
                            />
                        </div>
                    </div>
                    <div className="map" style={{display: 'block', height: '40.5rem'}}>
                        {
                            this.props.populateGeoJsonMap()
                        }
                    </div>
                </div>

                {/* ASN Panel */}
                <div className="col-1-of-2">
                    <div className="related__heading">
                        <h3 className="heading-h3">
                            {
                                this.props.entityType === 'country'
                                    ? `ASNs/ISPs affected by ${this.props.entityName} Outages`
                                    : this.props.entityType === 'region'
                                    ? `ASNs/ISPs affected by ${this.props.parentEntityName} Outages`
                                    : this.props.entityType === 'asn'
                                        ? `Countries affected by ${this.props.entityName} Outages`
                                        : null
                            }

                        </h3>
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
                    <div className="tab__table" ref={this.relatedTableConfig}>
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
