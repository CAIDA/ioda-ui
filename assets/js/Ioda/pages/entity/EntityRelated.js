import React, {Component} from 'react';
import Modal from '../../components/modal/Modal';
import T from "i18n-react";
import Loading from "../../components/loading/Loading";
import Tooltip from "../../components/tooltip/Tooltip";

class EntityRelated extends Component {
    constructor(props) {
        super(props);
        this.relatedTableConfig = React.createRef();
    }

    render() {
        const regionalModalButtonText = T.translate("entity.regionalModalButtonText");
        const asnModalButtonText = T.translate("entity.asnModalButtonText");
        const regionalSectionTitleCountryType = T.translate("entity.regionalSectionTitleCountryType");
        const regionalSectionTitleRegionType = T.translate("entity.regionalSectionTitleRegionType");
        const regionalSectionTitleAsnType = T.translate("entity.regionalSectionTitleAsnType");

        const tooltipEntityRegionalSummaryMapTitle = T.translate("tooltip.entityRegionalSummaryMap.title");
        const tooltipEntityRegionalSummaryMapText = T.translate("tooltip.entityRegionalSummaryMap.text");
        const tooltipEntityAsnSummaryTableTitle = T.translate("tooltip.entityAsnSummaryTable.title");
        const tooltipEntityAsnSummaryTableText = T.translate("tooltip.entityAsnSummaryTable.text");

        return(
            <div className="row related">
                {/* Region Panel */}
                <div className="col-1-of-2">
                    <div className="related__heading">
                        <div className="related__heading-title">
                            <h3 className="heading-h3">
                                {
                                    this.props.entityType === 'country'
                                        ? `${regionalSectionTitleCountryType} ${this.props.entityName}`
                                        : this.props.entityType === 'region'
                                        ? `${regionalSectionTitleRegionType} ${this.props.parentEntityName}`
                                        : this.props.entityType === 'asn'
                                            ? `${regionalSectionTitleAsnType} ${this.props.entityName}`
                                            : null
                                }
                            </h3>
                            <Tooltip
                                title={tooltipEntityRegionalSummaryMapTitle}
                                text={tooltipEntityRegionalSummaryMapText}
                            />
                        </div>
                        <div className="related__modal--region related__modal">
                            <button className="related__modal-button" onClick={() => this.props.toggleModal("map")}>
                                {regionalModalButtonText}
                            </button>
                            <Modal
                                modalLocation={"map"}
                                // entity name needed to populate text in headings
                                entityName={this.props.entityName}
                                // entity type needed to determine which time series count text to use
                                entityType={this.props.entityType}
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
                                // Used for triggering the load all button loading icon once clicked
                                loadAllButtonEntitiesLoading={this.props.loadAllButtonEntitiesLoading}
                                handleAdditionalEntitiesLoading={() => this.props.handleAdditionalEntitiesLoading()}
                                // manage loading bar for when loadAll button is clicked and
                                // additional raw signals are requested beyond what was initially loaded
                                additionalRawSignalRequestedPingSlash24={this.props.additionalRawSignalRequestedPingSlash24}
                                additionalRawSignalRequestedBgp={this.props.additionalRawSignalRequestedBgp}
                                additionalRawSignalRequestedUcsdNt={this.props.additionalRawSignalRequestedUcsdNt}
                                // used for tracking when check max/uncheck all loading icon should appear and not
                                checkMaxButtonLoading={this.props.checkMaxButtonLoading}
                                uncheckAllButtonLoading={this.props.uncheckAllButtonLoading}
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
                        <div className="related__heading-title">
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
                            <Tooltip
                                title={tooltipEntityAsnSummaryTableTitle}
                                text={tooltipEntityAsnSummaryTableText}
                            />
                        </div>
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
                                // entity type needed to determine which time series count text to use
                                entityType={this.props.entityType}
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
                                // Used for triggering the load all button loading icon once clicked
                                loadAllButtonEntitiesLoading={this.props.loadAllButtonEntitiesLoading}
                                handleAdditionalEntitiesLoading={() => this.props.handleAdditionalEntitiesLoading()}
                                // manage loading bar for when loadAll button is clicked and
                                // additional raw signals are requested beyond what was initially loaded
                                additionalRawSignalRequestedPingSlash24={this.props.additionalRawSignalRequestedPingSlash24}
                                additionalRawSignalRequestedBgp={this.props.additionalRawSignalRequestedBgp}
                                additionalRawSignalRequestedUcsdNt={this.props.additionalRawSignalRequestedUcsdNt}
                                // used for tracking when check max/uncheck all loading icon should appear and not
                                checkMaxButtonLoading={this.props.checkMaxButtonLoading}
                                uncheckAllButtonLoading={this.props.uncheckAllButtonLoading}
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
