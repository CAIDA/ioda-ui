import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';
import Slider from 'react-bootstrap-slider';
import d3 from 'd3';
import cubism from '../libs/cubism';
import $ from 'jquery';

import tools from '../utils/tools';
import Toggle from '../components/toggle-switch';
import RadioToolbar from '../components/radio-toolbar';
import { CharthouseDataSet } from '../utils/dataset';

// Sort by method
class SortBy extends React.Component {

    static propTypes = {
        sortBy: PropTypes.string,
        onSortByChanged: PropTypes.func,
        sortAscending: PropTypes.bool,
        onToggleSortAscending: PropTypes.func
    };

    static defaultProps = {
        sortBy: 'alpha',
        sortAscending: true,
        onSortByChanged: function (newVal) {
        },
        onToggleSortAscending: function (newVal) {
        }
    };

    render() {

        const sortByOptions = [
            ['alpha', 'Name'],
            ['max', 'Max val'],
            ['avg', 'Avg val'],
            ['latest', 'Latest val'],
            ['recent', 'Most recent'],
            ['euclideanDistance', 'Euclidean distance']
        ];

        return <div
            className='text-left'
            style={{display: 'inline-block', margin: '0 5px'}}
        >
            <em className="small" style={{margin: '0 3px'}}>Sort by:</em>
            <br/>
            <span className="form-inline">
                <select className="form-control input-sm"
                        value={this.props.sortBy}
                        title='Select method to sort the series by.'
                        style={{
                            height: 18,
                            padding: '0 2px',
                            fontSize: '.65em',
                            cursor: 'pointer'
                        }}
                        onChange={this._changedSortBy}
                >
                        {sortByOptions.map(function (opt) {
                            return <option key={opt[0]} value={opt[0]}>
                                {opt[1]}
                            </option>;
                        })}
                </select>
            </span>

            <span style={{margin: '0 3px'}}>
                <RadioToolbar
                    key="sortOrder"
                    selected={this.props.sortAscending ? 't' : 'f'}
                    description='Sort series in a descending (arrow down) or ascending (arrow up) order'
                    fontSize="9px"
                    options={[
                        {
                            val: 'f',
                            display: <small>
                                <i className="fa fa-arrow-down"/>
                            </small>
                        },
                        {
                            val: 't',
                            display: <small>
                                <i className="fa fa-arrow-up"/>
                            </small>
                        }
                    ]}
                    onChange={this._toggleSortAscending}
                />
            </span>
        </div>
    }

    // Private methods
    _changedSortBy = (e) => {
        this.props.onSortByChanged(e.target.value);
    };

    _toggleSortAscending = (newVal) => {
        this.props.onToggleSortAscending(newVal === 't');
    };
}

class Controller extends React.Component {
    static propTypes = {
        seriesHeight: PropTypes.number,
        autoYScale: PropTypes.bool,
        sortBy: PropTypes.string,
        sortAscending: PropTypes.bool,
        yScalePower: PropTypes.number,
        onChangeSeriesHeight: PropTypes.func,
        onToggleAutoYScale: PropTypes.func,
        onChangeYScalePower: PropTypes.func,
        onSortByChanged: PropTypes.func,
        onToggleSortAscending: PropTypes.func
    };

    static defaultProps = {
        seriesHeight: 0,
        autoYScale: false,
        yScalePower: 1,
        sortBy: 'alpha',
        sortAscending: true,
        onChangeSeriesHeight: function (newHeight) {
        },
        onToggleAutoYScale: function (newState) {
        },
        onChangeYScalePower: function (newState) {
        },
        onSortByChanged: function (newVal) {
        },
        onToggleSortAscending: function (newVal) {
        }
    };

    render() {

        const rThis = this;

        const seriesHeightOptions = [
            [0, 'auto'],
            [1, 'micro'],
            [3, 'small'],
            [10, 'medium'],
            [40, 'medium-large'],
            [80, 'large'],
            [250, 'huge']
        ];

        return <div className="text-right">
            <div className='text-left' style={{display: 'inline-block'}}>
                <em className="small" style={{margin: '0 3px'}}>Series
                    Height:</em>
                <br/>
                <span className="form-inline">
                    <select className="form-control input-sm"
                            value={this.props.seriesHeight}
                            title='Height of each stacked series. Choose "auto" to fit whole graph to screen.'
                            style={{
                                height: 18,
                                padding: '0 2px',
                                fontSize: '.65em',
                                cursor: 'pointer'
                            }}
                            onChange={this._changedSeriesHeight}
                    >
                        {seriesHeightOptions.map(function (opt) {
                            return <option key={opt[0]} value={opt[0]}>
                                {opt[1]}
                            </option>;
                        })}
                    </select>
                </span>
            </div>

            <SortBy
                sortBy={this.props.sortBy}
                sortAscending={this.props.sortAscending}
                onSortByChanged={this.props.onSortByChanged}
                onToggleSortAscending={this.props.onToggleSortAscending}
            />

            <div className='text-left'
                 style={{display: 'inline-block', margin: '0 10px'}}>
                <small><em>Auto Y Scale:</em></small>
                &nbsp;&nbsp;
                <br/>
                <div style={{
                    display: 'inline-block',
                    verticalAlign: 'middle'
                }}>
                    <Toggle
                        on={this.props.autoYScale}
                        width={55}
                        textOn="Global"
                        textOff="Local"
                        description="Switch between using same Y scale range for all series (Global) or individual Y scale range based on series max (Local)"
                        onToggle={this.props.onToggleAutoYScale}
                    />
                </div>
            </div>

            <Slider
                width={110}
                min={-9}
                max={9}
                step={1}
                value={this._base2slider(this.props.yScalePower)}
                tooltipFormatter={function (val) {
                    val = rThis._slider2base(val);
                    return val === 1
                        ? 'Linear'
                        : (val > 1
                                ? 'Exp base ' + val
                                : 'Log base ' + Math.round(1 / val)
                        );
                }}
                description="Change Y scale base type, from Linear (center) to logarithmic (right) or exponential (left)"
                change={this._changedYScaleSlider}
            />

        </div>;
    }

    // Private methods
    _slider2base = (val) => {
        val = -val; // Convert to number
        return val >= 0 ? 1 + val : 1 / (1 - val);
    };

    _base2slider = (base) => {
        base = +base;
        return -Math.round((base >= 1 ? base - 1 : 1 - 1 / base));
    };

    _changedYScaleSlider = (newVal) => {
        this.props.onChangeYScalePower(this._slider2base(newVal));
    };

    _changedSeriesHeight = (e) => {
        this.props.onChangeSeriesHeight(e.target.value);
    };
}

const MIN_FONT_SIZE = 6;
const MIN_HEIGHT_WITH_BORDER = 4;     // Min horizon chart height to include chart border (unclutter thin graphs)
const TIME_FORMATTER = d3.time.format.utc("%a, %b %-d %Y %-I:%M%p UTC");
const HORIZONTAL_MARGIN = 10;   // To accommodate for eventual scrollbar

class StackedHorizonsGraph extends React.PureComponent {
    static propTypes = {
        data: PropTypes.instanceOf(CharthouseDataSet).isRequired,
        width: PropTypes.number.isRequired,
        seriesHeight: PropTypes.number,
        sortBy: PropTypes.string,
        sortAscending: PropTypes.bool,
        globalYScale: PropTypes.bool,
        yScalePower: PropTypes.number
    };

    static defaultProps = {
        seriesHeight: 10,
        globalYScale: false,
        yScalePower: 1,
        sortBy: 'alpha',
        sortAscending: true
    };

    state = {
        context: cubism.context()           // Establish Cubism Context
            .size(this.props.width - HORIZONTAL_MARGIN)    // # of points (each point=1px)
            .stop()
    };

    componentDidMount() {
        this._configCubismContext();
        this._plotChart();
    }

    componentDidUpdate(nextProps) {
        if (nextProps.width !== this.props.width) {
            this.state.context.size(this.props.width - HORIZONTAL_MARGIN);
        }

        if (nextProps.width !== this.props.width || nextProps.data !== this.props.data) {
            this._configCubismContext();
        }

        this._plotChart();
    }

    render() {
        return <div className="stacked-series-graph"
                    style={{
                        width: this.props.width - HORIZONTAL_MARGIN
                    }}
        />;
    }

    // Private methods
    _configCubismContext = () => {
        const data = this.props.data;

        const nativeNumPoints = (data.summary().last_until - data.summary().earliest_from) / data.summary().steps[0];
        const nativeStep = data.summary().steps[0] * 1000;
        const numPoints = this.state.context.size();

        this.state.context.step(Math.round(nativeStep * nativeNumPoints / numPoints));           // time unit (msecs)
        this.state.context.serverDelay(Date.now() - new Date(data.summary().last_until * 1000));    // Last data available
    };

    _padData = () => {
        const parsed = $.extend(true, {}, this.props.data.data());
        Object.keys(parsed.series).forEach(function (serId) {
            padData(parsed.series[serId], parsed.summary.earliest_from, parsed.summary.last_until);
        });

        function padData(seriesData, earliestFrom, lastUntil) {
            // Pad the series data to obey earliestFrom and lastUntil
            let missingTime = seriesData.from - earliestFrom;
            while (missingTime > 0) {
                seriesData.values.unshift(null);
                missingTime -= seriesData.step;
            }

            missingTime = lastUntil - seriesData.until;
            while (missingTime > 0) {
                seriesData.values.push(null);
                missingTime -= seriesData.step;
            }
        }

        return parsed;
    };

    _plotChart = () => {

        const rThis = this;
        const data = this._padData();
        const valRange = this.props.data.getValRange();
        const node = ReactDOM.findDOMNode(this);

        ////

        $(node).empty();

        // Top/bottom axis
        d3.select(node)
            .selectAll(".axis")
            .data(["top", "bottom"])
            .enter().append("div")
            .attr("class", function (d) {
                return d + " axis";
            }).each(function (d) {
            d3.select(this)
                .call(rThis.state.context.axis()
                    .ticks(Math.ceil(rThis.props.width / 200))  // One tick every ~200px)
                    .orient(d)
                    .tickFormat(d3.time.format.utc.multi([
                        [".%L", function (d) {
                            return d.getUTCMilliseconds();
                        }],
                        [":%S", function (d) {
                            return d.getUTCSeconds();
                        }],
                        ["%-I:%M%p", function (d) {
                            return d.getUTCMinutes();
                        }],
                        ["%-I%p", function (d) {
                            return d.getUTCHours();
                        }],
                        ["%a %-d", function (d) {
                            return d.getUTCDay() && d.getUTCDate() !== 1;
                        }],
                        ["%b %-d", function (d) {
                            return d.getUTCDate() !== 1;
                        }],
                        ["%b", function (d) {
                            return d.getUTCMonth();
                        }],
                        ["%Y", function () {
                            return true;
                        }]
                    ]))
                    .focusFormat(TIME_FORMATTER)
                );
        });

        // Horizon series graphs
        const $horizons = $('<div>').insertBefore($(node).find('.bottom'))
            .css('position', 'relative');

        d3.select($horizons[0])
            .selectAll(".horizon")
            .data(Object.keys(data.series)
                .sort(this._getSortMethod())
                .map(stock)
            ).enter()
            .append("div")
            .attr("class", "horizon").call(rThis.state.context.horizon()
            .format(function (d) {
                return d == null ? 'n/a' : d3.format(".3s")(d);
            })
            .height(rThis.props.seriesHeight)
            .extent(rThis.props.globalYScale ? [valRange[0], valRange[1]] : null)
            .scale(d3.scale.pow().exponent(rThis.props.yScalePower))
        );

        // Resize/hide series text
        const fontSize = Math.min(rThis.props.seriesHeight * 0.55, 14);
        $("span.title, span.value", $horizons).css(
            fontSize > MIN_FONT_SIZE
                ? {'font-size': fontSize}
                : {display: 'none'}
        );

        // Remove border for very thin horizon lines
        if (this.props.seriesHeight < MIN_HEIGHT_WITH_BORDER) {
            $(".horizon", $horizons).css('border', 'none');
        }

        // Mouse hover vertical rule
        d3.select($horizons[0]).append("div")
            .attr("class", "rule")
            .call(this.state.context.rule());

        const $hoverLogger = $('<span class="floating-legend small">')
            .appendTo($(node));

        this.state.context.on("focus", function (x) {

            // Make the rule text follow the cursor horizontally
            d3.selectAll(".value").style(
                "right",
                x == null ? null : rThis.state.context.size() - x + 6 + "px"
            );

            // Update the logger value
            const $hoverHorizon = $('.horizon:hover', $horizons);
            const ptTime = TIME_FORMATTER(rThis.state.context.scale.invert(x));
            $hoverLogger
                .html($('.title', $hoverHorizon).text().length
                    ? '<em>' + $('.title', $hoverHorizon).text() + '</em>: '
                    + '<b>' + $('.value', $hoverHorizon).text() + '</b> '
                    + (data.summary.common_suffix || '') // Units
                    + '<br><small><em>(' + ptTime + ')</em></small>'
                    : ''
                );
        });

        // Make the logger follow the cursor
        $horizons.on("mousemove", function (e) {
            const swapToLeft = ((rThis.props.width - e.clientX) < $hoverLogger.width());
            $hoverLogger.css({
                'left': e.clientX + (swapToLeft ? (-$hoverLogger.width() - 13) : 13),
                'top': e.clientY + 5
            });
        }).on("mouseout", function () {
            $hoverLogger.html('');
        });

        ///

        function stock(expression) {
            return rThis.state.context.metric(
                function (start, stop, step, callback) {
                    callback(null, data.series[expression].values.crossSample(rThis.state.context.size()));
                },
                data.series[expression].name ? data.series[expression].name.abbrFit(100) : ''
            );
        }
    };

    _getSortMethod = () => {

        const props = this.props;
        const ascending = this.props.sortAscending;

        // Alphabetically or default
        const options = ['alpha', 'max', 'avg', 'latest', 'recent', 'euclideanDistance'];
        if (props.sortBy === 'alpha' || options.indexOf(props.sortBy) === -1) {
            return function (a, b) {
                return (ascending ? 1 : -1) * ((a > b) ? 1 : -1);
            };
        }

        // For the remaining methods, we must pre-process data for sorting performance
        const seriesData = this.props.data.data().series;
        const preProcessData = {};

        Object.keys(seriesData).forEach(function (s) {
            switch (props.sortBy) {
                case 'max':
                    preProcessData[s] = Math.max.apply(Math, seriesData[s].values);
                    break;
                case 'avg':
                    let sum = 0, cnt = 0;
                    seriesData[s].values.filter(function (val) {
                        return val != null;
                    }).forEach(function (val) {
                        sum += val;
                        cnt++;
                    });
                    preProcessData[s] = cnt ? sum / cnt : null;
                    break;
                case 'latest':
                    preProcessData[s] = null;
                    seriesData[s].values.slice().reverse().some(function (val) {
                        if (val != null) {
                            preProcessData[s] = val;
                            return true;    // Break out of loop
                        }
                    });
                    break;
                case 'recent':
                    preProcessData[s] = seriesData[s].until + seriesData[s].step;
                    seriesData[s].values.slice().reverse().some(function (val) {
                        preProcessData[s] -= seriesData[s].step;
                        return val != null;   // Break out of loop
                    });
                    break;
                default:
                    break;
            }
        });

        if (this.props.sortBy === 'euclideanDistance') {
            // If the threshold is too large, the border of clusters is blurry
            // If the threshold is too small, the greedy algorithm archives local optimum but ignores larger patterns
            const DISTANCE_THRESHOLD = 1;

            // Normalize values to the range [1, 0]
            const seriesValues = Object.keys(seriesData).reduce(function (seriesValues, s) {
                const values = seriesData[s].values.map(function (d) {
                    return d || 0;
                });
                const maxVal = Math.max.apply(Math, values);
                seriesValues[s] = (maxVal === 0)
                    ? Array.apply(null, Array(values.length)).map(Number.prototype.valueOf, 0)
                    : values.map(function (d) {
                        return d / maxVal;
                    });
                return seriesValues;
            }, {});

            const summary = this.props.data.summary();
            let numPoints;
            if (summary.steps.length === 1 && uniqueBy(seriesData, 'from') &&
                uniqueBy(seriesData, 'until')) {
                // Span and step are unique and thus array length is unique. No need to align
                numPoints = (summary.last_until - summary.earliest_from) / summary.steps[0]
            }
            else {
                // Pad series to the same length and sample to the same step as the graph is
                // Series are regarded as discrete points, not intervals
                numPoints = this.state.context.size();
                const lastUntilWithoutStep = Math.max.apply(Math,
                    Object.keys(seriesData).map(function (s) {
                        return seriesData[s].until - seriesData[s].step;
                    }));
                const timeStep = (lastUntilWithoutStep - summary.earliest_from) / (numPoints - 1);
                Object.keys(seriesValues).forEach(function (s) {
                    const values = seriesValues[s], series = seriesData[s];
                    const crossSampledValues = seriesValues[s] = [];
                    for (let i = 0; i < numPoints; i++) {
                        const time = summary.earliest_from + timeStep * i;
                        const idx = (time - series.from) / series.step;
                        const leftIdx = Math.floor(idx),
                            rightIdx = Math.ceil(idx);
                        const val = (rightIdx === leftIdx)
                            ? values[idx]
                            : values[leftIdx] * (rightIdx - idx) + values[rightIdx] * (idx - leftIdx);
                        crossSampledValues.push(val || 0);
                    }
                }.bind(this));
            }

            let cntr = 0;
            const threshold = Math.pow(DISTANCE_THRESHOLD / 8, 2) * numPoints / 100; // by intuition
            // Choose the time series with minimum events as the initial value
            let pivot = Object.keys(seriesData).reduce(function (last, s) {
                const events = seriesData[s].values.reduce(function (a, b) {
                    return a + (b || 0);
                }, 0);
                return last[0] < events ? last : [events, s];
            }, [Number.MAX_VALUE])[1];

            while (Object.keys(seriesValues).length) {
                preProcessData[pivot] = cntr++;
                const pivotValues = seriesValues[pivot];
                delete seriesValues[pivot];

                let minSimilarity = Number.MAX_VALUE;
                Object.keys(seriesValues).map(function (s) {
                    const similarity = distance(pivotValues, seriesValues[s], minSimilarity);

                    // Find all time series similar to pivot (smaller than threshold)
                    if (similarity < threshold) {
                        return [s, similarity];
                    }

                    // Set pivot to the next ts most similar to pivot (not smaller than threshold)
                    else if (similarity < minSimilarity) {
                        pivot = s;
                        minSimilarity = similarity;
                    }
                })
                    .filter(Boolean)
                    .sort(function (a, b) {
                        // Sort by similarity to the pivot
                        const diff = a[1] - b[1];
                        if (diff) {
                            return diff;
                        }

                        // Sort by visual discrepancy
                        const vs1 = seriesValues[a[0]],
                            vs2 = seriesValues[b[0]];
                        for (let i = 0; i < vs1.length; i++) {
                            if (Boolean(vs1[i]) ^ Boolean(vs2[i])) {
                                return vs1[i] ? -1 : 1;
                            }
                        }
                        return 0;
                    })
                    .forEach(function (sTuple) {
                        preProcessData[sTuple[0]] = cntr++;
                        delete seriesValues[sTuple[0]];
                    });
            }

            function uniqueBy(obj, property) {
                const seen = [];
                return Object.keys(obj).every(function (s) {
                    const prop = obj[s][property];
                    if (seen.indexOf(prop) === -1) {
                        if (seen.length === 0) {
                            seen.push(prop);
                        }
                        else {
                            return false;
                        }
                    }
                    return true;
                });
            }

            function distance(vs1, vs2, max) { // Euclidean distance
                let sum = 0;
                for (let i = 0; i < vs1.length; i++) {
                    sum += Math.pow(vs1[i] - vs2[i], 2);
                    if (sum >= max) {
                        return max;
                    }
                }
                return sum; // does not sqrt for performance
            }
        }

        return function (a, b) {
            return (ascending ? 1 : -1) * (preProcessData[a] - preProcessData[b]);
        };
    };
}

const VERTICAL_HEADROOM = 140;  // Graph header and footer vertical margin space
const VERTICAL_HEADROOM_NO_CONTROLS = 90;
//const MAX_SERIES_HEIGHT = 250;   // px

// Main viz component
class StackedHorizonViz extends React.Component {
    static propTypes = {
        data: PropTypes.instanceOf(CharthouseDataSet).isRequired,
        configMan: PropTypes.object,
        maxHeight: PropTypes.number
    };

    static defaultProps = {
        configMan: {
            getParam: function (key) {
            },
            setParams: function (keVals) {
            },
            onParamChange: function (cb, key) {
            },
            unsubscribe: function (cb, key) {
            }
        },
        maxHeight: window.innerHeight * .7
    };

    constructor(props) {
        super(props);

        const showControls = props.configMan.getParam('showControls', true);
        const ascending = props.configMan.getParam('sortAscending', true);

        this.state = {
            width: null,
            showControls: tools.fuzzyBoolean(showControls),

            sortBy: props.configMan.getParam('sortBy') || '',
            sortAscending: tools.fuzzyBoolean(ascending),
            horizonSeriesHeight: props.configMan.getParam('horizonSeriesHeight') || 0,   // 0 = auto derived
            autoYScale: false,
            yScalePower: props.configMan.getParam('yScalePower') || 1
        };
    }

    componentDidMount() {
        this._setWidth();
        window.addEventListener('resize', this._setWidth);
        this.props.configMan.onParamChange(this._configChanged);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this._setWidth);
        this.props.configMan.unsubscribe(this._configChanged);
    }

    render() {

        return <div className="charthouse-stacked-series">
            {this.state.showControls &&
            <div style={{marginBottom: 5, marginRight: 12}}>
                <Controller
                    seriesHeight={+this.state.horizonSeriesHeight}
                    autoYScale={this.state.autoYScale}
                    yScalePower={this.state.yScalePower}
                    sortBy={this.state.sortBy}
                    sortAscending={this.state.sortAscending}
                    onChangeSeriesHeight={this._onChangeSeriesHeight}
                    onToggleAutoYScale={this._onToggleAutoYScale}
                    onChangeYScalePower={this._onChangeYScalePower}
                    onSortByChanged={this._changeSortBy}
                    onToggleSortAscending={this._toggleSortAscending}
                />
            </div>
            }

            {this.state.width && <StackedHorizonsGraph
                data={this.props.data}
                width={this.state.width}
                seriesHeight={+this.state.horizonSeriesHeight || this._getAutoSeriesHeight()}
                globalYScale={this.state.autoYScale}
                yScalePower={this.state.yScalePower}
                sortBy={this.state.sortBy}
                sortAscending={this.state.sortAscending}
            />
            }
        </div>;
    }

    // Private methods
    _setWidth = () => {
        this.setState({width: ReactDOM.findDOMNode(this).offsetWidth});
    };

    _configChanged = (newParams) => {
        const rThis = this;

        const keepProps = ['horizonSeriesHeight', 'sortBy', 'sortAscending'];

        const updState = {};
        let defaults;
        Object.keys(newParams).forEach(function (k) {
            if (keepProps.indexOf(k) !== -1) {

                if (newParams[k] == null && defaults == null)
                    defaults = rThis.getInitialState();  // Populate defaults

                updState[k] = (newParams[k] != null
                        ? parse(newParams[k])
                        : defaults[k]
                );
            }
        });

        if (Object.keys(updState).length) {
            this.setState(updState);
        }

        function parse(val) {
            if (typeof val === 'string' && val.length) {
                const valLc = val.toLowerCase();
                if (valLc === 'false' || valLc === 'true')
                    return (valLc !== 'false');  // Boolean

                if (!isNaN(val))
                    return +val;        // Number
            }

            return val;
        }
    };

    _onChangeSeriesHeight = (newHeight) => {
        this.props.configMan.setParams({'horizonSeriesHeight': newHeight});
    };

    _onToggleAutoYScale = (newState) => {
        this.setState({autoYScale: newState});
    };

    _onChangeYScalePower = (newVal) => {
        this.setState({yScalePower: newVal});
    };

    _getAutoSeriesHeight = () => {
        // Auto-derive based on graph-height
        const graphHeight = this.props.maxHeight - (this.state.showControls ? VERTICAL_HEADROOM : VERTICAL_HEADROOM_NO_CONTROLS);

        // AK disables max series height. always use all available vspace.
        //return Math.min(MAX_SERIES_HEIGHT, Math.max(1,
        //    Math.floor(graphHeight / this.props.data.cntSeries())
        //));

        return Math.max(1,
            Math.ceil(graphHeight / this.props.data.cntSeries())
        );
    };

    _changeSortBy = (newMethod) => {
        this.props.configMan.setParams({sortBy: newMethod});
    };

    _toggleSortAscending = (newVal) => {
        this.props.configMan.setParams({sortAscending: newVal});
    };
}

export default StackedHorizonViz;
