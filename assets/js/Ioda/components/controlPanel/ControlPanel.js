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
            wholeDayInputSelected: false
        }
    }

    componentDidMount() {
        console.log(this.state);
    }

    componentDidUpdate(nextProps, nextState) {
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

    handleRangeUpdate() {
        this.props.timeFrame(this.state.selection, this.state.timeRange);
    }

    handleDateChange(item) {
        console.log(item);
        this.setState(
            {
                selection: {
                    startDate: new Date(this.props.from * 1000),
                    endDate: new Date(this.props.until * 1000),
                    key: 'selection'
                }
            }
        )
    }

    render() {
        const year = new Date().getUTCFullYear().toString();
        console.log(this.state.selection.startDate);
        let startDate = this.state.selection.startDate.toUTCString().split(", ")[1].split(" ").slice(0, 3).join(" ");
        let startTime = this.state.selection.startDate.toUTCString().split(year)[1].split(".")[0].split("GMT")[0];

        let endDate = this.state.selection.endDate.toUTCString().split(", ")[1].split(" ").slice(0, 3).join(" ");
        let endTime = this.state.selection.endDate.toUTCString().split(year)[1].split(".")[0].split("GMT")[0];

        const utc = T.translate("controlPanel.utc");
        const wholeDay = T.translate("controlPanel.wholeDay");
        const apply = T.translate("controlPanel.apply");

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
                            onChange={item => this.handleDateChange(item)}
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
                        <button className="range__button" onClick={() => this.handleRangeUpdate()}>
                            {apply}
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
