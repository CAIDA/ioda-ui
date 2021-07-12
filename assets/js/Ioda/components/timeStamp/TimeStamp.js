import React, { Component } from 'react';
import {convertSecondsToDateValues} from "../../utils";


class TimeStamp extends Component {
    render() {
        const timestamp = `${this.props.from.month} ${this.props.from.day}, ${this.props.from.year} ${this.props.from.hours}:${this.props.from.minutes}${this.props.from.meridian} — ${this.props.until.month} ${this.props.until.day}, ${this.props.until.year} ${this.props.until.hours}:${this.props.until.minutes}${this.props.until.meridian}`;
        return (
            <React.Fragment>
                <div className="timestamp">
                    {timestamp}
                </div>
                {/*<div className="clipboard">*/}
                {/*    <button onClick={() => {navigator.clipboard.writeText(timestamp)}}>*/}
                {/*    Copy to Clipboard*/}
                {/*    </button>*/}
                {/*</div>*/}
            </React.Fragment>
        );
    }
}

export default TimeStamp;
