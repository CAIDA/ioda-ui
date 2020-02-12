import { GET_SEARCH_RESULTS } from '../../constants/ActionTypes';

export const getSearchResults = (searchQuery) => {
    return {
        type: GET_SEARCH_RESULTS,
        payload: searchResults
    }
};
