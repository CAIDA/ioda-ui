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
    constructor(props) {
        super(props);
        // this.state = {
        //     searchQuery: {
        //         text: "",
        //         filter: ""
        //     }
        // }
    }

    // handleInputChange = (event) => {
    //     event.persist();
    //     this.setState(prevState => ({
    //         searchQuery: {
    //             ...prevState.searchQuery,
    //             text: event.target.value
    //         }
    //     }));
    // };
    //
    // handleSelectChange = (event) => {
    //     event.persist();
    //     this.setState(prevState => ({
    //         searchQuery: {
    //             ...prevState.searchQuery,
    //             filter: event.target.value
    //         }
    //     }));
    // };
    //
    // handleSearch = () => {
    //     history.push(`/search?__query=${this.state.searchQuery.text}&__filter=${this.state.searchQuery.filter}`);
    // };

    render() {
        let heroStyle = {backgroundImage: `linear-gradient(#6fa2b3, #2d6a7e), linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${heroImg})`};
        return (
            <div className='home'>
                <div className="home__hero u-full-max-width" style={heroStyle}>
                    <div className="row">
                        <div className="col-2-of-5">
                            <div className="home__hero-headline">
                                <h1 className="home__hero-text"><span>PANDA</span>A Platform for Applied Network Data Analysis</h1>
                            </div>
                        </div>
                        <div className="col-3-of-5">
                            <Searchbar />
                            {/*<SearchbarComponent onSelectChange={this.handleSelectChange}*/}
                            {/*                    onInputChange={this.handleInputChange}*/}
                            {/*                    onButtonClick={this.handleSearch}/>*/}
                            {/*<div className="home__search">*/}
                            {/*    <div className="home__search-bar">*/}
                            {/*        <select onChange={this.handleSelectChange} className="home__search-filter">*/}
                            {/*            <option>Filter For:</option>*/}
                            {/*            <option disabled={true}>All</option>*/}
                            {/*            <option disabled={true}>Papers</option>*/}
                            {/*            <option disabled={true}>Topics</option>*/}
                            {/*            <option>Data Sets</option>*/}
                            {/*            <option disabled={true}>Entities</option>*/}
                            {/*            <option disabled={true}>Joins</option>*/}
                            {/*        </select>*/}
                            {/*        <input className="home__search-input"*/}
                            {/*               type="text" placeholder="Search Feature Coming Soon"*/}
                            {/*               onChange={this.handleInputChange}*/}
                            {/*        />*/}
                            {/*        <button onClick={this.handleSearch} className="home__search-button"><span className="glyphicon glyphicon-search"/></button>*/}
                            {/*    </div>*/}
                            {/*    <div className="home__search-label">*/}
                            {/*        <label>Find your data</label>*/}
                            {/*    </div>*/}
                            {/*</div>*/}
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col-1-of-1">
                        <div className="home__story">
                            <h2 className="header__secondary">
                                <div className="home__featured-word">
                                    <span>Process</span>
                                    <span>Store</span>
                                    <span>Investigate</span>
                                    <span>Correlate</span>
                                </div>
                                <span>diverse streams of large-scale data on the internet.</span>
                            </h2>
                        </div>
                    </div>
                </div>
                <div className="row home__query">
                    <div className="col-1-of-1">
                        <h3 className="section-header">Search query Builder</h3>
                        <p className="home__query-description">Not sure what to search for? Craft a search query to help you find data about the internet.</p>
                        <div className="row">
                            <div className="col-1-of-2">
                                <div className="home__progress-bar">
                                    <div className="home__progress-bar-step">
                                        <div className="home__progress-bar-step-number">1</div>
                                        <div className="home__progress-bar-step-text">Data Type</div>
                                    </div>
                                    <div className="home__progress-bar-connector">&nbsp;</div>
                                    <div className="home__progress-bar-step">
                                        <div className="home__progress-bar-step-number">2</div>
                                        <div className="home__progress-bar-step-text">Data Source</div>
                                    </div>
                                    <div className="home__progress-bar-connector">&nbsp;</div>
                                    <div className="home__progress-bar-step">
                                        <div className="home__progress-bar-step-number">3</div>
                                        <div className="home__progress-bar-step-text">Data View</div>
                                    </div>
                                </div>
                                <div className="home__progress-bar-action">
                                    <p>Select a data type:</p>
                                </div>
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
