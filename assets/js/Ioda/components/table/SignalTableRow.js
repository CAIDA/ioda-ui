import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import {humanizeNumber} from "../../utils";
import {Link} from "react-router-dom";
import T from 'i18n-react';

// Each row of the summary table needs it's own component to manage the
// hover state, which controls the table that displays score breakdowns.

class SignalTableRow extends Component {
    constructor(props) {
        super(props);
        this.state = {
            x: 0,
            y: 0,
            displayScores: false,
            visibility: this.props.data.visibility
        };
        this.handleRowScoreHide = this.handleRowScoreHide.bind(this);
    }

    componentDidMount() {
        document.addEventListener('click', this.handleRowScoreHide, true);
    }

    componentDidUpdate(prevProps) {
        if (this.props.data !==prevProps.data) {
            this.setState({ visibility: this.props.data.visibility});
        }
    }

    componentWillUnmount() {
        document.removeEventListener('click', this.handleRowScoreHide, true);
    }

    handlePopulateScores(scores) {
        if (scores !== null) {
            return scores && scores.map((score, index) => {
                let scoreValue = humanizeNumber(score.score, 2);
                return (
                    <tr className="table__scores-row" key={index}>
                        <td className="table__scores-cell">
                            {score.source}
                        </td>
                        <td className="table__scores-cell">
                            {scoreValue}
                        </td>
                    </tr>
                )
            })
        } else {return null;}
    }

    handleRowScoreHide() {
        const domNode = ReactDOM.findDOMNode(this);

        if (!domNode || !domNode.contains(event.target)) {
            this.setState({
                displayScores: false
            });
        }
    }

    handleRowScoreDisplay() {
        this.setState({
            displayScores: !this.state.displayScores
        })
    }

    handleRowHover(event) {
        event.persist();
        // console.log(event);
        // console.log(event.nativeEvent.offsetY);
        // Keep the hover table aligned with the corresponding ellipses
        this.setState({
            y: event.nativeEvent.offsetY < 8
                ? -2
                : event.nativeEvent.offsetY > 20
                    ? 14
                    : event.nativeEvent.offsetY - 9
        });
    }

    // controls checkbox visibility UI, having it wait on props is taking too long
    handleVisibilityState(item) {
        // update checkbox and call props function
        this.setState({
            visibility: !this.state.visibility
        }, () =>
            setTimeout(() => {
                this.props.toggleEntityVisibilityInHtsViz(item)
            }, 1000)
        );
    }

    render() {
        let overallScore = humanizeNumber(this.props.data.score, 2);

        const dataSourceHeading = T.translate("table.scoresTable.dataSourceHeading");
        const scoreHeading = T.translate("table.scoresTable.scoreHeading");

        const item = this.props.data;
        const entityCode = this.props.data.entityCode;
        const entityType = this.props.data.entityType;

        return(
            <tr
                className="table--summary-row"
                // onMouseMove={(event) => this.handleRowHover(event)}
                // onMouseLeave={(event) => this.handleRowHover(event)}
                onTouchStart={(event) => this.handleRowHover(event)}
            >
                {
                    this.props.type === "signal"
                        ? <td>
                            <input className="table__cell-checkbox" type="checkbox" name={entityCode}
                                   checked={this.state.visibility}
                                   onChange={() => this.handleVisibilityState(item)}
                            />
                        </td>
                        : null
                }
                <td>
                    <Link className="table__cell-link"
                          to={
                              window.location.search.split("?")[1]
                                  ? `/${entityType}/${entityCode}?from=${window.location.search.split("?")[1].split("&")[0].split("=")[1]}&until=${window.location.search.split("?")[1].split("&")[1].split("=")[1]}`
                                  : `/${entityType}/${entityCode}`
                          }
                          onClick={() => this.props.handleEntityClick(this.props.data.entityType, this.props.data.entityCode)}
                    >
                        {this.props.data.name}
                    </Link>
                </td>
                {
                    this.props.entityType === 'asn'
                        ? <td className="td--center">{this.props.data.ipCount}</td>
                        : null
                }
                <td
                    className="table__cell--overallScore td--center"
                    onClick={() => this.handleRowScoreDisplay()}
                    style={{backgroundColor: this.props.data.color}}

                >
                    {overallScore}
                    {/*<span className="table__ellipses">⋮</span>*/}
                    <table
                        className={this.state.displayScores ? "table__scores table__scores--active" : "table__scores"}
                        style={{top: `${this.state.y}px`}}
                    >
                        <thead>
                        <tr className="table__scores-headers">
                            <th className="table__scores-cell">
                                {dataSourceHeading}
                            </th>
                            <th className="table__scores-cell">
                                {scoreHeading}
                            </th>
                        </tr>
                        </thead>
                        <tbody>
                        {this.handlePopulateScores(this.props.data.scores)}
                        </tbody>
                    </table>

                </td>
            </tr>
        )
    }
}

export default SignalTableRow;
