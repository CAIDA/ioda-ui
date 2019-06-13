import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';
import Slider from 'react-bootstrap-slider';
import d3 from 'd3';
import topojson from 'topojson';
import $ from 'jquery';
import _ from 'underscore';

import crossletInit from '../libs/crosslet/crosslet.custom';
import 'Explorer/css/crosslet.css'

import Toggle from '../components/toggle-switch';
import tools from '../utils/tools';
import {CharthouseDataSet, CharthouseCfData} from '../utils/dataset.js';
import Player from '../components/player';
import DataApi from '../connectors/data-api';

class Controller extends React.Component {
    static propTypes = {
        relColorScale: PropTypes.bool,
        onChangeRelColorScale: PropTypes.func,

        colorScaleBase: PropTypes.number,
        onChangeColorScaleBase: PropTypes.func
    };

    static defaultProps = {
        relColorScale: false,
        onChangeRelColorScale: function (newState) {
        },

        colorScaleBase: 1,
        onChangeColorScaleBase: function (newBase) {
        }
    };

    render() {
        const rThis = this;

        return <div className="text-right">
            <small><em>Color scale:</em></small>
            <span style={{
                display: 'inline-block',
                verticalAlign: 'middle',
                marginLeft: 4,
                marginRight: 12
            }}>
                    <Toggle
                        width={70}
                        on={this.props.relColorScale}
                        textOn="Relative"
                        textOff="Fixed"
                        description="Whether to keep a constant color scale across all views (fixed) or to adjust scale according to current range of values (relative)"
                        onToggle={this.props.onChangeRelColorScale}
                    />
                </span>
            <Slider
                width={110}
                min={-5}
                max={5}
                step={1}
                value={this._base2slider(this.props.colorScaleBase)}
                tooltipFormatter={function (val) {
                    val = rThis._slider2base(val);
                    return val === 1
                        ? 'Linear'
                        : (val > 1
                                ? 'Exp base ' + val
                                : 'Log base ' + Math.round(1 / val)
                        );
                }}
                description="Change color scale base type, from Linear (center) to logarithmic (for left-skewed datasets) or exponential (for right-skewed datasets)"
                onChange={this._changeColorSlider}
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
        return -(base >= 1 ? base - 1 : 1 - 1 / base);
    };

    _changeColorSlider = (newVal) => {
        this.props.onChangeColorScaleBase(this._slider2base(newVal));
    };
}

const MAPBOX_MAP_ID = 'alistairkingcaida/ciwzes1vk001t2qnub72ug0ib';
const DEFAULT_MAPVIEW = {
    center: [20, 0],
    zoom: 2
};
const COLOR_SET = ['rgb(254,204,92)', 'rgb(253,141,60)', 'rgb(227,26,28)'];

// ['#bcbddc','#807dba','#4a1486'];   // Purples
// ['#C7F774', '#60A859', '#007148']; // Greens
// ['#fed976', '#fd8d3c', '#bd0026']; // Orange-Dark reds
// ['rgb(254,204,92)','rgb(253,141,60)','rgb(227,26,28)']; // Yellow - Reds
// ['#fec44f', '#ec7014', '#662506']; // Browns

class CrossletMap extends React.PureComponent {

    static propTypes = {
        data: PropTypes.arrayOf(PropTypes.object).isRequired,
        dimensions: PropTypes.arrayOf(PropTypes.object).isRequired, // List of dimensions to show in separate tabs each with {id, name, valRange} (first in list will be activated)
        topoJsonMethod: PropTypes.object.isRequired,
        geoObjProp: PropTypes.string.isRequired,              // Which topojson object property to use
        geoIdProp: PropTypes.string.isRequired,               // Which property in the topojson represents the id of the series
        geoNameProp: PropTypes.string.isRequired,             // Which property in the topojson represents the name of the series
        dataIdProp: PropTypes.string.isRequired,              // Which attribute in the data object to use for linking against the topojson geo id
        colorScaleBase: PropTypes.number,
        colors: PropTypes.array,
        unitsTxt: PropTypes.string
    };

    static defaultProps = {
        colorScaleBase: 1,
        unitsTxt: ''
    };

    componentDidMount() {
        // Initialise map
        const crosslet = crossletInit(); // (Re-)Initialize crosslet
        this.map = new crosslet.MapView(
            $(ReactDOM.findDOMNode(this.refs.crossletMap)),
            this._genCrossletCfg()
        );

        this._fitToDataBbox();
    }

    componentDidUpdate(prevProps) {

        if (this.props.data !== prevProps.data || this.props.colorScaleBase !== prevProps.colorScaleBase) {

            this.map.ds.data = {}; // Reset datastore memory
            for (let d in this.map.panel.boxes) {
                this.map.panel.boxes[d].config.data.dataSet = this.props.data;
                this.map.panel.boxes[d].config.data.interval = null;
                this.map.panel.boxes[d].config.data.exponent = this.props.colorScaleBase;
                this.map.panel.boxes[d].loadData();
            }

            // Not necessary for re-render, but good-practice to keep state
            for (let d in this.map.config.dimensions) {
                this.map.config.dimensions[d].data.dataSet = this.props.data;
                this.map.config.dimensions[d].data.exponent = this.props.colorScaleBase;
            }
        }
    }

    render() {
        return <div ref="crossletMap" style={{height: 'inherit'}}/>;
    }

    // Private methods
    _genCrossletCfg = () => {
        const rThis = this;

        const colScaleLinear = d3.scale.linear()
            .domain([1, 10, 20])
            .range(this.props.colors || COLOR_SET)
            .interpolate(d3.cie.interpolateLab);

        const numFormat = tools.halfSINumFormatter(3);

        // Activate first dimension in list
        const activeDimension = this.props.dimensions[0].id;

        return {
            map: {
                leaflet: {
                    url: "https://api.mapbox.com/styles/v1/{mapId}/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiYWxpc3RhaXJraW5nY2FpZGEiLCJhIjoiYWEzMGMzMmJiZWE5MWM4OGI1MmEyZmQzNzY2NWQ2MDAifQ.wJshrGIeVcbepqF6H-VtoA",
                    //url: "https://{s}.tiles.mapbox.com/v3/{mapId}/{z}/{x}/{y}.png",
                    mapId: MAPBOX_MAP_ID,
                    attribution: /*'&copy; The Regents of the University of California. All Rights Reserved. */
                        'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
                    sleepNote: false
                },
                geo: {
                    topoJsonMethod: this.props.topoJsonMethod,
                    name_field: this.props.geoNameProp,
                    id_field: this.props.geoIdProp,
                    topo_object: this.props.geoObjProp
                },
                view: DEFAULT_MAPVIEW,
                sleep: false
            },
            data: {
                id_field: this.props.dataIdProp
            },
            dimensions: _.chain(this.props.dimensions)
                .map(function (d) {
                    return {
                        id: d.id,
                        title: d.name + (rThis.props.unitsTxt ? ' (' + rThis.props.unitsTxt + ')' : ''),
                        data: {
                            dataSet: rThis.props.data,
                            field: d.id,
                            colorscale: colScaleLinear,
                            exponent: rThis.props.colorScaleBase
                        },
                        format: {
                            long: function () {
                                return function (d) {
                                    return numFormat(d) + ' ' + rThis.props.unitsTxt;
                                };
                            },
                            axis: function () {
                                return numFormat;
                            },
                            short: function () {
                                return numFormat;
                            }
                        },
                        render: {
                            hideGraph: false,
                            hideTitle: rThis.props.dimensions.length === 1
                        }
                    }
                })
                .indexBy('id') // Index by dimension ID
                .each(function (d) {
                    delete d.id; // Remove ID key
                })
                .value(),
            defaults: {
                //opacity : 0.7,
                order: this.props.dimensions.map(function (d) {
                    return d.id
                }),
                active: activeDimension
            }
        };
    };

    // Fits crosslet map to data bounding box
    _fitToDataBbox = () => {

        // Latitude range of the relevant world (from Patagonia to Iceland)
        const LAT_RANGE = [-50, 70];

        const RETRY_TIME = 200; // ms
        let N_RETRIES = 100;

        const crossletObj = this.map;

        const polygonIds = this.props.data.map(function (d) {
            return d.topoId;
        });

        let _fitAttempt = null;
        (_fitAttempt = function () {
            if (!crossletObj.ds.isGeoLoaded) {
                if (N_RETRIES-- >= 0)
                    setTimeout(_fitAttempt, RETRY_TIME);
                return;
            }

            let bbox = getBbox(
                crossletObj.ds.l.cache[crossletObj.ds.geoCall.url + crossletObj.ds.l.version],
                crossletObj.config.map.geo.topo_object,
                crossletObj.ds.geoIdField,
                polygonIds
            );
            if (bbox) {
                bbox = bbox.map(function (coords) { // Limit lat range
                    return [
                        Math.max(LAT_RANGE[0], Math.min(LAT_RANGE[1], coords[0])),
                        coords[1]
                    ];
                });

                if (bbox[0][1] > bbox[1][1]) { // At least one of the long boundaries has crossed the 24h line (-180deg)
                    if (bbox[0][1] > 165) bbox[0][1] -= 360;
                    if (bbox[1][1] < -165) bbox[1][1] += 360;
                }

                crossletObj.map.fitBounds(bbox);
            }
        })(); // Run at once first time


        // Calculate bounding box given topojson data and a set of polygon IDs
        function getBbox(topoData, topoObj, idField, polyIds) {
            const features = topojson.feature(topoData, topoData.objects[topoObj]).features.filter(function (d) {
                return polyIds.indexOf(d.properties[idField] + '') !== -1;
            });

            if (!features.length) return null;

            return features.map(d3.geo.bounds).reduce(function (prev, cur) {
                return [
                    [
                        Math.min(prev[0][0], cur[0][0]),
                        Math.min(prev[0][1], cur[0][1])
                    ],
                    [
                        Math.max(prev[1][0], cur[1][0]),
                        Math.max(prev[1][1], cur[1][1])
                    ]
                ];
            }).map(function (coords) {
                return coords.reverse();
            }); // Invert lat long coords
        }

    };
}

const AGGR_FUNC_NAMES = {
    avg: 'Average',
    sum: 'Total'
};

class CharthouseGeoChart extends React.Component {
    static propTypes = {
        width: PropTypes.number,
        height: PropTypes.number,

        cfData: PropTypes.instanceOf(CharthouseCfData).isRequired,
        dataSummary: PropTypes.object.isRequired,
        tableCfg: PropTypes.object.isRequired,

        relColorScale: PropTypes.bool.isRequired,
        colorScaleBase: PropTypes.number.isRequired,

        colors: PropTypes.array,

        aggrFunc: PropTypes.string
    };

    static defaultProps = {
        width: 640,
        height: 480,

        aggrFunc: 'avg'
    };

    constructor(props, context) {
        super(props, context);

        const cfMetaField = ['geo', props.tableCfg.db, props.tableCfg.table, props.tableCfg.column].join('.');

        const dimensionInfo = this._getDimensions();

        // Bogus max, min, zero points for all dimensions
        const mockupMaxVals = {topoId: -Math.random()};
        dimensionInfo.forEach(function (dim) {
            mockupMaxVals[dim.id] = dim.valRange[1];
        });

        const mockupMinVals = {topoId: -Math.random()};
        dimensionInfo.forEach(function (dim) {
            mockupMinVals[dim.id] = dim.valRange[0];
        });

        const mockupZeroVals = {topoId: -Math.random()};
        dimensionInfo.forEach(function (dim) {
            mockupZeroVals[dim.id] = 0;
        });

        this.state = {
            dataApi: new DataApi(),

            groupByTopo: props.cfData.get().dimension(function (d) {
                return d[cfMetaField];
            }).group(),

            dimensionInfo: dimensionInfo,
            mockupMaxVals: mockupMaxVals,
            mockupMinVals: mockupMinVals,
            mockupZeroVals: mockupZeroVals,

            mapData: null
        };
    }

    componentWillMount() {
        this.setState({mapData: this._aggrTsData()});
    }

    componentDidUpdate(prevProps) {
        if (this.props.cfData !== prevProps.cfData) {
            this.setState({
                groupBySeries: this.props.cfData.get().dimension(function (d) {
                    return d.series;
                })
                    .group()
            });

            this.onCfDataChange();
        }

        if (this.props.relColorScale !== prevProps.relColorScale) {
            this.setState({mapData: this._aggrTsData()});
        }
    }

    render() {

        return <div className="charthouse-crosslet-map"
                    style={{height: this.props.height}}>
            <CrossletMap
                data={this.state.mapData}
                dimensions={this.state.dimensionInfo}
                topoJsonMethod={this.state.dataApi.getTopoTable(this.props.tableCfg.table, this.props.tableCfg.db)}
                geoObjProp={this.props.tableCfg.table}
                geoIdProp={this.props.tableCfg.column}
                geoNameProp="name"
                dataIdProp="topoId"
                colorScaleBase={this.props.colorScaleBase}
                colors={this.props.colors}
                unitsTxt={(this.props.dataSummary.commonSuffix ? AGGR_FUNC_NAMES[this.props.aggrFunc] + ' ' + this.props.dataSummary.commonSuffix : '')}
            />
        </div>;
    }

    // Returns set of unique geo dimension id > {name, value range}
    _getDimensions = () => {
        const byDimensionId = this.props.cfData.get().dimension(function (d) {
            return d.dimensionId;
        });

        const dimensionLst = byDimensionId.group()
            .reduce(
                function reduceAdd(p, v) {
                    return {
                        name: p.name || v.dimensionName,
                        min: Math.min(p.min, v.value),
                        max: Math.max(p.max, v.value)
                    };
                },
                function reduceRemove(p) {
                    return p;
                },
                function reduceInit() {
                    return {
                        name: null,
                        min: Infinity,
                        max: -Infinity
                    };
                }
            )
            .orderNatural()
            .all()
            .map(function (dimension) {
                return {
                    id: dimension.key,
                    name: dimension.value.name || ' ',
                    valRange: [dimension.value.min, dimension.value.max]
                };
            });

        // GC dimension & group when possible
        if (byDimensionId.hasOwnProperty('dispose')) byDimensionId.dispose();

        return dimensionLst;
    };

    // Aggregate data over time (avg or sum) per geographic polygon
    _aggrTsData = () => {
        const rThis = this;
        const mapData = this.state.groupByTopo
            .reduce(    // Average all time values per dimension into one
                function add(p, v) {
                    if (v.value != null) {
                        if (!p.hasOwnProperty(v.dimensionId)) {
                            p[v.dimensionId] = {
                                sum: 0,
                                cnt: 0
                            }
                        }
                        p[v.dimensionId].sum += v.value;
                        p[v.dimensionId].cnt += 1;
                    }
                    return p;
                },
                function remove(p, v) {
                    if (v.value != null) {
                        p[v.dimensionId].sum -= v.value;
                        p[v.dimensionId].cnt -= 1;
                    }
                    return p;
                },
                function init() {
                    return {}
                }
            )
            .all()
            // Discard Topo elems with no data associated
            .filter(function (d) {
                return Object.keys(d.value).length;
            })
            .map(function (d) {
                const res = {
                    topoId: d.key
                };
                _.each(d.value, function (avgReduce, dimId) {
                    res[dimId] = (rThis.props.aggrFunc === 'avg') ? avgReduce.sum / avgReduce.cnt : avgReduce.sum;
                });
                return res;
            });

        mapData.push(this.state.mockupZeroVals); // Always include 0
        if (this.props.relColorScale) {
            // Force global max/min points to maintain absolute color scale
            mapData.push(this.state.mockupMaxVals);
            mapData.push(this.state.mockupMinVals);
        }

        return mapData;
    };

    // Public methods
    onCfDataChange = () => {
        // Gen new map data
        this.setState({mapData: this._aggrTsData()});
    };
}


// Main geo viz component
const TIME_FILTER_HEIGHT = 75; //px
const VERTICAL_HEADROOM = 80;  // Vertical margin space

class CrossletGeomap extends React.Component {
    static propTypes = {
        data: PropTypes.instanceOf(CharthouseDataSet).isRequired,
        onTimeChange: PropTypes.func,
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
        let colorScaleBase = props.configMan.getParam('colorScaleBase');

        // allow colors to be received from the URL as a JSON-encoded string
        let colors = props.configMan.getParam('colors');
        colors = (typeof colors === 'string') ?
            (colors.startsWith("[") ? JSON.parse(colors) : colors.split(","))
            : colors;

        this.state = {
            cfData: new CharthouseCfData(props.data),
            tableCfg: null,

            relColorScale: false,
            colorScaleBase: colorScaleBase !== null ? +colorScaleBase : 1,
            colors: colors,

            width: null,

            fps: 2,

            showControls: tools.fuzzyBoolean(showControls),

            aggrFunc: props.configMan.getParam('aggrFunc') || 'avg'
        };
    }

    componentWillMount() {
        this.setState({tableCfg: this._getBestAnnotationLevel()});
    }

    componentDidMount() {
        this._setWidth();
        window.addEventListener('resize', this._setWidth);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this._setWidth);
    }

    componentDidUpdate(prevProps) {
        if (this.props.data !== prevProps.data) {
            this.refs.timeFilter && this.refs.timeFilter.stop();    // Stop to clear all data filters
            this.state.cfData.setData(this.props.data);
            this.setState({tableCfg: this._getBestAnnotationLevel()});
            this.refs.timeFilter && this.refs.timeFilter.onCfDataChange();
        }
    }

    render() {

        // Don't render if width is not yet set
        if (!this.state.width) return <div/>;

        const mapHeight = Math.max(
            this.props.maxHeight - TIME_FILTER_HEIGHT - (this.state.showControls ? VERTICAL_HEADROOM : 10),
            100
        );

        // Check if there is any geo-relevant data
        if (!this.state.tableCfg)
            return <div className="alert alert-warning">
                Unable to plot. No <strong>geographically relevant</strong> data
                found.
                &nbsp;Please query for data with geographical significance, or
                choose an alternative representation method.
            </div>;

        // Check if all data is geo-relevant at the same level
        const nSeries = this.props.data.cntSeries();
        if (this.state.tableCfg.nSeries < nSeries)
            return <div className="alert alert-warning">
                Refusing to plot. Best geography annotation found in data is
                at <strong>
                {[this.state.tableCfg.db, this.state.tableCfg.table, this.state.tableCfg.column].join(':')}
            </strong>, but
                only <strong>{this.state.tableCfg.nSeries}</strong> out
                of <strong>{nSeries}</strong> series are annotated at this
                level.
                <br/>
                Please make sure all the series have a consistent geographical
                significance, or choose an alternative representation method.
            </div>;

        return <div>
            {this.state.showControls && <div style={{marginBottom: 5}}>
                <Controller
                    relColorScale={this.state.relColorScale}
                    onChangeRelColorScale={this._toggleRelColorScale}

                    colorScaleBase={this.state.colorScaleBase}
                    onChangeColorScaleBase={this._changeColorScaleBase}
                />
            </div>
            }

            <div style={{
                width: this.state.width,
                height: mapHeight
            }}>
                <CharthouseGeoChart
                    ref="geoChart"
                    cfData={this.state.cfData}
                    dataSummary={this.props.data.summary()}
                    tableCfg={this.state.tableCfg}

                    width={this.state.width}
                    height={mapHeight}

                    relColorScale={this.state.relColorScale}
                    colorScaleBase={this.state.colorScaleBase}

                    colors={this.state.colors}

                    aggrFunc={this.state.aggrFunc}
                />
            </div>

            <div style={{marginTop: 5}}>
                <Player
                    ref='timeFilter'
                    cfData={this.state.cfData.get()}
                    width={this.state.width}
                    height={TIME_FILTER_HEIGHT}
                    maxFps={3}
                    fps={this.state.fps}
                    idCol='series'
                    nameCol='name'
                    showPlayControls={this.state.showControls}
                    onFilterChange={this._timeFiltered}
                    onTimeChange={this.props.onTimeChange}
                    onFpsChange={this._fpsChange}
                />
            </div>
        </div>;
    }

    // Private methods
    _getBestAnnotationLevel = () => {
        // Build structure of geo annotations
        const matches = {};

        const dataSeries = this.props.data.series();
        Object.keys(dataSeries).map(function (ser) {
            return dataSeries[ser].annotations;
        }).filter(function (annList) {
            return annList != null;
        }).forEach(function (annList) {
            annList.filter(function (ann) {
                return ann.type === 'join' && ann.attributes.type === 'geo';
            }).forEach(function (ann) {
                const att = ann.attributes;
                const db = att.hasOwnProperty('db') ? att.db : '';
                const table = att.table;
                const column = att.column;
                if (!matches.hasOwnProperty(db)) matches[db] = {};
                if (!matches[db].hasOwnProperty(table)) matches[db][table] = {};
                if (!matches[db][table].hasOwnProperty(column)) matches[db][table][column] = {
                    total: 0,
                    default: 0
                };
                matches[db][table][column].total++;
                if (att.hasOwnProperty('default') && att.default) {
                    matches[db][table][column].default++;
                }
            })
        });

        // Pick best column
        const bestPick = {
            total: null,
            totalCnt: 0,
            default: null,
            defaultCnt: 0
        };
        for (let db in matches) {
            for (let table in matches[db]) {
                for (let column in matches[db][table]) {
                    if (matches[db][table][column].total >= bestPick.totalCnt) {
                        bestPick.total = {
                            db: db,
                            table: table,
                            column: column,
                            nSeries: matches[db][table][column].total
                        };
                        bestPick.totalCnt = bestPick.total.nSeries;
                    }
                    if (matches[db][table][column].default >= bestPick.defaultCnt) {
                        bestPick.default = {
                            db: db,
                            table: table,
                            column: column,
                            nSeries: matches[db][table][column].default
                        };
                        bestPick.defaultCnt = bestPick.default.nSeries;
                    }
                }
            }
        }

        return bestPick['default'] || bestPick['total'];
    };

    _setWidth = () => {
        this.setState({width: ReactDOM.findDOMNode(this).offsetWidth});
    };

    _toggleRelColorScale = (newState) => {
        this.setState({relColorScale: newState});
    };

    _changeColorScaleBase = (newBase) => {
        this.setState({colorScaleBase: newBase});
    };

    _fpsChange = (newFps) => {
        this.setState({fps: newFps});
    };

    _timeFiltered = () => {
        this.refs.geoChart.onCfDataChange();
    };
}

export default CrossletGeomap;
