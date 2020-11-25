import React, { Component } from 'react';
import {humanizeNumber} from "../../utils";

// Each row of the summary table needs it's own component to manage the
// hover state, which controls the table that displays score breakdowns.

class SummaryTableRow extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isHovered: false
        }
    }

    handlePopulateScores(scores) {
        return scores && scores.map((score, index) => {
            let scoreValue = humanizeNumber(score.score, 2);
            return (
                <tr className="table__scores-row" key={index} >
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

    handleRowHover() {
        this.setState(prevState => ({
            isHovered: !prevState.isHovered
        }));
    }

    render() {
        let overallScore = humanizeNumber(this.props.data.score, 2);
        return(
            <tr onMouseOver={() => this.handleRowHover(this.props.data.scores)} onMouseLeave={() => this.handleRowHover(this.props.data.scores)}>
                <td>
                    {this.props.data.name}
                </td>
                <td style={{position: "relative"}}>
                    {overallScore}
                    <button>⋮</button>
                    <table className={this.state.isHovered ? "table__scores table__scores--visible" : "table__scores"}>
                        <thead>
                        <tr className="table__scores-headers">
                            <th className="table__scores-cell">
                                Data Source
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
