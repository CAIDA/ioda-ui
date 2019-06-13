import PropTypes from 'prop-types';
import React from 'react';

import DataApi from '../connectors/data-api';
import {eventTypeName} from '../utils';
import {humanizeBytes, humanizeNumber} from 'Hi3/utils';

import 'Hijacks/css/components/stats-table.css';

class StatsRow extends React.Component {

    static propTypes = {
        eventType: PropTypes.string.isRequired
    };

    state = {
        stats: null
    };

    refreshTimer = null;

    constructor(props) {
        super(props);
        this.api = new DataApi();
    }

    componentDidMount() {
        this._getStats(this.props.eventType);
    }

    componentWillReceiveProps(newProps) {
        this._getStats(newProps.eventType);
    }

    componentWillUnmount() {
        if (this.refreshTimer) {
            clearTimeout(this.refreshTimer);
            this.refreshTimer = null;
        }
    }

    render() {
        const stats = this.state.stats;
        if (!stats || !stats.today || !stats.total) {
            // don't render anything while stats are first loading
            return null;
        }
        const name = stats.eventType !== 'all'
            ? eventTypeName(stats.eventType)
            : '';
        return <div className='row text-center panel-body'>
            <div className='row'>
                <div className='col-md-4 data-stat'>
                    <div className='data-stat-number'>
                        {stats.today.count.toLocaleString()}
                    </div>
                    <div className='data-stat-caption'>
                        Suspicious {name} Events Today
                    </div>
                </div>
                <div className='col-md-4 data-stat'>
                    <div className='data-stat-number'>
                        {this._formatValue(stats.total.count)}
                    </div>
                    <div className='data-stat-caption'>
                        Suspicious {name} Events
                    </div>
                </div>
                <div className='col-md-4 data-stat'>
                    <div className='data-stat-number'>
                        {this._formatValue(stats.total.bytes, true)}
                    </div>
                    <div className='data-stat-caption'>
                        {name} Dataset Size
                    </div>
                </div>
            </div>
        </div>
    }

    _formatValue(value, isBytes) {
        return isBytes ? humanizeBytes(value) : humanizeNumber(value);
    }

    _getStats(eventType) {
        this.api.getStats(eventType, this._parseStats);
        if (!this.refreshTimer) {
            this.refreshTimer = setTimeout(() => {
                this.refreshTimer = null;
                this.api.getStats(this.props.eventType, this._parseStats);
            }, 60 * 1000);
        }
    }

    _parseStats = (stats) => {
        stats.data.eventType = this.props.eventType;
        this.setState({stats: stats.data});
    };
}

class StatsTable extends React.Component {

    static propTypes = {
        eventType: PropTypes.string
    };

    static defaultProps = {
        eventType: 'all'
    };

    render() {
        return <div className='hijacks-statstable panel panel-default'>
            <StatsRow eventType='all'/>
            {this.props.eventType !== 'all' ? <StatsRow eventType={this.props.eventType}/> : null }
        </div>
    }
}

export default StatsTable;
