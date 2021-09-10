import React, { Component } from 'react';
import {convertSecondsToDateValues} from "../../utils";
import T from "i18n-react";


class TimeStamp extends Component {
    constructor(props) {
        super(props);
        this.state = {
            fade: false,
            messageTop: 0,
            messageLeft: 0,
            screenBelow1024: false
        }
    }

    componentDidMount() {
        window.addEventListener("resize", this.resize.bind(this));
        this.resize();
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.resize.bind(this));
    }

    resize() {
        let screenBelow1024 = (window.innerWidth <= 1024);
        if (screenBelow1024 !== this.state.screenBelow1024) {
            this.setState({
                screenBelow1024: screenBelow1024
            });
        }
    }

    copyTimestamp(e, timestamp) {
        // copy to clipboard
        navigator.clipboard.writeText(timestamp);

        // trigger animation
        this.setState({
            fade: true,
            messageTop: event.target.offsetTop - 15,
            messageLeft: this.state.screenBelow1024 ? event.clientX - 105 : event.clientX + 15
        });
    }

    resetFadeState() {
        this.setState({fade: false});
    }

    render() {
        const timestamp = `${this.props.from.month} ${this.props.from.day}, ${this.props.from.year} ${this.props.from.hours}:${this.props.from.minutes}${this.props.from.meridian} — ${this.props.until.month} ${this.props.until.day}, ${this.props.until.year} ${this.props.until.hours}:${this.props.until.minutes}${this.props.until.meridian}`;
        const fade = this.state.fade;
        const hoverTitle = T.translate("timestamp.hoverTitle");
        const copyToClipboardMessage = T.translate("timestamp.copyToClipboardMessage");
        return (
            <div className="timestamp" onClick={(e) => this.copyTimestamp(e, timestamp)}>
                <div
                    className={fade ? 'timestamp__message timestamp__fade' : 'timestamp__message'}
                    onAnimationEnd={() => this.resetFadeState()}
                    style={{top: `${this.state.messageTop}px`, left: `${this.state.messageLeft}px`}}
                >
                    {copyToClipboardMessage}
                </div>
                <div className="timestamp__text" title={hoverTitle}>
                    {timestamp}
                </div>
            </div>

        );
    }
}

export default TimeStamp;
