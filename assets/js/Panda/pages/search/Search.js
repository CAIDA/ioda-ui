import React, { Component } from 'react';
import { connect } from 'react-redux';
import {Link} from 'react-router-dom';
import { getSearchResults } from './SearchActions';
import { SearchRankWeights } from './SearchConstants';
import SearchbarComponent from "../../components/searchbar/SearchbarComponent";
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
        }
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
    }

    handleQueryExtraction = (searchQueryText, searchQueryFilter) => {
        this.setState({
            searchQuery: {
                text: searchQueryText,
                filter: searchQueryFilter
            }
        }, ()  => {
            this.handleSearch();
        });
    };

    handleSearch = () => {
        let searchRank = {
            "AS Rank": 0,
            "AS Relationship": 0,
            "BGPStream": 0,
            "HI-CUBE": 0,
            "Internet Health Report": 0,
            "IODA": 0,
            "ITDK": 0,
            "MANIC": 0,
            "Netacuity": 0
        };
        const searchBank = this.props.searchResults;
        console.log(searchBank);
        const searchTerm = this.state.searchQuery.text;
        console.log(searchTerm);

        // Scan through each dataset and attribute points based on search value matching a particular value for a key
        // as defined in the SearchConstants.js file.
        searchBank.filter(dataset => {
            let keysWhereMatchOccurs = [];
            // find keys where searchQuery exists in it's value
            function getKeyByValue(object, value) {
                keysWhereMatchOccurs.push(Object.keys(object).filter(key => object[key].includes(value)));
                let count = countMatchInstances(object, value);
                return [Object.keys(object).filter(key => object[key].includes(value)), count];
            }

            // Count number of instances searchQuery appears in value of key where it exists for dataset
            function countMatchInstances(object,value) {
                let relevantKeys = [];
                let description = 0;
                let name = 0;
                let tags = 0;
                Object.entries(keysWhereMatchOccurs).map(key => {
                    key[1].map(key => {
                        relevantKeys.push(key);
                    });
                });

                relevantKeys.forEach(key => {
                    let string = object[key];
                    if (key === "name") {
                        name += string.match(new RegExp(value, "g")).length;
                    }
                    if (key === "description") {
                        description += string.match(new RegExp(value, "g")).length;
                    }
                    if (key === "tags") {
                        tags += string.toString().match(new RegExp(value, "g")).length;
                    }
                });
                return {"nameCount": name, "descriptionCount": description, "tagsCount": tags};
            }

            // Dataset object level
            const datasetValues = getKeyByValue(dataset, searchTerm);
            const datasetMatchedKeys = datasetValues[0];
            const datasetKeyOccurrences = datasetValues[1];
            if (datasetMatchedKeys.includes("name")) {
                Object.keys(searchRank).forEach(key => {
                    if (key === dataset.name) {
                        searchRank[key] += (SearchRankWeights["dataset.name"] * datasetKeyOccurrences.nameCount);
                    }
                });
            }
            if (datasetMatchedKeys.includes("description")) {
                Object.keys(searchRank).forEach(key => {
                    if (key === dataset.name) {
                        searchRank[key] += (SearchRankWeights["dataset.description"] * datasetKeyOccurrences.descriptionCount);
                    }
                });
            }
            if (datasetMatchedKeys.includes("tags")) {
                Object.keys(searchRank).forEach(key => {
                    if (key === dataset.name) {
                        searchRank[key] += (SearchRankWeights["dataset.tags"] * datasetKeyOccurrences.tagsCount);
                    }
                });
            }

            // Run through Entities
            if (dataset.entities) {
                dataset.entities.map(entity => {
                    let keysWhereMatchOccurs = [];
                    function getKeyByValue(object, value) {
                        keysWhereMatchOccurs.push(Object.keys(object).filter(key => object[key].includes(value)));
                        let count = countMatchInstances(object, value);
                        return [Object.keys(object).filter(key => object[key].includes(value)), count];
                    }

                    function countMatchInstances(object,value) {
                        let relevantKeys = [];
                        let description = 0;
                        let id = 0;
                        Object.entries(keysWhereMatchOccurs).map(key => {
                            key[1].map(key => {
                                relevantKeys.push(key);
                            });
                        });

                        relevantKeys.forEach(key => {
                            let string = object[key];
                            if (key === "id") {
                                id += string.match(new RegExp(value, "g")).length;
                            }
                            if (key === "description") {
                                description += string.match(new RegExp(value, "g")).length;
                            }
                        });
                        return {"descriptionCount": description, "idCount": id};
                    }

                    // Entity object level
                    const entityValues = getKeyByValue(entity, searchTerm);
                    const entityMatchedKeys = entityValues[0];
                    const entityKeyOccurrences = entityValues[1];

                    if (entityMatchedKeys.includes("id")) {
                        Object.keys(searchRank).forEach(key => {
                            if (key === dataset.name) {
                                searchRank[key] += (SearchRankWeights["dataset.entity.id"] * entityKeyOccurrences.idCount);
                            }
                        });
                    }
                    if (entityMatchedKeys.includes("description")) {
                        Object.keys(searchRank).forEach(key => {
                            if (key === dataset.name) {
                                searchRank[key] += (SearchRankWeights["dataset.entity.description"] * entityKeyOccurrences.descriptionCount);
                            }
                        });
                    }



                    // Run through Features
                    if (entity.features) {
                        entity.features.map(feature => {
                            let keysWhereMatchOccurs = [];
                            function getKeyByValue(object, value) {
                                keysWhereMatchOccurs.push(Object.keys(object).filter(key => object[key].includes(value)));
                                let count = countMatchInstances(object, value);
                                return [Object.keys(object).filter(key => object[key].includes(value)), count];
                            }

                            function countMatchInstances(object,value) {
                                let relevantKeys = [];
                                let description = 0;
                                let id = 0;
                                Object.entries(keysWhereMatchOccurs).map(key => {
                                    key[1].map(key => {
                                        relevantKeys.push(key);
                                    });
                                });

                                relevantKeys.forEach(key => {
                                    let string = object[key];
                                    if (key === "id") {
                                        id += string.match(new RegExp(value, "g")).length;
                                    }
                                    if (key === "description") {
                                        description += string.match(new RegExp(value, "g")).length;
                                    }
                                });
                                return {"descriptionCount": description, "idCount": id};
                            }

                            // Entity object level
                            const featureValues = getKeyByValue(feature, searchTerm);
                            const featureMatchedKeys = featureValues[0];
                            const featureKeyOccurrences = featureValues[1];
                            if (featureMatchedKeys.includes("id")) {
                                Object.keys(searchRank).forEach(key => {
                                    if (key === dataset.name) {
                                        searchRank[key] += (SearchRankWeights["dataset.entity.feature.id"] * featureKeyOccurrences.idCount);
                                    }
                                });
                            }
                            if (datasetMatchedKeys.includes("description")) {
                                Object.keys(searchRank).forEach(key => {
                                    if (key === dataset.name) {
                                        searchRank[key] += (SearchRankWeights["dataset.entity.feature.description"] * featureKeyOccurrences.descriptionCount);
                                    }
                                });
                            }
                        });
                    }

                });
            }

            // Run through Joins
            if (dataset.joins) {
                dataset.joins.map(join => {
                    let keysWhereMatchOccurs = [];
                    function getKeyByValue(object, value) {
                        keysWhereMatchOccurs.push(Object.keys(object).filter(key => object[key].includes(value)));
                        let count = countMatchInstances(object, value);
                        return [Object.keys(object).filter(key => object[key].includes(value)), count];
                    }

                    function countMatchInstances(object,value) {
                        let relevantKeys = [];
                        let description = 0;
                        let entities = 0;
                        let label = 0;
                        Object.entries(keysWhereMatchOccurs).map(key => {
                            key[1].map(key => {
                                relevantKeys.push(key);
                            });
                        });

                        relevantKeys.forEach(key => {
                            let string = object[key];
                            if (key === "entities") {
                                entities += string.toString().match(new RegExp(value, "g")).length;
                            }
                            if (key === "label") {
                                label += string.match(new RegExp(value, "g")).length;
                            }
                            if (key === "description") {
                                description += string.match(new RegExp(value, "g")).length;
                            }
                        });
                        return {"descriptionCount": description, "entitiesCount": entities, "labelCount": label};
                    }

                    // Join object level
                    const joinValues = getKeyByValue(join, searchTerm);
                    const joinMatchedKeys = joinValues[0];
                    const joinKeyOccurrences = joinValues[1];

                    if (joinMatchedKeys.includes("entities")) {
                        Object.keys(searchRank).forEach(key => {
                            if (key === dataset.name) {
                                searchRank[key] += (SearchRankWeights["dataset.join.entities"] * joinKeyOccurrences.entitiesCount);
                            }
                        });
                    }
                    if (joinMatchedKeys.includes("description")) {
                        Object.keys(searchRank).forEach(key => {
                            if (key === dataset.name) {
                                searchRank[key] += (SearchRankWeights["dataset.join.description"] * joinKeyOccurrences.descriptionCount);
                            }
                        });
                    }
                    if (joinMatchedKeys.includes("label")) {
                        Object.keys(searchRank).forEach(key => {
                            if (key === dataset.name) {
                                searchRank[key] += (SearchRankWeights["dataset.join.label"] * joinKeyOccurrences.labelCount);
                            }
                        });
                    }
                });
            }
        });


        // Remove datasets that scored a 0
        let relevantSearchResults = [];
        Object.entries(searchRank).filter(dataset => {
            if (dataset[1] !== 0) {
                relevantSearchResults.push(dataset);
            }
        });
        relevantSearchResults.sort((a, b) => b[1] - a[1]);

        // console.log(relevantSearchResults);

        // Order remaining datasets by name with the most points attributed.
        let relevantSearchObjects = [];

        searchBank.map(dataset => {
           relevantSearchResults.forEach((key) => {
               if (dataset.name === key[0]) {
                   dataset.score = key[1];
                   relevantSearchObjects.push(dataset);
               }
           }) ;
        });

        // Sort results by new score key added in prior step
        const returnedResults = relevantSearchObjects.sort((a, b) => {
            return b.score - a.score;
        });
        // console.log(returnedResults);

        this.setState({
           searchResults: returnedResults
        });
    };

    render() {
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
                              {this.state.searchResults && this.state.searchResults.length}
                          </span>
                                <span className="search__legend-text">Datasets</span>
                            </div>
                            <div className="search__legend-item search__legend-item--papers">
                                <span className="search__legend-count">0</span>
                                <span className="search__legend-text">Papers</span>
                            </div>
                            <div className="search__legend-item search__legend-item--topics">
                                <span className="search__legend-count">0</span>
                                <span className="search__legend-text">Topics</span>
                            </div>
                            <div className="search__legend-item search__legend-item--entities">
                                <span className="search__legend-count">0</span>
                                <span className="search__legend-text">Entities</span>
                            </div>
                            <div className="search__legend-item search__legend-item--joins">
                                <span className="search__legend-count">0</span>
                                <span className="search__legend-text">Joins</span>
                            </div>
                        </div>
                    </div>
              </div>
              <div className="row">
                  <div className="col-1-of-1">
                      {this.state.searchResults &&
                        this.state.searchResults.map((result, index) => {
                           return  <div className={`search__result search__result--dataset`} key={index}>
                               <div className="search__result-headline">
                                   <p className="search__result-name">{result.name}</p>
                                   <p className="search__result-tags">{result.tags.map(tag => <span>{tag}</span>)}</p>
                               </div>
                               <div className="search__result-detail">
                                   <p className="search__result-description">{result.description}</p>
                                   <div className="search__result-entities">
                                       {
                                           result.entities && result.entities.map((entity, index) => {
                                               return <div className="search__result-entity" key={index}>
                                               <div className="search__result-entity-display">
                                                   <span className="search__result-entity-name">{entity.id} &mdash;</span>
                                                   <span className={entity.features.length - 1 > 0 ? "search__result-entity-feature" : "search__result-entity-feature u-margin-right"} >{entity.features[0].id}</span>
                                                   {
                                                       entity.features.length - 1 > 0 ? <span className="search__result-entity-feature-additional">, {entity.features.length - 1} more <span className="search__result-entity-feature-control">+</span></span> : null
                                                   }

                                               </div>
                                               <div className="search__result-entity-feature-modal">
                                                   {
                                                       entity.features.length > 1 && entity.features.map((feature, index) => {
                                                           return <p key={index}>
                                                               <span>{feature.id}</span>
                                                               {/*<span>{feature.description}</span>*/}
                                                           </p>;
                                                       })
                                                   }
                                               </div>
                                            </div>
                                           })
                                       }
                                       {

                                       }
                                   </div>

                                   <p className="search__result-joins">
                                       {
                                           result.joins && result.joins.map((join, index) => {
                                               return <span className="search__result-join" key={index}>{join.entities[0]} <span className="search__result-join-plus">&nbsp;+&nbsp;</span> {join.entities[1]}</span>
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
        searchResults: state.getSearchResults
    }
};

export default connect(mapStateToProps, { getSearchResults })(SearchFeed);
