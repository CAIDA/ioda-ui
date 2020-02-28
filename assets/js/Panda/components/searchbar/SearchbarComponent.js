import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { filterOptions } from "./SearchbarConstants";
import Select from 'react-select'


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
            options: false
        };
    }

    componentDidUpdate(prevProps) {
        if (this.props.searchbarFilters !== prevProps.searchbarFilters) {
            let newOptions = [];
            const options = [...this.props.searchbarFilters];
            options.map((option, index) => {
                option = {id: option.name, name: option.description.split(":")[0]};
                newOptions.push(option);
            });
            this.setState({
               options: newOptions
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
                    {
                        this.state.options &&
                        <select
                            onChange={this.props.onSelectChange}
                            className="searchbar__search-filter"
                            onMouseDown={() => this.handleInitialFilterDisable()}
                        >
                            {
                                this.state.options && this.state.options.map((option, index) => {
                                    console.log(this.state.options);
                                    return <option key={index} value={option.id}>{option.name}</option>
                                })
                            }
                            <option value={filterOptions.all}>All</option>
                        </select>
                    }

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
