/*
 * This software is Copyright (c) 2013 The Regents of the University of
 * California. All Rights Reserved. Permission to copy, modify, and distribute this
 * software and its documentation for academic research and education purposes,
 * without fee, and without a written agreement is hereby granted, provided that
 * the above copyright notice, this paragraph and the following three paragraphs
 * appear in all copies. Permission to make use of this software for other than
 * academic research and education purposes may be obtained by contacting:
 *
 * Office of Innovation and Commercialization
 * 9500 Gilman Drive, Mail Code 0910
 * University of California
 * La Jolla, CA 92093-0910
 * (858) 534-5815
 * invent@ucsd.edu
 *
 * This software program and documentation are copyrighted by The Regents of the
 * University of California. The software program and documentation are supplied
 * "as is", without any accompanying services from The Regents. The Regents does
 * not warrant that the operation of the program will be uninterrupted or
 * error-free. The end-user understands that the program was developed for research
 * purposes and is advised not to rely exclusively on the program for any reason.
 *
 * IN NO EVENT SHALL THE UNIVERSITY OF CALIFORNIA BE LIABLE TO ANY PARTY FOR
 * DIRECT, INDIRECT, SPECIAL, INCIDENTAL, OR CONSEQUENTIAL DAMAGES, INCLUDING LOST
 * PROFITS, ARISING OUT OF THE USE OF THIS SOFTWARE AND ITS DOCUMENTATION, EVEN IF
 * THE UNIVERSITY OF CALIFORNIA HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH
 * DAMAGE. THE UNIVERSITY OF CALIFORNIA SPECIFICALLY DISCLAIMS ANY WARRANTIES,
 * INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
 * FITNESS FOR A PARTICULAR PURPOSE. THE SOFTWARE PROVIDED HEREUNDER IS ON AN "AS
 * IS" BASIS, AND THE UNIVERSITY OF CALIFORNIA HAS NO OBLIGATIONS TO PROVIDE
 * MAINTENANCE, SUPPORT, UPDATES, ENHANCEMENTS, OR MODIFICATIONS.
 */

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
