/*
 * This software is Copyright (c) 2013 The Regents of the University of
 * California. All Rights Reserved. Permission to copy, modify, and distribute this
 * software and its documentation for academic research and education purposes,
 * without fee, and without a written agreement is hereby granted, provided that
 * the above copyright notice, this paragraph and the following three paragraphs
 * appear in all copies. Permission to make use of this software for other than
 * academic research and education purposes may be obtained by contacting:
 *
 * Office of Innovation and Commercialization
 * 9500 Gilman Drive, Mail Code 0910
 * University of California
 * La Jolla, CA 92093-0910
 * (858) 534-5815
 * invent@ucsd.edu
 *
 * This software program and documentation are copyrighted by The Regents of the
 * University of California. The software program and documentation are supplied
 * "as is", without any accompanying services from The Regents. The Regents does
 * not warrant that the operation of the program will be uninterrupted or
 * error-free. The end-user understands that the program was developed for research
 * purposes and is advised not to rely exclusively on the program for any reason.
 *
 * IN NO EVENT SHALL THE UNIVERSITY OF CALIFORNIA BE LIABLE TO ANY PARTY FOR
 * DIRECT, INDIRECT, SPECIAL, INCIDENTAL, OR CONSEQUENTIAL DAMAGES, INCLUDING LOST
 * PROFITS, ARISING OUT OF THE USE OF THIS SOFTWARE AND ITS DOCUMENTATION, EVEN IF
 * THE UNIVERSITY OF CALIFORNIA HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH
 * DAMAGE. THE UNIVERSITY OF CALIFORNIA SPECIFICALLY DISCLAIMS ANY WARRANTIES,
 * INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
 * FITNESS FOR A PARTICULAR PURPOSE. THE SOFTWARE PROVIDED HEREUNDER IS ON AN "AS
 * IS" BASIS, AND THE UNIVERSITY OF CALIFORNIA HAS NO OBLIGATIONS TO PROVIDE
 * MAINTENANCE, SUPPORT, UPDATES, ENHANCEMENTS, OR MODIFICATIONS.
 */

import React, { Component } from 'react';
import {
    nodeDetailConfig,
    getNodeDetail__Dataset,
    getNodeDetail__Entity,
    getNodeDetail__Join
} from "./ResultConstants";
import { searchApiFilter__All } from '../search-result/SearchConstants';
import { getNodeDetail } from "./ResultActions";
import {connect} from "react-redux";
import {Link} from 'react-router-dom';
import ReactHtmlParser from 'react-html-parser';
import SearchResults from "../../components/searchresults/SearchResults";


class Result extends Component {
    constructor(props) {
        super(props);
        this.state = {
            nodeDetail: null,
            searchResults: null,
            searchId: null
        };
    }

    componentDidMount() {
        this.handleNewIdGeneration();
    }

    handleNewIdGeneration = () => {
        let id = `${this.props.match.params.type}:${this.props.match.params.type === "join"
            ? this.props.match.params.name.replace("+", "\+")
            : this.props.match.params.type === "selection"
                ? this.props.match.params.name.replace("?", "\?")
                : this.props.match.params.name
        }`;
        this.fetchNodeDetail(id);
        this.setState({
            searchId: id
        });
    };

    fetchNodeDetail = (id) => {
        let { getNodeDetailData } = this.props;
        const apiCall = Object.assign(nodeDetailConfig);
        apiCall.url = `{
            nodes (ids:["${id}"]) {
                id
                name
                description
                __typename
                ${this.props.match.params.type === "dataset" ? getNodeDetail__Dataset
                    : this.props.match.params.type === "entity" ? getNodeDetail__Entity
                    : this.props.match.params.type === "join" ? getNodeDetail__Join
                    : this.props.match.params.type === "paper" ? ``
                    : this.props.match.params.type === "tag" ? ``
                    : this.props.match.params.type === "selection" ? ``
                    : null
                }
            }
            search(query:"${id}") {
                name
                id
                __typename
                description
                tags {
                    name
                }
                ${searchApiFilter__All}
            }
        }`;
        console.log(decodeURIComponent(apiCall.url));
        getNodeDetailData(apiCall);
    };

    componentDidUpdate(prevProps) {
        if (`${this.props.match.params.type}:${this.props.match.params.name}` !== this.state.searchId) {
            this.handleNewIdGeneration();
        }

        if (this.props.nodeDetail !== prevProps.nodeDetail) {
            this.setState({
                nodeDetail: this.props.nodeDetail.data.nodes[0],
                searchResults: this.props.nodeDetail.data.search
            }, () => {
                console.log(this.state.nodeDetail);
            });
        }
    }

    render() {
        if ( !this.state.nodeDetail ) {
            return <div />
        }
        console.log(this.state.nodeDetail);
        return (
            <div className="result">
                <div className="row">
                    {
                        this.state.nodeDetail &&
                        <div className={`result__node result__node--${this.state.nodeDetail.__typename.toLowerCase()}`}>
                            <span className="search__result-letter">{this.state.nodeDetail.__typename}</span>
                            <p className={`result__node-id result__node-id--${this.state.nodeDetail.__typename.toLowerCase()}`}>{this.state.nodeDetail.id}</p>
                            <p className="result__node-name">{this.state.nodeDetail.name}</p>
                            <div className="result__node-desc">
                                {
                                    this.state.nodeDetail.__typename === 'Selection'
                                    ? ReactHtmlParser(this.state.nodeDetail.description)
                                    : this.state.nodeDetail.description
                                }
                            </div>
                            {
                                this.state.nodeDetail.interfaces && this.state.nodeDetail.interfaces.map((interfaces, index) => {
                                    return <div key={index}>
                                        <p>
                                            <a href={interfaces.url}>
                                                {interfaces.type}
                                            </a>
                                            <span style={{marginLeft: '10px'}}>status: {interfaces.status}</span>
                                        </p>
                                    </div>;
                                })

                            }
                        </div>
                    }
                </div>
                <div className="row">
                    <p className="result__query">
                        <Link to={`/search?__query=${this.state.searchId}&__filter=`}>
                            query:"{this.state.searchId}"
                        </Link>
                    </p>
                    {
                        this.state.searchResults &&
                        <SearchResults results={this.state.searchResults}/>
                    }
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        nodeDetail: state.getNodeDetail.id
    }
};

const mapDispatchToProps = (dispatch) => {
    return {
        getNodeDetailData: (nodeDetailConfig) => {
            dispatch(getNodeDetail(nodeDetailConfig))
        }
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(Result);
