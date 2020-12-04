import React, { Component } from 'react';

class ControlPanel extends Component {
    render() {
        return(
            <div className="row control-panel">
                <div className="col-1-of-3">
                    <p>Time Range</p>
                    <p>Time Zone</p>
                </div>
                <div className="col-2-of-3">
                    <p>Social</p>
                    <p>Searchbar</p>
                    <p>Recent History</p>
                </div>
            </div>
        );
    }
}

export default ControlPanel;
