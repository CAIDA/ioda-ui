import React, { Component } from 'react';
import {generateKeys, humanizeNumber} from "../../utils";
import SummaryTableRow from "./SummaryTableRow";
import SignalTableRow from "./SignalTableRow";
import iconSortAsc from 'images/icons/icon-sortAsc.png';
import iconSortDesc from 'images/icons/icon-sortDesc.png';
import iconSortUnsorted from 'images/icons/icon-sortUnsort.png';
import iconCancel from 'images/icons/icon-cancel.png';
import iconCheckmark from 'images/icons/icon-checkmark.png';

class Table extends Component {
    constructor(props) {
        super(props);
        this.state = {
            eventData: [],
            alertData: [],
            summaryData: [],
            signalData: [],
            data: [],
            sortedColumn: {
                name: "",
                position: "",
                arrow: ""
            }
        };
        this.alertHeaders = {
            level: "Alert",
            dateStamp: "Time (UTC)",
            dataSource: "Data Source",
            actualValue: "Actual Value",
            baselineValue: "Baseline Value"
        };
        this.eventHeaders = {
            age: "Age",
            fromDate: "From",
            untilDate: "Until",
            duration: "Duration",
            score: "Score"
        };
        this.summaryHeaders = {
            name: "Name",
            score: "Score",
        };
        this.signalHeaders = {
            visibility: "Visibility",
            name: "Name",
            score: "Score"
        };
    }

    componentDidUpdate(prevProps) {
        // if (this.state !== prevState) {
        //     if (this.props.type === "signal") {
        //         // Signal Table default sort
        //         this.setState({
        //             signalData: this.props.data,
        //             sortedColumn: {
        //                 name: "score",
        //                 position: "desc",
        //                 arrow: iconSortDesc
        //             }
        //         },() => {
        //             console.log(this.state.signalData);
        //         });
        //     }
        // }

        if (this.props.data !== prevProps.data) {
            if (this.props.type === "alert") {
                // Alert Table default sort
                this.setState({
                    alertData: this.props.data,
                    sortedColumn: {
                        name: "dateStamp",
                        position: "desc",
                        arrow: iconSortDesc
                    }
                });
            }

            if (this.props.type === "event") {
                // Event Table default sort
                this.setState({
                    eventData: this.props.data,
                    sortedColumn: {
                        name: "fromDate",
                        position: "desc",
                        arrow: iconSortDesc
                    }
                });
            }

            if (this.props.type === "summary") {
                // Summary Table default sort
                this.setState({
                    summaryData: this.props.data,
                    sortedColumn: {
                        name: "score",
                        position: "desc",
                        arrow: iconSortDesc
                    }
                });
            }

            if (this.props.type === "signal") {
                // Signal Table default sort
                this.setState({
                    signalData: this.props.data,
                    sortedColumn: {
                        name: "score",
                        position: "desc",
                        arrow: iconSortDesc
                    }
                },() => {
                    console.log(this.state.signalData);
                });
            }
        }

        // Check for getting relatedTo Outage Summary data on Entity Page to populate
        if (this.props.type === "summary" && this.state.summaryData !== this.props.data) {
            // Summary Table default sort
            this.setState({
                summaryData: this.props.data,
                sortedColumn: {
                    name: "score",
                    position: "desc",
                    arrow: iconSortDesc
                }
            });
        }

        // Check for getting Map Modal Signal Table data on Entity Page to populate
        if (this.props.type === "signal" && this.state.signalData !== this.props.data) {
            // Signal Table default sort
            this.setState({
                signalData: this.props.data,
                sortedColumn: {
                    name: "score",
                    position: "desc",
                    arrow: iconSortDesc
                }
            });
        }

    }

    compare(key, order) {
        return function innerSort(a, b) {
            if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {
                // property doesn't exist on either object
                return 0;
            }

            const varA = (typeof a[key] === 'string')
                ? a[key].toUpperCase() : a[key];
            const varB = (typeof b[key] === 'string')
                ? b[key].toUpperCase() : b[key];

            let comparison = 0;
            if (varA > varB) {
                comparison = 1;
            } else if (varA < varB) {
                comparison = -1;
            }
            return (
                (order === 'desc') ? (comparison * -1) : comparison
            );
        };
    }

    sortByColumn(event) {
        let { type } = this.props;
        let colToSort, position, data;

        // get key from respective object based on header value clicked on
        if (type === "alert") {
            colToSort = Object.keys(this.alertHeaders).find(key => this.alertHeaders[key] === event.target.value);
            position = this.alertHeaders[colToSort];
        }

        if (type === "event") {
            colToSort = Object.keys(this.eventHeaders).find(key => this.eventHeaders[key] === event.target.value);
            position = this.eventHeaders[colToSort];
        }

        if (type === "summary") {
            colToSort = Object.keys(this.summaryHeaders).find(key => this.summaryHeaders[key] === event.target.value);
            position = this.summaryHeaders[colToSort];
        }

        if (type === "signal") {
            colToSort = Object.keys(this.signalHeaders).find(key => this.signalHeaders[key] === event.target.value);
            position = this.signalHeaders[colToSort];
        }

        // Update state of table to sort rows and add icon
        // ToDo: Replace icon with proper image file
        this.setState( {
            sortedColumn: {
                name: colToSort,
                position: event.target.value !== position
                    ? "asc"
                    : this.state.sortedColumn.position === "asc"
                        ? "desc"
                        : "asc",
                arrow: event.target.value !== position
                    ? iconSortUnsorted
                    : this.state.sortedColumn.position === "asc"
                        ? iconSortDesc
                        : iconSortAsc
            }
        }, () => {
            data = this.props.data.sort(this.compare(colToSort, this.state.sortedColumn.position));
            this.setState({
                data: data
            })
        })
    }

    render() {
        const { type } = this.props;
        return (
            <div className="table__wrapper">
                <table className={`table ${type === "alert" ? "table--alert" : type === "event" ? "table--event" : type === "summary" ? "table--summary" : "table--signal"}`}>
                    <thead>
                    <tr className="table__header">
                        {
                            Object.values(type === "alert"
                                ? this.alertHeaders
                                : type === "event"
                                    ? this.eventHeaders
                                    : type === "summary"
                                        ? this.summaryHeaders
                                        : type === "signal"
                                            ? this.signalHeaders
                                            : null
                            ).map(header => {
                                return <th className="table__header-col" key={header}>
                                    <button onClick={(event) => this.sortByColumn(event)} value={header}>
                                        {header}
                                        {
                                            type === "alert"
                                                ? header === this.alertHeaders[this.state.sortedColumn.name]
                                                ? <img className="table__header-sort" src={this.state.sortedColumn.arrow} alt={this.state.sortedColumn.arrow}/>
                                                : <img className="table__header-sort" src={iconSortUnsorted} alt="Unsorted"/>
                                                : null

                                        }
                                        {
                                            type === "event"
                                                ? header === this.eventHeaders[this.state.sortedColumn.name]
                                                ? <img className="table__header-sort" src={this.state.sortedColumn.arrow} alt={this.state.sortedColumn.arrow}/>
                                                : <img className="table__header-sort" src={iconSortUnsorted} alt="Unsorted"/>
                                                : null

                                        }
                                        {
                                            type === "summary"
                                                ? header === this.summaryHeaders[this.state.sortedColumn.name]
                                                ? <img className="table__header-sort" src={this.state.sortedColumn.arrow} alt={this.state.sortedColumn.arrow}/>
                                                : <img className="table__header-sort" src={iconSortUnsorted} alt="Unsorted"/>
                                                : null

                                        }
                                        {
                                            type === "signal"
                                                ? header === this.signalHeaders[this.state.sortedColumn.name]
                                                ? <img className="table__header-sort" src={this.state.sortedColumn.arrow} alt={this.state.sortedColumn.arrow}/>
                                                : <img className="table__header-sort" src={iconSortUnsorted} alt="Unsorted"/>
                                                : null

                                        }
                                    </button>
                                </th>;
                            })
                        }
                    </tr>
                    </thead>
                    <tbody>
                    {
                        this.state.alertData && this.state.alertData.map(alert => {
                            return <tr key={generateKeys(this.props.type === 'alert' ? 'alert' : 'event')}>
                                <td className={alert.level === "warning" ? "table--alert-warning" : "table--alert-normal"}>
                                    {
                                        alert.level === "warning"
                                            ? <img className="table--alert-level-img" src={iconCancel} alt="✗"/>
                                            : <img className="table--alert-level-img" src={iconCheckmark} alt="✓"/>
                                    }
                                </td>
                                <td>
                                    <p>{alert.date.month} {alert.date.day}, {alert.date.year}</p>
                                    <p>{alert.date.hours}:{alert.date.minutes} {alert.date.meridian}</p>
                                </td>
                                <td>
                                    {alert.dataSource}
                                </td>
                                <td>
                                    {alert.actualValue}
                                </td>
                                <td>
                                    {alert.baselineValue}
                                </td>
                            </tr>
                        })
                    }
                    {
                        this.state.eventData && this.state.eventData.map(event => {
                            return <tr key={generateKeys(this.props.type === 'alert' ? 'alert' : 'event')}>
                                <td>
                                    {event.age}
                                </td>
                                <td>
                                    <p>{event.from.month} {event.from.day}, {event.from.year}</p>
                                    <p>{event.from.hours}:{event.from.minutes} {event.from.meridian}</p>
                                </td>
                                <td>
                                    <p>{event.until.month} {event.until.day}, {event.until.year}</p>
                                    <p>{event.until.hours}:{event.until.minutes} {event.until.meridian}</p>
                                </td>
                                <td>
                                    {event.duration}
                                </td>
                                <td>
                                    {event.score}
                                </td>
                            </tr>
                        })
                    }
                    {
                        this.props.type === "summary" && this.state.summaryData.slice(this.props.currentDisplayLow, this.props.currentDisplayHigh).map(summary => {
                            return <SummaryTableRow key={generateKeys('summary')} type={this.props.type} data={summary}/>
                        })
                    }
                    {
                        this.props.type === "signal" && this.props.data.slice(this.props.currentDisplayLow, this.props.currentDisplayHigh).map(signal => {
                            return <SignalTableRow key={generateKeys('signal')} type={this.props.type} data={signal}/>

                        })
                    }
                    </tbody>
                </table>
                <div className="table__page">
                    <p className="table__page-text">Showing {this.props.currentDisplayLow + 1} - {this.props.currentDisplayHigh} of {this.props.totalCount} Entries</p>
                    <div className="table__page-controls">
                        <button onClick={(type) => this.props.prevPage(type)} className="table__page-button">Prev</button>
                        <button onClick={(type) => this.props.nextPage(type)} className="table__page-button">Next</button>
                    </div>

                </div>
            </div>
        );
    }
}

export default Table;
