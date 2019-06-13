import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';
import 'font-awesome/css/font-awesome.css';

import Toggle from './toggle-switch';
import Dialog from './dialog';
import TimeLogger from './time-logger';
import PermalinkForm from './permalink';
import RawData from './raw-data.jsx';
import { CharthouseDataSet } from '../utils/dataset';
import PluginContent from './plugin-content';
// TODO: look into webpack code splitting to avoid loading deps several times
import CHARTHOUSE_PLUGIN_SPECS from '../viz-plugins/plugin-specs';
import tools from '../utils/tools';
import '../utils/jquery-plugins';

// TODO: this component could probably be refactored into multiple modules

class DataInfo extends React.Component {
    // TODO: why is vizTimeRange not updating when we get new data?
    static propTypes = {
        data: PropTypes.instanceOf(CharthouseDataSet).isRequired,
        vizTimeRange: PropTypes.array
    };

    state = {
        numPoints: this.props.data.cntNonNullPnts()
    };

    componentDidUpdate(prevProps, prevState) {
        var newNumPoints = this.props.data.cntNonNullPnts();
        if (newNumPoints != this.state.numPoints) {
            this.setState({numPoints: newNumPoints});
        }

        // Blink on data changes
        if (this.props.data.numSeries != prevProps.data.numSeries) {
            $(ReactDOM.findDOMNode(this.refs.numSeries)).flash(500, 2);
        }

        if (this.state.numPoints != prevState.numPoints) {
            $(ReactDOM.findDOMNode(this.refs.numPoints)).flash(500, 2);
        }
    }

    render() {
        var dataRes = this.props.data.getResolution(
            function (dur) {
                return '<em>' + dur.humanize().replace(/^an? /, "") + '</em>';
            }
        ).map(function (stepAgg) {
            return stepAgg[0] + (stepAgg[1].length ? (' (in ' + stepAgg[1].join(', ') + ' bins)') : '');
        }).join(', ');
        dataRes = dataRes || 'n/a';

        return <div className="viz-plugin-info small">
                <span className="text-muted">
                    {'#'} Series: <em className="small"
                                      ref="numSeries">{this.props.data.numSeries}</em>
                    &nbsp;| {'#'} Points: <em className="small"
                                              ref="numPoints">{this.state.numPoints}</em>
                    &nbsp;| Data resolution: <span
                    dangerouslySetInnerHTML={{__html: dataRes}}/>
                </span>
            <span style={{float: 'right'}}>
                    {this.props.children}
                </span>
            {this.props.vizTimeRange && this.props.vizTimeRange.length == 2 &&
            <div className="pull-right"
                 style={{
                     marginRight: '10px'
                 }}
            >
                <TimeLogger
                    start={this.props.vizTimeRange[0]}
                    end={this.props.vizTimeRange[1]}
                />
            </div>}
        </div>;
    }
}

class PluginFooter extends React.Component {
    static propTypes = {
        data: PropTypes.instanceOf(CharthouseDataSet).isRequired
    };

    render() {
        return <div>
            <RawData
                data={this.props.data}
            />

            <span style={{margin: '0px 10px'}}>
                    {this.props.children}
                </span>

            <button type="button" className="btn btn-info btn-xs pull-right"
                    title="Get Permalink for current view"
                    onClick={this._getPermalink}
            >
                <span className="glyphicon glyphicon-link"/> Short URL
            </button>
        </div>;
    }

    // Private methods
    _getPermalink = () => {
        const $anchor = $('<span>');
        ReactDOM.render(
            <Dialog

                ns={this.props.ns}
                title="Get Permalink"
                onClose={function () {
                    // GC rogue modal
                    ReactDOM.unmountComponentAtNode($anchor[0]);
                }}
            >
                <PermalinkForm/>
            </Dialog>,
            $anchor.get(0)
        );
    };
}

class AutoPoller extends React.Component {
    static propTypes = {
        on: PropTypes.bool,
        frequency: PropTypes.number,
        description: PropTypes.string,
        showToggle: PropTypes.bool,
        targets: PropTypes.arrayOf(PropTypes.shape({
            dataCall: PropTypes.func.isRequired,
            onNewData: PropTypes.func
        }).isRequired).isRequired,
        onToggle: PropTypes.func,
    };

    static defaultProps = {
        on: false,
        frequency: 10000,   // ms
        description: '',
        showToggle: true,
        onToggle: function () {
        }
    };

    state = {
        fetching: false,
        delivering: false,
        errors: []
    };

    componentWillMount() {
        this.pollers = [];
    }

    componentDidMount() {

        var rThis = this;

        // Setup the pollers
        var numFetching = 0;
        var numDelivering = 0;

        this.pollers = this.props.targets.map(function (target) {
            var thisPoller = {
                xhr: null,
                timer: tools.periodicTask(
                    rThis.props.frequency,
                    function (cb) {
                        numFetching++;
                        rThis.setState({
                            fetching: true,
                            errors: []
                        });

                        if (thisPoller.xhr) {
                            thisPoller.xhr.abort();
                            thisPoller.xhr = null;
                        }

                        thisPoller.xhr = target.dataCall(
                            function success(newData) {
                                if (!rThis.pollers) {
                                    // we have been cancelled
                                    return;
                                }

                                numDelivering++;
                                rThis.setState({
                                    fetching: --numFetching > 0,
                                    delivering: true
                                });

                                target.onNewData(newData);

                                if (!rThis.pollers) {
                                    // we have been cancelled
                                    return;
                                }

                                rThis.setState({delivering: --numDelivering > 0});
                                thisPoller.xhr = null;
                                cb(); // All done, run callback
                            },
                            function error(msg) {
                                var errors = rThis.state.errors;
                                errors.push(msg);
                                rThis.setState({
                                    errors: errors
                                });
                                thisPoller.xhr = null;
                                cb();   // Try again
                            }
                        );
                    }
                )
            };
            return thisPoller;
        });

        // Run it immediately if initialized on
        if (this.props.on) {
            this.pollers.forEach(function (poller) {
                poller.timer.run();
            });
        }
    }

    componentDidUpdate(prevProps) {
        // Start/stop auto-polling
        if (this.props.on != prevProps.on) {
            var funcName = this.props.on ? 'run' : 'stop';
            this.pollers.forEach(function (poller) {
                if (poller.xhr) {
                    poller.xhr.abort();
                    poller.xhr = null;
                }
                poller.timer[funcName]();
            });
        }
    }

    componentWillUnmount() {
        // Stop auto-polling if running
        this.pollers.forEach(function (poller) {
            if (poller.xhr) {
                poller.xhr.abort();
                poller.xhr = null;
            }
            poller.timer.stop();
            poller.timer = null;
        });
        this.pollers = null;
    }

    render() {
        return <span>
                <span style={{
                    display: 'inline-block',
                    verticalAlign: 'middle',
                    marginRight: 5,
                    fontSize: '.8em'
                }}>
                {this.props.showToggle && <Toggle
                    on={this.props.on}
                    description={'Enable periodic polling to refresh data (every ' + Math.round(this.props.frequency / 1000) + 's)'}
                    onToggle={this.props.onToggle}
                />
                }
                </span>
                <span style={{fontSize: '.8em'}}>
                    <i className="fa fa-refresh fa-spin fa-fw"
                       style={{
                           display: this.state.fetching ? false : 'none'
                       }}
                       title="Fetching data..."
                    />
                    <i className="fa fa-paint-brush fa-spin fa-fw"
                       style={{
                           display: this.state.delivering ? false : 'none'
                       }}
                       title="Rendering new data..."
                    />
                    <i className="fa fa-exclamation-triangle fa-fw"
                       style={{
                           color: 'darkred',
                           display: this.state.errors.length ? false : 'none'
                       }}
                       title={'Failed to fetch new data (' + this.state.errors.join('; ') + ')'}
                    />
                </span>
            </span>
    }
}

//// Main plugin-loader component

const VERTICAL_OUTER_OFFSET = 25;   // # vertical px already taken outside component (for auto height sizing related to window height)
const HEADER_HEIGHT = 60;            // # vertical px used by panel header
const FOOTER_HEIGHT = 60;            // # vertical px used by panel footer
const MONITOR_UPD_FREQ = 20000; // ms

class VizPlugin extends React.Component {
    static propTypes = {
        plugin: PropTypes.string,
        title: PropTypes.string,
        header: PropTypes.node,
        queryTxt: PropTypes.string,
        dataCall: PropTypes.func,
        markersDataCall: PropTypes.func,
        configMan: PropTypes.object,
        hidePanel: PropTypes.bool,
        loadingTxt: PropTypes.node
    };

    static defaultProps = function () {
        return {
            plugin: 'rawText',
            title: '',
            queryTxt: '',
            dataCall: blankDataCall,
            markersDataCall: blankDataCall,
            hidePanel: false
        };

        function blankDataCall(successCb, errorCb) {
            successCb({/* data */});
            // Return pointer to ajax xhr object to allow on-demand aborting
            return new XMLHttpRequest();
        }
    }();

    constructor(props) {
        super(props);

        var showControls = props.configMan.getParam('showControls', true);
        var showTimeLogger = props.configMan.getParam('showTimeLogger', true);
        var monitorCfg = props.configMan.getParam('liveUpdate', false);

        this.state = {
            maxHeight: props.configMan.getParam('pluginMaxHeight') || (window.innerHeight - VERTICAL_OUTER_OFFSET),
            dataLoaded: false,
            parsing: false,
            monitoring: tools.fuzzyBoolean(monitorCfg),
            showControls: tools.fuzzyBoolean(showControls),
            showTimeLogger: tools.fuzzyBoolean(showTimeLogger),
            data: null,
            dataRetrievalError: null,
            vizTimeRange: null
        };
    }

    componentDidUpdate(prevProps) {
        if (this.props.plugin != prevProps.plugin && this.state.dataLoaded) {
            this.setState({
                vizTimeRange: [
                    this.state.data.summary().earliest_from * 1000,
                    this.state.data.summary().last_until * 1000
                ]
            });
        }
    }

    componentWillMount() {
        this.currentXhrs = [];
    }

    componentDidMount() {

        var rThis = this;

        this._abortAllXhrs();  // Abort current ajax request

        // Get initial data
        var dataLoading = 2;

        var currentXhr = this.props.dataCall(
            function (apiData) {    // Success

                rThis.setState({parsing: true});

                var chData = new CharthouseDataSet(apiData);

                rThis.setState({
                    dataLoaded: --dataLoading <= 0,
                    parsing: false,
                    data: chData,
                    vizTimeRange: [
                        chData.summary().earliest_from * 1000,
                        chData.summary().last_until * 1000
                    ]
                });

                // Set page title to series name (but only if our config is
                // the global config)
                // this check reads a little strangely because .globalCfg
                // returns the global config iff it is not the global
                // config...
                // TODO: figure out if there is a better way to do this
                if (!rThis.props.configMan.globalCfg) {
                    const cp = chData.summary().common_prefix;
                    document.title = cp ? cp.getCanonicalHumanized()
                        : (rThis.props.title.length < 40 ? rThis.props.title.trim() : '');
                }
            },

            function (msg) { // Data retrieval error
                rThis.setState({dataRetrievalError: msg});
            }
        );

        var markersXhr = this.props.markersDataCall(
            function success(apiData) {
                rThis.setState({dataLoaded: --dataLoading <= 0});
                rThis._onMarkersUpdate(apiData);
            },
            function error(msg) {
                rThis.setState({dataRetrievalError: msg});
            }
        );

        this.currentXhrs = [currentXhr, markersXhr];

        window.addEventListener('resize', this._setMaxHeight);
        this.props.configMan.onParamChange(this._setMaxHeight, 'pluginMaxHeight');
        this.props.configMan.onParamChange(this._setMonitoring, 'liveUpdate');
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this._setMaxHeight);
        this.props.configMan.unsubscribe(this._setMaxHeight, 'pluginMaxHeight');
        this.props.configMan.unsubscribe(this._setMonitoring, 'liveUpdate');
        this._abortAllXhrs();
    }

    render() {

        var pluginObj = CHARTHOUSE_PLUGIN_SPECS[this.props.plugin];

        if (!pluginObj) {
            // No such plugin
            return <div className="alert alert-warning">
                Visualization plugin <strong>{this.props.plugin} </strong>
                not available! Please pick a different representation method.
            </div>;
        }

        let panelTitle;
        if (this.props.title) {
            panelTitle = this.props.title.trim();
        } else if (this.state.dataLoaded && this.state.data.summary().common_prefix) {
            panelTitle = this.state.data.summary().common_prefix.getCanonicalHumanized();
        } else {
            panelTitle = this.props.queryTxt || null;
        }

        var liveUpdPoller = pluginObj.dynamic  // Include self-update button, if plugin supports it
            ? <AutoPoller
                on={this.state.monitoring}
                frequency={MONITOR_UPD_FREQ}
                showToggle={this.state.showControls}
                onToggle={this._selfUpdateToggle}
                targets={[{
                    dataCall: this.props.dataCall,
                    onNewData: this._onDataUpdate
                }, {
                    dataCall: this.props.markersDataCall,
                    onNewData: this._onMarkersUpdate
                }]}
            />
            : null;

        var panelBody = <div>
            <div className={this.props.hidePanel ? "" : "panel-body"}>
                {this.state.dataRetrievalError
                    // Data error
                    ? <div className="alert alert-danger">
                        <strong>Data retrieval
                            error: {this.state.dataRetrievalError}</strong>
                    </div>
                    : ((!this.state.dataLoaded || this.state.parsing)
                            // Loading data...
                            ? <div>
                                <div
                                    className="progress progress-striped active center-block">
                                    <div className="progress-bar"
                                         style={{width: '100%'}}>
                                        <span
                                            className="sr-only">Loading...</span>
                                    </div>
                                </div>
                                <div className="text-muted text-center">
                                    {!this.state.parsing
                                        ? this.props.loadingTxt ? this.props.loadingTxt : ('Loading data' + (this.props.queryTxt.trim() ? (' for ' + this.props.queryTxt.trim().abbrFit(200)) : '...'))
                                        : 'Parsing data...'
                                    }
                                </div>
                            </div>
                            : (this.state.data.isEmpty()
                                    // Empty data
                                    ? <div className="text-center">
                                        <em>No data
                                            found</em> {!this.state.showControls && this.state.dataLoaded ? liveUpdPoller : null}
                                    </div>
                                    // Showing data
                                    : <div>
                                        <div>
                                            <PluginContent
                                                pluginCfg={pluginObj}
                                                data={this.state.data}
                                                markers={this.state.markers}
                                                onTimeChange={this._vizTimeChanged}
                                                configMan={this.props.configMan}
                                                maxHeight={this.state.maxHeight
                                                - HEADER_HEIGHT
                                                - (this.state.showControls ? FOOTER_HEIGHT : 0)
                                                }
                                            />
                                        </div>
                                        <DataInfo
                                            data={this.state.data}
                                            vizTimeRange={this.state.showTimeLogger ? this.state.vizTimeRange : null}
                                        >
                                            {   // Include poller here if it's not on footer
                                                !this.state.showControls && this.state.dataLoaded ? liveUpdPoller : null
                                            }
                                        </DataInfo>
                                    </div>
                            )
                    )
                }
            </div>

            {this.state.showControls && this.state.dataLoaded
                ? <div className="panel-footer">
                    <PluginFooter data={this.state.data}>
                            <span>
                                <em className="small"
                                    style={{marginRight: 5}}>Live-update:</em>
                                {liveUpdPoller}
                            </span>
                    </PluginFooter>
                </div>
                : null
            }
        </div>;

        return this.props.hidePanel
            ? panelBody
            : <div
                className="panel panel-default controller-panel charthouse-viz-plugin">
                <div className="panel-heading"
                     style={{display: this.state.dataLoaded ? false : 'none'}}
                >
                    {this.props.header
                        ? this.props.header
                        :
                        (<div className="text-center">
                            <strong
                                className="panel-title">{panelTitle || '\u00a0'}
                            </strong>
                        </div>)
                    }
                </div>
                {panelBody}
            </div>;
    }

    // Private methods
    _setMaxHeight = () => {
        var newHeight = this.props.configMan.getParam('pluginMaxHeight') || (window.innerHeight - VERTICAL_OUTER_OFFSET);
        if (this.state.maxHeight != newHeight) {
            this.setState({maxHeight: newHeight});
        }
    };

    _setMonitoring = (newVal) => {
        newVal = tools.fuzzyBoolean(newVal);
        if (newVal != this.state.monitoring) {
            this.setState({monitoring: newVal});
        }
    };

    _selfUpdateToggle = (isOn) => {
        this.props.configMan.setParams({liveUpdate: isOn});
    };

    _onDataUpdate = (newData) => {
        var newDataSet = new CharthouseDataSet(newData);
        if (this.state.data.diffData(newDataSet)) {
            // Update state if data has changed
            this.setState({
                data: newDataSet,
                vizTimeRange: [
                    newDataSet.summary().earliest_from * 1000,
                    newDataSet.summary().last_until * 1000
                ]
            });
        }
    };

    _vizTimeChanged = (newTimeRange) => {
        this.setState({vizTimeRange: newTimeRange})
    };

    _abortAllXhrs = () => {
        this.currentXhrs.forEach(function (xhr) {
            xhr.abort();
        });
        this.currentXhrs = [];
    };

    _onMarkersUpdate = (apiData) => {
        // markers = {
        //     seriesExpressionText: [{
        //         time: ...,
        //         value: ...,
        //         color: ...,
        //         iconUrl: ...
        //     }]
        // }
        this.setState({markers: apiData});
        //this.props.configMan.setParams({markers: apiData}, false);
    };

    // Public methods
    refresh = () => {
        // Reset to initial state and re-run constructor
        this.setState({
            dataLoaded: false,
            parsing: false,
            data: null,
            vizTimeRange: null,
            dataRetrievalError: null
        });
        this.componentDidMount();
    };
}

export default VizPlugin;
