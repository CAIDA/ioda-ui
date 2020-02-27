import React, { Component } from 'react';
import { connect } from 'react-redux';
import { getSearchResults } from './SearchActions';
import {
    searchResultsConfig,
    searchApiFilter__All,
    searchApiFilter__Dataset,
    searchApiFilter__Entity,
    searchApiFilter__Join,
    searchApiFilter__Paper,
    searchApiFilter__Tag
} from './SearchConstants';
import Searchbar from "../../components/searchbar/Searchbar";
import SearchResults from "../../components/searchresults/SearchResults";
import SearchLegend from "../../components/searchlegend/SearchLegend";

class SearchFeed extends Component {
    constructor(props) {
        super(props);
        this.state = {
            searchQuery: {
                text: null,
                filter: null
            },
            searchResults: null
        };
        this.searchQueryText = '';
        this.searchQueryFilter = '';
    }

    componentDidMount() {
        let queryStringArray = this.props.location.search.split("__");
        let searchQueryText = decodeURI(queryStringArray[1].slice(queryStringArray[1].indexOf("=") + 1).slice(0,-1));
        let searchQueryFilter = decodeURI(queryStringArray[2].slice(queryStringArray[2].indexOf("=") + 1));
        this.handleQueryExtraction(searchQueryText, searchQueryFilter);
        this.searchQueryText = searchQueryText;
        this.searchQueryFilter = searchQueryFilter;
        this.fetchSearchResults(searchQueryText, searchQueryFilter);
    }

    buildQuery = (searchQueryText, searchQueryFilter) => {
        return `{
            search(
                query:%22${searchQueryText}%22,selected:[${searchQueryFilter}]){
                    name%20
                    id%20
                    score%20
                    __typename%20
                    tags {
                        name
                    }
                    ${ searchQueryFilter === '' ? searchApiFilter__All
                        : searchQueryFilter === 'DATASET' ? searchApiFilter__Dataset
                        : searchQueryFilter === 'ENTITY' ? searchApiFilter__Entity
                        : searchQueryFilter === 'JOIN' ? searchApiFilter__Join
                        : searchQueryFilter === 'PAPER' ? searchApiFilter__Paper
                        : searchQueryFilter === 'TAG' ? searchApiFilter__Tag
                        : searchQueryFilter === 'SOLUTION' ? ``
                        : null
                    }
                }
            }`;
    };

    fetchSearchResults = (searchQueryText, searchQueryFilter) => {
        let { getSearchResultsData } = this.props;
        const apiCall = Object.assign(searchResultsConfig);
        apiCall.url = this.buildQuery(searchQueryText, searchQueryFilter);
        getSearchResultsData(apiCall);
    };

    handleQueryExtraction = (searchQueryText, searchQueryFilter) => {
        this.setState({
            searchQuery: {
                text: searchQueryText,
                filter: searchQueryFilter
            }
        });
    };

    componentDidUpdate(prevProps) {
        if (this.props.searchResults !== prevProps.searchResults) {
            this.setState({
               searchResults: this.props.searchResults.data.search
            });
        }
    }

    render() {
        let searchResultCount = {
            dataset: 0,
            paper: 0,
            tag: 0,
            entity: 0,
            join: 0
        };

        this.props.searchResults && this.props.searchResults.data.search.map((result) => {
            console.log(result);
            switch (result.id.split(":")[0]) {
                case "dataset":
                    searchResultCount.dataset++;
                    break;
                case "paper":
                    searchResultCount.paper++;
                    break;
                case "tag":
                    searchResultCount.tag++;
                    break;
                case "entity":
                    searchResultCount.entity++;
                    break;
                case "join":
                    searchResultCount.join++;
                    break;
                default:
                    break;
            }
        });

        return (
            <div className="search">
                <div className="row">
                    <div className="search__menu">
                        {
                            this.state.searchQuery.text!== null && this.state.searchQuery.filter !== null &&
                            <Searchbar
                                searchQueryText={this.searchQueryText}
                                searchQueryFilter={this.searchQueryFilter}
                            />
                        }
                        <SearchLegend searchResultCount={searchResultCount} />
                    </div>
              </div>
              <div className="row">
                  <div className="col-1-of-1">
                      {
                          this.state.searchResults !== null && <SearchResults results={this.state.searchResults} />
                      }
                      {
                          this.state.searchResults && this.state.searchResults.length === 0 &&
                              <div className="search__no-result">
                                  No Results
                              </div>
                      }
                  </div>
              </div>
          </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        searchResults: state.getSearchResults.searchResults
    }
};

const mapDispatchToProps = (dispatch) => {
    return {
        getSearchResultsData: (searchResultsConfig) => {
            dispatch(getSearchResults(searchResultsConfig))
        }
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(SearchFeed);
