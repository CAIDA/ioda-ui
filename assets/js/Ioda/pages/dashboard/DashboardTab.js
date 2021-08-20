import React, {Component} from 'react';
import T from "i18n-react";
import {
    convertSecondsToDateValues,
    secondsToDhms,
    controlPanelTimeRangeLimit,
    horizonChartSeriesColor, humanizeNumber
} from "../../utils";
import TimeStamp from "../../components/timeStamp/TimeStamp";
import Tooltip from "../../components/tooltip/Tooltip";
import iconGlobe from 'images/icons/icon-globe.png';
import iconChart from 'images/icons/icon-chart.png';
import { Style } from "react-style-tag";
import Table from "../../components/table/Table";
import HorizonTSChart from "horizon-timeseries-chart";
import * as d3 from "d3-shape";
import TopoMap from "../../components/map/Map";
import PreloadImage from "react-preload-image";


class DashboardTab extends Component {
    constructor(props) {
        super(props);
        this.config = React.createRef();
    }

    componentDidMount() {
        console.log(this.config.current);
    }

    componentDidUpdate(prevProps) {
        // console.log(this.props);
        if (this.props.eventDataProcessed !== prevProps.eventDataProcessed) {
            this.genChart();
        }

        if (this.config.current) {
            this.genChart();
        }


    }

    genMap() {
        return <TopoMap topoData={this.props.topoData} scores={this.props.topoScores} handleEntityShapeClick={(entity) => this.props.handleEntityShapeClick(entity)}/>;
    }

    genChart() {
        const chart = HorizonTSChart()(document.getElementById(`horizon-chart`));
        return chart
            .data(this.props.eventDataProcessed)
            .series('entityName')
            .yNormalize(false)
            .useUtc(true)
            .use24h(false)
            // Will need to detect column width to populate height
            .width(this.config.current.offsetWidth)
            .height(570)
            .enableZoom(false)
            .showRuler(true)
            .interpolationCurve(d3.curveStepAfter)
            .positiveColors(['white', horizonChartSeriesColor])
            .toolTipContent=({ series, ts, val }) => `${series}<br>${ts}: ${humanizeNumber(val)}`;
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
                        left: -5.65rem;
                        color: #2c3e50;
                        font-weight: 400;
                    }
                `}</Style>
                {
                    this.props.until - this.props.from < controlPanelTimeRangeLimit ?
                        <div className="row">
                            {
                                this.props.totalOutages === 0 ?
                                    <div className="col-1-of-1 tab__error tab__error--noOutagesFound">
                                        No {this.props.activeTabType} Outages found
                                    </div>
                                    : <React.Fragment>
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
                                                        <img className="tab__config-button-img"
                                                             src={this.props.tabCurrentView === 'timeSeries' ? iconGlobe : iconChart}
                                                             alt={this.props.tabCurrentView === 'timeSeries' ? viewChangeIconAltTextMap : viewChangeIconAltTextHts}
                                                             title={this.props.tabCurrentView === 'timeSeries' ? viewChangeIconAltTextMap : viewChangeIconAltTextHts}
                                                             height="20" width="20"
                                                        />
                                                    </button>
                                                </div>
                                            </div>
                                            {
                                                this.props.type !== "asn"
                                                    ? <div className="tab__map" style={this.props.tabCurrentView === 'map' ? {display: 'block'} : {display: 'none'}}>
                                                        {
                                                            this.props.topoData && this.props.summaryDataRaw && this.props.totalOutages && this.props.topoScores
                                                                ? this.genMap()
                                                                : null
                                                        }
                                                    </div>
                                                    : null
                                            }
                                            <div id="horizon-chart" style={this.props.tabCurrentView === 'timeSeries' || this.props.type === 'asn' ? {display: 'block'} : {display: 'none'}}>
                                                {
                                                    this.config.current && this.props.eventDataProcessed.length > 0
                                                        ? this.genChart()
                                                        : null
                                                }
                                            </div>
                                            <TimeStamp from={convertSecondsToDateValues(this.props.from)}
                                                       until={convertSecondsToDateValues(this.props.until)} />
                                        </div>
                                        <div className="col-1-of-3">
                                            <div className="tab__table">
                                                {
                                                    this.props.activeTabType &&
                                                    this.props.totalOutages &&
                                                    this.props.genSummaryTableDataProcessed ?
                                                        <Table
                                                            type={"summary"}
                                                            data={this.props.summaryDataProcessed}
                                                            totalCount={this.props.totalOutages}
                                                            entityType={this.props.activeTabType}
                                                        /> : null
                                                }
                                            </div>
                                        </div>
                                    </React.Fragment>

                            }

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
