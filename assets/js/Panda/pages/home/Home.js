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
import heroImg from "images/home__laptop-with-data.jpg";
import sprite from "images/sprite.svg"
import chevron from "images/SVG/chevron-right.svg";
import { bindActionCreators } from "redux";
import { createBrowserHistory } from 'history';
import { connect } from 'react-redux';
import SearchbarComponent from '../../components/searchbar/SearchbarComponent';
import Searchbar from "../../components/searchbar/Searchbar";
import T from 'i18n-react';

const history = createBrowserHistory({ forceRefresh:true });

const Card = ({title, icon}) => {
    return (
        <div className="card">
            <div className="card__headline">
                {/*<img src={chevron} alt={title} className="card__headline-icon" />*/}
                <svg className="card__headline-icon">
                    <use xlinkHref={`${sprite}#icon-${icon}`} />
                </svg>
                <h2 className="card__headline-text">
                    {title}
                </h2>
            </div>
            <div className="card__content">
                Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aperiam esse natus quasi. Beatae deserunt eos et hic illo itaque nihil placeat repellat.
            </div>
            <div className="card__action">
                <button className="card__action-button">query {title} Data »</button>
            </div>
        </div>
    );
};

class Home extends Component {
    render() {
        let heroStyle = {backgroundImage: `linear-gradient(#6fa2b3, #2d6a7e), linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${heroImg})`};
        return (
            <div className='home'>
                <div className="home__hero u-full-max-width" style={heroStyle}>
                    <div className="row">
                        <div className="col-2-of-5">
                            <div className="home__hero-headline">
                                <h1 className="home__hero-text">
                                    <T.span text='home.title'/>
                                    A Platform for Applied Network Data Analysis
                                </h1>
                            </div>
                        </div>
                        <div className="col-3-of-5">
                            <T.p texts="subheader"/>
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col-1-of-1">
                        <Searchbar />
                        <T.p texts="home.subheader"/>
                    </div>
                </div>
                <div className="row home__query">
                    <div className="col-1-of-1">
                        <h3 className="section-header">Search query Builder</h3>
                        <p className="home__query-description">Not sure what to search for? Craft a search query to help you find data about the internet.</p>
                        <div className="row">
                            <div className="col-1-of-2">

                            </div>
                        </div>
                    </div>
                </div>
                <div className="row row__card">
                    <div className="col-1-of-3">
                        <Card
                            title="Structure"
                            icon="cross"
                            content="Covers internet topology, AS level, and AS2Org"
                        />
                    </div>
                    <div className="col-1-of-3">
                        <Card
                            title="Performance"
                            icon="meter"
                        />
                    </div>
                    <div className="col-1-of-3">
                        <Card
                            title="Security"
                            icon="shield"
                        />
                    </div>
                </div>
                <div className="row row__card">
                    <div className="col-1-of-3">
                        <Card
                            title="Naming"
                            icon="drive_file_rename_outline"
                        />
                    </div>
                    <div className="col-1-of-3">
                        <Card
                            title="Routing"
                            icon="flow-branch"
                        />
                    </div>
                    <div className="col-1-of-3">
                        <Card
                            title="Traffic"
                            icon="cross"
                        />
                    </div>
                </div>
            </div>
        );
    }
}

export default Home;
