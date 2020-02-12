import { GET_SEARCH_RESULTS } from '../../constants/ActionTypes';
import { SearchResultsData } from './SearchConstants';

export default function getSearchResults(state = SearchResultsData, action) {
    if (action.type === GET_SEARCH_RESULTS) {
        return action.payload;
    }

    return state;
};
