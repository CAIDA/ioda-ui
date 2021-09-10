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
import iconCalendar from 'images/icons/icon-calendar.png';
// Tooltip Component
import Tooltip from "../../components/tooltip/Tooltip";
import {
    convertDateValuesToSeconds,
    convertSecondsToDateValues,
    getTimeStringFromDate,
    getUTCTimeStringFromDate, secondaryColor, secondaryColorDark, secondaryColorLight
} from "../../utils";
import PreloadImage from "react-preload-image";

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
            readableTimeRangeInputSelection: {
                startDate: "",
                endDate: ""
            },
            rangeInputVisibility: false,
            wholeDayInputSelected: false,
            validRange: true,
            applyButtonActive: true,
            customRangeVisible: false,
            todaySelected: false,
            lastHourSelected: false,
            userInputSelected: false,
            last24HoursSelected: false,
            userInputRangeInput: null,
            userInputRangeSelect: "days"
        };
        this.handleUserInputRange = this.handleUserInputRange.bind(this);
        this.timeRangeContainer = React.createRef();
    }

    componentDidMount() {
        console.log("update3");
        let readableDates = this.setDateInLegend(this.props.from, this.props.until);
        this.setState({
            readableTimeRangeInputSelection: {
                startDate: readableDates[0],
                endDate: readableDates[1]
            }
        });
        document.addEventListener('click', event => this.handleClickOffTimeRange(event), {passive: true});
    }

    componentWillUnmount() {
        document.removeEventListener('click', event => this.handleClickOffTimeRange(event));
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

    // set text that renders in bottom right hand corner depicting the start and end date of the currently viewable range
    setDateInLegend(from, until) {
        let readableStartDate = convertSecondsToDateValues(from);
        let readableEndDate = convertSecondsToDateValues(until);
        readableStartDate = `${readableStartDate.month} ${readableStartDate.day}, ${readableStartDate.year} ${readableStartDate.hours}:${readableStartDate.minutes}${readableStartDate.meridian} UTC`;
        readableEndDate = `${readableEndDate.month} ${readableEndDate.day}, ${readableEndDate.year} ${readableEndDate.hours}:${readableEndDate.minutes}${readableEndDate.meridian} UTC`;
        return [ readableStartDate, readableEndDate ];
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
    // detect when a click occurs outside of the time range to close it
    handleClickOffTimeRange(event) {
        if (this.timeRangeContainer && this.timeRangeContainer.current && !this.timeRangeContainer.current.contains(event.target))
            this.setState({
                rangeInputVisibility: false,
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

        // get time ranges from dates
        let startTimeRange, endTimeRange;
        if (this.state.selection.label === "lastHour" || this.state.selection.label === "last24Hours" || this.state.selection.label === "userInputRange") {
            // Get UTC values for time range state, set them, then make api call
            startTimeRange = getUTCTimeStringFromDate(newStartDate);
            endTimeRange = getUTCTimeStringFromDate(newEndDate);
        } else {
            startTimeRange = getTimeStringFromDate(newStartDate);
            endTimeRange = getTimeStringFromDate(newEndDate);
        }

        if (this.state.userInputSelected) {
            if (newStartDate && newEndDate) {
                let readableDates = this.setDateInLegend(Math.floor(newStartDate / 1000) , Math.floor(newEndDate / 1000));
                this.setState({
                    selection: {
                        ...this.state.selection,
                        startDate: newStartDate,
                        endDate: newEndDate,
                    },
                    timeRange: [
                        startTimeRange,
                        endTimeRange
                    ],
                    readableTimeRangeInputSelection: {
                        startDate: readableDates[0],
                        endDate: readableDates[1]
                    }
                }, () => {
                    this.handleRangeDisplay();
                    this.props.timeFrame(this.state.selection, this.state.timeRange);
                })
            }
        } else {
            // Add conditional to check states for delivering utc time vs normal time.
            let readableDates;
            if (this.state.lastHourSelected || this.state.userInputSelected || this.state.last24HoursSelected) {
                readableDates = this.setDateInLegend(
                    Math.floor(this.state.selection.startDate.getTime() / 1000),
                    Math.floor(this.state.selection.endDate.getTime() / 1000)
                );
            } else {
                readableDates = this.setDateInLegend(
                    Math.floor((this.state.selection.startDate.getTime() / 1000) - (this.state.selection.startDate.getTimezoneOffset() * 60000) / 1000),
                    Math.floor((this.state.selection.endDate.getTime() / 1000) - (this.state.selection.endDate.getTimezoneOffset() * 60000) / 1000)
                );
            }


            this.setState({
                timeRange: [
                    startTimeRange,
                    endTimeRange
                ],
                readableTimeRangeInputSelection: {
                    startDate: readableDates[0],
                    endDate: readableDates[1]
                }
            }, () => {
                this.handleRangeDisplay();
                this.props.timeFrame(this.state.selection, this.state.timeRange);
            });
        }
    }
    // function manage the time unit selected in the dropdown for the user input option in sidebar
    handleUserInputRange(event) {
        if (event.currentTarget.className === "range__dropdown-userInputRangeSelect") {
            this.setState({
                userInputRangeSelect: event.target.value,
                userInputSelected: true
            });
        }

        if (event.currentTarget.className === "range__dropdown-userInputRangeInput") {
            this.setState({
                userInputRangeInput: event.target.value,
                userInputSelected: true
            });
        }
    }
    // function to handle clicking the close button when on an entity page
    handleCloseButton() {
        const { history } = this.props;
        history.push(
            window.location.search.split("?")[1]
                ? `/dashboard?from=${window.location.search.split("?")[1].split("&")[0].split("=")[1]}&until=${window.location.search.split("?")[1].split("&")[1].split("=")[1]}`
                : `/dashboard`
        );
    }
    // function to handle editing the input range directly
    handleRangeInputKeyChange(e) {
        const startDateTime = convertDateValuesToSeconds(e.target.value.split(" - ")[0]);
        const endDateTime = convertDateValuesToSeconds(e.target.value.split(" — ")[1]);
        const readableTimes = this.setDateInLegend(Math.floor(startDateTime / 1000), Math.floor(endDateTime / 1000));

        this.setState({
            selection: {
                startDate: new Date(startDateTime),
                endDate: new Date(endDateTime),
                key: 'selection'
            },
            timeRange: [
                `${new Date(startDateTime).getUTCHours() < 10 ? `0${new Date(startDateTime).getUTCHours()}` : new Date(startDateTime).getUTCHours()}:${new Date(startDateTime).getUTCMinutes() < 10 ? `0${new Date(startDateTime).getUTCMinutes()}` : new Date(startDateTime).getUTCMinutes()}:${new Date(startDateTime).getUTCSeconds() < 10 ? `0${new Date(startDateTime).getUTCSeconds()}` : new Date(startDateTime).getUTCSeconds()}`,
                `${new Date(endDateTime).getUTCHours() < 10 ? `0${new Date(endDateTime).getUTCHours()}` : new Date(endDateTime).getUTCHours()}:${new Date(endDateTime).getUTCMinutes() < 10 ? `0${new Date(endDateTime).getUTCMinutes()}` : new Date(endDateTime).getUTCMinutes()}:${new Date(endDateTime).getUTCSeconds() < 10 ? `0${new Date(endDateTime).getUTCSeconds()}` : new Date(endDateTime).getUTCSeconds()}`
            ],
            readableTimeRangeInputSelection: {
                startDate: readableTimes[0],
                endDate: readableTimes[1]
            }
        }, () => {
            this.handleRangeDisplay();
            this.props.timeFrame(this.state.selection, this.state.timeRange);
        });
    }

    render() {
        const utc = T.translate("controlPanel.utc");
        const wholeDay = T.translate("controlPanel.wholeDay");
        const apply = T.translate("controlPanel.apply");
        const cancel = T.translate("controlPanel.cancel");

        const tooltipSearchBarTitle = T.translate("tooltip.searchBar.title");
        const tooltipSearchBarText = T.translate("tooltip.searchBar.text");
        const tooltipTimeRangeTitle = T.translate("tooltip.timeRange.title");
        const tooltipTimeRangeText = T.translate("tooltip.timeRange.text");

        // date functions for predefined static ranges
        const defineds = {
            startOfToday: new Date(new Date().setHours(0,0,0,0)),
            endOfToday: new Date(new Date().setHours(23,59,59,999)),
            oneHourAgo: new Date(new Date().getTime() - (1000*60*60)),
            twentyFourHoursAgo: new Date(new Date().getTime() - (1000*60*60*24)),
            currentTime: new Date(),
            startOfWeek: startOfWeek(new Date()),
            endOfWeek: endOfWeek(new Date()),
            startOfLastWeek: startOfWeek(addDays(new Date(), -7)),
            endOfLastWeek: endOfWeek(addDays(new Date(), -7)),
            startOfLastSevenDay: startOfDay(addDays(new Date(), -7)),
            startOfLastThirtyDay: startOfDay(addDays(new Date(), -30)),
            startOfYesterday: startOfDay(addDays(new Date(), -1)),
            endOfYesterday: endOfDay(addDays(new Date(), -1)),
            startOfMonth: startOfMonth(new Date()),
            endOfMonth: endOfMonth(new Date()),
            startOfLastMonth: startOfMonth(addMonths(new Date(), -1)),
            endOfLastMonth: endOfMonth(addMonths(new Date(), -1)),
        };

        // set UI for sidebar options on date range
        const sideBarOptions = () => {
            const selectOptions = {
                min: "mins",
                hr: "hours",
                day: "days",
                wk: "weeks"
            };
            let customInputHTML = <div className="range__dropdown-userInputRange">
                Last
                <input type="number" placeholder="number" onChange={this.handleUserInputRange} className="range__dropdown-userInputRangeInput"/>
                <select value={this.state.userInputRangeSelect} onChange={this.handleUserInputRange} className="range__dropdown-userInputRangeSelect">
                    <option value={selectOptions.min}>{selectOptions.min}</option>
                    <option value={selectOptions.hr}>{selectOptions.hr}</option>
                    <option value={selectOptions.day}>{selectOptions.day}</option>
                    <option value={selectOptions.wk}>{selectOptions.wk}</option>
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
                        endDate: defineds.currentTime,
                        label: "last24Hours"
                    })
                },
                {
                    label: "- 7 days",
                    range: () => ({
                        startDate: defineds.startOfLastSevenDay,
                        endDate: defineds.endOfToday,
                        label: "last7Days"
                    })
                },
                {
                    label: "- 30 days",
                    range: () => ({
                        startDate: defineds.startOfLastThirtyDay,
                        endDate: defineds.endOfToday,
                        label: "last30Days"
                    })
                },
                {
                    label: "This Month",
                    range: () => ({
                        startDate: defineds.startOfMonth,
                        endDate: defineds.endOfMonth,
                        label: "thisMonth"
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
            ...createStaticRanges(sideBar)
        ];

        const activeCSS = `background: linear-gradient(2deg, ${secondaryColorDark}, ${secondaryColorLight})!important; font-weight: 700!important; color: #fff!important;`;
        const inactiveCSS = `color: ${secondaryColor}!important; font-weight: 400!important;`;


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
                    .rdrStaticRange:nth-child(7) {
                        ${this.state.userInputSelected ? activeCSS : inactiveCSS}
                    }
                    .rdrStaticRange:nth-child(8) {
                        ${this.state.customRangeSelected ? activeCSS : inactiveCSS}
                    }
                    .rdrStaticRangeSelected {
                        ${this.state.todaySelected || this.state.lastHourSelected || this.state.userInputSelected || this.state.customRangeSelected ? inactiveCSS : activeCSS}
                    }
                `}</Style>
                <div className="col-1-of-3">
                    <div className="searchbar">
                        <div className="searchbar__heading">
                            <T.p text={"controlPanel.searchBarPlaceholder"} className="searchbar__label"/>
                            <Tooltip
                                title={tooltipSearchBarTitle}
                                text={tooltipSearchBarText}
                            />
                        </div>
                        {
                            this.props.searchbar()
                        }
                    </div>
                    <div className="range__container" ref={this.timeRangeContainer}>
                        <div className="range__heading">
                            <T.p text={"controlPanel.timeRange"} className="range__label"/>
                            <Tooltip
                                title={tooltipTimeRangeTitle}
                                text={tooltipTimeRangeText}
                            />
                        </div>
                        <div className="range">
                            <button className="range__input" onClick={() => this.handleRangeDisplay()}>
                                <div className="range__calendar">
                                    <PreloadImage className="range__calendar-img" src={iconCalendar} />
                                </div>
                                <input className="range__input-field" onChange={(e) => this.handleRangeInputKeyChange(e)}
                                       value={`${this.state.readableTimeRangeInputSelection.startDate} — ${this.state.readableTimeRangeInputSelection.endDate}`}
                                />
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
                                                    last24HoursSelected: false,
                                                    customRangeSelected: false,
                                                    userInputSelected: false,
                                                    customRangeVisible: false,
                                                    timeRange: [
                                                        "00:00:00",
                                                        "23:59:59"
                                                    ],

                                                    ...item
                                                }, this.handleRangeUpdate);
                                                break;
                                            case 'lastHour':
                                                this.setState({
                                                    ...this.state,
                                                    todaySelected: false,
                                                    lastHourSelected: true,
                                                    last24HoursSelected: false,
                                                    customRangeSelected: false,
                                                    userInputSelected: false,
                                                    customRangeVisible: false,
                                                    timeRange: [
                                                        `${item.selection.startDate.getUTCHours() < 10 ? `0${item.selection.startDate.getUTCHours()}` : item.selection.startDate.getUTCHours()}:${item.selection.startDate.getUTCMinutes() < 10 ? `0${item.selection.startDate.getUTCMinutes()}` : item.selection.startDate.getUTCMinutes()}:${item.selection.startDate.getUTCSeconds() < 10 ? `0${item.selection.startDate.getUTCSeconds()}` : item.selection.startDate.getUTCSeconds()}`,
                                                        `${item.selection.endDate.getUTCHours() < 10 ? `0${item.selection.endDate.getUTCHours()}` : item.selection.endDate.getUTCHours()}:${item.selection.endDate.getUTCMinutes() < 10 ? `0${item.selection.endDate.getUTCMinutes()}` : item.selection.endDate.getUTCMinutes()}:${item.selection.endDate.getUTCSeconds() < 10 ? `0${item.selection.endDate.getUTCSeconds()}` : item.selection.endDate.getUTCSeconds()}`
                                                    ],
                                                    ...item
                                                }, this.handleRangeUpdate);
                                                break;
                                            case 'last24Hours':
                                                this.setState({
                                                    ...this.state,
                                                    todaySelected: false,
                                                    lastHourSelected: false,
                                                    last24HoursSelected: true,
                                                    customRangeSelected: false,
                                                    userInputSelected: false,
                                                    customRangeVisible: false,
                                                    timeRange: [
                                                        `${item.selection.startDate.getUTCHours() < 10 ? `0${item.selection.startDate.getUTCHours()}` : item.selection.startDate.getUTCHours()}:${item.selection.startDate.getUTCMinutes() < 10 ? `0${item.selection.startDate.getUTCMinutes()}` : item.selection.startDate.getUTCMinutes()}:${item.selection.startDate.getUTCSeconds() < 10 ? `0${item.selection.startDate.getUTCSeconds()}` : item.selection.startDate.getUTCSeconds()}`,
                                                        `${item.selection.endDate.getUTCHours() < 10 ? `0${item.selection.endDate.getUTCHours()}` : item.selection.endDate.getUTCHours()}:${item.selection.endDate.getUTCMinutes() < 10 ? `0${item.selection.endDate.getUTCMinutes()}` : item.selection.endDate.getUTCMinutes()}:${item.selection.endDate.getUTCSeconds() < 10 ? `0${item.selection.endDate.getUTCSeconds()}` : item.selection.endDate.getUTCSeconds()}`
                                                    ],
                                                    ...item
                                                }, this.handleRangeUpdate);
                                                break;
                                            case 'userInputRange':
                                                // set state here to control what is highlighted in css, use state in apply button to set time parameters
                                                this.setState({
                                                    todaySelected: false,
                                                    lastHourSelected: false,
                                                    last24HoursSelected: false,
                                                    customRangeSelected: false,
                                                    userInputSelected: true,
                                                    customRangeVisible: false,
                                                    ...item
                                                });
                                                break;
                                            case "customRange":
                                                this.setState({
                                                    todaySelected: false,
                                                    lastHourSelected: false,
                                                    last24HoursSelected: false,
                                                    customRangeSelected: true,
                                                    userInputSelected: false,
                                                    customRangeVisible: true,
                                                    selection: {
                                                        startDate: !this.state.wholeDayInputSelected
                                                            ? new Date(item.selection.startDate.setHours(this.state.timeRange[0].split(":")[0], this.state.timeRange[0].split(":")[1], this.state.timeRange[0].split(":")[2]))
                                                            : new Date(item.selection.startDate.setUTCHours(0, 0, 0)),
                                                        endDate: !this.state.wholeDayInputSelected
                                                            ? new Date(item.selection.endDate.setHours(this.state.timeRange[1].split(":")[0], this.state.timeRange[1].split(":")[1], this.state.timeRange[1].split(":")[2]))
                                                            : new Date(item.selection.endDate.setUTCHours(23, 59, 59)),
                                                        ...item.selection
                                                    }
                                                });
                                                break;
                                            default:
                                                this.setState({
                                                    ...this.state,
                                                    todaySelected: false,
                                                    lastHourSelected: false,
                                                    last24HoursSelected: false,
                                                    userInputSelected: false,
                                                    customRangeSelected: false,
                                                    customRangeVisible: false,
                                                    timeRange: [
                                                        "00:00:00",
                                                        "23:59:59"
                                                    ],
                                                    ...item
                                                }, this.handleRangeUpdate);
                                                break;
                                        }
                                    } else {
                                        this.setState({
                                            ...this.state,
                                            todaySelected: false,
                                            lastHourSelected: false,
                                            last24HoursSelected: false,
                                            userInputSelected: false,
                                            customRangeSelected: false,
                                            customRangeVisible: false,
                                            timeRange: [
                                                "00:00:00",
                                                "23:59:59"
                                            ],
                                            ...item
                                        }, this.handleRangeUpdate);
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
                                rangeColors={[secondaryColor]}
                            />
                            <div className={this.state.customRangeVisible ? "range__time range__time--visible" : "range__time"}>
                                {
                                    !this.state.wholeDayInputSelected
                                        ? <TimeRangePicker
                                            onChange={(time) => this.handleTimeChange(time)}
                                            value={this.state.timeRange}
                                            disableClock={true}
                                            maxDetail={"second"}
                                            clearIcon={null}
                                        />
                                        : null
                                }
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
                </div>
                <div className="col-2-of-3">
                    <div className="control-panel__title">
                        <h1 className="heading-h1">{this.props.title}</h1>
                        {
                            this.props.title !== T.translate("entity.pageTitle")
                                ? <button className="control-panel__button" onClick={() => this.handleCloseButton()}>
                                    ×
                                </button>
                                : null
                        }
                    </div>
                </div>
            </div>
        );
    }
}

export default ControlPanel;
