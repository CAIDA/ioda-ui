import React, { Component } from 'react';
import { createBrowserHistory } from 'history';
import SearchbarComponent from '../../components/searchbar/SearchbarComponent';

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
        event.persist();
        this.setState(prevState => ({
            searchQuery: {
                ...prevState.searchQuery,
                filter: event.target.value
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
                />
            </div>
        );
    }
}

export default Searchbar;
