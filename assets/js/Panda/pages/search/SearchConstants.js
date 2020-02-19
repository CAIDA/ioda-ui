import SearchJson from "../../constants/SearchJson";
export const SearchResultsData = SearchJson;

export const searchResultsConfig = {
    method: "get",
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

export const searchApiFilter__All = `... on%20 Entity {
                            name%20
                            id%20
                            nameLong%20
                            description%20
                            features {
                                name%20
                                description
                            }
                            tags {
                                name
                            }
                            datasets {
                                id
                            }
                        }
                        ... on%20 Dataset {
                            description%20
                            joins {
                                entities {
                                    name
                                }
                            }
                            entities {
                                name%20
                                features {
                                    name%20
                                    description
                                }
                            }
                        }
                        ... on%20 Paper {
                            name%20
                            id%20
                            tags {
                                name
                            }
                            datasets {
                                id
                            }
                        }
                        ... on%20 Join {
                            name%20
                            id%20
                            label%20
                            entities {
                                name%20
                                id
                            }
                        }
                        ... on%20 Tag {
                            name%20
                            id
                        }`;

export const searchApiFilter__Dataset = `... on%20 Dataset {
                            description%20
                            joins {
                                entities {
                                    name
                                }
                            }
                            entities {
                                name%20
                                features {
                                    name%20
                                    description
                                }
                            }
                        }`;

export const searchApiFilter__Entity = `... on%20 Entity {
                            name%20
                            id%20
                            description%20
                            features {
                                name%20
                                description
                            }
                            tags {
                                name
                            }
                            datasets {
                                id
                            }
                        }`;

export const searchApiFilter__Join = `... on%20 Join {
                            name%20
                            id%20
                            label%20
                            entities {
                                name%20
                                id
                            }
                        }`;

export const searchApiFilter__Paper = `...on%20 Paper {
                            name%20
                            id%20
                            tags {
                                name
                            }
                            datasets {
                                id
                            }
                        }`;

export const searchApiFilter__Tag = `...on%20 Tag {
                            name%20
                            id
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
    return returnedResults;
};
