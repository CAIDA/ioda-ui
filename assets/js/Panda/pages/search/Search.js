import React, { Component } from 'react';
import { connect } from 'react-redux';
import {Link} from 'react-router-dom';
import { getSearchResults } from './SearchActions';
import {
    searchResultsConfig,
    SearchApiFilter__All,
    searchApiFilter__Dataset,
    searchApiFilter__Entity,
    searchApiFilter__Join,
    searchApiFilter__Paper,
    searchApiFilter__Tag
} from './SearchConstants';
import Searchbar from "../../components/searchbar/Searchbar";

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

    fetchSearchResults = (searchQueryText, searchQueryFilter) => {
        let { getSearchResultsData } = this.props;
        const apiCall = Object.assign(searchResultsConfig);
        apiCall.url = `{
            search(
                query:%22${searchQueryText}%22,selected:[${searchQueryFilter}]){
                    name%20
                    id%20
                    score%20
                    tags {
                        name
                    }
                    ${ searchQueryFilter === '' ? SearchApiFilter__All
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
                        <div className="search__legend">
                            <div className="search__legend-item search__legend-item--datasets">
                                <span className="search__legend-count">
                                    {searchResultCount.dataset}
                                </span>
                                <span className="search__legend-text">Datasets</span>
                            </div>
                            <div className="search__legend-item search__legend-item--papers">
                                <span className="search__legend-count">
                                    {searchResultCount.paper}
                                </span>
                                <span className="search__legend-text">Papers</span>
                            </div>
                            <div className="search__legend-item search__legend-item--tags">
                                <span className="search__legend-count">
                                    {searchResultCount.tag}
                                </span>
                                <span className="search__legend-text">Tags</span>
                            </div>
                            <div className="search__legend-item search__legend-item--entities">
                                <span className="search__legend-count">
                                    {searchResultCount.entity}
                                </span>
                                <span className="search__legend-text">Entities</span>
                            </div>
                            <div className="search__legend-item search__legend-item--joins">
                                <span className="search__legend-count">
                                    {searchResultCount.join}
                                </span>
                                <span className="search__legend-text">Joins</span>
                            </div>
                        </div>
                    </div>
              </div>
              <div className="row">
                  <div className="col-1-of-1">
                      {this.state.searchResults !== null && this.state.searchResults.map((result, index) => {
                           return  <div className={`search__result search__result--${result.id.split(":")[0]}`} key={index}>
                               <div className="search__result-headline">
                                   <p className="search__result-name">{result.name}</p>
                                   <p className="search__result-tags">{result.tags && result.tags.map((tag, index) => {
                                       return <span key={index}>{tag.name}</span>
                                        })}
                                   </p>
                               </div>
                               <div className="search__result-detail">
                                   <p className="search__result-description">{result.description}</p>
                                   <div className="search__result-entities">
                                       <div className="entity__detail">
                                           <div className="entity__feature">
                                               {
                                                   result.features && result.features.map((feature, index) => {
                                                       return <div className="entity__feature-item" key={index}>
                                                           <span>{feature.name}</span>
                                                       </div>
                                                   })
                                               }
                                           </div>
                                           <div className="entity__related">
                                               {
                                                   result.datasets && result.datasets.length > 1
                                                       ? <p className="entity__related-item">
                                                           <span className="entity__related-item--dataset"><span>{result.datasets.length}</span> Datasets</span>
                                                       </p>
                                                       : result.datasets && result.datasets.length === 1
                                                       ? <p className="entity__related-item">
                                                           <span className="entity__related-item--dataset"><span>{result.datasets.length}</span> Dataset</span>
                                                       </p>
                                                       : null
                                               }
                                           </div>
                                       </div>
                                       {
                                           result.entities && result.entities.map((entity, index) => {
                                               return <div className="search__result-entity" key={index}>
                                               <div className="search__result-entity-display">
                                                   <span className="search__result-entity-name">{entity.name}</span>
                                                   {
                                                       entity.features
                                                           ? <div className="search__result-entity-additional"><span>&mdash;</span><span className={entity.features.length - 1 > 0 ? "search__result-entity-feature" : "search__result-entity-feature u-margin-right"} >{entity.features[0].name}</span>
                                                           {
                                                               entity.features.length - 1 > 0 ? <span className="search__result-entity-feature-additional">, {entity.features.length - 1} more <span className="search__result-entity-feature-control">+</span></span> : null
                                                           } </div>
                                                           : null
                                                   }


                                               </div>
                                                   {
                                                       entity.features
                                                       ? <div className="search__result-entity-feature-modal">
                                                           {
                                                               entity.features.length > 1 && entity.features.map((feature, index) => {
                                                                   return <span className="search__result-entity-feature-modal-item" key={index}>{feature.name}</span>;
                                                               })
                                                           }
                                                           </div>
                                                       : null
                                                   }
                                            </div>
                                           })
                                       }
                                   </div>
                                   <p className="search__result-joins">
                                       {
                                           result.joins && result.joins.map((join, index) => {
                                               return <span className="search__result-join" key={index}>{join.entities[0].name} <span className="search__result-join-plus">&nbsp;+&nbsp;</span> {join.entities[1].name}</span>
                                           })
                                       }
                                   </p>
                               </div>
                           </div>;
                        })
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
}

export default connect(mapStateToProps, mapDispatchToProps)(SearchFeed);
