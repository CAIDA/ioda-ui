import React from 'react';
import { Redirect } from 'react-router-dom';

import { auth } from 'Auth';

class LogoutPage extends React.Component {
    render() {
        auth.logout();
        return <Redirect to='/'/>
    }
}

export default LogoutPage;
