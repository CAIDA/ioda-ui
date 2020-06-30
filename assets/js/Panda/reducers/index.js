import { combineReducers } from "redux";
import getSearchResults from "../pages/search-result/SearchReducers";
import getNodeDetail from "../pages/result-detail/ResultReducers";
import getSearchbarFilters from "../components/searchbar/SearchbarReducers";

const reducers = {
    getSearchbarFilters,
    getSearchResults,
    getNodeDetail
};

const rootReducer = combineReducers(reducers);

export default rootReducer;
