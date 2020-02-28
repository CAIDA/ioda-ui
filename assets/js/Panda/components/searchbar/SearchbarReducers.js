import { GET_SEARCHBAR_FILTERS } from '../../constants/ActionTypes';

export default function getSearchbarFilters(state = {}, action) {
    switch (action.type) {
        case GET_SEARCHBAR_FILTERS:
            return action;
        default:
            return state;
    }
};
