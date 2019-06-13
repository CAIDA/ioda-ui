import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';
import moment from 'moment';
// TODO: re-apply or upgrade to version with following patch:
/*
// 2016-11-02 AK fixes bug when entire series is null, this caused highcharts
// to fall through both of these cases and emit an error.
if (!firstPoint || isNumber(firstPoint)) { // assume all points are numbers
 */
import HighStock from 'highcharts/highstock.src';

import RadioToolbar from '../components/radio-toolbar';
import tools from '../utils/tools';
import { CharthouseDataSet } from '../utils/dataset.js';
import Toggle from '../components/toggle-switch';
import SelectPicker from '../components/select-picker';
import '../utils/proto-mods';

const YAXIS_COLORS = ['teal', 'sienna'];

// Sub-Controls
// Row 1

// Y2 Series Assignment control
class Y2Control extends React.Component {
    static propTypes = {
        seriesList: PropTypes.object.isRequired, // id=>{series}
        y2Series: PropTypes.arrayOf(PropTypes.string).isRequired,
        onY2SeriesChanged: PropTypes.func.isRequired
    };

    render() {
        const sList = this.props.seriesList;
        return <div
            className='text-left'
            style={{
                display: (Object.keys(this.props.seriesList).length > 1) ?
                    'inline-block' :
                    'none',
                margin: '0 5px'
            }}
        >
            <em className="small">
                Move to <span style={{color: YAXIS_COLORS[1]}}>secondary Y</span> axis:
            </em>
            <br/>
            <SelectPicker
                style={{verticalAlign: 'middle'}}
                options={{
                    style: 'btn-default btn-xs',
                    size: 14,
                    showIcon: false,
                    countSelectedText: '{0} series selected'
                }}
                multiple
                disabled={this.props.seriesList.length < 2}
                onChange={this._seriesSelectionChanged}
                title='Select series'
                data-width='250px'
                data-live-search={true}
                data-selected-text-format='count>3'
            >
                {
                    Object.keys(sList).alphanumSort()
                        .map(function (s) {
                                return <option
                                    className="small"
                                    data-icon="glyphicon-leaf"
                                    value={s}
                                    key={s}
                                >
                                    {(sList[s].name || s).abbrFit(40, .3)}
                                </option>
                            }
                        )
                }
            </SelectPicker>
        </div>
    }

    _seriesSelectionChanged = (newVal) => {
        this.props.onY2SeriesChanged(newVal || []);
    };
}

// Point Aggregation control
class PointAggControl extends React.Component {

    static propTypes = {
        interactive: PropTypes.bool.isRequired,
        ptsPerPx: PropTypes.number,
        timePerPx: PropTypes.string,
        aggrFunc: PropTypes.string.isRequired,
        onAggrFuncChanged: PropTypes.func.isRequired
    };

    render() {
        const aggrFuncs = [
            ["average", "Avg"],
            ["sum", "Sum"],
            ["high", "Max"],
            ["low", "Min"],
            ["open", "First"],
            ["close", "Close"]
        ];

        const aggrFunc = this.props.aggrFunc;
        let aggrFuncName = '';
        aggrFuncs.forEach(function (kv) {
            if (kv[0] === aggrFunc) aggrFuncName = kv[1];
        });

        return <div
            className="text-left"
            style={{
                display: (this.props.ptsPerPx && this.props.ptsPerPx !== 1) ? 'inline-block' : 'none',
                margin: '0 3px'
            }}
        >
            <em className="small">Time point aggregation:&nbsp;</em>
            {this.props.interactive && <br/>}
            <span className="form-inline">
                    {this.props.interactive && <select
                        className="form-control input-sm"
                        style={{
                            height: '18px',
                            fontSize: '.65em',
                            padding: '0 2px',
                            cursor: 'pointer'
                        }}
                        title="If there is more than one time point per pixel, which aggregation method to use to visually group the multiple values into one point"
                        onChange={this._onChange}
                        value={this.props.aggrFunc}
                    >
                        {
                            aggrFuncs.map(function (aggrFunc) {
                                return <option
                                    value={aggrFunc[0]}
                                    key={aggrFunc[0]}
                                >
                                    {aggrFunc[1]}
                                </option>
                            })
                        }
                    </select>
                    }
                <span style={{fontSize: '.6em', verticalAlign: 'middle'}}>
                        {!this.props.interactive && <span>{aggrFuncName}</span>}
                    &nbsp;of <em>{this.props.ptsPerPx}</em> pts/px (<em>{this.props.timePerPx}</em>)
                    </span>
                </span>
        </div>
    }

    _onChange = (e) => {
        this.props.onAggrFuncChanged(e.target.value);
    };
}

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
            ['recent', 'Most recent']
        ];

        return <div
            className='text-left'
            style={{display: 'inline-block', margin: '0 5px'}}
        >
            <em className="small" style={{margin: '0 3px'}}>Sort series by:</em>
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

// Y-Axis Zoom toggle
class YAxisZoomToggle extends React.Component {
    static propTypes = {
        zoomMode: PropTypes.string.isRequired,
        onZoomModeChanged: PropTypes.func.isRequired
    };

    render() {
        return <div
            className="text-left"
            style={{
                display: 'inline-block',
                margin: '0 5px'
            }}
        >
            <em className="small">Y axis zoom:</em>
            <br/>
            <div style={{display: 'inline-block', verticalAlign: 'middle'}}>
                <Toggle
                    description="Manual mode enables interactive zooming on the Y axis"
                    onToggle={this._onToggle}
                    width={60}
                    height={16}
                    on={this.props.zoomMode === "auto"}
                    textOn="Auto"
                    textOff="Manual"
                />
            </div>
        </div>
    }

    _onToggle = (newState) => {
        this.props.onZoomModeChanged(newState ? "auto" : "manual");
    };
}

// Row 2

// Downsample Notice
class DownsampledNotice extends React.Component {
    static propTypes = {
        stepHuman: PropTypes.string
    };

    render() {
        if (!this.props.stepHuman) return null;

        return <span title='For improved rendering performance'>
                <b>Note: </b>Graph data downsampled to <em>
                {this.props.stepHuman}
                </em>
            </span>
    }
}

// All-Series toggle
class AllSeriesToggle extends React.Component {
    static propTypes = {
        onToggleAllSeries: PropTypes.func.isRequired
    };

    render() {
        return <span>
                click series to toggle on/off, dbl-click to solo (
                <a
                    href="javascript:void(0);"
                    className="text-info"
                    title="Toggles the visibility state of all series"
                    onClick={this.props.onToggleAllSeries}
                >
                    toggle all
                </a>
                )
            </span>
    }
}

// Set of controls above the chart
class Controls extends React.Component {
    static propTypes = {
        seriesList: PropTypes.object.isRequired, // id=>{series}
        chartType: PropTypes.string,
        sortBy: PropTypes.string.isRequired,
        sortAscending: PropTypes.bool.isRequired,
        y2Series: PropTypes.arrayOf(PropTypes.string).isRequired,
        zoomMode: PropTypes.string,
        aggrPtsPerPx: PropTypes.number,
        aggrTimePerPx: PropTypes.string,
        aggrFunc: PropTypes.string.isRequired,
        downsampledStepHuman: PropTypes.string,
        interactive: PropTypes.bool,
        onChartTypeChanged: PropTypes.func.isRequired,
        onY2SeriesChanged: PropTypes.func.isRequired,
        onZoomModeChanged: PropTypes.func.isRequired,
        onAggrFuncChanged: PropTypes.func.isRequired,
        onToggleAllSeries: PropTypes.func.isRequired,
        onSortByChanged: PropTypes.func,
        onToggleSortAscending: PropTypes.func
    };

    static defaultProps = {
        interactive: true,
        onSortByChanged: function (newVal) {
        },
        onToggleSortAscending: function (newVal) {
        }
    };

    render() {
        const showAllSeriesToggle = this.props.interactive && Object.keys(this.props.seriesList).length > 1;

        return <div>
            <div
                className="text-right"
                style={{marginBottom: '6px'}}
            >
                {this.props.interactive && <span style={{margin: '0 5px'}}>
                        <RadioToolbar
                            selected={this.props.chartType}
                            description='Choose chart type'
                            options={[
                                {
                                    val: 'line',
                                    display: <span><i
                                        className='fa fa-line-chart'/> Line</span>
                                },
                                {
                                    val: 'area',
                                    display: <span><i
                                        className='fa fa-area-chart'/> Stacked</span>
                                },
                                {
                                    val: 'column',
                                    display: <span><i
                                        className='fa fa-bar-chart'/> Bar</span>
                                }
                            ]}
                            onChange={this.props.onChartTypeChanged}
                        />
                    </span>}
                {this.props.interactive &&
                (Object.keys(this.props.seriesList).length > 1) && <SortBy
                    sortBy={this.props.sortBy}
                    sortAscending={this.props.sortAscending}
                    onSortByChanged={this.props.onSortByChanged}
                    onToggleSortAscending={this.props.onToggleSortAscending}
                />}
                {this.props.interactive && <Y2Control
                    seriesList={this.props.seriesList}
                    y2Series={this.props.y2Series}
                    onY2SeriesChanged={this.props.onY2SeriesChanged}
                />}
                <PointAggControl
                    interactive={this.props.interactive}
                    ptsPerPx={this.props.aggrPtsPerPx}
                    timePerPx={this.props.aggrTimePerPx}
                    aggrFunc={this.props.aggrFunc}
                    onAggrFuncChanged={this.props.onAggrFuncChanged}
                />
                {this.props.interactive && <YAxisZoomToggle
                    zoomMode={this.props.zoomMode}
                    onZoomModeChanged={this.props.onZoomModeChanged}
                />
                }
            </div>
            <div
                className="text-right text-muted"
                style={{fontSize: '.7em'}}
            >
                <DownsampledNotice
                    stepHuman={this.props.downsampledStepHuman}
                />
                <span>
                    {
                        this.props.downsampledStepHuman && showAllSeriesToggle ? ' | ' : null
                    }
                    </span>
                {showAllSeriesToggle && <AllSeriesToggle
                    onToggleAllSeries={this.props.onToggleAllSeries}
                />
                }
            </div>
        </div>;
    }

    // Private methods
    _changedSortBy = (e) => {
        this.props.onChangeSortBy(e.target.value);
    };

    _toggleSortAscending = (newVal) => {
        this.props.onToggleSortAscending(newVal === 't');
    };
}

// XY Chart

const MAX_SERIES_LEGEND = 500;
// TODO: check if these next two should still be set per-browser:
const MAX_SERIES_POINT_MARKERS = 1000;
const MAX_GRAPH_VERTICES = 100000;
const MAX_SERIES_TO_ANIMATE = 20;
const POINTS_PER_PIXEL = 2;

class CharthouseXYChart extends React.PureComponent {
    static propTypes = {
        data: PropTypes.instanceOf(CharthouseDataSet).isRequired,
        height: PropTypes.number.isRequired,
        type: PropTypes.string.isRequired,
        sortBy: PropTypes.string,
        sortAscending: PropTypes.bool,
        y2Series: PropTypes.arrayOf(PropTypes.string).isRequired,
        zoomMode: PropTypes.string.isRequired,
        aggrFunc: PropTypes.string.isRequired,
        onTimeRangeChanged: PropTypes.func.isRequired,
        onAggregationRatioChanged: PropTypes.func.isRequired,
        onDownsampledStepChanged: PropTypes.func.isRequired,
        showLegend: PropTypes.bool.isRequired,
        markers: PropTypes.object.isRequired
    };

    static defaultProps = {
        sortBy: 'alpha',
        sortAscending: true
    };

    componentDidMount() {
        this._draw();
        this.componentDidUpdate(this.props);
    }

    componentDidUpdate(prevProps) {
        let redraw = false;
        let fullRedraw = false;

        // has the data changed?
        if (prevProps.data !== this.props.data) {
            const diff = prevProps.data.diffData(this.props.data);
            if (diff) {
                this._updateData(diff);
            }
        }

        // have the markers changed?
        if (prevProps.markers !== this.props.markers) {
            this._updateMarkers();
        }

        // Has the chart height changed?
        if (prevProps.height !== this.props.height) {
            fullRedraw = true;
        }

        // has the chart type changed?
        if (prevProps.type !== this.props.type) {
            const chartType = this.props.type;
            this.highchart.series.forEach(function (series) {
                series.update({type: chartType}, false);
                // Keep track of it in global chart options too (for global rerender)
                series.chart.options.series[series.index].type = chartType;
            });
            redraw = true;
        }

        // has the sorting method changed
        if (prevProps.sortBy !== this.props.sortBy || prevProps.sortAscending !== this.props.sortAscending) {
            // Recalculate series order
            this.highchart.options.series = this._parseData(this.props.data.series());
            fullRedraw = true;
        }

        // update the y2 axis if necessary
        const y2Series = this.props.y2Series;
        const dualYAxis = (y2Series.length && y2Series.length < this.highchart.series.length);

        this.highchart.series.forEach(function (series) {
            const yAxis = 1 * (y2Series.indexOf(series.options.id) !== -1);
            if (yAxis !== series.options.yAxis) {
                series.update({yAxis: yAxis}, false);
                // Keep track of it in global chart options too (for global rerender)
                series.chart.options.series[series.index].yAxis = yAxis;
                redraw = true;
            }

            // Tag series label with y axis (if there's a dual axis)
            let name = series.options.name ? series.options.name.split('<span')[0] : series.options.id;
            if (dualYAxis) {
                name += '<span style="color: ' + YAXIS_COLORS[yAxis] + ';font-size: .7em;"> [y' + (yAxis + 1) + ']</span>';
            }
            if (series.options.name !== name) {
                series.update({name: name}, false);
                series.chart.options.series[series.index].name = name;
                redraw = true;
            }

            // Show/hide chart lines
            //$chart.highcharts().axes.slice(1,3).forEach(function (yAxis) {
            //  yAxis.update({ lineWidth:.6*dualYAxis }, false);
            //});

        });

        // change the zoom mode
        if (prevProps.zoomMode !== this.props.zoomMode) {
            this.highchart.options.chart.zoomType = this.props.zoomMode === "auto" ? "x" : "xy";
            redraw = true;
        }

        // change the aggregation function
        if (prevProps.aggrFunc !== this.props.aggrFunc) {
            this.highchart.options.plotOptions.series.dataGrouping.approximation = this.props.aggrFunc;
            fullRedraw = true;
        }


        if (fullRedraw) {
            // Force re-render (w/out animation): no way to update this property dynamically
            const opts = this.highchart.options;
            opts.plotOptions.series.animation = false;
            this.highchart = null;
            this.highchart = HighStock.stockChart(this.node, opts);
            this.highchart.options.plotOptions.series.animation = null;
            this._chartChanged();
        } else if (redraw) {
            this.highchart.redraw();
        }
    }

    render() {
        return <div className="charthouse-highcharts-graph"
                    style={{height: this.props.height}} />
    }

    toggleAllSeries = () => {
        this.highchart.series.forEach(function (series) {
            series.setVisible(!series.visible, false);
        });
        this.highchart.redraw();
    };

    _draw = () => {
        const node = ReactDOM.findDOMNode(this);
        this.node = node;

        const yRange = this.props.data.getValRange();
        const rThis = this;

        // TODO: refactor this config
        this.highchart = HighStock.stockChart(node, {
            title: {
                text: null
            },
            colors: ['rgb(31,120,180)', 'rgb(51,160,44)', 'rgb(227,26,28)',
                'rgb(255,127,0)', 'rgb(106,61,154)', 'rgb(177,89,40)',
                'rgb(166,206,227)', 'rgb(178,223,138)', 'rgb(251,154,153)',
                'rgb(253,191,111)', 'rgb(202,178,214)'],
            chart: {
                backgroundColor: null,
                style: {
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Source Sans Pro", "Helvetica Neue", Helvetica, Arial, sans-serif'
                },
                zoomType: (rThis.props.zoomMode === "auto") ? 'x' : 'xy',
                spacingBottom: 0,
                events: {
                    click: function () { // Dbl-clicking on background brings all series back
                        const dblClickTime = 500; //ms

                        if (this.hasOwnProperty('chartJustClicked') && this.chartJustClicked === true) {
                            // Double-click
                            this.chartJustClicked = false;
                            rThis.highchart.series.forEach(function (series) {
                                series.setVisible(true, false);
                            });
                            this.redraw();
                            return;
                        }

                        // Normal click - flag click timeout
                        const thisChart = this;
                        thisChart.chartJustClicked = true;
                        setTimeout(function () {
                            thisChart.chartJustClicked = false;
                        }, dblClickTime);
                    },
                    load: rThis._chartChanged,
                    redraw: rThis._chartChanged,
                }
            },
            credits: {
                enabled: false
            },
            xAxis: {
                title: {
                    text: 'Time (UTC)'
                },
                type: 'datetime',
                ordinal: false,
                dateTimeLabelFormats: {
                    hour: '%l%P',
                    minute: '%l:%M%P'
                },
                // Display markers as plot lines
                plotLines: rThis._createPlotLines()
            },
            yAxis: [
                this._axisConf = {
                    title: {
                        text: this._getCommonSuffix() // series units
                    },
                    opposite: false, // Axis on left side
                    gridLineWidth: 0.6,
                    gridLineDashStyle: 'dash',
                    lineColor: YAXIS_COLORS[0],
                    max: yRange[1] <= 0 ? 0 : null, // Include y=0 at init time
                    min: yRange[0] >= 0 ? 0 : null, // Include y=0 at init time
                    tickPositioner: function () {
                        // Force yMin=0 for only positive vals
                        if (this.dataMin != null) {
                            // Force yMin=0 for only positive vals
                            const minOpt = (this.dataMin >= 0) ? 0 : null;
                            if (this.options.min !== minOpt)
                                this.update({min: minOpt});
                        }

                        // Force yMax=0 for only negative vals
                        if (this.dataMax != null) {
                            const maxOpt = (this.dataMax <= 0) ? 0 : null;
                            if (this.options.max !== maxOpt)
                                this.update({max: maxOpt});
                        }
                        return null;
                    }
                },
                $.extend({}, this._axisConf, {
                        title: null,
                        opposite: true, // Axis on right side
                        lineColor: YAXIS_COLORS[1]
                    }
                )
            ],
            tooltip: {
                dateTimeLabelFormats: {
                    // No point in displaying sec/msec variations
                    millisecond: "%A, %b %e, %l:%M:%S%P",
                    second: "%A, %b %e, %l:%M:%S%P",
                    minute: "%A, %b %e, %l:%M%P",
                    hour: "%A, %b %e, %l:%M%P"
                },
                valueSuffix: ' ' + this._getCommonSuffix(),
                crosshairs: true,
                snap: 10,
                //hideDelay: 5,
                /*
                // TODO: AK comments optimistically with new version of highcharts
                positioner: function () {
                    return {x: 50, y: 10};
                },
                */
                shared: false   // Include all series or just one
            },
            legend: {
                enabled: (this.props.showLegend && this.props.data.numSeries > 1 && this.props.data.numSeries <= MAX_SERIES_LEGEND),
                maxHeight: this.props.height * 0.17,
                itemStyle: {
                    width: ReactDOM.findDOMNode(this).offsetWidth * 0.9, // Prevent overflow for really large series names
                    'text-decoration': 'initial'
                },
                itemHoverStyle: {
                    'text-decoration': 'underline'
                },
                margin: 5,
                padding: 5
            },

            rangeSelector: {  // Time range selector with defaults on top
                enabled: false
            },

            navigator: {  // Time control on bottom
                enabled: false
            },

            scrollbar: { // Horizontal scrollbar on bottom
                enabled: false
            },

            plotOptions: {
                series: {
                    cursor: 'auto',
                    stickyTracking: false,
                    dataGrouping: {
                        approximation: this.props.aggrFunc,
                        groupPixelWidth: POINTS_PER_PIXEL
                    },
                    events: {
                        click: function () { // Hide series on click / show-only on dbl-click
                            // TODO: can these click handlers be refactored into common funcs?
                            const dblClickTime = 300; //ms

                            if (this.hasOwnProperty('seriesJustClicked') && this.seriesJustClicked === true) {
                                // Double-click
                                clearTimeout(this.toggleTimeout);
                                this.seriesJustClicked = false;
                                rThis.highchart.series.forEach(function (series) {
                                    series.setVisible(false, false);
                                });
                                this.show();
                                return;
                            }

                            // Normal click - postpone hide action
                            const series = this;
                            series.seriesJustClicked = true;
                            this.toggleTimeout = setTimeout(function () {
                                series.seriesJustClicked = false;
                                series.hide();
                            }, dblClickTime);
                        },
                        legendItemClick: function () {  // On dbl-click show only series
                            const dblClickTime = 300; //ms

                            if (this.hasOwnProperty('legendJustClicked') && this.legendJustClicked === true) {
                                // Double-click
                                this.legendJustClicked = false;
                                rThis.highchart.series.forEach(function (series) {
                                    series.setVisible(false, false);
                                });
                                this.show();
                                return false;
                            }

                            // Normal click - attach 'just-clicked' flag and postpone redraw
                            const series = this;
                            series.legendJustClicked = true;
                            setTimeout(function () {
                                series.legendJustClicked = false;
                                rThis.highchart.redraw();
                            }, dblClickTime);
                            this.setVisible(!this.visible, false);
                            return false;
                        }
                    }
                },
                line: {
                    marker: {
                        enabled: this.props.data.numSeries > MAX_SERIES_POINT_MARKERS ? false : null,
                        radius: 1.3
                    }
                },
                area: {
                    stacking: 'normal',
                    fillOpacity: .6,
                    marker: {
                        enabled: this.props.data.numSeries > MAX_SERIES_POINT_MARKERS ? false : null,
                        radius: 1.3
                    }
                },
                column: {}
            },

            series: this._parseData(this.props.data.series())

        });
        //this._chartChanged();
    };

    _getCommonSuffix = () => {
        const cs = this.props.data.summary().common_suffix;
        return cs ? cs.getCanonicalHumanized() : '';
    };

    _parseData = (seriesData) => {
        let seriesNames = Object.keys(seriesData);

        const numVertices = seriesNames.map(function (serName) {
            return seriesData[serName].values.cntVertices();
        }).reduce(function (a, b) {
            return a + b;
        }, 0);

        // Make sure we're downsampling to a multiple of the original time
        const downSampleRatio = Math.max(1, Math.ceil(numVertices / MAX_GRAPH_VERTICES));

        this.props.onDownsampledStepChanged(
            downSampleRatio === 1 ?
                null :
                moment.duration(seriesData[seriesNames[0]].step * 1000 * downSampleRatio).humanize());

        const chartType = this.props.type;

        seriesNames = seriesNames.sort(this._getSortMethod());

        return seriesNames.map(function (series) {
            const vals = seriesData[series];

            const numPoints = Math.ceil(vals.values.length / downSampleRatio);
            const step = vals.step * 1000 * downSampleRatio;

            const data = downSampleRatio === 1 ? vals.values : vals.values.crossSample(numPoints);

            return {
                lineWidth: 1,
                id: series,
                name: vals.contextual_name ? vals.contextual_name.abbrFit(250) : null,
                yAxis: 0,
                pointInterval: step,
                pointStart: vals.from * 1000,
                data: data,
                originalStep: vals.step * 1000,
                visible: data.some(function (val) {
                    return val != null;
                }),
                type: chartType,
            }
        });
    };

    _updateData = (diff) => {
        const chart = this.highchart;

        const newData = this.props.data;

        // If there's many series to change, redraw in bulk
        let bulkRedraw = (
            Object.keys(diff.changeSeries).length
            + Object.keys(diff.addSeries).length
            + diff.removeSeries.length
        ) > MAX_SERIES_TO_ANIMATE;

        const updAnimation = {duration: 800};

        const parsedData = this._parseData(newData.series());

        chart.series.slice().forEach(function (ser) {
            const serId = ser.options.id;

            if (diff.removeSeries.indexOf(serId) !== -1) {
                // Remove series
                ser.remove(!bulkRedraw);
            }

            if (diff.changeSeries.hasOwnProperty(serId)) {
                // Modify series
                const diffSer = diff.changeSeries[serId];

                if (ser.options.pointInterval !== newData.series()[serId].step * 1000
                    || diffSer.prependPts.length
                    || (diffSer.shiftPts && diffSer.shiftPts !== diffSer.appendPts.length)
                    || diffSer.changePts) {
                    // If step is different, need to prepend or shift points (change series start),
                    // no choice but to replace all options
                    // TODO: there seems to be some bug with how highcharts updates series start/end times
                    // in this case when the series data changes, the timestamps don't seem to change correctly
                    // this is especially noticeable in the time range logger which is updated by our chartChanged method
                    ser.setData(parsedData[
                            parsedData
                                .map(function (d) {
                                    return d.id;
                                })
                                .indexOf(serId)
                            ].data,
                        !bulkRedraw
                    );
                } else {
                    if (diffSer.changePts.length || diffSer.popPts) {

                        // Modify points section deactivated by above if (run series.update() instead)
                        // Highstock's addPoint() in middle is buggy and causes update issues (series.points == null)
                        // Perhaps it gets fixed in a future version.

                        // Modify points
                        diffSer.changePts.forEach(function (pt) {
                            ser.removePoint(pt[0], false);
                            ser.addPoint({
                                x: ser.options.pointStart + ser.options.pointInterval * pt[0],
                                y: pt[1]
                            }, false, false);
                        });

                        // Pop points
                        for (let i = ser.yData.length - diffSer.popPts; i < ser.yData.length; i++) {
                            ser.removePoint(i, false);
                        }

                        if (!bulkRedraw && !diffSer.appendPts.length) {
                            chart.redraw();
                        }
                    }

                    // Append points (optionally sliding window)
                    const slideWindow = (diffSer.shiftPts === diffSer.appendPts.length);
                    diffSer.appendPts.forEach(function (pt) {
                        ser.addPoint(pt, !bulkRedraw, slideWindow, updAnimation);
                    });
                }
            }
        });

        // Add series
        const seriesToAdd = Object.keys(diff.addSeries);
        parsedData.filter(function (serData) {
            return seriesToAdd.indexOf(serData.id) !== -1;
        }).forEach(function (serData) {
            chart.addSeries(serData, !bulkRedraw);
        });

        // Draw changes just once
        if (bulkRedraw) chart.redraw();
    };

    _updateMarkers = () => {
        // remove all the markers
        const xAxis = this.highchart.axes[0];
        xAxis.plotLinesAndBands.forEach(function (pl) {
            xAxis.removePlotBandOrLine(pl.id);
        });

        // add the new markers
        this._createPlotLines().forEach(function (pl) {
            xAxis.addPlotBandOrLine(pl, 'plotLines');
        });
    };

    _createPlotLines = () => {
        const rThis = this;
        return [].concat.apply([], Object.keys(this.props.markers).map(function (s) {
            return rThis.props.markers[s].map(function (marker) {
                const removeLabel = function (pl) {
                    if (pl.options.label) {
                        delete pl.options.label;
                        pl.options.dashStyle = 'Solid';
                        if (pl.svgElem) {
                            pl.svgElem.destroy();
                            pl.svgElem = undefined;
                            pl.render();
                        }
                    }
                };

                const addLabel = function (pl) {
                    pl.options.label = {
                        text: '<strong>' + marker.label + '</strong>',
                        rotation: 0,
                        align: 'center',
                        y: 0
                    };
                    pl.options.dashStyle = 'Dash';
                    if (pl.svgElem) {
                        pl.svgElem.destroy();
                        pl.svgElem = undefined;
                        pl.render();
                    }
                };

                const timeCfg = marker.time ? {
                    value: marker.time * 1000,
                    milliTime: marker.time * 1000,
                } : {
                    from: marker.from * 1000,
                    to: marker.until * 1000,
                    milliTime: marker.from * 1000
                };
                return $.extend(timeCfg, {
                    id: marker.label + ':' + timeCfg.milliTime,
                    color: marker.color,
                    width: 3,
                    zIndex: 1,
                    dashStyle: marker.emphasize ? 'Dash' : 'Solid',
                    //label: {text: marker.label},
                    events: {
                        // Force showing the tooltip of points corresponding to violations
                        mouseover: function () {
                            // if a label was given, show it now
                            if (marker.label && !this.options.label) {
                                // hide all other labels
                                this.axis.plotLinesAndBands && this.axis.plotLinesAndBands.forEach(removeLabel);
                                addLabel(this);
                                return; // don't show the series tooltip
                            }

                            // if the marker is attached to a series, trigger the tooltip for that
                            const series = rThis.highchart.get(s);
                            if (series) {
                                // Choose the point closest to milliTime to display tooltip on.
                                // When there are so many points that the graph cannot display all of them,
                                // the default value in the tooltip may be different from the y value of this point
                                let index = indexOfSeries(series.points, timeCfg.milliTime, 'x');
                                if (index % 1 !== 0) {
                                    const floor = Math.floor(index),
                                        ceil = Math.ceil(index);
                                    index = (Math.abs(timeCfg.milliTime - series.points[ceil].x) <
                                        Math.abs(timeCfg.milliTime - series.points[floor].x))
                                        ? ceil
                                        : floor;
                                }

                                // currMarker = marker;
                                rThis.highchart.tooltip.refresh(series.points[index]);
                            }
                        },
                        mouseout: function () {
                            removeLabel(this);
                        }
                    }
                });
            });
        })).sort(function (a, b) {
            return (a.time) ?
                b.time - a.time
                : (b.to - b.from) - (a.to - a.from);
        });

        // Series: sorted, and difference between each pair of adjacent numbers is almost the same
        // TODO: put this func in the correct place
        function indexOfSeries(arr, val, property) {
            const key = function (d) {
                return (property == null) ? d : d[property];
            };
            const start = key(arr[0]),
                end = key(arr[arr.length - 1]),
                step = (end - start) / (arr.length - 1);
            return (start <= val && val <= end)
                ? (val - start) / step
                : null;
        }
    };

    _chartChanged = () => {
        const highchart = this.highchart;
        if (!highchart) {
            return;
        }
        const xRange = [
            highchart.axes[0].getExtremes().userMin
            || highchart.axes[0].getExtremes().dataMin
            || null,
            highchart.axes[0].getExtremes().userMax
            || highchart.axes[0].getExtremes().dataMax
            || null
        ];

        // signal to the parent that the time range has changed
        this.props.onTimeRangeChanged(xRange[0], xRange[1]);

        // update time point aggregation info
        const smallestStep = Math.min.apply(Math,
            highchart.options.series.map(function (s) {
                return s.pointInterval;
            })
        );
        const numAggrPoints = Math.ceil(
            (xRange[1] - xRange[0])                   // Data time range
            / smallestStep                          // Highest time granularity of data
            / highchart.plotWidth         // Chart plot area width in px
            * POINTS_PER_PIXEL                      // # pxs per point group
        );

        this.props.onAggregationRatioChanged(
            numAggrPoints,
            moment.duration(numAggrPoints * smallestStep).humanize()
        );
    };

    _getSortMethod = () => {

        const props = this.props;
        const ascending = this.props.sortAscending;

        // Alphabetically or default
        if (props.sortBy === 'alpha' || ['alpha', 'max', 'avg', 'latest', 'recent'].indexOf(props.sortBy) === -1) {
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

        return function (a, b) {
            return (ascending ? 1 : -1) * (preProcessData[a] - preProcessData[b]);
        };
    };
}

// Main HighCharts viz component

const VERTICAL_HEADROOM = 85;
const VERTICAL_HEADROOM_NO_CONTROLS = 75;

class HighchartsGraph extends React.Component {
    static propTypes = {
        data: PropTypes.instanceOf(CharthouseDataSet).isRequired,
        markers: PropTypes.object,
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
        maxHeight: window.innerHeight * .7,
        markers: {}
    };

    constructor(props, context) {
        super(props, context);
        this.state = this._getInitialState()
    }

    _getInitialState() {
        const props = this.props;
        const showControls = props.configMan.getParam('showControls', true);
        const ascending = props.configMan.getParam('sortAscending', true);
        const showLegend = props.configMan.getParam('showLegend', true);
        return {
            visibleFrom: props.data.summary().earliest_from * 1000,
            visibleUntil: props.data.summary().last_until * 1000,
            chartType: props.configMan.getParam('chartType') || 'line',
            sortBy: props.configMan.getParam('sortBy') || '',
            sortAscending: tools.fuzzyBoolean(ascending),
            y2Series: this._filterExistingSeries(props.configMan.getParam('y2Series') || []),
            zoomMode: "auto", // or "manual"
            aggrPtsPerPx: null,
            aggrTimePerPx: null,
            pntAggregation: props.configMan.getParam('pntAggregation') || "average",
            downsampledStepHuman: null,
            showControls: tools.fuzzyBoolean(showControls),
            showLegend: tools.fuzzyBoolean(showLegend)
        };
    }

    componentWillMount() {
        this.props.configMan.onParamChange(this._configChanged);
    }

    componentWillUnmount() {
        this.props.configMan.unsubscribe(this._configChanged);
    }

    componentWillUpdate(nextProps) {
        if (nextProps.data !== this.props.data) {
            this._onY2SeriesChanged(this._filterExistingSeries(this.props.configMan.getParam('y2Series') || []));
        }
    }

    render() {

        return <div>
            <Controls
                interactive={this.state.showControls}
                seriesList={this.props.data.series()}
                chartType={this.state.chartType}
                y2Series={this.state.y2Series}
                zoomMode={this.state.zoomMode}
                aggrPtsPerPx={this.state.aggrPtsPerPx}
                aggrTimePerPx={this.state.aggrTimePerPx}
                aggrFunc={this.state.pntAggregation}
                downsampledStepHuman={this.state.downsampledStepHuman}
                sortBy={this.state.sortBy}
                sortAscending={this.state.sortAscending}
                onChartTypeChanged={this._onChartTypeChanged}
                onY2SeriesChanged={this._onY2SeriesChanged}
                onZoomModeChanged={this._onZoomModeChanged}
                onAggrFuncChanged={this._onAggrFuncChanged}
                onToggleAllSeries={this._onToggleAllSeries}
                onSortByChanged={this._changeSortBy}
                onToggleSortAscending={this._toggleSortAscending}
            />
            <CharthouseXYChart
                ref="charthouseXY"
                data={this.props.data}
                markers={this.props.markers}
                height={Math.max(this.props.maxHeight - (this.state.showControls ? VERTICAL_HEADROOM : VERTICAL_HEADROOM_NO_CONTROLS), 100)}
                type={this.state.chartType}
                y2Series={this.state.y2Series}
                zoomMode={this.state.zoomMode}
                aggrFunc={this.state.pntAggregation}
                sortBy={this.state.sortBy}
                sortAscending={this.state.sortAscending}
                onTimeRangeChanged={this._onTimeRangeChanged}
                onAggregationRatioChanged={this._onAggregationRatioChanged}
                onDownsampledStepChanged={this._onDownsampledStepChanged}
                showLegend={this.state.showLegend}
            />
        </div>

    }

    // Private methods
    _configChanged = (newParams) => {
        const rThis = this;

        const keepProps = [
            'chartType',
            'y2Series',
            'pntAggregation',
            'sortBy',
            'sortAscending'
        ];

        const updState = {};
        let defaults;
        Object.keys(newParams).forEach(function (k) {
            if (keepProps.indexOf(k) !== -1) {

                if (newParams[k] == null && defaults == null)
                    defaults = rThis._getInitialState();  // Populate defaults

                updState[k] = (newParams[k] != null
                        ? parse(newParams[k])
                        : defaults[k]
                );
            }
        });

        updState.y2Series = this._filterExistingSeries(updState.y2Series || []);

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

    _filterExistingSeries = (seriesToFilter) => {
        seriesToFilter = Array.isArray(seriesToFilter) ? seriesToFilter : [seriesToFilter];
        const series = this.props.data.series();
        return seriesToFilter.filter(function (s) {
            return series.hasOwnProperty(s);
        });
    };

    _onTimeRangeChanged = (newFrom, newUntil) => {
        this.setState({
            visibleFrom: newFrom || this.props.data.summary().earliest_from * 1000,
            visibleUntil: newUntil || this.props.data.summary().last_until * 1000
        });
        this.props.onTimeChange([this.state.visibleFrom, this.state.visibleUntil])
    };

    _onAggregationRatioChanged = (aggrPoints, aggrTime) => {
        this.setState({aggrPtsPerPx: aggrPoints, aggrTimePerPx: aggrTime});
    };

    _onChartTypeChanged = (newType) => {
        this.props.configMan.setParams({'chartType': newType});
    };

    _onY2SeriesChanged = (y2Series) => {
        this.props.configMan.setParams({'y2Series': y2Series});
    };

    _onZoomModeChanged = (newZoomMode) => {
        this.setState({zoomMode: newZoomMode});
    };

    _onAggrFuncChanged = (newFunc) => {
        this.props.configMan.setParams({pntAggregation: newFunc});
    };

    _onToggleAllSeries = () => {
        this.refs.charthouseXY.toggleAllSeries();
    };

    _onDownsampledStepChanged = (dss) => {
        this.setState({downsampledStepHuman: dss})
    };

    _changeSortBy = (newMethod) => {
        this.props.configMan.setParams({sortBy: newMethod});
    };

    _toggleSortAscending = (newVal) => {
        this.props.configMan.setParams({sortAscending: newVal});
    };
}

export default HighchartsGraph;
