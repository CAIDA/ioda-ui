import { combineReducers } from "redux";
import getSearchResults from "../pages/search/SearchReducers";
import getNodeDetail from "../pages/result/ResultReducers";

const reducers = {
    getSearchResults,
    getNodeDetail
};

const rootReducer = combineReducers(reducers);

export default rootReducer;
