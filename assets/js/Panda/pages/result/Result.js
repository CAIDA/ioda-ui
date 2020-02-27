import React, { Component } from 'react';
import {
    nodeDetailConfig,
    getNodeDetail__Dataset,
    getNodeDetail__Entity,
    getNodeDetail__Join
} from "./ResultConstants";
import { searchApiFilter__All } from '../search/SearchConstants';
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
            console.log(`${this.props.match.params.type}:${this.props.match.params.name}`);
            console.log(this.state.searchId);
            console.log("1");
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
