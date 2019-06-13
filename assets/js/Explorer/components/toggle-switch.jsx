import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';
import 'jquery-toggles';
import 'jquery-toggles/css/toggles.css';
import 'jquery-toggles/css/themes/toggles-modern.css';

class ToggleSwitch extends React.Component {
    static propTypes = {
        width: PropTypes.number,
        height: PropTypes.number,
        on: PropTypes.bool,
        textOn: PropTypes.string,
        textOff: PropTypes.string,
        description: PropTypes.string,
        onToggle: PropTypes.func
    };

    static defaultProps = {
        width: 43,
        height: 16,
        on: false,
        textOn: 'On',
        textOff: 'Off',
        description: '',
        onToggle: function (isOn) {
        }
    };

    componentDidMount() {
        this.$toggle = $(ReactDOM.findDOMNode(this.refs.toggleBtn)).toggles({
            width: this.props.width,
            height: this.props.height,
            on: this.props.on,
            drag: false,
            text: {
                on: this.props.textOn,
                off: this.props.textOff
            }
        });

        var rThis = this;
        this.$toggle.on('toggle', function (e, active) {
            rThis.props.onToggle(active);
        });
    }

    componentDidUpdate(prevProps) {
        if (this.props.on != prevProps.on)
            this.$toggle.toggles(this.props.on);
    }

    componentWillUnmount() {
        // Destroy plugin
        var $elem = $(ReactDOM.findDOMNode(this.refs.toggleBtn));
        $.removeData($elem.get(0));
    }

    render() {
        return <div
            className="toggle-modern text-center"
            ref="toggleBtn"
            title={this.props.description}
            style={{WebkitFontSmoothing: 'antialiased'}}
        />
    }
}

export default ToggleSwitch;
