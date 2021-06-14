import React, {Component} from 'react';
import T from "i18n-react";


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

        console.log(this.props.from);
        console.log(this.props.until);

        return(
            <div className="tab">
                <div className="row">
                    <div className="col-2-of-3">
                        <div className="tab__config" ref={this.config}>
                            <h2 className="heading-h2">
                                {
                                    this.props.type === 'country' ? countryOutages :
                                    this.props.type === 'region' ? regionalOutages :
                                    this.props.type === 'asn' ? asnOutages : null
                                }
                            </h2>
                            <button className="tab__config-button"
                                    onClick={() => this.props.handleTabChangeViewButton()}
                                    style={this.props.type === 'asn' ? {display: 'none'} : null}
                            >
                                {
                                    this.props.tabCurrentView === 'timeSeries' ? viewChangeIconAltTextMap : viewChangeIconAltTextHts
                                }
                            </button>
                            {/*<button className="tab__config-button">Modal</button>*/}
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
                        <div className="tab__timestamp">
                            {this.props.from.month} {this.props.from.day}, {this.props.from.year} {this.props.from.hours}:{this.props.from.minutes}{this.props.from.meridian} —
                            {this.props.until.month} {this.props.until.day}, {this.props.until.year} {this.props.until.hours}:{this.props.until.minutes}{this.props.until.meridian}
                        </div>
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
