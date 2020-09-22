import {
    GET_SUGGESTED_SEARCH_RESULTS
} from '../../constants/ActionTypes';
import { fetchData } from "../../services/FetchData";

const receiveSuggestedSearchResults = (suggestedSearchResults) => {
    return {
        type: GET_SUGGESTED_SEARCH_RESULTS,
        suggestedSearchResults
    }
};

export const getSuggestedSearchResults = (searchQuery) => {
    return function (dispatch) {
        fetchData(dispatch, searchQuery).then(data => {
            dispatch(receiveSuggestedSearchResults(data.data))
        });
    }
};
