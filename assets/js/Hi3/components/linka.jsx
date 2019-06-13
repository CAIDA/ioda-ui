import PropTypes from 'prop-types';
import React from 'react';
import {Link} from 'react-router-dom';
import isExternal from 'is-url-external';

class LinkA extends React.Component {

    static propTypes = {
        to: PropTypes.string.isRequired,
    };

    render() {
        return isExternal(this.props.to) ?
            <a
                href={this.props.to}
                {...this.props}
            />
            :
            <Link {...this.props} />;
    }
}

export default LinkA;
