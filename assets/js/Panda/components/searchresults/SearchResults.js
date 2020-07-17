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
import {Link} from "react-router-dom";
import ReactHtmlParser from "react-html-parser";


class SearchResults extends Component {
    render() {
        return (
            this.props.results.map((result, index) => {
                return <div className={`search__result search__result--${result.id.split(/:(.+)/)[0]}`} key={index}>
                    <div className="search__result-left">
                        <span className="search__result-letter">{result.__typename}</span>
                        <div className="search__result-headline">
                            <Link to={`/result/${result.id.split(/:(.+)/)[0]}/${result.id.split(/:(.+)/)[1]}`}><p
                                className="search__result-name">{result.name}</p></Link>
                        </div>
                        <div className="search__result-detail">
                            <div className="search__result-description">
                                {
                                    result.__typename === 'Selection'
                                        ? ReactHtmlParser(result.description)
                                        : result.description

                                }
                            </div>
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
