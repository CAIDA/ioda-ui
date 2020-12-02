import React, { Component } from 'react';
import {humanizeNumber} from "../../utils";
import SummaryTableRow from "./SummaryTableRow";
import iconSortAsc from 'images/icons/icon-sortAsc.png';
import iconSortDesc from 'images/icons/icon-sortDesc.png';
import iconSortUnsorted from 'images/icons/icon-sortUnsort.png';
import iconCancel from 'images/icons/icon-cancel.png';
import iconCheckmark from 'images/icons/icon-checkmark.png';

class Table extends Component {
    constructor(props) {
        super(props);
        this.state = {
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
    }

    componentDidUpdate(prevProps) {
        if (this.props.data !== prevProps.data) {
            this.setState({
                data: this.props.data
            });

            if (this.props.type === "alert") {
                // Event Table default sort
                this.setState({
                    sortedColumn: {
                        name: "dateStamp",
                        position: "asc",
                        arrow: iconSortAsc
                    }
                });
            }

            if (this.props.type === "event") {
                // Event Table default sort
                this.setState({
                    sortedColumn: {
                        name: "fromDate",
                        position: "asc",
                        arrow: iconSortAsc
                    }
                });
            }

            if (this.props.type === "summary") {
                // Summary Table default sort
                this.setState({
                    sortedColumn: {
                        name: "score",
                        position: "asc",
                        arrow: iconSortAsc
                    }
                });
            }
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
            <table className={`table ${type === "alert" ? "table--alert" : type === "event" ? "table--event" : "table--summary"}`}>
                <thead>
                <tr className="table__header">
                    {
                        Object.values(type === "alert"
                            ? this.alertHeaders
                            : type === "event"
                                ? this.eventHeaders
                                : type === "summary"
                                    ? this.summaryHeaders
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
                                </button>
                            </th>;
                        })
                    }
                </tr>
                </thead>
                <tbody>
                {
                    this.props.type === "alert" && this.state.data.map((alert, index) => {
                        return <tr key={index}>
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
                    this.props.type === "event" && this.state.data.map((event, index) => {
                        return <tr key={index}>
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
                    this.props.type === "summary" && this.state.data.map((summary, index) => {
                        return <SummaryTableRow data={summary} key={index}/>
                    }, this)
                }
                </tbody>
            </table>
        );
    }
}

export default Table;
