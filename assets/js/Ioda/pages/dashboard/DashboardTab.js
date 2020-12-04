import React, {Component} from 'react';


class DashboardTab extends Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.props.populateGeoJsonMap();
    }

    render() {
        return(
            <div className="tab">
                <div className="row">
                    <div className="col-2-of-3">
                        {this.props.type}
                        <div className="tab__config">
                            View Changer
                            Modal
                        </div>
                        <div className="tab__map">
                            Map
                            {
                                this.props.populateGeoJsonMap()
                            }
                        </div>
                    </div>
                    <div className="col-1-of-3">
                        <div className="tab__table">
                            Table
                        </div>
                    </div>
                </div>

            </div>
        );
    }
}

export default DashboardTab;
