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
import PropTypes from 'prop-types';
import { filterOptions } from "./SearchbarConstants";
import { Multiselect } from 'multiselect-react-dropdown';


class SearchbarComponent extends Component {
    static propTypes = {
        onInputChange: PropTypes.func.isRequired,
        onSelectChange: PropTypes.func.isRequired,
        onSearch: PropTypes.func.isRequired
    };

    constructor(props) {
        super(props);
        this.state = {
            initialFilterValue: false,
            options: null,
            selectedValues: {cat: "", key: "All Data Types"}
        };
    }

    componentDidUpdate(prevProps) {
        if (this.props.searchbarFilters !== prevProps.searchbarFilters) {
            let newOptions = [];
            const options = [...this.props.searchbarFilters];
            options.map((option, index) => {
                option = {cat: option.name, key: option.description.split(":")[0]};
                newOptions.push(option);
            });
            newOptions.push({cat: "", key: "All Data Types"});
            this.setState({
               options: newOptions,
                defaultOption: [newOptions[0]]
            });
        }
    }

    handleInitialFilterDisable() {
        this.setState({
           initialFilterValue: true
        });
    }

    render() {
        return (
            <div className="searchbar__search">

                <div className="searchbar__search-bar">
                    <input className="searchbar__search-input"
                           type="text" placeholder="Papers, Presentations, Datasets, Tools, Questions..."
                           onChange={this.props.onInputChange}
                           defaultValue={this.props.currentSearchQuery || ''}
                           onKeyDown={(event) => this.props.onSearch(event)}
                    />
                    <button onClick={this.props.onSearch} className="searchbar__search-button"><span className="glyphicon glyphicon-search"/></button>
                </div>
                <div className="searchbar__search-label">
                    <label>Find your data</label>
                </div>
            </div>
        );
    }
}

export default SearchbarComponent;
