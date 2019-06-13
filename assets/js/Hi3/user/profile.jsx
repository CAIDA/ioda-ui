import React from 'react';

import { auth } from 'Auth';

class ProfilePage extends React.Component {

    state = {
        profile: null
    };

    constructor(props) {
        super(props);

        this._parseProfile = this._parseProfile.bind(this);
    }

    componentWillMount() {
        auth.getProfile(this._parseProfile);
    }

    render() {
        const profile = this.state.profile;
        if (!profile) {
            return <p>loading user info</p>;
        }
        return <div>
            <pre>{JSON.stringify(profile, null, 2)}</pre>
            <pre>{JSON.stringify(auth.getIdToken(), null, 2)}</pre>
        </div>;
    }

    _parseProfile(profile, err) {
        if (err) {
            this.setState({error: err});
        } else {
            this.setState({profile});
        }
    }

}

export default ProfilePage;
