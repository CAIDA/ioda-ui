import PropTypes from 'prop-types';
import React from 'react';
import moment from 'moment';

const MOMENT_FORMAT = 'LL h:mma';

class TimeLogger extends React.Component {
    static propTypes = {
        start: PropTypes.number,
        end: PropTypes.number
    };

    render() {
        return <span>
                <em className="text-primary">
                    {this.props.start ? moment(this.props.start).utc().format(MOMENT_FORMAT) : null}
                </em>
            &nbsp;-&nbsp;
            <em className="text-primary">
                    {this.props.end ? moment(this.props.end).utc().format(MOMENT_FORMAT) : null}
                </em>
            </span>;
    }
}

export default TimeLogger;
