import React, { Component } from 'react';
// Date Picker Dependencies
import { DateRangePicker } from 'react-date-range';
import { addDays } from 'date-fns'
// Time Picker Dependencies
import TimeRangePicker from '@wojtekmaj/react-timerange-picker';
import {getIsoStringFromDate} from '../../utils/index';

class ControlPanel extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selection: {
                startDate: new Date(this.props.from * 1000),
                endDate: new Date(this.props.until * 1000),
                key: 'selection'
            },
            timeRange: [
                new Date((this.props.from * 1000) - 86400000).toISOString().split("T")[1].split(".")[0],
                new Date((this.props.until * 1000) - 1000).toISOString().split("T")[1].split(".")[0]
                // "00:00:00",
                // "23:59:59"
            ],
            rangeInputVisibility: false,
            wholeDayInputSelected: false
        }
    }

    componentDidUpdate(nextProps, nextState) {
        // If date or time have changed, call parent function to update visuals
        if (nextState.selection !== this.state.selection || nextState.timeRange !== this.state.timeRange) {
            this.props.timeFrame(this.state.selection, this.state.timeRange);
        }

        if (nextProps.from !== this.props.from) {
            this.setState(prevState => ({
                selection: {
                    ...prevState.selection,
                    startDate: new Date(this.props.from * 1000)
                }
            }))
        }

        if (nextProps.until !== this.props.until) {
            this.setState(prevState => ({
                selection: {
                    ...prevState.selection,
                    endDate: new Date(this.props.until * 1000)
                }
            }))
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
        let startDate = this.state.selection.startDate.toISOString().split("T")[0];
        let startTime = this.state.selection.startDate.toISOString().split("T")[1].split(".")[0];
        // convert for timezone
        // let startTime = this.state.selection.startDate.toLocaleString( 'sv', { timeZoneName: 'short' } );
        // let startTime = this.state.selection.startDate.toLocaleString( 'sv', { timeZoneName: 'short' } );
        let endDate = this.state.selection.endDate.toISOString().split("T")[0];
        let endTime = this.state.selection.endDate.toISOString().split("T")[1].split(".")[0];
        // convert for timezone
        // let endTime = this.state.selection.endDate.toLocaleString( 'sv', { timeZoneName: 'short' } );
        // let endTime = this.state.selection.endDate;

        return(
            <div className="row control-panel">
                <div className="col-1-of-3">
                    <h2>{this.props.entityName}</h2>
                    <p>Time Range</p>
                    <div className="range">
                        <button className="range__input" onClick={() => this.handleRangeDisplay()}>
                            <span className="range__input-start">
                                {startDate} - {startTime}<sub><sup><sub>UTC</sub></sup></sub>
                            </span>
                            <span className="range__input-dash">—</span>
                            <span className="range__input-end">
                                {endDate} - {endTime}<sub><sup><sub>UTC</sub></sup></sub>
                            </span>
                        </button>
                    </div>
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
                </div>
                <div className="col-2-of-3">
                    <div className="searchbar">
                    {
                        this.props.searchbar()
                    }
                    </div>
                </div>
            </div>
        );
    }
}

export default ControlPanel;
