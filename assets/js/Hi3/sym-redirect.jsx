import React from 'react';
import DataApi from 'Explorer/connectors/data-api';

class SymRedirect extends React.Component {

    state = {
        error: null
    };

    componentDidMount() {
        const api = new DataApi();
        const rThis = this;
        api.lookupShortUrl(
            function(data) { // success
                window.location.replace(data.data.long_url);
            },
            function(error) { // error
                // TODO: this is a little hax, should really check the status code
                if (error.startsWith('Not Found')) {
                    rThis.setState({
                        error: `The given permalink ('@${rThis.props.match.params.tag}') does not exist.`
                    });
                } else {
                    rThis.setState({error});
                }
            },
            this.props.match.params.tag
        );
    }

    render() {
        if (this.state.error) {
            return <p>{this.state.error}</p>;
        }
        return <p>Redirecting...</p>;
    }
}

export default SymRedirect;
