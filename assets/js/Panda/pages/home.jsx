import React from 'react';
import {Link} from 'react-router-dom';
import {Alert} from 'react-bootstrap';

import {Tile, TileGrid} from '../components/tile-grid';
import Panda from '../utils';

import caidaLogo from 'images/logos/caida-logo-cropped.svg';
import pandaLogo from 'images/logos/panda-full.png';
import dashboardThumb from 'images/thumbs/dashboards.png';
import examplesThumb from 'images/logos/panda-icon.png'; // TODO add thumb
import feedsThumb from 'images/thumbs/feeds.png';

import 'Panda/css/pages/home.css';

class InterfaceTiles extends React.Component {
    render() {
        return <TileGrid title='Data Investigation Interfaces'>
            <Tile to='/feeds' thumb={feedsThumb}
                  title='Data Feeds &amp; Analytics'>
                External projects that leverage the Panda platform to
                detect and analyze specific types of Internet AS level
                events, including BGP Hijacking, and large-scale outages and
	        much more.
            </Tile>
            <Tile to='/dashboards' thumb={dashboardThumb}
                  title='Live Dashboards'>
                Pre-configured dashboards tailored for real-time monitoring of
                Internet dynamics and events.
            </Tile>
            <Tile to='/examples' thumb={examplesThumb} isScreenshot={false}
                  title='Event Analyses'>
                Detailed blog-style post-event analyses created using data
                and visualizations provided by the Panda platform.
            </Tile>
        </TileGrid>;
    }
}

class Home extends React.Component {
    render() {
        return <div className='container'>
            <div className="jumbotron">
                <h1>
                    <img id="panda-logo" src={ pandaLogo }/>
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
                    <strong>Panda is still under heavy development.</strong>
                    <br/>
                    This is a preview version of Panda. Much of the content,
                    and many features are either missing or work-in-progress.
                </p>
            </Alert>
            <p className='lead'>
                Welcome to Panda, a <a href="https://www.caida.org">
                CAIDA</a> project
                to lorem ipsum dolor sit amet, consectetur adipiscing elit,
                sed do eiusmod tempor incididunt ut labore et dolore
                magna aliqua.
                If this is your first time using Panda, then you might want to
                take a look at the
                <Link to='/quickstart'> Quickstart Guide </Link> and
                <Link to='/docs'> Documentation </Link>.
            </p>
            <InterfaceTiles/>
        </div>;
    }
}

export default Home;
