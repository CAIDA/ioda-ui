import React from 'react';

import config from 'Config';
import staticCfg from 'Config/static';
import CharthouseTime from './utils/time';
import ControlPanel from './components/control-panel';
import Visualizer from './components/visualizer';
import ExpressionSet from "./expression/set";

// TODO: break these styles up and move them to the actual components that use them
import 'Explorer/css/explorer.css';
import 'Explorer/css/viz-plugins.css';

class Explorer extends React.Component {
    constructor(props) {
        super(props);
        const expressionSet = ExpressionSet.createFromJsonArray(config.getParam('expressions'));

        this.state = {
            expressionSet: expressionSet,
            from: new CharthouseTime(config.getParam("from") || staticCfg.from),
            until: new CharthouseTime(config.getParam("until") || staticCfg.until),
            plugin: config.getParam("plugin") || staticCfg.plugin,
            showController: config.getParam('hideControl') == null,

            // used to be that we only expanded for non-default expression
            initExpandMetricTree: true
        };
    }

    componentDidMount() {
        // Monitor params change
        config.onParamChange(this._configChangeHandler);
    }

    componentWillUnmount() {
        config.unsubscribe(this._configChangeHandler);
    }

    _configChangeHandler = (newParams) => {
        var updQueryState = {};

        if (newParams.hasOwnProperty('expressions')) {
            updQueryState.expressionSet = ExpressionSet.createFromJsonArray(newParams.expressions);
        }

        if (newParams.hasOwnProperty('from')) {
            updQueryState.from = new CharthouseTime(newParams.from || staticCfg.from);
        }

        if (newParams.hasOwnProperty('until')) {
            updQueryState.until = new CharthouseTime(newParams.until || staticCfg.until);
        }

        if (newParams.hasOwnProperty('plugin')) {
            updQueryState.plugin = newParams.plugin || staticCfg.plugin;
        }

        if (newParams.hasOwnProperty('hideControl')) {
            updQueryState.showController = (newParams.hideControl == null);
        }

        if (Object.keys(updQueryState).length) {
            // Set new query params in one go
            this.setState(updQueryState);
        }
    };

    _changeQueryParams = (changedQueryParams) => {

        // Component state change managed by config manager
        var pushState = {};

        if (changedQueryParams.expressionSet)
            pushState.expressions = changedQueryParams.expressionSet.toSerialJson();

        if (changedQueryParams.from)
            pushState.from = changedQueryParams.from.toParamStr();

        if (changedQueryParams.until)
            pushState.until = changedQueryParams.until.toParamStr();

        if (changedQueryParams.plugin)
            pushState.plugin = changedQueryParams.plugin;

        config.setParams(pushState);
    };

    render() {
        return <div id="explorer-main">
            <div className="container-fluid">
                <div
                    className={this.state.showController ? 'col col-sm-4 col-lg-3' : ''}
                    style={this.state.showController ? {} : {display: 'none'}}
                >
                    <ControlPanel
                        expressionSet={this.state.expressionSet}
                        from={this.state.from}
                        until={this.state.until}
                        plugin={this.state.plugin}
                        onChange={this._changeQueryParams}
                        initExpandMetricTree={this.state.initExpandMetricTree}
                    />
                </div>
                <div
                    className={this.state.showController ? 'col col-sm-8 col-lg-9' : ''}
                >
                    <Visualizer
                        expressionSet={this.state.expressionSet}
                        from={this.state.from}
                        until={this.state.until}
                        plugin={this.state.plugin}
                    />
                </div>
            </div>
        </div>
    }
}

export default Explorer
