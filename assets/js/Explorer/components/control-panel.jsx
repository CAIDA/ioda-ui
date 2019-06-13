import PropTypes from 'prop-types';
import React from 'react';

import { auth } from 'Auth';
import CharthouseTime from '../utils/time';
import TimeRangeControl from './time-range-control';
import PluginSelector from './plugin-selector';
import ExpressionComposer from './expression-composer';
import ExpressionSet from "../expression/set";

// Module constants
const HIERARCHY_EXPLORER_VERTICAL_OFFSET = 330; // # vertical px already in use by headers, other controls, etc

class ControlPanel extends React.Component {
    static propTypes = {
        expressionSet: PropTypes.instanceOf(ExpressionSet).isRequired,
        from: PropTypes.instanceOf(CharthouseTime).isRequired,
        until: PropTypes.instanceOf(CharthouseTime).isRequired,
        plugin: PropTypes.string.isRequired,
        initExpandMetricTree: PropTypes.bool,
        onChange: PropTypes.func
    };

    static defaultProps = {
        initExpandMetricTree: true,
        onChange: function (changedParams) {
        }
    };

    state = {
        windowHeight: window.innerHeight
    };

    componentDidMount() {
        window.addEventListener('resize', this._setWindowHeight);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this._setWindowHeight);
    }

    _setWindowHeight = () => {
        this.setState({windowHeight: window.innerHeight});
    };

    _timeSelected = (from, until) => {
        this.props.onChange({
            from: from,
            until: until
        });
    };

    _pluginSelected = (selPlugin) => {
        this.props.onChange({plugin: selPlugin});
    };

    _expressionEntered = (newExpSet) => {
        if (!newExpSet || !newExpSet.equals(this.props.expressionSet)) {
            this.props.onChange({expressionSet: newExpSet});
        }
    };

    render() {

        return <div>
            <div className="panel panel-default controller-panel">
                <div className="panel-heading panel-title">
                    Pick a time period
                </div>
                <div className="panel-body">
                    <TimeRangeControl
                        from={this.props.from}
                        until={this.props.until}
                        onChange={this._timeSelected}
                    />
                </div>
            </div>
            <div className="panel panel-default controller-panel">
                <div className="panel-heading panel-title">
                    Select a visualization
                </div>
                <div className="panel-body">
                    <PluginSelector
                        selectedPlugin={this.props.plugin}
                        onPluginSelected={this._pluginSelected}
                    />
                </div>
            </div>
            <div className="panel panel-default controller-panel">
                <div className="panel-heading panel-title">
                    Build query expression
                </div>
                <div className="panel-body">
                    <ExpressionComposer
                        expressionSet={this.props.expressionSet}
                        initExpandMetricTree={this.props.initExpandMetricTree}
                        maxHeight={Math.max(300, this.state.windowHeight - HIERARCHY_EXPLORER_VERTICAL_OFFSET)}
                        onExpressionEntered={this._expressionEntered}
                    />
                </div>
            </div>
        </div>
    }
}

export default ControlPanel;
