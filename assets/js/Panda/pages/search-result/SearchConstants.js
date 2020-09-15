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

import SearchJson from "../../constants/SearchJson";
export const SearchResultsData = SearchJson;

export const searchResultsConfig = {
    method: "post",
    url: ""
};

export const SearchRankWeights = {
    "dataset.name" : 2,
    "dataset.description" : 1,
    "dataset.tags" : 8,

    "dataset.entity.id" : 34,
    "dataset.entity.description": 5,

    "dataset.entity.feature.id" : 21,
    "dataset.entity.feature.description": 21,

    "dataset.join.entities": 34,
    "dataset.join.label": 13,
    "dataset.join.description": 3
};

export const searchApiFilter__All = `... on Entity {
                            name
                            id
                            description
                            features {
                                name
                                description
                            }
                            tags {
                                name
                            }
                            datasets {
                                id
                            }
                        }
                        ... on Dataset {
                            description
                            joins {
                                entities {
                                    name
                                }
                            }
                            entities {
                                name
                                features {
                                    name
                                    description
                                }
                            }
                        }
                        ... on Paper {
                            name
                            id
                            tags {
                                name
                            }
                            datasets {
                                id
                            }
                        }
                        ... on Join {
                            name
                            id
                            label
                            entities {
                                name
                                id
                            }
                        }
                        ... on Tag {
                            name
                            id
                        }`;

export const searchApiFilter__Dataset = `... on Dataset {
                            description
                            joins {
                                entities {
                                    name
                                }
                            }
                            entities {
                                name
                                features {
                                    name
                                    description
                                }
                            }
                        }`;

export const searchApiFilter__Entity = `... on Entity {
                            name
                            id
                            description
                            features {
                                name
                                description
                            }
                            tags {
                                name
                            }
                            datasets {
                                id
                            }
                        }`;

export const searchApiFilter__Join = `... on Join {
                            name
                            id
                            label
                            entities {
                                name
                                id
                            }
                        }`;

export const searchApiFilter__Paper = `...on Paper {
                            name
                            id
                            description
                            tags {
                                name
                            }
                            datasets {
                                id
                            }
                        }`;

export const searchApiFilter__Tag = `...on Tag {
                            name
                            id
                        }`;

export const searchApiFilter__Selection = `...on Selection {
                          query
                          ids
                        }`;

// Deprecated
export const handleSearch = (searchResults, searchQueryText) => {
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
    const searchBank = searchResults;
    const searchTerm = searchQueryText;

    // Scan through each dataset and attribute points based on search-result value matching a particular value for a key
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
    return returnedResults;
};