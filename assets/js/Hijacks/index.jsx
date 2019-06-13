import React from 'react';

import DataApi from './connectors/data-api';

import 'Hijacks/css/hijacks.css';

class HijacksDashboard extends React.Component {

    constructor(props) {
        super(props);
        this.api = new DataApi();

        this.api.getEvents('moas', {}, this.parseEvents, null);
    }

    state = {
        eventJson: null
    };

    render() {
        return this.state.eventJson ?
                <pre><code>{this.state.eventJson}</code></pre> :
                <p>loading...</p>
    }

    parseEvents = (events) => {
        this.setState({eventJson: events});
    };
}

export default HijacksDashboard;
