import React, {Component} from 'react';
import { Style } from "react-style-tag";
import T from 'i18n-react';
// Date Picker Dependencies
import {createStaticRanges, DateRangePicker} from 'react-date-range';
import {
    sub,
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
            lastHourSelected: false,
            userInputSelected: false,
            userInputRangeInput: null,
            userInputRangeSelect: "days"
        };
        this.handleUserInputRange = this.handleUserInputRange.bind(this);
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
    // Checkbox in custom range menu to toggle time selected as the entire day
    handleWholeDaySelection() {
        this.setState({
            timeRange: ["00:00:00", "23:59:59"],
            selection: {
                ...this.state.selection,
                startDate: new Date(new Date(this.state.selection.startDate).setUTCHours(0,0,0,0)),
                endDate: new Date(new Date(this.state.selection.endDate).setUTCHours(23,59,59,0))
            },
            wholeDayInputSelected: !this.state.wholeDayInputSelected
        });
    }
    handleRangeDisplay() {
        this.setState({
            rangeInputVisibility: !this.state.rangeInputVisibility,
            customRangeVisible: false
        })
    }
    // clicking the apply button
    handleRangeUpdate() {
        let newStartDate, newEndDate;
        if (this.state.userInputSelected) {
            // figure out Date unit multiplier (e.g. if it's a day get the seconds value for a day to multiply with input)
            switch (this.state.userInputRangeSelect) {
                case "mins":
                    newStartDate = new Date(new Date() - this.state.userInputRangeInput * 1000 * 60);
                    newEndDate = new Date();
                    break;
                case "hours":
                    newStartDate = new Date(new Date() - this.state.userInputRangeInput * 1000 * 60 * 60);
                    newEndDate = new Date();
                    break;
                case "days":
                    newStartDate = new Date(new Date() - this.state.userInputRangeInput * 1000 * 60 * 60 * 24);
                    newEndDate = new Date();
                    break;
                case "weeks":
                    newStartDate = new Date(new Date() - this.state.userInputRangeInput * 1000 * 60 * 60 * 24 * 7);
                    newEndDate = new Date();
                    break;
                case "months":
                    newStartDate = new Date(new Date() - this.state.userInputRangeInput * 1000 * 60 * 60 * 24 * 30);
                    newEndDate = new Date();
                    break;
                case "years":
                    newStartDate = new Date(new Date() - this.state.userInputRangeInput * 1000 * 60 * 60 * 24 * 365);
                    newEndDate = new Date();
                    break;
                default:
                    console.alert("error with updating range with user input.");
                    break;
            }
        } else {
            newStartDate = this.state.selection.startDate;
            newEndDate = this.state.selection.endDate;
        }

        // Get UTC values for time range state, set them, then make api call
        let startTimeRangeHours = newStartDate.getUTCHours() < 10 ? `0${newStartDate.getUTCHours()}` : newStartDate.getUTCHours();
        let startTimeRangeMin = newStartDate.getUTCMinutes() < 10 ? `0${newStartDate.getUTCMinutes()}` : newStartDate.getUTCMinutes();
        let startTimeRangeSec = newStartDate.getUTCSeconds() < 10 ? `0${newStartDate.getUTCSeconds()}` : newStartDate.getUTCSeconds();
        let startTimeRange = `${startTimeRangeHours}:${startTimeRangeMin}:${startTimeRangeSec}`;

        let endTimeRangeHours = newEndDate.getUTCHours() < 10 ? `0${newEndDate.getUTCHours()}` : newEndDate.getUTCHours();
        let endTimeRangeMin = newEndDate.getUTCMinutes() < 10 ? `0${newEndDate.getUTCMinutes()}` : newEndDate.getUTCMinutes();
        let endTimeRangeSec = newEndDate.getUTCSeconds() < 10 ? `0${newEndDate.getUTCSeconds()}` : newEndDate.getUTCSeconds();
        let endTimeRange = `${endTimeRangeHours}:${endTimeRangeMin}:${endTimeRangeSec}`;

        if (this.state.userInputSelected) {
            if (newStartDate && newEndDate) {
                this.setState({
                    selection: {
                        ...this.state.selection,
                        startDate: newStartDate,
                        endDate: newEndDate,
                    },
                    timeRange: [
                        startTimeRange,
                        endTimeRange
                    ]
                }, () => {
                    this.handleRangeDisplay();
                    this.props.timeFrame(this.state.selection, this.state.timeRange);
                })
            }
        } else {
            this.setState({
                timeRange: [
                    startTimeRange,
                    endTimeRange
                ]
            }, () => {
                this.handleRangeDisplay();
                this.props.timeFrame(this.state.selection, this.state.timeRange);
            });
        }
    }
    // function manage the time unit selected in the dropdown for the user input option in sidebar
    handleUserInputRange(event) {
        if (event.currentTarget.className === "range__dropdown-userInputRangeSelect") {
            this.setState({userInputRangeSelect: event.target.value});
        }

        if (event.currentTarget.className === "range__dropdown-userInputRangeInput") {
            this.setState({ userInputRangeInput: event.target.value});
        }
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
            const selectOptions = {
                min: "mins",
                hr: "hours",
                day: "days",
                wk: "weeks",
                mon: "months",
                yr: "years"
            };
            let customInputHTML = <div className="range__dropdown-userInputRange">
                Last
                <input type="number" placeholder="number" onChange={this.handleUserInputRange} className="range__dropdown-userInputRangeInput"/>
                <select value={this.state.userInputRangeSelect} onChange={this.handleUserInputRange} className="range__dropdown-userInputRangeSelect">
                    <option value={selectOptions.min}>{selectOptions.min}</option>
                    <option value={selectOptions.hr}>{selectOptions.hr}</option>
                    <option value={selectOptions.day}>{selectOptions.day}</option>
                    <option value={selectOptions.wk}>{selectOptions.wk}</option>
                    <option value={selectOptions.mon}>{selectOptions.mon}</option>
                    <option value={selectOptions.yr}>{selectOptions.yr}</option>
                </select>
            </div>;
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
                    label: customInputHTML,
                    range: () => ({
                        label: "userInputRange",
                        inputValue: this.state.userInputRangeInput,
                        selectValue: this.state.userInputRangeSelect
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

        const activeCSS = "color: rgb(61, 145, 255)!important; font-weight: 700!important;";
        const inactiveCSS = "color: #404040!important; font-weight: 400!important;"


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
                    
                    /* Styles to force issue where active custom inputs styling needs to be controlled */                    
                    .rdrStaticRange:first-child {
                        ${this.state.todaySelected ? activeCSS : inactiveCSS}  
                    }
                    .rdrStaticRange:nth-child(2) {
                        ${this.state.lastHourSelected ? activeCSS : inactiveCSS}  
                    }
                    .rdrStaticRange:nth-child(10) {
                        ${this.state.userInputSelected ? activeCSS : inactiveCSS}
                    }
                    .rdrStaticRange:nth-child(11) {
                        ${this.state.customRangeSelected ? activeCSS : inactiveCSS}
                    }
                    .rdrStaticRangeSelected {
                        ${this.state.todaySelected || this.state.lastHourSelected || this.state.userInputSelected || this.state.customRangeSelected ? inactiveCSS : activeCSS}
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
                                                customRangeSelected: false,
                                                userInputSelected: false,
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
                                                userInputSelected: false,
                                                customRangeSelected: false,
                                                timeRange: [
                                                    `${item.selection.startDate.getUTCHours() < 10 ? `0${item.selection.startDate.getUTCHours()}` : item.selection.startDate.getUTCHours()}:${item.selection.startDate.getUTCMinutes() < 10 ? `0${item.selection.startDate.getUTCMinutes()}` : item.selection.startDate.getUTCMinutes()}:${item.selection.startDate.getUTCSeconds() < 10 ? `0${item.selection.startDate.getUTCSeconds()}` : item.selection.startDate.getUTCSeconds()}`,
                                                    `${item.selection.endDate.getUTCHours() < 10 ? `0${item.selection.endDate.getUTCHours()}` : item.selection.endDate.getUTCHours()}:${item.selection.endDate.getUTCMinutes() < 10 ? `0${item.selection.endDate.getUTCMinutes()}` : item.selection.endDate.getUTCMinutes()}:${item.selection.endDate.getUTCSeconds() < 10 ? `0${item.selection.endDate.getUTCSeconds()}` : item.selection.endDate.getUTCSeconds()}`
                                                ],
                                                ...item
                                            });
                                            break;
                                        case 'userInputRange':
                                            // set state here to control what is highlighted in css, use state in apply button to set time parameters
                                            this.setState({
                                                todaySelected: false,
                                                lastHourSelected: false,
                                                userInputSelected: true,
                                                customRangeSelected: false
                                            });
                                            break;
                                        case 'customRange':
                                            this.setState({
                                                customRangeVisible: true,
                                                customRangeSelected: true,
                                                todaySelected: false,
                                                lastHourSelected: false,
                                                userInputSelected: false
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
                                        userInputSelected: false,
                                        timeRange: [
                                            "00:00:00",
                                            "23:59:59"
                                        ],
                                        ...item
                                    })
                                }
                            }}
                            months={1}
                            minDate={new Date(2016, 0, 1)}
                            maxDate={new Date()}
                            direction="vertical"
                            // setting to true will cause a console error due to length of calendar months loaded (back to minDate value)
                            scroll={{ enabled: false }}
                            ranges={[this.state.selection]}
                            staticRanges={staticRanges}
                            inputRanges = {[]}
                        />
                        <div className={this.state.customRangeVisible ? "range__time range__time--visible" : "range__time"}>
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
