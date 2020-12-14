import React, {Component} from 'react';

class DashboardTab extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return(
            <div className="tab">
                <div className="row">
                    <div className="col-2-of-3">
                        <div className="tab__config">
                            <button className="tab__config-button">View Changer</button>
                            <button className="tab__config-button">Modal</button>
                        </div>
                        {
                            this.props.type !== "asn"
                                ? <div className="tab__map" style={{height: '400px'}}>
                                        {
                                            this.props.populateGeoJsonMap()
                                        }
                                    </div>
                                : null
                        }
                        <div className="tab__hts" style={{height: '400px'}}>
                            <div className="row">
                                <h3>Time Series</h3>
                                <div id="horizon-chart">
                                    {
                                        this.props.populateHtsChart()
                                    }
                                </div>
                            </div>
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
