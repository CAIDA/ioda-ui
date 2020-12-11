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
                            <button className="tab__config-button">View Chagnger</button>
                            <button className="tab__config-button">Modal</button>
                        </div>
                        {
                            this.props.type !== "asn"
                                ? <div className="tab__map" style={{height: '400px'}}>
                                        {
                                            this.props.populateGeoJsonMap()
                                        }
                                    </div>
                                : <div className="tab__hts" style={{height: '400px'}}>
                                        Time Series
                                </div>
                        }
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
