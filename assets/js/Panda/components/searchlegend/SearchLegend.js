import React, { Component } from 'react';

class SearchLegend extends Component {
    render() {
        return(
            <div className="search__legend">
                <div className="search__legend-item search__legend-item--datasets">
                    <span className="search__legend-letter">{Object.keys(this.props.searchResultCount)[0].charAt(0)}</span>
                    <span className="search__legend-count">
                        {this.props.searchResultCount.dataset}
                    </span>
                    <span className="search__legend-text">Datasets</span>
                </div>
                <div className="search__legend-item search__legend-item--papers">
                    <span className="search__legend-letter">{Object.keys(this.props.searchResultCount)[1].charAt(0)}</span>
                    <span className="search__legend-count">
                        {this.props.searchResultCount.paper}
                    </span>
                    <span className="search__legend-text">Papers</span>
                </div>
                <div className="search__legend-item search__legend-item--tags">
                    <span className="search__legend-letter">{Object.keys(this.props.searchResultCount)[2].charAt(0)}</span>
                    <span className="search__legend-count">
                        {this.props.searchResultCount.tag}
                    </span>
                    <span className="search__legend-text">Tags</span>
                </div>
                <div className="search__legend-item search__legend-item--entities">
                    <span className="search__legend-letter">{Object.keys(this.props.searchResultCount)[3].charAt(0)}</span>
                    <span className="search__legend-count">
                        {this.props.searchResultCount.entity}
                    </span>
                    <span className="search__legend-text">Entities</span>
                </div>
                <div className="search__legend-item search__legend-item--joins">
                    <span className="search__legend-letter">{Object.keys(this.props.searchResultCount)[4].charAt(0)}</span>
                    <span className="search__legend-count">
                        {this.props.searchResultCount.join}
                    </span>
                    <span className="search__legend-text">Joins</span>
                </div>
            </div>
        );
    }
}

export default SearchLegend;
