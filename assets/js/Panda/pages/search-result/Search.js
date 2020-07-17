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
import { connect } from 'react-redux';
import { getSearchResults } from './SearchActions';
import {
    searchResultsConfig,
    searchApiFilter__All,
    searchApiFilter__Dataset,
    searchApiFilter__Entity,
    searchApiFilter__Join,
    searchApiFilter__Paper,
    searchApiFilter__Tag,
    searchApiFilter__Selection
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
                query:"${searchQueryText}",selected:[${searchQueryFilter}]){
                    name
                    id
                    score
                    __typename
                    tags {
                        name
                    }
                    ${ searchQueryFilter === '' ? searchApiFilter__All
                        : searchQueryFilter.includes('DATASET') ? searchApiFilter__Dataset
                        : searchQueryFilter.includes('ENTITY') ? searchApiFilter__Entity
                        : searchQueryFilter.includes('JOIN') ? searchApiFilter__Join
                        : searchQueryFilter.includes('PAPER') ? searchApiFilter__Paper
                        : searchQueryFilter.includes('TAG') ? searchApiFilter__Tag
                        : searchQueryFilter.includes('SELECTION') ? searchApiFilter__Selection
                        : null
                    }
                }
            }`;
    };

    fetchSearchResults = (searchQueryText, searchQueryFilter) => {
        let { getSearchResultsData } = this.props;
        const apiCall = Object.assign(searchResultsConfig);
        apiCall.url = this.buildQuery(searchQueryText, searchQueryFilter);
        console.log(apiCall.url);
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
            join: 0,
            selection: 0
        };

        this.props.searchResults && this.props.searchResults.data.search.map((result) => {
            switch (result.id.split(/:(.+)/)[0]) {
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
                case "selection":
                    searchResultCount.selection++;
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
