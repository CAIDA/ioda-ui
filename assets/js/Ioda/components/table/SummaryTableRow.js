import React, { Component } from 'react';
import {humanizeNumber} from "../../utils";

// Each row of the summary table needs it's own component to manage the
// hover state, which controls the table that displays score breakdowns.

class SummaryTableRow extends Component {
    constructor(props) {
        super(props);
        this.state = {
            x: 0,
            y: 0
        }
    }

    handlePopulateScores(scores) {
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

    render() {
        let overallScore = humanizeNumber(this.props.data.score, 2);
        return(
            <tr
                className="table--summary-row"
                onMouseMove={(event) => this.handleRowHover(event)}
                onMouseLeave={(event) => this.handleRowHover(event)}
            >
                <td>
                    {this.props.data.name}
                </td>
                <td
                    className="table__cell--overallScore"

                >
                    {overallScore}
                    <span className="table__ellipses">⋮</span>
                    <table
                        className="table__scores"
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

export default SummaryTableRow;