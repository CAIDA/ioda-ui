import React, { Component } from 'react';


class TimeStamp extends Component {
    render() {
        return (
            <div className="timestamp">
                {this.props.from.month} {this.props.from.day}, {this.props.from.year} {this.props.from.hours}:{this.props.from.minutes}{this.props.from.meridian} —&nbsp;
                {this.props.until.month} {this.props.until.day}, {this.props.until.year} {this.props.until.hours}:{this.props.until.minutes}{this.props.until.meridian}
            </div>
        );
    }
}

export default TimeStamp;
