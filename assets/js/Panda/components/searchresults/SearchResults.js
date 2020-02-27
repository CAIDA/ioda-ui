import React, { Component } from 'react';
import {Link} from "react-router-dom";


class SearchResults extends Component {
    render() {
        console.log(this.props);
        return (
            this.props.results.map((result, index) => {
                return <div className={`search__result search__result--${result.id.split(/:(.+)/)[0]}`} key={index}>
                    <div className="search__result-left">
                        <span className="search__result-letter">{result.__typename}</span>
                        <div className="search__result-headline">
                            <Link to={`/result/${result.id.split(':')[0]}/${result.id.split(/:(.+)/)[1]}`}><p
                                className="search__result-name">{result.name}</p></Link>
                        </div>
                        <div className="search__result-detail">
                            <p className="search__result-description">{result.description}</p>
                            <div className="search__result-entities">
                                <div className="entity__detail">
                                    <div className="entity__feature">
                                        {
                                            result.features && result.features.map((feature, index) => {
                                                return <div className="entity__feature-item" key={index}>
                                                    <span>{feature.name}</span>
                                                </div>
                                            })
                                        }
                                    </div>
                                    <div className="entity__related">
                                        {
                                            result.datasets && result.datasets.length > 1
                                                ? <p className="entity__related-item">
                                                    <span
                                                        className="entity__related-item--dataset"><span>{result.datasets.length}</span> Datasets</span>
                                                </p>
                                                : result.datasets && result.datasets.length === 1
                                                ? <p className="entity__related-item">
                                                    <span
                                                        className="entity__related-item--dataset"><span>{result.datasets.length}</span> Dataset</span>
                                                </p>
                                                : null
                                        }
                                    </div>
                                </div>
                                {
                                    result.entities && result.entities.map((entity, index) => {
                                        return <div className="search__result-entity" key={index}>
                                            <div className="search__result-entity-display">
                                                <span className="search__result-entity-name">{entity.name}</span>
                                                {
                                                    entity.features
                                                        ? <div className="search__result-entity-additional">
                                                            <span>&mdash;</span><span
                                                            className={entity.features.length - 1 > 0 ? "search__result-entity-feature" : "search__result-entity-feature u-margin-right"}>{entity.features[0].name}</span>
                                                            {
                                                                entity.features.length - 1 > 0 ? <span
                                                                    className="search__result-entity-feature-additional">, {entity.features.length - 1} more <span
                                                                    className="search__result-entity-feature-control">+</span></span> : null
                                                            } </div>
                                                        : null
                                                }
                                            </div>
                                            {
                                                entity.features
                                                    ? <div className="search__result-entity-feature-modal">
                                                        {
                                                            entity.features.length > 1 && entity.features.map((feature, index) => {
                                                                return <span
                                                                    className="search__result-entity-feature-modal-item"
                                                                    key={index}>{feature.name}</span>;
                                                            })
                                                        }
                                                    </div>
                                                    : null
                                            }
                                        </div>
                                    })
                                }
                            </div>
                            <p className="search__result-joins">
                                {
                                    result.joins && result.joins.map((join, index) => {
                                        return <span className="search__result-join" key={index}>{join.entities[0].name}
                                            <span
                                                className="search__result-join-plus">&nbsp;+&nbsp;</span> {join.entities[1].name}</span>
                                    })
                                }
                            </p>
                        </div>
                    </div>
                    <div className="search__result-tags">{result.tags && result.tags.map((tag, index) => {
                        return <p key={index}>{tag.name}</p>
                    })}
                    </div>
                </div>
            })
        );
    }
}

export default SearchResults;
