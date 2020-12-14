import React, {Component} from 'react';

class DashboardTab extends Component {
    constructor(props) {
        super(props);
        this.config = React.createRef();
        this.state = {
            currentView: 'map'
        }
    }

    changeView() {
        if (this.state.currentView === 'map') {
            this.setState({currentView: 'timeSeries'});
        } else if (this.state.currentView === 'timeSeries') {
            this.setState({currentView: 'map'});
        }
    }

    render() {
        return(
            <div className="tab">
                <div className="row">
                    <div className="col-2-of-3">
                        <div className="tab__config" ref={this.config}>
                            <button className="tab__config-button"
                                    onClick={() => this.changeView()}
                                    style={this.props.type === 'asn' ? {display: 'none'} : null}
                            >View Changer</button>
                            <button className="tab__config-button">Modal</button>
                        </div>
                        {
                            this.props.type !== "asn"
                                ? <div className="tab__map" style={this.state.currentView === 'map' ? {display: 'block', height: '400px'} : {display: 'none'}}>
                                        {
                                            this.props.populateGeoJsonMap()
                                        }
                                    </div>
                                : null
                        }
                        <div id="horizon-chart" style={this.state.currentView === 'timeSeries' || this.props.type === 'asn' ? {display: 'block'} : {display: 'none'}}>
                            {
                                this.config.current
                                    ? this.props.populateHtsChart(this.config.current.offsetWidth)
                                    : null
                            }
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
