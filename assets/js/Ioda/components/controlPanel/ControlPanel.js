import React, {Component} from 'react';
import { Style } from "react-style-tag";
import T from 'i18n-react';
// Date Picker Dependencies
import {createStaticRanges, DateRangePicker} from 'react-date-range';
import {
    addDays,
    addMonths,
    addYears,
    endOfDay,
    endOfMonth,
    endOfWeek,
    endOfYear,
    startOfDay,
    startOfMonth,
    startOfWeek,
    startOfYear
} from "date-fns";
// Time Picker Dependencies
import TimeRangePicker from '@wojtekmaj/react-timerange-picker';

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
            applyButtonActive: true,
            customRangeVisible: false,
            todaySelected: false,
            lastHourSelected: false
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
            rangeInputVisibility: !this.state.rangeInputVisibility,
            customRangeVisible: false
        })
    }

    handleRangeUpdate() {
        this.handleRangeDisplay();
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

        // date functions for predefined static ranges
        const defineds = {
            oneHourAgo: new Date(new Date().getTime() - (1000*60*60)),
            twentyFourHoursAgo: new Date(new Date().getTime() - (1000*60*60*24)),
            currentTime: new Date(),
            startOfWeek: startOfWeek(new Date()),
            endOfWeek: endOfWeek(new Date()),
            startOfLastWeek: startOfWeek(addDays(new Date(), -7)),
            endOfLastWeek: endOfWeek(addDays(new Date(), -7)),
            startOfToday: new Date(new Date().setHours(0,0,0,0)),
            startOfLastSevenDay: startOfDay(addDays(new Date(), -7)),
            startOfLastThirtyDay: startOfDay(addDays(new Date(), -30)),
            startOfLastNintyDay: startOfDay(addDays(new Date(), -90)),
            startOfLastThreeHundredSixtyFiveDay: startOfDay(addDays(new Date(), -365)),
            endOfToday: new Date(new Date().setHours(23,59,59,999)),
            startOfYesterday: startOfDay(addDays(new Date(), -1)),
            endOfYesterday: endOfDay(addDays(new Date(), -1)),
            startOfMonth: startOfMonth(new Date()),
            endOfMonth: endOfMonth(new Date()),
            startOfLastMonth: startOfMonth(addMonths(new Date(), -1)),
            endOfLastMonth: endOfMonth(addMonths(new Date(), -1)),
            startOfYear: startOfYear(new Date()),
            endOfYear: endOfYear(new Date()),
            startOflastYear: startOfYear(addYears(new Date(), -1)),
            endOflastYear: endOfYear(addYears(new Date(), -1))
        };

        // set UI for sidebar options on date range
        const sideBarOptions = () => {
            return [
                {
                    label: "Today",
                    range: () => ({
                        startDate: defineds.startOfToday,
                        endDate: defineds.endOfToday,
                        label: "today"
                    })
                },
                {
                    label: "- 60 mins",
                    range: () => ({
                        startDate: defineds.oneHourAgo,
                        endDate: defineds.currentTime,
                        label: "lastHour"
                    })
                },
                {
                    label: "- 24 hours",
                    range: () => ({
                        startDate: defineds.twentyFourHoursAgo,
                        endDate: defineds.currentTime
                    })
                },
                {
                    label: "- 7 days",
                    range: () => ({
                        startDate: defineds.startOfLastSevenDay,
                        endDate: defineds.endOfToday
                    })
                },
                {
                    label: "- 30 days",
                    range: () => ({
                        startDate: defineds.startOfLastThirtyDay,
                        endDate: defineds.endOfToday
                    })
                },
                {
                    label: "- 1 year",
                    range: () => ({
                        startDate: defineds.startOfLastThreeHundredSixtyFiveDay,
                        endDate: defineds.endOfToday
                    })
                },
                {
                    label: "This Month",
                    range: () => ({
                        startDate: defineds.startOfMonth,
                        endDate: defineds.endOfMonth
                    })
                },
                {
                    label: "This Year",
                    range: () => ({
                        startDate: defineds.startOfYear,
                        endDate: defineds.endOfYear
                    })
                },
                {
                    label: "Last Year",
                    range: () => ({
                        startDate: defineds.startOflastYear,
                        endDate: defineds.endOflastYear
                    })
                },
                {
                    label: "Custom Range",
                    range: () => ({
                        label: "customRange"
                    })
                }
            ];
        };

        // simplify sidebar to a variable, then set it to the static ranges attribute
        const sideBar = sideBarOptions();
        const staticRanges = [
            // ...defaultStaticRanges,
            ...createStaticRanges(sideBar)
        ];


        return(
            <div className="row control-panel">
                <Style>{`
                    /* Styles to force hide/show the calendar dependent on if Custom Range is clicked */ 
                    .rdrDefinedRangesWrapper {
                        padding-bottom: 4rem;
                    }
                    .rdrCalendarWrapper,
                    .range__time,
                    .react-timerange-picker {
                        ${this.state.customRangeVisible ? "display: block;" : "display: none"}
                    }
                    .range__dropdown-checkbox {
                        ${this.state.customRangeVisible ? "display: flex;" : "display: none"}
                    }
                    
                    /* Styles to force issue where both Today and - 60 mins options want to both highlight at the same time */                    
                    .rdrStaticRange:first-child {
                        ${this.state.todaySelected ? "color: rgb(61, 145, 255)important;" : "color: #404040!important; font-weight: 400!important;"}  
                    }
                    .rdrStaticRange:nth-child(2) {
                        ${this.state.lastHourSelected ? "color: rgb(61, 145, 255)important;" : "color: #404040!important; font-weight: 400!important;"}  
                    }
                `}</Style>
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
                            onChange={item => {
                                if (item.selection.label) {
                                    switch (item.selection.label) {
                                        case 'today':
                                            this.setState({
                                                ...this.state,
                                                todaySelected: true,
                                                lastHourSelected: false,
                                                timeRange: [
                                                    "00:00:00",
                                                    "23:59:59"
                                                ],
                                                ...item
                                            });
                                            break;
                                        case 'lastHour':
                                            this.setState({
                                                ...this.state,
                                                lastHourSelected: true,
                                                todaySelected: false,
                                                timeRange: [
                                                    `${item.selection.startDate.getUTCHours() < 10 ? `0${item.selection.startDate.getUTCHours()}` : item.selection.startDate.getUTCHours()}:${item.selection.startDate.getUTCMinutes() < 10 ? `0${item.selection.startDate.getUTCMinutes()}` : item.selection.startDate.getUTCMinutes()}:${item.selection.startDate.getUTCSeconds() < 10 ? `0${item.selection.startDate.getUTCSeconds()}` : item.selection.startDate.getUTCSeconds()}`,
                                                    `${item.selection.endDate.getUTCHours() < 10 ? `0${item.selection.endDate.getUTCHours()}` : item.selection.endDate.getUTCHours()}:${item.selection.endDate.getUTCMinutes() < 10 ? `0${item.selection.endDate.getUTCMinutes()}` : item.selection.endDate.getUTCMinutes()}:${item.selection.endDate.getUTCSeconds() < 10 ? `0${item.selection.endDate.getUTCSeconds()}` : item.selection.endDate.getUTCSeconds()}`
                                                ],
                                                ...item
                                            });
                                            break;
                                        case 'customRange':
                                            this.setState({
                                                customRangeVisible: true,
                                                todaySelected: false,
                                                lastHourSelected: false
                                            });
                                            break;
                                        default:
                                            break;
                                    }
                                } else {
                                    this.setState({
                                        ...this.state,
                                        todaySelected: false,
                                        lastHourSelected: false,
                                        timeRange: [
                                            "00:00:00",
                                            "23:59:59"
                                        ],
                                        ...item
                                    })
                                }
                            }}
                            months={1}
                            minDate={new Date(1970, 0, 1)}
                            maxDate={new Date()}
                            direction="vertical"
                            // setting to true will cause a console error due to length of calendar months loaded (back to minDate value)
                            scroll={{ enabled: false }}
                            ranges={[this.state.selection]}
                            staticRanges={staticRanges}
                            inputRanges = {[]}
                        />
                        <div className={this.state.wholeDayInputSelected ? "range__time" : "range__time range__time--visible"}>
                            <TimeRangePicker
                                onChange={(time) => this.handleTimeChange(time)}
                                value={this.state.timeRange}
                                disableClock={true}
                                maxDetail={"second"}
                                clearIcon={null}
                            />
                            <div className="range__dropdown-checkbox">
                                <input onChange={() => this.handleWholeDaySelection()} type="checkbox" name="checkbox" id="whole-day"/>
                                <label htmlFor="whole-day">{wholeDay}</label>
                            </div>
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
