import React, {Component} from 'react';
import T from "i18n-react";
import {convertSecondsToDateValues, secondsToDhms, controlPanelTimeRangeLimit} from "../../utils";
import TimeStamp from "../../components/timeStamp/TimeStamp";
import Tooltip from "../../components/tooltip/Tooltip";
import iconGlobe from 'images/icons/icon-globe.png';
import iconChart from 'images/icons/icon-chart.png';
import { Style } from "react-style-tag";


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
        const viewTitleMap = T.translate("dashboard.viewTitleMap");
        const viewTitleChart = T.translate("dashboard.viewTitleChart");
        const timeDurationTooHighErrorMessage = T.translate("dashboard.timeDurationTooHighErrorMessage");

        const tooltipDashboardHeadingTitle = T.translate("tooltip.dashboardHeading.title");
        const tooltipDashboardHeadingText = T.translate("tooltip.dashboardHeading.text");

        return(
            <div className="tab">
                <Style>{`
                    /* Styles to update label for button depending on which view is current */                 
                    .tab__config-button:after {
                        ${this.props.tabCurrentView === 'timeSeries' ? `content: "${viewTitleChart}"` : `content: "${viewTitleMap}"`};
                        font-size: 1rem;
                        font-style: italic;
                        position: absolute;
                        top: 1rem;
                        left: -5.5rem;
                        color: #2c3e50;
                        font-weight: 400;
                    }
                `}</Style>
                {
                    this.props.until - this.props.from < controlPanelTimeRangeLimit ?
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
                                    <div className="tab__config-button-container">
                                        <button className="tab__config-button"
                                                onClick={() => this.props.handleTabChangeViewButton()}
                                                style={this.props.type === 'asn' ? {display: 'none'} : null}
                                        >
                                            {
                                                <img className="tab__config-button-img"
                                                     src={this.props.tabCurrentView === 'timeSeries' ? iconChart : iconGlobe}
                                                     alt={this.props.tabCurrentView === 'timeSeries' ? viewChangeIconAltTextMap : viewChangeIconAltTextHts}
                                                     title={this.props.tabCurrentView === 'timeSeries' ? viewChangeIconAltTextMap : viewChangeIconAltTextHts}
                                                />
                                            }
                                        </button>
                                    </div>
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
                        : <div className="row">
                            <p className="tab__error">
                                {timeDurationTooHighErrorMessage}
                                {secondsToDhms(this.props.until - this.props.from)}.
                            </p>
                        </div>
                }
            </div>
        );
    }
}

export default DashboardTab;
