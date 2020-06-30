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
