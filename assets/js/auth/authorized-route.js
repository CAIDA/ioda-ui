import PropTypes from 'prop-types';
import React from 'react';
import { Route, Redirect } from 'react-router-dom';

import { auth } from 'Auth';

class AuthorizedRoute extends React.Component {

    static propTypes = {
        permission: PropTypes.string
    };

    constructor(props) {
        super(props);
    }

    render() {
        const { component, permission, ...props } = this.props;
        if (!auth.isAuthenticated()) {
            return <Route {...props}>
                <Redirect to={{
                    pathname: '/login',
                    state: { referrer: location.href }
                }}/>
            </Route>;
        }
        if (permission && !auth.hasPermission(permission)) {
            return <Route {...props}>
                <Redirect to='/user/pending'/>
            </Route>;
        }
        return <Route component={component} {...props}/>
    }
}

export default AuthorizedRoute;
