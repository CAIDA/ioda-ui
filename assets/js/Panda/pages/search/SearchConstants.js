import SearchJson from "../../constants/SearchJson";
export const SearchResultsData = SearchJson;

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
