import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import {Link} from "react-router-dom";
import T from 'i18n-react';


class Loading extends Component {
    render() {
        return (
            <div className="progress-bar-striped">
                <div style={{width: "100%"}}>
                    <strong><T.p text="loadingBar.loading"/></strong>
                </div>
            </div>
        );
    }
}

export default Loading;
