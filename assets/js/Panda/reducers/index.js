import { combineReducers } from "redux";
import getSearchResults from "../pages/search/SearchReducers";

const reducers = {
    getSearchResults
};

const rootReducer = combineReducers(reducers);

export default rootReducer;
