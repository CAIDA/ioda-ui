import React, {Component} from 'react';
import T from "i18n-react";
import {convertSecondsToDateValues} from "../../utils";
import TimeStamp from "../../components/timeStamp/TimeStamp";
import Tooltip from "../../components/tooltip/Tooltip";


class DashboardTab extends Component {
    constructor(props) {
        super(props);
        this.config = React.createRef();
    }

    render() {
        const countryOutages = T.translate("dashboard.countryOutages");
        const regionalOutages = T.translate("dashboard.regionalOutages");
        const asnOutages = T.translate("dashboard.asnOutages");
        const viewChangeIconAltTextHts = T.translate("dashboard.viewChangeIconAltTextHts");
        const viewChangeIconAltTextMap = T.translate("dashboard.viewChangeIconAltTextMap");

        const tooltipDashboardHeadingTitle = T.translate("tooltip.dashboardHeading.title");
        const tooltipDashboardHeadingText = T.translate("tooltip.dashboardHeading.text");

        return(
            <div className="tab">
                <div className="row">
                    <div className="col-2-of-3">
                        <div className="tab__config" ref={this.config}>
                            <div className="tab__heading">
                                <h2 className="heading-h2">
                                    {
                                        this.props.type === 'country' ? countryOutages :
                                            this.props.type === 'region' ? regionalOutages :
                                                this.props.type === 'asn' ? asnOutages : null
                                    }
                                </h2>
                                <Tooltip
                                    title={tooltipDashboardHeadingTitle}
                                    text={tooltipDashboardHeadingText}
                                />
                            </div>
                            <button className="tab__config-button"
                                    onClick={() => this.props.handleTabChangeViewButton()}
                                    style={this.props.type === 'asn' ? {display: 'none'} : null}
                            >
                                {
                                    this.props.tabCurrentView === 'timeSeries' ? viewChangeIconAltTextMap : viewChangeIconAltTextHts
                                }
                            </button>
                        </div>
                        {
                            this.props.type !== "asn"
                                ? <div className="tab__map" style={this.props.tabCurrentView === 'map' ? {display: 'block'} : {display: 'none'}}>
                                        {
                                            this.props.populateGeoJsonMap()
                                        }
                                    </div>
                                : null
                        }
                        <div id="horizon-chart" style={this.props.tabCurrentView === 'timeSeries' || this.props.type === 'asn' ? {display: 'block'} : {display: 'none'}}>
                            {
                                this.config.current
                                    ? this.props.populateHtsChart(this.config.current.offsetWidth)
                                    : null
                            }
                        </div>
                        <TimeStamp from={convertSecondsToDateValues(this.props.from)}
                                   until={convertSecondsToDateValues(this.props.until)} />
                    </div>
                    <div className="col-1-of-3">
                        <div className="tab__table">
                            {
                                this.props.genSummaryTable()
                            }
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default DashboardTab;
