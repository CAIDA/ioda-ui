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

// React Imports
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
// Internationalization
import T from 'i18n-react';
// Data Hooks
import { searchEntities } from "../../data/ActionEntities";
import { getTopoAction } from "../../data/ActionTopo";
import { searchSummary } from "../../data/ActionOutages";
// Components
import { Searchbar } from 'caida-components-library'
import { TwitterTimelineEmbed } from 'react-twitter-embed';
import TopoMap from "../../components/map/Map";
import * as topojson from 'topojson';
import Card from "./Card";
import Examples from "./Examples";
// Images
import otfLogo from 'images/logos/otf.png';
import dhsLogo from 'images/logos/dhs.svg';
import comcastLogo from 'images/logos/comcast.svg';
import nsfLogo from 'images/logos/nsf.svg';
import isocLogo from 'images/logos/isoc.svg';
import Loading from "../../components/loading/Loading";
// Constants
import urls from "../../constants/urls/urls";
import Methodology from "./Methodology";


// const Example = country => {
//     const countryName = Object.values(country);
//   return (
//     <div className="example">
//         {`${countryName}`}
//     </div>
//   );
// };

class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {
            mounted: false,
            suggestedSearchResults: null,
            searchTerm: null,
            lastFetched: 0,
            topoData: null,
            topoScores: null,
            outageSummaryData: null
        };
        this.handleEntityShapeClick = this.handleEntityShapeClick.bind(this);
    }

    componentDidMount() {
        console.log("upadte");
        this.setState({mounted: true}, () => {
            // Get topo and outage data to populate map
            this.getDataTopo();
            this.getDataOutageSummary();
        });
    }

    componentWillUnmount() {
        this.setState({mounted: false});
    }

    componentDidUpdate(prevProps) {
        // After API call for suggested search results completes, update suggestedSearchResults state with fresh data
        if (this.props.suggestedSearchResults !== prevProps.suggestedSearchResults) {
            this.setState({
                suggestedSearchResults: this.props.suggestedSearchResults
            });
        }

        // After API call for outage summary data completes, pass summary data to map function for data merging
        if (this.props.summary !== prevProps.summary) {
            this.setState({
                outageSummaryData: this.props.summary
            }, () => {
                console.log(this.state.outageSummaryData);
                this.getMapScores();
            })
        }

        // After API call for topographic data completes, update topoData state with fresh data
        if (this.props.topoData !== prevProps.topoData) {
            let topoObjects = topojson.feature(this.props.topoData.country.topology, this.props.topoData.country.topology.objects["ne_10m_admin_0.countries.v3.1.0"]);
            this.setState({
                topoData: topoObjects
            }, () => {
                console.log(this.state.topoData);
            });
        }
    }

    // Make API call to retrieve summary data to populate on map
    getDataOutageSummary() {
        if (this.state.mounted) {
            let until = Math.round(new Date().getTime() / 1000);
            let from = Math.round((new Date().getTime()  - (24 * 60 * 60 * 1000)) / 1000);
            const entityType = "country";
            this.props.searchSummaryAction(from, until, entityType);
        }
    }

    // Compile Scores to be used within the map
    getMapScores() {
        if (this.state.topoData && this.state.outageSummaryData) {
            let topoData = this.state.topoData;
            let scores = [];

            // get Topographic info for a country if it has outages
            this.state.outageSummaryData.map(outage => {
                let topoItemIndex = this.state.topoData.features.findIndex(topoItem => topoItem.properties.usercode === outage.entity.code);

                if (topoItemIndex > 0) {
                    let item = topoData.features[topoItemIndex];
                    item.properties.score = outage.scores.overall;
                    topoData.features[topoItemIndex] = item;

                    // Used to determine coloring on map objects
                    scores.push(outage.scores.overall);
                    scores.sort((a, b) => {
                        return a - b;
                    });
                }
            });
            this.setState({topoScores: scores}, ()=> {
                console.log(this.state.topoScores);
            });
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
    getDataSuggestedSearchResults(searchTerm) {
        if (this.state.mounted) {
            // Set searchTerm to the value of nextProps, nextProps refers to the current search string value in the field.
            this.setState({ searchTerm: searchTerm });
            // // Make api call
            if (searchTerm.length >= 2 && (new Date() - new Date(this.state.lastFetched)) > 300) {
                this.setState({
                    lastFetched: Date.now()
                }, () => {
                    this.props.searchEntitiesAction(searchTerm, 11);
                })
            }
        }
    }
    // Define what happens when user clicks suggested search result entry
    handleResultClick = (query) => {
        const { history } = this.props;
        let entity;
        typeof query === 'object' && query !== null
            ? entity = this.state.suggestedSearchResults.filter(result => {
                return result.name === query.name
            })
            : entity = this.state.suggestedSearchResults.filter(result => {
                return result.name === query
            });
        entity = entity[0];
        history.push(`/${entity.type}/${entity.code}`);
    };
    // function to manage when a user clicks a country in the map
    handleEntityShapeClick(entity) {
        const { history } = this.props;
        history.push(
            window.location.search.split("?")[1]
                ? `/country/${entity.properties.usercode}?from=${window.location.search.split("?")[1].split("&")[0].split("=")[1]}&until=${window.location.search.split("?")[1].split("&")[1].split("=")[1]}`
                : `/country/${entity.properties.usercode}`
        );
    }
    // Reset searchbar with searchterm value when a selection is made, no customizations needed here.
    handleQueryUpdate = (query) => {
        this.forceUpdate();
        this.setState({
            searchTerm: query
        });
    }

    render() {
        const searchBarTitle = T.translate("home.searchBarTitle");
        const searchBarPlaceholder = T.translate("home.searchBarPlaceholder");
        const searchBarDashboardText = T.translate("home.searchBarDashboardText");
        const searchBarDashboardLink = T.translate("home.searchBarDashboardLink");
        const recentOutages = T.translate("home.recentOutages");
        const twitterWidgetTitle = T.translate("home.twitterWidgetTitle");
        const aboutButtonText = T.translate("home.aboutButtonText");
        const partnersSectionTitle = T.translate("home.partnersSectionTitle");

        return (
            <div className='home'>
                <div className="row search">
                    <div className="col-2-of-3">
                        <h2 className="section-header">
                            {searchBarTitle}
                        </h2>
                        <Searchbar placeholder={searchBarPlaceholder}
                                   getData={this.getDataSuggestedSearchResults.bind(this)}
                                   itemPropertyName={'name'}
                                   handleResultClick={(event) => this.handleResultClick(event)}
                                   searchResults={this.state.suggestedSearchResults}
                                   handleQueryUpdate={this.handleQueryUpdate}
                        />
                        <p className="search__text">
                            {searchBarDashboardText}
                            <Link to="/dashboard" className="search__link">
                                {searchBarDashboardLink}
                            </Link>
                        </p>
                    </div>
                </div>
                <div className="row map">
                    <div className="col-3-of-4">
                        <h2 className="section-header">
                            {recentOutages}
                        </h2>
                        <T.p className="map__text" text="home.mapTimeFrame"/>
                        {
                            this.state.topoData && this.state.topoScores
                                ? <div className="map__content">
                                    <TopoMap topoData={this.state.topoData} scores={this.state.topoScores} handleEntityShapeClick={this.handleEntityShapeClick}/>
                                </div>
                            : this.state.topoData && this.state.outageSummaryData.length === 0
                                ? <div className="map__content">
                                    <TopoMap topoData={this.state.topoData} scores={null} handleEntityShapeClick={this.handleEntityShapeClick}/>
                                </div>
                            : <Loading/>
                        }
                    </div>
                    <div className="col-1-of-4">
                        <h2 className="section-header">
                            {twitterWidgetTitle}
                        </h2>
                        <div className="map__feed">
                            <TwitterTimelineEmbed
                                sourceType="profile"
                                screenName="caida_ioda"
                                options={{ id: "profile:caida_ioda", height: '48.3rem'}}
                                lang="en"
                            />
                        </div>
                    </div>
                </div>
                <div className="about">
                    <div className="row">
                        <div className="col-2-of-3">
                            <T.p className="about__text" text="home.about"/>
                            <Link to="/dashboard" className="button">
                                <button>
                                    {aboutButtonText}
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
                <Examples />
                <Methodology />
                <div className="row partners">
                    <div className="col-1-of-1">
                        <h2 className="section-header">
                            {partnersSectionTitle}
                        </h2>
                    </div>
                    <div className="col-1-of-3">
                        <Card partner="nsf"/>
                    </div>
                    <div className="col-1-of-3">
                        <Card partner="dhs"/>
                    </div>
                    <div className="col-1-of-3">
                        <Card partner="otf"/>
                    </div>
                    <div className="col-1-of-3">
                        <Card partner="comcast"/>
                    </div>
                    <div className="col-1-of-3">
                        <Card partner="isoc"/>
                    </div>
                    <div className="col-1-of-3">
                        <Card partner="dos"/>
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
