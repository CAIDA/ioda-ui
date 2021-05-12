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
                                // entity name needed to populate text in headings
                                entityName={this.props.entityName}
                                // tracking when the modal should be visible
                                showModal={this.props.showMapModal}
                                // tracking when the close button is clicked
                                toggleModal={this.props.toggleModal}
                                // render function that populates the ui
                                populateGeoJsonMap={() => this.props.populateGeoJsonMap()}
                                // data that draws polygons on map
                                summaryDataMapRaw={this.props.summaryDataMapRaw}
                                // render function that populates the ui
                                genSignalsTable={(entityType) => this.props.genSignalsTable(entityType)}
                                // check max and uncheck all button functionality
                                handleSelectAndDeselectAllButtons={(event) => this.props.handleSelectAndDeselectAllButtons(event)}
                                // Current number of entities checked in table
                                regionalSignalsTableEntitiesChecked={this.props.regionalSignalsTableEntitiesChecked}
                                // function to populate horizon time series visual
                                populateHtsChart={(width, dataSource, entityType) => this.props.populateHtsChart(width, dataSource, entityType)}
                                // to detect when loading bar should appear in modal
                                rawRegionalSignalsProcessedPingSlash24={this.props.rawRegionalSignalsProcessedPingSlash24}
                                rawRegionalSignalsProcessedBgp={this.props.rawRegionalSignalsProcessedBgp}
                                rawRegionalSignalsProcessedUcsdNt={this.props.rawRegionalSignalsProcessedUcsdNt}
                                // data that populates in table
                                regionalSignalsTableSummaryDataProcessed={this.props.regionalSignalsTableSummaryDataProcessed}
                                // Error message when max entities are checked
                                rawSignalsMaxEntitiesHtsError={this.props.rawSignalsMaxEntitiesHtsError}
                                // For use in the string that populates when there are more than 300 entities that could load
                                initialTableLimit={this.props.initialTableLimit}
                                // count used to determine if text to populate remaining entities beyond the initial Table load limit should display
                                regionalSignalsTableTotalCount={this.props.regionalSignalsTableTotalCount}
                                // function used to call api to load remaining entities
                                handleLoadAllEntitiesButton={event => this.props.handleLoadAllEntitiesButton(event)}
                                // Used to determine if load all message should display or not
                                regionalRawSignalsLoadAllButtonClicked={this.props.regionalRawSignalsLoadAllButtonClicked}

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
                                genSignalsTable={(entityType) => this.props.genSignalsTable(entityType)}
                                // render function that populate the ui
                                populateHtsChart={(width, dataSource, entityType) => this.props.populateHtsChart(width, dataSource, entityType)}
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
                                // For use in the string that populates when there are more than 300 entities that could load
                                initialTableLimit={this.props.initialTableLimit}
                                // count used to determine if text to populate remaining entities beyond the initial Table load limit should display
                                asnSignalsTableTotalCount={this.props.asnSignalsTableTotalCount}
                                // function used to call api to load remaining entities
                                handleLoadAllEntitiesButton={event => this.props.handleLoadAllEntitiesButton(event)}
                                // Used to determine if load all message should display or not
                                asnRawSignalsLoadAllButtonClicked={this.props.asnRawSignalsLoadAllButtonClicked}
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
