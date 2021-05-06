import React, {Component} from 'react';
import Modal from '../../components/modal/Modal';
import T from "i18n-react";
import Loading from "../../components/loading/Loading";

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
                                handleSelectAndDeselectAllButtons={(event) => this.props.handleSelectAndDeselectAllButtons(event)}
                                regionalSignalsTableEntitiesChecked={this.props.regionalSignalsTableEntitiesChecked}
                                // populateRegionalHtsChart={(width, datasource) => this.props.populateRegionalHtsChart(width, datasource)}
                                populateRegionalHtsChartPingSlash24={(width) => this.props.populateRegionalHtsChartPingSlash24(width)}
                                populateRegionalHtsChartBgp={(width) => this.props.populateRegionalHtsChartBgp(width)}
                                populateRegionalHtsChartUcsdNt={(width) => this.props.populateRegionalHtsChartUcsdNt(width)}
                                // to detect when loading bar should appear in modal
                                rawRegionalSignalsProcessedPingSlash24={this.props.rawRegionalSignalsProcessedPingSlash24}
                                rawRegionalSignalsProcessedBgp={this.props.rawRegionalSignalsProcessedBgp}
                                rawRegionalSignalsProcessedUcsdNt={this.props.rawRegionalSignalsProcessedUcsdNt}
                                regionalSignalsTableSummaryDataProcessed={this.props.regionalSignalsTableSummaryDataProcessed}
                                summaryDataMapRaw={this.props.summaryDataMapRaw}
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
                                handleSelectAndDeselectAllButtons={(event) => this.props.handleSelectAndDeselectAllButtons(event)}
                                populateAsnHtsChartPingSlash24={(width) => this.props.populateAsnHtsChartPingSlash24(width)}
                                populateAsnHtsChartBgp={(width) => this.props.populateAsnHtsChartBgp(width)}
                                populateAsnHtsChartUcsdNt={(width) => this.props.populateAsnHtsChartUcsdNt(width)}
                                rawAsnSignalsProcessedPingSlash24={this.props.rawAsnSignalsProcessedPingSlash24}
                                rawAsnSignalsProcessedBgp={this.props.rawAsnSignalsProcessedBgp}
                                rawAsnSignalsProcessedUcsdNt={this.props.rawAsnSignalsProcessedUcsdNt}
                                asnSignalsTableSummaryDataProcessed={this.props.asnSignalsTableSummaryDataProcessed}
                                asnSignalsTableEntitiesChecked={this.props.asnSignalsTableEntitiesChecked}
                            />
                        </div>
                    </div>
                    <div className="tab__table" ref={this.relatedTableConfig}>
                        {
                            this.props.relatedToTableSummary
                                ? this.props.genSummaryTable()
                                : <Loading/>
                        }
                    </div>
                </div>
            </div>
        );
    }
}

export default EntityRelated;
