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
                <div className="search__legend-item search__legend-item--selections">
                    <span className="search__legend-letter">{Object.keys(this.props.searchResultCount)[5].charAt(0)}</span>
                    <span className="search__legend-count">
                        {this.props.searchResultCount.selection}
                    </span>
                    <span className="search__legend-text">Selections</span>
                </div>
            </div>
        );
    }
}

export default SearchLegend;
