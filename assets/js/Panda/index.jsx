// external CSS deps
// TODO: fix green color on success button hover
import 'css/theme/css/bootstrap-flatly.css';

// global CSS styles
import 'css/base.css';

// library imports
import React from 'react';
import ReactDOM from 'react-dom';
import {withRouter} from 'react-router';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

// auth
import Sidebar from './sidebar';

import Quickstart from './pages/quickstart';
import Docs from './pages/docs';
import About from './pages/about';
import Acks from './pages/acks';
import Platforms from './pages/feeds';
import Dashboards from './pages/dashboards';
import Examples from './pages/examples';

import Home from './pages/home';

// TODO: switch to SVG/font so that nav coloring works correctly
import pandaLogo from 'images/logos/panda-icon-white.png';
import pandaLogoText from 'images/logos/panda-text-white.png';

// TODO: nested routes (see https://devhints.io/react-router)
// TODO: default route and not-found route

class ContentRouter extends React.Component {
    render() {
        return <Switch>
            {/* page routes */}
            <Route path='/quickstart' component={Quickstart}/>
            <Route path='/docs' component={Docs}/>
            <Route path='/about' component={About}/>
            <Route path='/acks' component={Acks}/>

            <Route path='/feeds' component={Platforms}/>
            <Route path='/dashboards' component={Dashboards}/>
            <Route path='/examples' component={Examples}/>

            <Route path='/' component={Home}/>
        </Switch>;
    }
}

const PINNED_SIDEBAR_DEFAULT = true;
// which pages should be linked to (in addition to home)
const SIDEBAR_LINKS = [
    {
        isBrand: true,
        icon: <img src={pandaLogo}/>,
        text: <img src={pandaLogoText}/>,
    },
    null, // separator
    {
        page: 'quickstart',
        icon: <span className="glyphicon glyphicon-flash"/>
    },
    {
        page: 'docs',
        icon: <span className="glyphicon glyphicon-education"/>,
        text: 'Documentation'
    },
    {
        page: 'about',
        icon: <span className="glyphicon glyphicon-info-sign"/>
    },
    {
        page: 'acks',
        icon: <span className="glyphicon glyphicon-thumbs-up"/>,
        text: 'Acknowledgements'
    },
    null, // separator
    {
        page: 'feeds',
        icon: <span className="glyphicon glyphicon-globe"/>,
        text: 'Data Feeds'
    },
    {
        page: 'dashboards',
        icon: <span className="glyphicon glyphicon-dashboard"/>,
        text: 'Live Dashboards'
    },
    {
        page: 'examples',
        icon: <span className="glyphicon glyphicon-heart"/>,
        text: 'Event Analyses'
    }
];

// which pages should/should not have a pinned sidebar
const PINNED_SIDEBAR_PAGES = {
};
SIDEBAR_LINKS.forEach(link => {
    if (link) {
        PINNED_SIDEBAR_PAGES[`/${link.page || ''}`] = link.pinned;
    }
});

class PandaContent extends React.Component {

    render() {
        let sidebarPinned = PINNED_SIDEBAR_PAGES[this.props.location.pathname];
        if (sidebarPinned !== true && sidebarPinned !== false) {
            sidebarPinned = PINNED_SIDEBAR_DEFAULT;
        }
        return <div>
            <Sidebar isPinned={sidebarPinned} links={SIDEBAR_LINKS}/>
            <div id='panda-container'
                 className={sidebarPinned ? 'sidebar-expanded' : ''}>
                <ContentRouter/>
            </div>
        </div>
    }
}
const PandaContentWithRouter = withRouter(PandaContent);

class PandaApp extends React.Component {

    render() {
        return <BrowserRouter>
            <PandaContentWithRouter/>
        </BrowserRouter>;
    }

}
ReactDOM.render(<PandaApp/>, document.getElementById('root'));
