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

import PropTypes from 'prop-types';
import React from 'react';

import LinkA from 'Panda/components/linka';

import 'Panda/css/tile-grid.css';

const TILES_PER_ROW = 3;

class Tile extends React.Component {

    static propTypes = {
        to: PropTypes.string.isRequired,
        thumb: PropTypes.string.isRequired,
        isScreenshot: PropTypes.bool,
        title: PropTypes.string.isRequired,
        disabled: PropTypes.bool // TODO
    };

    static defaultProps = {
        isScreenshot: true,
        disabled: false
    };

    render () {
        return <LinkA to={this.props.to}>
            <div className={`tile col-md-${12/TILES_PER_ROW}`}>
                <div className=' panel panel-default'>
                    <div className="thumbnail panel-body">
                        <img src={this.props.thumb}
                             className={this.props.isScreenshot ? 'screenshot' : null}/>
                        <div className="caption text-center">
                            <h4>
                                {this.props.title}
                            </h4>
                            {this.props.children}
                        </div>
                    </div>
                </div>
            </div>
        </LinkA>;
    }
}

class TileGrid extends React.Component {

    static propTypes = {
        title: PropTypes.node
    };

    render() {
        let children = this.props.children.slice();
        let rows = [];
        while (children.length) {
            rows.push(children.splice(0, TILES_PER_ROW))
        }
        return <div className='tilegrid'>
            {this.props.title ? <h3>{this.props.title}</h3> : null }
            {rows.map((row, idx) => {
                return <div className="row" key={idx}>
                    {row}
                </div>
            })}
        </div>
    }
}

export {
    TileGrid,
    Tile
};
