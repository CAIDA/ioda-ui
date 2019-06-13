import PropTypes from 'prop-types';
import React from 'react';

import {CharthouseDataSet} from '../utils/dataset';

class PluginContent extends React.Component {

    static propTypes = {
        data: PropTypes.instanceOf(CharthouseDataSet).isRequired,
        markers: PropTypes.object,
        onTimeChange: PropTypes.func,
        configMan: PropTypes.object,
        pluginCfg: PropTypes.object.isRequired,
        maxHeight: PropTypes.number
    };

    static defaultProps = {
        maxHeight: null
    };

    state = {
        ReactPlugin: null  // AMD loaded
    };

    componentDidMount() {
        this._loadPluginModule();
    }

    componentWillUnmount() {
        this.isUnmounted = true;
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.pluginCfg.title !== nextProps.pluginCfg.title) {
            // Unload module
            this.setState({ReactPlugin: null});
        }
    }

    componentDidUpdate(prevProps) {
        if (this.props.pluginCfg.title !== prevProps.pluginCfg.title) {
            this._loadPluginModule();
        }
    }

    render() {
        return <div className="viz-plugin-content"
                    style={{maxHeight: this.props.maxHeight || false}}>
            {this.state.ReactPlugin
                ? <this.state.ReactPlugin
                    data={this.props.data}
                    markers={this.props.markers}
                    configMan={this.props.configMan}
                    maxHeight={this.props.maxHeight || false}
                    onTimeChange={this.props.onTimeChange}
                />
                : null
            }
        </div>;
    }

    // Private methods
    _loadPluginModule = () => {
        const rThis = this;
        this.props.pluginCfg.import.then(function ({default: Plugin}) {
            if (!rThis.isUnmounted) {
                rThis.setState({ReactPlugin: Plugin});
            }
        });
    };
}

export default PluginContent;
