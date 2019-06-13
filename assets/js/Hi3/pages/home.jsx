import React from 'react';
import {Link} from 'react-router-dom';
import {Alert} from 'react-bootstrap';

import {Tile, TileGrid} from '../components/tile-grid';
import {HI3} from '../utils';

import caidaLogo from 'images/logos/caida-logo-cropped.svg';
import hi3Logo from 'images/logos/hicube-full.png';
import explorerThumb from 'images/thumbs/explorer.png';
import dashboardThumb from 'images/thumbs/dashboards.png';
import examplesThumb from 'images/logos/hicube-icon.png'; // TODO add thumb
import feedsThumb from 'images/thumbs/feeds.png';

import 'Hi3/css/pages/home.css';

class InterfaceTiles extends React.Component {
    render() {
        return <TileGrid title='Data Investigation Interfaces'>
            <Tile to='/explorer' thumb={explorerThumb}
                  title='Time Series Explorer'>
                Interface for exploratory analysis of Internet security time
                series. Allows researchers to
                build custom visualizations by composing time
                series
                together using specialized post-processing
                functions.
            </Tile>
            <Tile to='/feeds' thumb={feedsThumb}
                  title='Data Feeds &amp; Analytics'>
                External projects that leverage the {HI3} platform to
                detect and analyze specific types of Internet security
                events, including BGP Hijacking, and large-scale outages.
            </Tile>
            <Tile to='/dashboards' thumb={dashboardThumb}
                  title='Live Dashboards'>
                Pre-configured dashboards tailored for real-time monitoring of
                Internet dynamics and events.
            </Tile>
            <Tile to='/examples' thumb={examplesThumb} isScreenshot={false}
                  title='Event Analyses'>
                Detailed blog-style post-event analyses created using data
                and visualizations provided by the {HI3} platform.
            </Tile>
        </TileGrid>;
    }
}

class Home extends React.Component {
    render() {
        return <div className='container'>
            <div className="jumbotron">
                <h1>
                    <img id="hi3-logo" src={ hi3Logo }/>
                    <img id="caida-logo" src={caidaLogo}/>
                </h1>
                <p className="lead">
                    <i>
                        A prototype platform for processing, storing,
                        investigating, and correlating diverse streams of
                        large-scale Internet security-related data.
                    </i>
                </p>
            </div>
            <Alert bsStyle="danger">
                <p className='lead'>
                    <strong>{HI3} is still under heavy development.</strong>
                    <br/>
                    This is a preview version of {HI3}. Much of the content,
                    and many features are either missing or work-in-progress.
                </p>
            </Alert>
            <p className='lead'>
                Welcome to {HI3}, a <a href="https://www.caida.org">
                CAIDA</a> project
                to lorem ipsum dolor sit amet, consectetur adipiscing elit,
                sed do eiusmod tempor incididunt ut labore et dolore
                magna aliqua.
                If this is your first time using {HI3}, then you might want to
                take a look at the
                <Link to='/quickstart'> Quickstart Guide </Link> and
                <Link to='/docs'> Documentation </Link>.
            </p>
            <InterfaceTiles/>
        </div>;
    }
}

export default Home;
