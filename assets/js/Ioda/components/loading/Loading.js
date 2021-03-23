import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import {Link} from "react-router-dom";


class Loading extends Component {
    render() {
        return (
            <div className="progress-bar-striped">
                <div style={{width: "100%"}}>
                    <strong><p>Loading...</p></strong>
                </div>
            </div>
        );
    }
}

export default Loading;
