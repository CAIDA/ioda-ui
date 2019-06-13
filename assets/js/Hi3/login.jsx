import React from 'react';
import { Redirect } from 'react-router-dom';

import { auth } from 'Auth';

class LoginPage extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        if (auth.isAuthenticated()) {
            // probably the user has directly navigated to the login page
            // be kind and send them home
            return <Redirect to='/'/>
        }

        // first, figure out where we'll redirect to after login
        const dest = this.props.location.state.referrer;
        console.log(`Saving redirect location as ${dest}`);
        sessionStorage.setItem('redirect_uri', dest);
        // now, ask the auth service to log in
        auth.login();
        // even though the login is async, it's a better experience if we
        // render nothing
        return null;
    }
}

export default LoginPage;
