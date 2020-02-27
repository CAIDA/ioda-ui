import { GET_SEARCH_RESULTS } from '../../constants/ActionTypes';
import { fetchData } from "../../services/FetchData";

const receiveSearchResults = (searchResults) => {
  return {
      type: GET_SEARCH_RESULTS,
      searchResults
  }
};

export const getSearchResults = (searchQuery) => {
    return function (dispatch) {
        fetchData(dispatch, searchQuery).then(data => {
            dispatch(receiveSearchResults(data.data))
        });

    }
};
