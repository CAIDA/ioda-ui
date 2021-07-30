import React, { Component } from 'react';
import {convertSecondsToDateValues} from "../../utils";
import T from "i18n-react";


class TimeStamp extends Component {
    constructor(props) {
        super(props);
        this.state = { fade: false }
    }

    copyTimestamp(timestamp) {
        // copy to clipboard
        navigator.clipboard.writeText(timestamp);

        // trigger animation
        this.setState({fade: true});
    }

    resetFadeState() {
        this.setState({fade: false});
    }

    render() {
        const timestamp = `${this.props.from.month} ${this.props.from.day}, ${this.props.from.year} ${this.props.from.hours}:${this.props.from.minutes}${this.props.from.meridian} — ${this.props.until.month} ${this.props.until.day}, ${this.props.until.year} ${this.props.until.hours}:${this.props.until.minutes}${this.props.until.meridian}`;
        const fade = this.state.fade;
        const copyToClipboardMessage = T.translate("timestamp.copyToClipboardMessage");
        return (
            <div className="timestamp" onClick={() => this.copyTimestamp(timestamp)}>
                <div
                    className={fade ? 'timestamp__message timestamp__fade' : 'timestamp__message'}
                    onAnimationEnd={() => this.resetFadeState()}
                    style={{top: event.target.offsetTop - 5, left: event.clientX}}
                >
                    {copyToClipboardMessage}
                </div>
                <div className="timestamp__text">
                    {timestamp}
                </div>
            </div>

        );
    }
}

export default TimeStamp;
