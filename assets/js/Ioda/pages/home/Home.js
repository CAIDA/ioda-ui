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
import {Link} from 'react-router-dom';
import { searchbar } from 'caida-components-library';
import { connect } from 'react-redux';
import T from 'i18n-react';

const Card = partner => {
    // ToDo: Swap out images for sprite sheet
    return (
        <div className="card">
            <div className="card__headline">
                <img src="" alt={`${partner} logo`} className="card__headline-icon" />
                <h2 className="card__headline-text">
                    partner
                </h2>
            </div>
            <div className="card__content">
                <p className="card__text">serunt eos et hic illo itaque nihil placeat repellat.</p>
            </div>
        </div>
    );
};

const Example = country => {
  return (
    <div className="example">
        country
    </div>
  );
};

class Home extends Component {
    render() {
        return (
            <div className='home'>
                {/*<div className="home__hero u-full-max-width">*/}
                {/*    <div className="row">*/}

                {/*    </div>*/}
                {/*</div>*/}
                <div className="row search">
                    <div className="col-1-of-6"></div>
                    <div className="col-2-of-3">
                        <h2 className="section-header">
                            Jump to a Country, Region, or AS/ISP of Interest
                        </h2>

                        <p className="search__text">
                            or Continue to
                            <Link to="/">
                                Outages Dashboard >>
                            </Link>
                        </p>
                    </div>
                    <div className="col-1-of-6"></div>
                </div>
                <div className="row map">
                    <div className="col-3-of-4">
                        <h2 className="section-header">
                            Recent Outages
                        </h2>
                        <p className="map__text">Last 24 hours</p>
                        <div className="map__content">
                            map
                        </div>
                    </div>
                    <div className="col-1-of-4">
                        <h2 className="section-header">
                            Latest News
                        </h2>
                        <div className="map__feed">
                            feed
                        </div>
                    </div>
                </div>
                <div className="row about">
                    <div className="col-2-of-3">
                        <p className="about__text">
                            blurb
                        </p>
                        <Link to="/">
                            Outages Dashboard >>
                        </Link>
                    </div>
                </div>
                <div className="row examples">
                    <div className="col-1-of-1">
                        <Example country="iran"/>
                    </div>
                    <div className="col-1-of-1">
                        <Example country="iran"/>
                    </div>
                </div>
                <div className="row partners">
                    <div className="col-1-of-5">
                        <Card partner="otf"/>
                    </div>
                    <div className="col-1-of-5">
                        <Card partner="dhs"/>
                    </div>
                    <div className="col-1-of-5">
                        <Card partner="comcast"/>
                    </div>
                    <div className="col-1-of-5">
                        <Card partner="nsf"/>
                    </div>
                    <div className="col-1-of-5">
                        <Card partner="isoc"/>
                    </div>
                </div>
            </div>
        );
    }
}

export default Home;
