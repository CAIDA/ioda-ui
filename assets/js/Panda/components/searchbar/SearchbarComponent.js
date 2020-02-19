import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { filterOptions } from "./SearchbarConstants";


class SearchbarComponent extends Component {
    static propTypes = {
        onInputChange: PropTypes.func.isRequired,
        onSelectChange: PropTypes.func.isRequired,
        onSearch: PropTypes.func.isRequired
    };

    constructor(props) {
        super(props);
        this.state = {
            initialFilterValue: false
        };
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
                    <select
                        onChange={this.props.onSelectChange}
                        className="searchbar__search-filter"
                        onMouseDown={() => this.handleInitialFilterDisable()}
                    >
                        <option disabled={this.state.initialFilterValue} value={filterOptions.all}>Filter For:</option>
                        <option value={filterOptions.all}>All</option>
                        <option value={filterOptions.paper}>Papers</option>
                        <option value={filterOptions.tag}>Tags</option>
                        <option value={filterOptions.dataset}>Data Sets</option>
                        <option value={filterOptions.entity}>Entities</option>
                        <option value={filterOptions.join}>Joins</option>
                    </select>
                    <input className="searchbar__search-input"
                           type="text" placeholder="Search For..."
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
