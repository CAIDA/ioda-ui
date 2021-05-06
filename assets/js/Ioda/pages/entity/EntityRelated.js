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
                                rawSignalsMaxEntitiesHtsError={this.props.rawSignalsMaxEntitiesHtsError}
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
                                // tracking when the modal should be visible
                                showModal={this.props.showTableModal}
                                // entity name needed to populate text in headings
                                entityName={this.props.entityName}
                                // tracking when the close button is clicked
                                toggleModal={this.props.toggleModal}
                                // render function that populates the ui
                                genSignalsTable={() => this.props.genAsnSignalsTable()}
                                // render functions that populate the ui
                                populateAsnHtsChartPingSlash24={(width) => this.props.populateAsnHtsChartPingSlash24(width)}
                                populateAsnHtsChartBgp={(width) => this.props.populateAsnHtsChartBgp(width)}
                                populateAsnHtsChartUcsdNt={(width) => this.props.populateAsnHtsChartUcsdNt(width)}
                                // data for each horizon time series
                                rawAsnSignalsProcessedPingSlash24={this.props.rawAsnSignalsProcessedPingSlash24}
                                rawAsnSignalsProcessedBgp={this.props.rawAsnSignalsProcessedBgp}
                                rawAsnSignalsProcessedUcsdNt={this.props.rawAsnSignalsProcessedUcsdNt}
                                // data that populates in table
                                asnSignalsTableSummaryDataProcessed={this.props.asnSignalsTableSummaryDataProcessed}
                                // Current number of entities checked in table
                                asnSignalsTableEntitiesChecked={this.props.asnSignalsTableEntitiesChecked}
                                // check max and uncheck all button functionality
                                handleSelectAndDeselectAllButtons={(event) => this.props.handleSelectAndDeselectAllButtons(event)}
                                // Error message when max entities are checked
                                rawSignalsMaxEntitiesHtsError={this.props.rawSignalsMaxEntitiesHtsError}
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
