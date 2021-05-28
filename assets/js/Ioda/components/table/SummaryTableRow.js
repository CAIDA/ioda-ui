import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import {humanizeNumber} from "../../utils";
import {Link} from "react-router-dom";
import T from 'i18n-react';
import d3 from "d3";

// Each row of the summary table needs it's own component to manage the
// hover state, which controls the table that displays score breakdowns.

class SummaryTableRow extends Component {
    constructor(props) {
        super(props);
        this.state = {
            x: 0,
            y: 0,
            displayScores: false,
            pingSlash24ScoreAvailable: false,
            bgpScoreAvailable: false,
            ucsdNtScoreAvailable: false,
            hoverTime: 600,
            t: null
        };
        this.handleRowScoreHide = this.handleRowScoreHide.bind(this);
    }

    componentDidMount() {
        document.addEventListener('click', this.handleRowScoreHide, true);
        // set states for outage source indicator in score cell

        this.props.data.scores.map(score => {
            switch (score.source) {
                case "ping-slash24":
                    this.setState({pingSlash24ScoreAvailable: true});
                    break;
                case "bgp":
                    this.setState({bgpScoreAvailable: true});
                    break;
                case "ucsd-nt":
                    this.setState({ucsdNtScoreAvailable: true});
                    break;
            }
        });
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

    showScoreTooltipHover() {
        this.setState({ t: setTimeout(() => {
                this.setState({ displayScores: true })
            }, this.state.hoverTime) })
    }

    hideScoreTooltipHover() {
        clearTimeout(this.state.t);
        this.setState({ displayScores: false })
    }

    handleRowHover(event) {
        event.persist();
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
        const dataSourceHeading = T.translate("table.scoresTable.dataSourceHeading");
        const scoreHeading = T.translate("table.scoresTable.scoreHeading");
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
                    this.props.signal
                    ? <td>
                            <input className="table__cell-checkbox" type="checkbox" checked={true}/>
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
                    ? <td className="table__cell--ipCount td--center">{this.props.data.ipCount}</td>
                    : null
                }
                <td
                    className="table__cell--overallScore td--center"
                    onTouchStart={() => this.handleRowScoreDisplay(event)}
                    onMouseEnter={() => this.showScoreTooltipHover()}
                    onMouseLeave={() => this.hideScoreTooltipHover()}
                    style={{backgroundColor: this.props.data.color}}
                >
                    <div className="table__scores-sourceCount">
                        {
                            this.state.pingSlash24ScoreAvailable
                                ? <div className={`table__scores-sourceCount-unit table__scores-sourceCount-unit--ping-slash24`}>&nbsp;</div>
                                : <div className="table__scores-sourceCount-unit table__scores-sourceCount-unit--empty">&nbsp;</div>
                        }
                        {
                            this.state.bgpScoreAvailable
                                ? <div className={`table__scores-sourceCount-unit table__scores-sourceCount-unit--bgp`}>&nbsp;</div>
                                : <div className="table__scores-sourceCount-unit table__scores-sourceCount-unit--empty">&nbsp;</div>
                        }
                        {
                            this.state.ucsdNtScoreAvailable
                                ? <div className={`table__scores-sourceCount-unit table__scores-sourceCount-unit--ucsd-nt`}>&nbsp;</div>
                                : <div className="table__scores-sourceCount-unit table__scores-sourceCount-unit--empty">&nbsp;</div>
                        }
                    </div>
                    {overallScore}
                    <span className="table__ellipses">⋮</span>
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
                        <tr className="table__scores-row">
                            <td className="table__scores-cell">
                                <strong>Overall</strong>
                            </td>
                            <td className="table__scores-cell">
                                <strong>{overallScore}</strong>
                            </td>
                        </tr>
                        {this.handlePopulateScores(this.props.data.scores)}
                        </tbody>
                    </table>

                </td>
            </tr>
        )
    }
}

export default SummaryTableRow;
