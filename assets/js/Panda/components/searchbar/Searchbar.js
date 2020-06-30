import React, { Component } from 'react';
import {connect} from "react-redux";
import { createBrowserHistory } from 'history';
import SearchbarComponent from '../../components/searchbar/SearchbarComponent';
import { getSearchbarFilters } from './SearchbarActions';
import { searchbarFiltersConfig } from './SearchbarConstants';


const history = createBrowserHistory({ forceRefresh:true });


class Searchbar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            searchQuery: {
                text: "",
                filter: ""
            }
        }
    }

    componentDidMount() {
        this.fetchSearchFilters();
    }

    fetchSearchFilters = () => {
        let { getSearchbarFiltersData } = this.props;
        const apiCall = Object.assign(searchbarFiltersConfig);
        getSearchbarFiltersData(apiCall);
    };

    componentDidUpdate(prevProps) {
        if (this.props.searchbarFilters !== prevProps.searchbarFilters) {
            this.setState({
                searchbarFilters: this.props.searchbarFilters.data.__type.enumValues
            });
        }
    }

    handleInputChange = (event) => {
        event.persist();
        this.setState(prevState => ({
            searchQuery: {
                ...prevState.searchQuery,
                text: event.target.value
            }
        }));
    };

    handleSelectChange = (event) => {
        // event.persist();
        console.log(event);
        let filters = [];
        event.map(filter => {filters.push(filter.cat)});
        console.log(filters);
        this.setState(prevState => ({
            searchQuery: {
                ...prevState.searchQuery,
                filter: filters.toString()
            }
        }));
    };

    handleSearch = (event) => {
        if(event.key === 'Enter') {
            history.push(`/search?__query=${this.state.searchQuery.text}&__filter=${this.state.searchQuery.filter}`);
        }

        if (event.target.value === undefined) {
            history.push(`/search?__query=${this.state.searchQuery.text}&__filter=${this.state.searchQuery.filter}`);
        }
    };

    render() {
        return (
            <div className="searchbar">
                <SearchbarComponent onSelectChange={this.handleSelectChange}
                                    onInputChange={this.handleInputChange}
                                    onSearch={this.handleSearch}
                                    currentSearchQuery={this.props.searchQueryText}
                                    currentSearchFilter={this.props.searchQueryFilter}
                                    searchbarFilters={this.state.searchbarFilters}
                />
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        searchbarFilters: state.getSearchbarFilters.searchbarFilters
    }
};

const mapDispatchToProps = (dispatch) => {
    return {
        getSearchbarFiltersData: (searchbarFiltersConfig) => {
            dispatch(getSearchbarFilters(searchbarFiltersConfig))
        }
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(Searchbar);
