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

// React Components
import React, { Component } from 'react';
import {Link} from 'react-router-dom';
import {Searchbar} from 'caida-components-library'
import { connect } from 'react-redux';
// Internationalization
import T from 'i18n-react';
// Map Dependencies
import { Map, Marker, Popup, TileLayer, GeoJSON } from 'react-leaflet';
import worldGeoJSON from 'geojson-world-map';
// Actions and Constants
import {
    mapAccessToken,
} from './HomeConstants';
import { searchEntities } from "../../data/ActionEntities";
import { getTopoAction } from "../../data/ActionTopo";
import * as topojson from 'topojson';
import { searchSummary } from "../../data/ActionOutages";
import { TwitterTimelineEmbed } from 'react-twitter-embed';

import otfLogo from 'images/logos/otf.png';
import dhsLogo from 'images/logos/dhs.svg';
import comcastLogo from 'images/logos/comcast.svg';
import nsfLogo from 'images/logos/nsf.svg';
import isocLogo from 'images/logos/isoc.svg';


const Card = partner => {
    const org = partner.partner;
    const text = "home." +  org;
    // ToDo: Swap out images for sprite sheet
    return (
        <div className="card">
            <div className="card__logo">
                {
                    org === 'otf'
                    ? <img src={otfLogo} alt={`${partner.partner} logo`} className="card__logo-icon" />
                    : org === 'dhs'
                        ? <img src={dhsLogo} alt={`${partner.partner} logo`} className="card__logo-icon" />
                        : org === 'comcast'
                            ? <img src={comcastLogo} alt={`${partner.partner} logo`} className="card__logo-icon" />
                            : org === 'nsf'
                                ? <img src={nsfLogo} alt={`${partner.partner} logo`} className="card__logo-icon" />
                                : org === 'isoc'
                                    ? <img src={isocLogo} alt={`${partner.partner} logo`} className="card__logo-icon" />
                                    : null
                }
            </div>
            <div className="card__content">
                <T.p className="card__text" text={text}/>
            </div>
        </div>
    );
};

const Example = country => {
    const countryName = Object.values(country);
  return (
    <div className="example">
        {`${countryName}`}
    </div>
  );
};

class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {
            mounted: false,
            suggestedSearchResults: null,
            searchTerm: null,
            topoData: null,
            outageSummaryData: null
        };
    }

    componentDidMount() {
        this.setState({mounted: true}, () => {
            this.getDataTopo();
            this.getDataOutageSummary();
        });
        // console.log(worldGeoJSON);
    }

    componentWillUnmount() {
        this.setState({mounted: false});
    }

    componentDidUpdate(prevProps) {
        // After API call for suggested search results completes, update suggestedSearchResults state with fresh data
        if (this.props.suggestedSearchResults !== prevProps.suggestedSearchResults) {
            let suggestedItems = [];
            let suggestedItemObjects = Object.entries(this.props.suggestedSearchResults.data);
            console.log(suggestedItemObjects);
            suggestedItemObjects.map(result => {
                suggestedItems.push(result[1])
            });
            this.setState({
                suggestedSearchResults: suggestedItems
            });
        }

        // After API call for outage summary data completes, pass summary data to map function for data merging
        if (this.props.summary !== prevProps.summary) {
            this.setState({
                outageSummaryData: this.props.summary
            })
        }

        // After API call for topographic data completes, update topoData state with fresh data
        if (this.props.topoData !== prevProps.topoData) {
            let topoObjects = topojson.feature(this.props.topoData.country.topology, this.props.topoData.country.topology.objects["ne_10m_admin_0.countries.v3.1.0"]);
            this.setState({
                topoData: topoObjects
            }, () => {
                this.populateGeoJsonMap();
            });
        }
    }

    // Make API  call to retrieve summary data to populate on map
    getDataOutageSummary() {
        if (this.state.mounted) {
            let until = Math.round(new Date().getTime() / 1000);
            let from = Math.round((new Date().getTime()  - (24 * 60 * 60 * 1000)) / 1000);
            const entityType = "country";
            this.props.searchSummaryAction(from, until, entityType);
        }
    }

    // Populate JSX that creates the map once topographic data is available
    populateGeoJsonMap() {
        let position = [20, 0];

        if (this.state.topoData && this.state.outageSummaryData) {
            // console.log(this.state.outageSummaryData);
            // // console.log(this.state.topoData);
            let topoData = this.state.topoData;

            this.state.outageSummaryData.map(outage => {
                let topoItemIndex = this.state.topoData.features.findIndex(topoItem => topoItem.properties.usercode === outage.entity.code);

                if (topoItemIndex > 0) {
                    let item = topoData.features[topoItemIndex];
                    item.properties.score = outage.scores.overall;
                    topoData.features[topoItemIndex] = item;
                }
            });

            return <Map
                center={position}
                zoom={2}
                minZoom={1}
                style={{width: 'inherit', height: 'inherit', overflow: 'hidden'}}
            >
                <TileLayer
                    id="mapbox/streets-v11"
                    url={`https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=${mapAccessToken}`}
                /><GeoJSON
                data={topoData}
                style={(feature) => ({
                    color: '#fff',
                    weight: 2,
                    fillColor:
                        !feature.properties.score
                            ? "transparent"
                            : feature.properties.score < 250
                                ? "rgb(254, 204, 92)"
                                : feature.properties.score < 500
                                    ? "rgb(253, 141, 60)"
                                    : "rgb(227, 26, 28)"
                    ,
                    fillOpacity: 0.7,
                    dashArray: '2'
                })}
            /></Map>;
        }
    }

    // Make API call to retrieve topographic data
    getDataTopo() {
        if (this.state.mounted) {
            let entityType = "country";
            this.props.getTopoAction(entityType);
        }
    }

    // get data for search results that populate in suggested search list
    getDataSuggestedSearchResults(nextProps) {
        if (this.state.mounted) {
            // Set searchTerm to the value of nextProps, nextProps refers to the current search string value in the field.
            this.setState({ searchTerm: nextProps });
            // // Make api call
            this.props.searchEntitiesAction(nextProps);
        }
    }

    // Define what happens when user clicks suggested search result entry
    handleResultClick = (query) => {
        const { history } = this.props;
        console.log(query);
        // query.name ? history.push(`/search?query=${query.name}`) : history.push(`/search?query=${query}`);
    };

    // Reset searchbar with searchterm value when a selection is made, no customizations needed here.
    handleQueryUpdate = (query) => {
        this.forceUpdate();
        this.setState({
            searchTerm: query
        });
    }

    render() {
        return (
            <div className='home'>
                <div className="row search">
                    <div className="col-2-of-3">
                        <h2 className="section-header">
                            Jump to a Country, Region, or AS/ISP of Interest
                        </h2>
                        <Searchbar placeholder={'Search for a Country, Region, or AS/ISP'}
                                   getData={this.getDataSuggestedSearchResults.bind(this)}
                                   itemPropertyName={'name'}
                                   handleResultClick={(event) => this.handleResultClick(event)}
                                   searchResults={this.state.suggestedSearchResults}
                                   handleQueryUpdate={this.handleQueryUpdate}
                        />
                        <p className="search__text">
                            or continue to
                            <Link to="/" className="search__link">
                                Outages Dashboard >>
                            </Link>
                        </p>
                    </div>
                </div>
                <div className="row map">
                    <div className="col-3-of-4">
                        <h2 className="section-header">
                            Recent Outages
                        </h2>
                        <p className="map__text">Last 24 hours</p>
                        <div className="map__content">
                            {
                                this.populateGeoJsonMap()
                            }
                        </div>
                    </div>
                    <div className="col-1-of-4">
                        <h2 className="section-header">
                            Latest News
                        </h2>
                        <div className="map__feed">
                            <TwitterTimelineEmbed
                                sourceType="profile"
                                screenName="caida_ioda"
                                options={{height: 483}}
                            />
                        </div>
                    </div>
                </div>
                <div className="about">
                    <div className="row">
                        <div className="col-2-of-3">
                            <p className="about__text">
                                IODA (Internet Outage Detection and Analysis) is a CAIDA project to develop an
                                operational prototype system that monitors the internet, in near-realtime, to identify
                                macroscopic Internet outages affecting the edge of the network, i.e. significantly
                                impacting an AS (Autonomous System) or a large fraction of a country.
                            </p>
                            <Link to="/" className="button">
                                <button>
                                    Outages Dashboard >>
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
                {/*<div className="row examples">*/}
                {/*    <div className="col-1-of-1">*/}
                {/*        <Example country="iran"/>*/}
                {/*    </div>*/}
                {/*    <div className="col-1-of-1">*/}
                {/*        <Example country="gabon"/>*/}
                {/*    </div>*/}
                {/*</div>*/}
                <div className="row partners">
                    <div className="col-1-of-1">
                        <h2 className="section-header">
                            Partners
                        </h2>
                    </div>
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

const mapStateToProps = (state) => {
    return {
        suggestedSearchResults: state.iodaApi.entities,
        summary: state.iodaApi.summary,
        topoData: state.iodaApi.topo
    }
};

const mapDispatchToProps = (dispatch) => {
    return {
        searchEntitiesAction: (searchQuery, limit=15) => {
           searchEntities(dispatch, searchQuery, limit);
        },
        searchSummaryAction: (from, until, entityType, entityCode=null, limit=null, page=null) => {
            searchSummary(dispatch, from, until, entityType, entityCode, limit, page);
        },
        getTopoAction: (entityType) => {
            getTopoAction(dispatch, entityType);
        }
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(Home);
