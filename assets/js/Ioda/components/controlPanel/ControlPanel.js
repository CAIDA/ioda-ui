import React, { Component } from 'react';
// Date Picker Dependencies
import { DateRangePicker } from 'react-date-range';
import { addDays } from 'date-fns'
// Time Picker Dependencies
import TimeRangePicker from '@wojtekmaj/react-timerange-picker'

class ControlPanel extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selection: {
                startDate: new Date(Date.now() - 86400000),
                endDate: new Date(),
                key: 'selection'
            },
            timeRange: [
                // new Date(Date.now() - 86400000).toISOString().split("T")[1].split(".")[0],
                // new Date(Date.now() - 1000).toISOString().split("T")[1].split(".")[0]
                "00:00:00",
                "23:59:59"
            ],
            rangeInputVisibility: false,
            wholeDayInputSelected: false
        }
    }

    componentDidUpdate(nextProps, nextState) {
        // If date or time have changed, call parent function to update visuals
        if (nextState.selection !== this.state.selection || nextState.timeRange !== this.state.timeRange) {
            console.log(this.state.timeRange);
            this.props.timeFrame(this.state.selection, this.state.timeRange);
        }
    }

    handleTimeChange(time) {
        this.setState({timeRange: time})
    }

    handleWholeDaySelection() {
        this.setState({
            timeRange: ["00:00:00", "23:59:59"],
            wholeDayInputSelected: !this.state.wholeDayInputSelected
        })
    }

    handleRangeDisplay() {
        this.setState({
            rangeInputVisibility: !this.state.rangeInputVisibility
        })
    }

    render() {
        return(
            <div className="row control-panel">
                <div className="col-1-of-3">
                    <p>Time Range</p>
                    <button className="range__input" onClick={() => this.handleRangeDisplay()}>A Day Ago - Now</button>
                    <div className={this.state.rangeInputVisibility ? "range__dropdown range__dropdown--visible" : "range__dropdown"}>
                        <DateRangePicker
                            onChange={item => this.setState({ ...this.state, ...item })}
                            months={1}
                            minDate={new Date(1970, 0, 1)}
                            maxDate={new Date()}
                            direction="vertical"
                            scroll={{ enabled: true }}
                            ranges={[this.state.selection]}
                            inputRanges = {[]}
                        />
                        <div className="range__dropdown-checkbox">
                            <input onChange={() => this.handleWholeDaySelection()} type="checkbox" name="checkbox" id="whole-day"/>
                            <label htmlFor="whole-day">Whole Day</label>
                        </div>
                        <div className={this.state.wholeDayInputSelected ? "range__time" : "range__time range__time--visible"}>
                            <TimeRangePicker
                                onChange={(time) => this.handleTimeChange(time)}
                                value={this.state.timeRange}
                                disableClock={true}
                                maxDetail={"second"}
                                clearIcon={null}
                            />
                        </div>
                    </div>
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
