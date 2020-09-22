import {
    GET_SUGGESTED_SEARCH_RESULTS
} from '../../constants/ActionTypes';

export function getSuggestedSearchResults(state = {}, action) {
    switch (action.type) {
        case GET_SUGGESTED_SEARCH_RESULTS:
            return action;
        default:
            return state;
    }
};
