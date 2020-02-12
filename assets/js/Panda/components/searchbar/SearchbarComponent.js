import React, { Component } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';


class SearchbarComponent extends Component {
    static propTypes = {
        onInputChange: PropTypes.func.isRequired,
        onSelectChange: PropTypes.func.isRequired,
        onSearch: PropTypes.func.isRequired
    };

    componentDidMount() {
        console.log("here");
        axios.get('http://localhost:4000/graphql?query={search(query:%22AS%22,selected:[DATASET]){name%20id}}')
        .then(response => {
            console.log(response.data);
        })
        .catch(error => {
            console.log(error);
        });
    }

    render() {
        return (
            <div className="searchbar__search">
                <div className="searchbar__search-bar">
                    <select defaultValue={this.props.currentSearchFilter || ''} onChange={this.props.onSelectChange} className="searchbar__search-filter">
                        <option>Filter For:</option>
                        <option disabled={true}>All</option>
                        <option disabled={true}>Papers</option>
                        <option disabled={true}>Topics</option>
                        <option>Data Sets</option>
                        <option disabled={true}>Entities</option>
                        <option disabled={true}>Joins</option>
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
