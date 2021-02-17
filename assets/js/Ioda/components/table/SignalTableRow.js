import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import {humanizeNumber} from "../../utils";
import {Link} from "react-router-dom";

// Each row of the summary table needs it's own component to manage the
// hover state, which controls the table that displays score breakdowns.

class SignalTableRow extends Component {
    constructor(props) {
        super(props);
        this.state = {
            x: 0,
            y: 0,
            displayScores: false
        };
        this.handleRowScoreHide = this.handleRowScoreHide.bind(this);
    }

    componentDidMount() {
        document.addEventListener('click', this.handleRowScoreHide, true);
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

    handleCheckboxChange(event) {
        console.log(event.target);
    }

    render() {
        let overallScore = humanizeNumber(this.props.data.score, 2);
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
                            <input className="table__cell-checkbox" type="checkbox" checked={true} onChange={event => this.handleCheckboxChange(event)}/>
                        </td>
                        : null
                }
                <td>
                    <Link className="table__cell-link" to={`/${this.props.data.entityType}/${this.props.data.entityCode}`}>
                        {this.props.data.name}
                    </Link>
                </td>
                <td
                    className="table__cell--overallScore"
                    onClick={() => this.handleRowScoreDisplay()}

                >
                    {overallScore}
                    <span className="table__ellipses">⋮</span>
                    <table
                        className={this.state.displayScores ? "table__scores table__scores--active" : "table__scores"}
                        style={{top: `${this.state.y}px`}}
                    >
                        <thead>
                        <tr className="table__scores-headers">
                            <th className="table__scores-cell">
                                Source
                            </th>
                            <th className="table__scores-cell">
                                Score
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
