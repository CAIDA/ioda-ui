import React, { Component } from 'react';
import T from 'i18n-react';
import {generateKeys, humanizeNumber} from "../../utils";
import SummaryTableRow from "./SummaryTableRow";
import SignalTableRow from "./SignalTableRow";
import iconSortAsc from 'images/icons/icon-asc.png';
import iconSortDesc from 'images/icons/icon-desc.png';
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
            level: "",
            dateStamp: T.translate("table.alertHeaders.dateStamp"),
            dataSource: T.translate("table.alertHeaders.dataSource"),
            actualValue: T.translate("table.alertHeaders.actualValue"),
            baselineValue: T.translate("table.alertHeaders.baselineValue")
        };
        this.eventHeaders = {
            fromDate: T.translate("table.eventHeaders.fromDate"),
            untilDate: T.translate("table.eventHeaders.untilDate"),
            duration: T.translate("table.eventHeaders.duration"),
            score: T.translate("table.eventHeaders.score")
        };
        this.summaryHeaders = {
            name: T.translate("table.summaryHeaders.name"),
            score: T.translate("table.summaryHeaders.score")
        };
        this.summaryHeadersAsn = {
            name: T.translate("table.summaryHeaders.name"),
            ipCount: T.translate("table.summaryHeaders.ipCount"),
            score: T.translate("table.summaryHeaders.score")
        };
        this.signalHeaders = {
            visibility: "",
            name: T.translate("table.signalHeaders.name"),
            score: T.translate("table.signalHeaders.score")
        };
        this.signalHeadersAsn = {
            visibility: "",
            name: T.translate("table.signalHeaders.name"),
            ipCount: T.translate("table.signalHeaders.ipCount"),
            score: T.translate("table.signalHeaders.score")
        };
    }

    componentDidMount() {
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
            });
        }
    }

    componentDidUpdate(prevProps) {
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
            if (event.target.value) {
                colToSort = Object.keys(this.alertHeaders).find(key => this.alertHeaders[key] === event.target.value);
            } else {
                colToSort = Object.keys(this.alertHeaders).find(key => this.alertHeaders[key] === event.target.parentNode.value);
            }
            position = this.alertHeaders[colToSort];
        }

        if (type === "event") {
            if (event.target.value) {
                colToSort = Object.keys(this.eventHeaders).find(key => this.eventHeaders[key] === event.target.value);
            } else {
                colToSort = Object.keys(this.eventHeaders).find(key => this.eventHeaders[key] === event.target.parentNode.value);
            }
            position = this.eventHeaders[colToSort];
        }

        if (type === "summary") {
            if (this.props.entityType === 'asn') {
                if (event.target.value) {
                    colToSort = Object.keys(this.summaryHeadersAsn).find(key => this.summaryHeadersAsn[key] === event.target.value);
                } else {
                    colToSort = Object.keys(this.summaryHeadersAsn).find(key => this.summaryHeadersAsn[key] === event.target.parentNode.value);
                }
                position = this.summaryHeadersAsn[colToSort];
            } else {
                if (event.target.value) {
                    colToSort = Object.keys(this.summaryHeaders).find(key => this.summaryHeaders[key] === event.target.value);
                } else {
                    colToSort = Object.keys(this.summaryHeaders).find(key => this.summaryHeaders[key] === event.target.parentNode.value);
                }
                position = this.summaryHeaders[colToSort];
            }
        }

        if (type === "signal") {
            if (this.props.entityType === 'asn') {
                if (event.target.value) {
                    colToSort = Object.keys(this.signalHeadersAsn).find(key => this.signalHeadersAsn[key] === event.target.value);
                } else {
                    colToSort = Object.keys(this.signalHeadersAsn).find(key => this.signalHeadersAsn[key] === event.target.parentNode.value);
                }
                position = this.signalHeadersAsn[colToSort];
            } else {
                if (event.target.value) {
                    colToSort = Object.keys(this.signalHeaders).find(key => this.signalHeaders[key] === event.target.value);
                } else {
                    colToSort = Object.keys(this.signalHeaders).find(key => this.signalHeaders[key] === event.target.parentNode.value);
                }
                position = this.signalHeaders[colToSort];
            }
        }

        // Update state of table to sort rows and add icon
        if (event.target.value) {
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
        } else {
            this.setState( {
                sortedColumn: {
                    name: colToSort,
                    position: event.target.parentNode.value !== position
                        ? "asc"
                        : this.state.sortedColumn.position === "asc"
                            ? "desc"
                            : "asc",
                    arrow: event.target.parentNode.value !== position
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
    }

    render() {
        const { type, entityType } = this.props;

        const unsortedIconAltText = T.translate("table.unsortedIconAltText");
        const displayCountShowing = T.translate("table.displayCountShowing");
        const displayCountOf = T.translate("table.displayCountOf");
        const displayCountEntries = T.translate("table.displayCountEntries");
        const prevButtonText = T.translate("table.prevButtonText");
        const nextButtonText = T.translate("table.nextButtonText");
        const eventNoOutagesMessage = T.translate("table.eventNoOutagesMessage");
        const alertNoOutagesMessage = T.translate("table.alertNoOutagesMessage");
        const summaryNoOutagesMessage = T.translate("table.summaryNoOutagesMessage");
        const signalNoOutagesMessage = T.translate("table.signalNoOutagesMessage");

        return (
            <div className="table__wrapper">
                <table className={`table ${
                    type === "alert" ? "table--alert" : 
                    type === "event" ? "table--event" : 
                    type === "summary" && entityType !== "asn" ? "table--summary" : 
                    type === "summary" && entityType === "asn" ? "table--summary table--summary--asn" :
                    type === "signal" && entityType === "asn" ? "table--signal table--signal--asn" :
                    "table--signal"
                }`}>
                    <thead>
                    <tr className="table__header">
                    {
                        Object.values(type === "alert"
                            ? this.alertHeaders
                            : type === "event"
                                ? this.eventHeaders
                                : type === "summary" && entityType === 'asn'
                                    ? this.summaryHeadersAsn
                                    : type === "summary" && entityType !== 'asn'
                                        ? this.summaryHeaders
                                        : type === "signal" && entityType === 'asn'
                                            ? this.signalHeadersAsn
                                            : type === 'signal' && entityType !== 'asn'
                                                ? this.signalHeaders
                                                : null
                        ).map(header => {
                            return <th className="table__header-col" key={header}>
                                <button onClick={(event) => this.sortByColumn(event)} value={header}>
                                    {header}
                                    {
                                        type === "alert"
                                            ? header === this.alertHeaders[this.state.sortedColumn.name]
                                            ? <img className="table__header-sort" src={this.state.sortedColumn.arrow} alt={this.state.sortedColumn.arrow} onClick={(event) => this.sortByColumn(event)}/>
                                            : <img className="table__header-sort" src={iconSortUnsorted} alt={unsortedIconAltText}/>
                                            : null
                                    }
                                    {
                                        type === "event"
                                            ? header === this.eventHeaders[this.state.sortedColumn.name]
                                            ? <img className="table__header-sort" src={this.state.sortedColumn.arrow} alt={this.state.sortedColumn.arrow} onClick={(event) => this.sortByColumn(event)}/>
                                            : <img className="table__header-sort" src={iconSortUnsorted} alt={unsortedIconAltText}/>
                                            : null
                                    }
                                    {
                                        type === "summary" && entityType !== 'asn'
                                            ? header === this.summaryHeaders[this.state.sortedColumn.name]
                                            ? <img className="table__header-sort" src={this.state.sortedColumn.arrow} alt={this.state.sortedColumn.arrow} onClick={(event) => this.sortByColumn(event)}/>
                                            : <img className="table__header-sort" src={iconSortUnsorted} alt={unsortedIconAltText}/>
                                            : null
                                    }
                                    {
                                        type === "summary" && entityType === 'asn'
                                            ? header === this.summaryHeadersAsn[this.state.sortedColumn.name]
                                            ? <img className="table__header-sort" src={this.state.sortedColumn.arrow} alt={this.state.sortedColumn.arrow} onClick={(event) => this.sortByColumn(event)}/>
                                            : <img className="table__header-sort" src={iconSortUnsorted} alt={unsortedIconAltText}/>
                                            : null
                                    }
                                    {
                                        type === "signal" && entityType !== 'asn'
                                            ? header === this.signalHeaders[this.state.sortedColumn.name]
                                            ? <img className="table__header-sort" src={this.state.sortedColumn.arrow} alt={this.state.sortedColumn.arrow} onClick={(event) => this.sortByColumn(event)}/>
                                            : <img className="table__header-sort" src={iconSortUnsorted} alt={unsortedIconAltText}/>
                                            : null
                                    }
                                    {
                                        type === "signal" && entityType === 'asn'
                                            ? header === this.signalHeadersAsn[this.state.sortedColumn.name]
                                            ? <img className="table__header-sort" src={this.state.sortedColumn.arrow} alt={this.state.sortedColumn.arrow} onClick={(event) => this.sortByColumn(event)}/>
                                            : <img className="table__header-sort" src={iconSortUnsorted} alt={unsortedIconAltText}/>
                                            : null
                                    }
                                </button>
                            </th>;
                        })
                    }
                    </tr>
                    </thead>

                    {
                        this.state.eventData.length > 0 || this.state.alertData.length > 0 ||
                        type === "summary" && this.props.data.length > 0 ||
                        type === "signal" && this.props.data.length > 0
                        ? <tbody style={this.props.data.length > 10 ? {overflowY: "scroll"} : {overflowY: "inherit"}}>
                                {
                                    this.state.alertData && this.state.alertData.map(alert => {
                                        return <tr key={generateKeys(this.props.type === 'alert' ? 'alert' : 'event')}>
                                            <td className={
                                                alert.level === "normal" ? "table--alert-normal td--center" :
                                                alert.level === 'warning' ? "table--alert-warning td--center" :
                                                alert.level === 'critical' ? "table--alert-critical td--center" :
                                                    "td--center"
                                            }>
                                                {
                                                    alert.level === "normal"
                                                        ? <img className="table--alert-level-img" src={iconCheckmark} alt="✗"/>
                                                        : <img className="table--alert-level-img" src={iconCancel} alt="✓"/>
                                                }
                                            </td>
                                            <td>
                                                <p>{alert.date.month} {alert.date.day}, {alert.date.year}</p>
                                                <p>{alert.date.hours}:{alert.date.minutes} {alert.date.meridian}</p>
                                            </td>
                                            <td>
                                                {alert.dataSource}
                                            </td>
                                            <td className="table--alert-actualValue td--center">
                                                {alert.actualValue}
                                            </td>
                                            <td className="td--center">
                                                {alert.baselineValue}
                                            </td>
                                        </tr>
                                    })
                                }
                                {
                                    this.state.eventData && this.state.eventData.map(event => {
                                        return <tr key={generateKeys(this.props.type === 'alert' ? 'alert' : 'event')}>
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
                                            <td className="td--center">
                                                {event.score}
                                            </td>
                                        </tr>
                                    })
                                }
                                {
                                    type === "summary" && this.props.data.map(summary => {
                                        return <SummaryTableRow key={generateKeys('summary')}
                                                                type={this.props.type} entityType={this.props.entityType}
                                                                data={summary} handleEntityClick={(entityType, entityCode) => this.props.handleEntityClick(entityType, entityCode)}
                                        />
                                    })
                                }
                                {
                                    type === "signal" && this.props.data.map(signal => {
                                        return <SignalTableRow key={generateKeys('signal')} type={this.props.type}
                                                               entityType={this.props.entityType} data={signal}
                                                               toggleEntityVisibilityInHtsViz={event => this.props.toggleEntityVisibilityInHtsViz(event)}
                                                               handleEntityClick={(entityType, entityCode) => this.props.handleEntityClick(entityType, entityCode)}
                                        />

                                    })
                                }
                            </tbody>
                        : <tbody className="table__empty">
                            {
                                type === "event" ? <tr><td colSpan='100%'>{eventNoOutagesMessage}</td></tr>
                                : type === 'alert' ? <tr><td colSpan='100%'>{alertNoOutagesMessage}</td></tr>
                                : type === "summary" ? <tr><td colSpan='100%'>{summaryNoOutagesMessage}</td></tr>
                                : type === "signal" ? <tr><td colSpan='100%'>{signalNoOutagesMessage}</td></tr>
                                : null
                            }
                        </tbody>
                    }
                </table>
                {
                    this.state.eventData.length > 0 || this.state.alertData.length > 0 ||
                    type === "summary" && this.props.data.length > 0 ||
                    type === "signal" && this.props.data.length > 0
                        ? <div className="table__page">
                            <p className="table__page-text">{displayCountShowing} {this.props.totalCount < 300 ? this.props.totalCount : this.props.data.length} {displayCountOf} {this.props.totalCount} {displayCountEntries}</p>
                            {
                                type === "summary"
                                    ? <div className="table__page-legend">
                                        <span className="table__page-legend-item table__page-legend-item--ping-slash24">Active Probing</span>
                                        <span className="table__page-legend-item table__page-legend-item--bgp">BGP</span>
                                        <span className="table__page-legend-item table__page-legend-item--ucsd-nt">Network Telescope</span>
                                    </div>
                                    : null

                            }
                    </div>
                        : null
                }

            </div>
        )
    }
}

export default Table;
