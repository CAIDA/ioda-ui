import React from 'react';
import { Redirect } from 'react-router-dom';

import { auth } from 'Auth';

class LoginCallbackPage extends React.Component {

    state = {
        handlingCallback: true,
        error: null
    };

    constructor(props) {
        super(props);
        this._loginSuccess = this._loginSuccess.bind(this);
        this._loginError = this._loginError.bind(this);
    }

    componentDidMount() {
        // this page should only be triggered by auth0
        if (/access_token|id_token|error/.test(this.props.location.hash)) {
            this.state.handlingCallback = true;
            auth.handleAuthentication(this._loginSuccess, this._loginError);
        }
    }

    render() {
        // 1. if we're authenticated, then redirect!
        if (auth.isAuthenticated()) {
            const dest = sessionStorage.getItem('redirect_uri') || '/';
            sessionStorage.removeItem('redirect_uri');
            if (!dest.startsWith('http')) {
                return <Redirect to={dest}/>
            }
            location.href = dest;
            return null;
        }

        // 1. if we are processing a callback
        if (this.state.handlingCallback) {
            // TODO: make this message prettier (w. spinner)
            return <p>Please wait..</p>;
        }

        // 2. did we get an error when logging in?
        if (this.state.error) {
            auth.forceLogin();
            // TODO: better error page and message
            // can this be caused by user error?
            return <p>Authentication failed. Please wait...</p>;
        }

        // 3. not authenticated, no callback, no error message, so this is an error
        // TODO: what to do in this case?
        // consider redirecting to home
        return <p>Invalid authentication state. Please retry</p>;
    }

    _loginSuccess() {
        this.setState({
            handlingCallback: false
        });
    }

    _loginError(err) {
        this.setState({
            handlingCallback: false,
            error: err
        });
    }
}

export default LoginCallbackPage;
