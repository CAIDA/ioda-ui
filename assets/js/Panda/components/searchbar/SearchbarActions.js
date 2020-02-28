import { GET_SEARCHBAR_FILTERS } from '../../constants/ActionTypes';
import { fetchData } from "../../services/FetchData";

const receiveSearchbarFilters = (searchbarFilters) => {
    return {
        type: GET_SEARCHBAR_FILTERS,
        searchbarFilters
    }
};

export const getSearchbarFilters = (config) => {
    return function (dispatch) {
        fetchData(dispatch, config).then(data => {
            dispatch(receiveSearchbarFilters(data.data))
        });

    }
};
