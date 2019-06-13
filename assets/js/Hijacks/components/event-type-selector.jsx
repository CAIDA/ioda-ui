import PropTypes from 'prop-types';
import React from 'react';
import {ToggleButtonGroup, ToggleButton} from 'react-bootstrap';

class EventTypeSelector extends React.Component {

    static propTypes = {
        eventType: PropTypes.string,
        onChange: PropTypes.func
    };

    static defaultProps = {
        eventType: 'moas',
        onChange: ()=>{}
    };

    render() {
        return <div style={{display: 'inline-block'}}>
            <label style={{display: 'block'}}>
                Select an event type
            </label>
            {/* onClick hax due to https://github.com/react-bootstrap/react-bootstrap/issues/2734 */}
            <ToggleButtonGroup type="radio" name="eventType"
                               value={this.props.eventType}
                               onChange={this._changeEventType}
            >
                <ToggleButton value='all' id='all'
                              onClick={this._changeEventType}>All</ToggleButton>
                <ToggleButton value='moas' id='moas'
                              onClick={this._changeEventType}>MOAS</ToggleButton>
                <ToggleButton value='submoas' id='submoas'
                              onClick={this._changeEventType}>Sub-MOAS</ToggleButton>
                <ToggleButton value='edges' id='edges'
                              onClick={this._changeEventType}>New Edge</ToggleButton>
                <ToggleButton value='defcon' id='defcon'
                              onClick={this._changeEventType}>Defcon</ToggleButton>
            </ToggleButtonGroup>
        </div>
    }

    _changeEventType = (e) => {
        this.props.onChange(e.target.id);
    };
}

export default EventTypeSelector;
