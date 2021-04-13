import React, { Component } from 'react';
import T from 'i18n-react';
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
                "00:00:00",
                "23:59:59"
            ],
            rangeInputVisibility: false,
            wholeDayInputSelected: false,
            validRange: true,
            applyButtonActive: true
        }
    }

    componentDidUpdate(nextProps, nextState) {
        if (nextProps.from !== this.props.from) {
            this.setState(prevState => ({
                selection: {
                    ...prevState.selection,
                    startDate: new Date(this.props.from * 1000 + (new Date(this.props.from * 1000).getTimezoneOffset() * 60000))
                }
            }))
        }

        if (nextProps.until !== this.props.until) {
            this.setState(prevState => ({
                selection: {
                    ...prevState.selection,
                    endDate: new Date(this.props.until * 1000 + (new Date(this.props.until * 1000).getTimezoneOffset() * 60000))
                }
            }))
        }

        // when time or date are changed, check to see if the selected range is valid to enable/disable the apply button
        if (nextState.timeRange !== this.state.timeRange || nextState.selection !== this.state.selection) {
            // if the date values are the same and the start time is later than the end time
            if (this.state.selection.endDate - this.state.selection.startDate === 0) {
                if (Date.parse(`01/01/2011 ${this.state.timeRange[0]}`) > Date.parse(`01/01/2011 ${this.state.timeRange[1]}`)) {
                    this.setState({
                        applyButtonActive: false
                    })
                }
            }
            // if the date values are the same and the start time is earlier than the end time
            if (this.state.selection.endDate - this.state.selection.startDate === 0) {
                if (Date.parse(`01/01/2011 ${this.state.timeRange[0]}`) < Date.parse(`01/01/2011 ${this.state.timeRange[1]}`)) {
                    this.setState({
                        applyButtonActive: true
                    })
                }
            }

            // if the end date is more recent than the start date
            if (this.state.selection.endDate - this.state.selection.startDate > 0) {
                this.setState({
                    applyButtonActive: true
                })
            }
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

    handleRangeUpdate() {
        this.props.timeFrame(this.state.selection, this.state.timeRange);
    }

    render() {
        let startDate = new Date((this.props.from * 1000)).toISOString().split("T")[0];
        let startTime = new Date((this.props.from * 1000)).toISOString().split("T")[1].split(".")[0];
        let endDate = new Date((this.props.until * 1000)).toISOString().split("T")[0];
        let endTime = new Date((this.props.until * 1000)).toISOString().split("T")[1].split(".")[0];

        const utc = T.translate("controlPanel.utc");
        const wholeDay = T.translate("controlPanel.wholeDay");
        const apply = T.translate("controlPanel.apply");
        const cancel = T.translate("controlPanel.cancel");

        return(
            <div className="row control-panel">
                <div className="col-1-of-1">
                    <h1 className="heading-h1">{this.props.entityName}</h1>
                </div>
                <div className="col-1-of-3">
                    <T.p text={"controlPanel.timeRange"} className="range__label"/>
                    <div className="range">
                        <button className="range__input" onClick={() => this.handleRangeDisplay()}>
                            <span className="range__input-start">
                                {startDate} - {startTime}<sub><sup><sub>{utc}</sub></sup></sub>
                            </span>
                            <span className="range__input-dash">—</span>
                            <span className="range__input-end">
                                {endDate} - {endTime}<sub><sup><sub>{utc}</sub></sup></sub>
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
                            <label htmlFor="whole-day">{wholeDay}</label>
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
                        {
                            this.state.applyButtonActive
                            ? <button className={this.state.applyButtonActive ? "range__button" : "range__button range__button--disabled"} onClick={() => this.handleRangeUpdate()}>
                                    {apply}
                                </button>
                                : <button className="range__button range__button--disabled">
                                    {apply}
                                </button>
                        }
                        <button className="range__button range__button--secondary" onClick={() => this.handleRangeDisplay()}>
                            {cancel}
                        </button>
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
