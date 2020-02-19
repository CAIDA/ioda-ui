import { GET_SEARCH_RESULTS } from '../../constants/ActionTypes';
import { SearchResultsData } from './SearchConstants';

export default function getSearchResults(state = {}, action) {
    switch (action.type) {
        case GET_SEARCH_RESULTS:
            return action;
        default:
            return state;
    }
};
