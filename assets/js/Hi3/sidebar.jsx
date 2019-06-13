import PropTypes from 'prop-types';
import React from 'react';
import {NavLink} from 'react-router-dom';
import titleCase from 'title-case';

import {auth} from 'Auth';

import 'Hi3/css/sidebar.css';

// TODO: properly support mobile

class SidebarLink extends React.Component {

    static propTypes = {
        isBrand: PropTypes.bool,
        page: PropTypes.string,
        icon: PropTypes.node.isRequired,
        onClick: PropTypes.func.isRequired,
        text: PropTypes.node
    };

    render() {
        const text = this.props.text || titleCase(this.props.page);
        return <li className={this.props.isBrand ? 'brand' : null}>
            <NavLink to={`/${this.props.isBrand ? '' : this.props.page}`}
                     onClick={this.props.onClick}>
                <div className="icon">{this.props.icon}</div>
                <div className="text">{text}</div>
            </NavLink>
        </li>;
    }
}

class Sidebar extends React.Component {

    static propTypes = {
        links: PropTypes.arrayOf(PropTypes.object).isRequired,
        isPinned: PropTypes.bool
    };

    static defaultProps = {
        isPinned: false
    };

    state = {
        isExpanded: false
    };

    render() {
        const collapsed = (!this.props.isPinned && !this.state.isExpanded) ?
            'sidebar-collapsed' : '';
        return <div>
            <div className={`sidebar ${collapsed}`}
                 onMouseOver={!this.props.isPinned ? this.onHover : null}
                 onMouseOut={!this.props.isPinned ? this.onLeave : null}
            >
                <ul>
                    {this.props.links.map((link, idx) => {
                        return link ?
                            <SidebarLink key={idx} onClick={this.onLeave} {...link}/> :
                            <div className='sidebar-separator' key={idx}/>;
                    })}
                    {auth.isAuthenticated() ?
                        (<div className='pull-bottom'>
                            <SidebarLink onClick={this.onLeave}
                                         page='user/profile'
                                         icon={<span
                                             className="glyphicon glyphicon-user"/>}
                                         text={<div>Logged in
                                             as <i>{auth.getNickname()}</i></div>}
                            />
                            <SidebarLink onClick={this.onLeave}
                                         page='logout'
                                         icon={<span
                                             className="glyphicon glyphicon-log-out"/>}
                            />
                        </div>)
                        : null};
                </ul>
            </div>
        </div>;
    }

    onHover = () => {
        this.setState({isExpanded: true});
    };

    onLeave = () => {
        this.setState({isExpanded: false});
    };
}

export default Sidebar;
