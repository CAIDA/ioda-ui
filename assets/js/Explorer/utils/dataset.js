import $ from 'jquery';
import moment from 'moment';
import crossfilter from 'crossfilter';
import {humanizeBytes} from 'Hi3/utils';

export class CharthouseDataSet {

    constructor(apiData) {
        this.apiData = apiData;
        this.numSeries = apiData ? this.cntSeries() : 0;
    }

    get() {
        return this.apiData;
    }

    set(apiData) {
        this.apiData = apiData;
        this.numSeries = this.cntSeries();
        return this;
    }

    clone() {
        return new CharthouseDataSet($.extend(true, {}, this.apiData));
    }

    jsonSize() {
        return this.apiData.jsonRequestSize;
    }

    jsonSizeHuman() {
        return humanizeBytes(this.jsonSize());
    }

    getRequest() {
        return this.apiData.request;
    }

    getRequestAsCurl() {
        const req = this.getRequest();
        const payload = JSON.stringify(req.payload);
        const hdrs = Object.keys(req.headers).map((h) => {
            return `-H '${h}: ${req.headers[h]}'`;
        }).join(' ');
        return `curl '${req.url}' --data '${payload}' -H 'Content-Type: application/json' ${hdrs}`;
    }

    data() {
        return this.apiData.data;
    }

    dataAsJSON() {
        return JSON.stringify(this.data());
    }

    summary() {
        return this.data().summary;
    }

    series() {
        return this.data().series || {}
    }

    isEmpty() {
        // Returns false at the first occurrence of a non-null val in any series
        const series = this.series();
        return !series ||
            !Object.keys(series).some(function (serName) {
                return series[serName].values.some(function (val) {
                    return val != null;
                });
            });
    }

    cntSeries() {
        return Object.keys(this.series()).length;
    }

    cntNonNullPnts() {
        let numPoints = 0;
        const series = this.series();
        Object.keys(series).forEach(function (ts) {
            numPoints += series[ts].values.filter(function (val) {
                return val != null;
            }).length;
        });
        return numPoints;
    }

    getResolution(durationFormatter) {
        const self = this;

        durationFormatter = durationFormatter || function (m) {
            return m;
        };

        const nativeSteps = self.summary().native_steps;

        return Object.keys(nativeSteps || [])
            .sort(function (a, b) {
                return parseInt(a) - parseInt(b)
            })
            .map(function (nativeStep) {
                return [
                    durationFormatter(moment.duration(nativeStep * 1000)),
                    nativeSteps[nativeStep]
                    // Remove redundant cases that have aggregation equal only to native step
                        .filter(function (realStep) {
                            return realStep !== nativeStep || nativeSteps[nativeStep].length > 1;
                        })
                        .sort(function (a, b) {
                            return parseInt(a) - parseInt(b)
                        })
                        .map(function (s) {
                            return durationFormatter(moment.duration(s * 1000));
                        })
                ];
            });
    }

    getValRange() {
        const series = this.series();
        let minVal = Infinity, maxVal = -Infinity;
        Object.keys(series).forEach(function (s) {
            series[s].values.forEach(function (val) {
                if (val != null) {
                    minVal = Math.min(minVal, val);
                    maxVal = Math.max(maxVal, val);
                }
            });
        });
        return [minVal, maxVal];
    }

    getLatestDataTime() {
        // Returns latest time when values for all series were observed
        const series = this.series();

        return Math.min.apply(Math, Object.keys(series).map(function (serName) {
            // Get time of last non-null data point
            const ts = series[serName];
            for (let i = ts.values.length - 1; i >= 0; i--) {
                if (ts.values[i] != null) {
                    // Found a non-null
                    return i * ts.step + ts.from;
                }
            }
            return null;
        }));
    }

    toCrossfilter() {
        // Flatten data to be ready to feed to crossfilter
        const self = this;
        const cfData = [];

        Object.keys(self.series()).forEach(function (seriesId) {
            const series = self.series()[seriesId];

            if (!series.values) return; // No points to add

            const meta = {
                series: seriesId,
                name: series.name
            };

            if (series.annotations)
                series.annotations
                    .filter(function (a) {
                        return a.type === 'join'
                    })
                    .forEach(function (a) {
                        meta[[a.attributes.type, a.attributes.db, a.attributes.table, a.attributes.column].join('.')] = a.attributes.id;
                        meta.dimensionId = a.attributes.dimension.id;
                        meta.dimensionName = a.attributes.dimension.name;
                    });

            let runTime = series.from;
            series.values.forEach(function (val) {
                cfData.push(
                    $.extend(
                        {
                            time: new Date(runTime * 1000),
                            value: val
                        },
                        meta
                    )
                );

                runTime += series.step;
            });
        });

        return cfData;
    }

    diffData(that) {
        // TODO clean up and improve performance of this func
        const diff = {
            removeSeries: [],
            addSeries: {},
            changeSeries: {}
        };

        // Removed series
        diff.removeSeries = Object.keys(this.series()).filter(
            function (serId) {
                return !that.series().hasOwnProperty(serId)
            }
        );

        for (const serId in that.series()) {
            // New series
            if (!this.series().hasOwnProperty(serId)) {
                diff.addSeries[serId] = that.series()[serId];
                continue;
            }

            const thisSer = this.series()[serId];
            const thatSer = that.series()[serId];
            const step = thisSer.step;

            // Series with discrepant step, misaligned grid
            if (thisSer.step !== thatSer.step || (thisSer.from - thatSer.from) % step) {
                // Remove and add complete series
                diff.removeSeries.push(serId);
                diff.addSeries[serId] = thatSer[serId];
                continue;
            }

            // Changed series
            const diffSer = {
                shiftPts: 0,
                popPts: 0,
                appendPts: [],
                prependPts: [],
                changePts: []
            };

            // Remove points at back and front
            diffSer.shiftPts = Math.max(0, (thatSer.from - thisSer.from) / step);
            diffSer.popPts = Math.max(0, (thisSer.until - thatSer.until) / step);

            // Pre/append points
            diffSer.prependPts = thatSer.values.slice(0, Math.max(0, (thisSer.from - thatSer.from) / step));
            // Append points
            diffSer.appendPts = thatSer.values.slice(-Math.max(0, thatSer.until - thisSer.until) / step || Infinity);

            // Flag changed vals
            const offset = (thatSer.from - thisSer.from) / step;
            let idx = Math.max(0, offset);
            while (idx < thisSer.values.length && idx - offset < thatSer.values.length) {
                if (thisSer.values[idx] !== thatSer.values[idx - offset]) {
                    diffSer.changePts.push([idx, thatSer.values[idx - offset]]);
                }
                idx++;
            }

            if (Object.keys(diffSer).some(function (k) {
                return (diffSer[k] instanceof Array) ? diffSer[k].length : diffSer[k];
            })) {
                diff.changeSeries[serId] = diffSer;
            }
        }

        return Object.keys(diff).some(function (k) {
            return Object.keys(diff[k]).length;
        })
            ? diff
            : null;
    }
}

////////

export class CharthouseCfData {

    constructor(apiDataSet) {
        this.cfObj = crossfilter(apiDataSet.toCrossfilter());
    }

    get() {
        return this.cfObj;
    }

    setData(apiDataSet) {
        // Ensure that all filters are off before running this, otherwise not all data will be removed
        this.cfObj.remove && this.cfObj.remove();
        this.cfObj.add(apiDataSet.toCrossfilter());
    }

    getValRange() {
        const byVal = this.cfObj.dimension(function (d) {
            return d.value;
        });
        byVal.filter(function (val) {
            return val != null;
        });

        const valRange = byVal.top(1).length
            ? [byVal.bottom(1)[0].value, byVal.top(1)[0].value]
            : null;  // No non-null values

        byVal.filterAll();
        if (byVal.hasOwnProperty('dispose')) byVal.dispose();

        return valRange;
    }

    // Only use for very small diffs, otherwise the setData method performs much better
    applyDataDiff(origData, diff) {
        const cf = this.cfObj;
        const perTime = cf.dimension(function (d) {
            return d.time;
        });
        const perSeries = cf.dimension(function (d) {
            return d.series;
        });

        // Change series
        let addPts = [];
        Object.keys(diff.changeSeries).forEach(function (serId) {

            const curData = origData.series()[serId];
            const diffData = diff.changeSeries[serId];
            const addSeriesPts = [];

            perSeries.filterExact(serId);

            // Shift
            if (diffData.shiftPts) {
                perTime.filter([
                    new Date(curData.from * 1000),
                    new Date((curData.from + diffData.shiftPts * curData.step) * 1000)
                ]);
                cf.remove();
            }

            // Pop
            if (diffData.popPts) {
                perTime.filter([
                    new Date((curData.until - diffData.popPts * curData.step) * 1000),
                    new Date(curData.until * 1000)
                ]);
                cf.remove();
            }

            // Append
            let time = +curData.until;
            diffData.appendPts.forEach(function (val) {
                addSeriesPts.push({time: new Date(time * 1000), value: val});
                time += curData.step;
            });

            // Prepend
            time = +curData.from - curData.step * diffData.prependPts.length;
            diffData.prependPts.forEach(function (val) {
                addSeriesPts.push({time: new Date(time * 1000), value: val});
                time += curData.step;
            });

            // Change points (remove+add because changing pts is not possible in crossfilter)
            diffData.changePts.forEach(function (pt) {
                const time = new Date((curData.from + pt[0] * curData.step) * 1000);
                addSeriesPts.push({time: time, value: pt[1]});
            });

            // Bundle pts to remove into intervals to improve filter+remove performance cycle
            const removeIntervals = toIntervals(diffData.changePts.map(function (pt) {
                return pt[0];
            }));
            removeIntervals.forEach(function (interval) {
                if (interval.constructor === Array) {
                    interval[1] += 1; // Exclusive end
                    perTime.filterRange(interval.map(function (pos) {
                        return new Date((curData.from + pos * curData.step) * 1000)
                    }));
                } else {
                    perTime.filterExact(new Date((curData.from + interval * curData.step) * 1000));
                }
                cf.remove();
            });

            const seriesMeta = getSeriesMeta(serId, curData);
            addPts = addPts.concat(addSeriesPts.map(function (pt) {
                return $.extend(pt, seriesMeta);
            }));
        });

        cf.add(addPts);

        // Release time filter
        perTime.filterAll().dispose();

        // Remove series
        diff.removeSeries.forEach(function (serId) {
            perSeries.filterExact(serId);
            cf.remove();
        });

        // Add series
        if (Object.keys(diff.addSeries).length) {
            const addData = $.extend(true, {}, origData);
            addData.data.series = diff.addSeries;
            cf.add((new CharthouseDataSet(addData)).toCrossfilter());
        }

        // Release series filter
        perSeries.filterAll().dispose();

        //

        function getSeriesMeta(seriesId, seriesData) {
            const meta = {
                series: seriesId,
                name: seriesData.human_name
            };

            // TODO: do annotations work correctly?
            if (seriesData.annotations)
                seriesData.annotations
                    .filter(function (a) {
                        return a.type === 'join'
                    })
                    .forEach(function (a) {
                        meta[[a.attributes.type, a.attributes.db, a.attributes.table, a.attributes.column].join('.')] = a.attributes.id;
                        meta.dimensionId = a.attributes.dimension.id;
                        meta.dimensionName = a.attributes.dimension.name;
                    });

            return meta;
        }

        function toIntervals(nums) {
            const result = [];
            let prevNum = null;
            nums
                .sort(function (a, b) {
                    return a - b;
                })
                .forEach(function (num) {
                    let elem = num;
                    if (num - 1 === prevNum) { // Sequential
                        elem = result.pop();
                        if (elem.constructor === Array) {
                            elem.pop(); // Replace interval end
                        } else {
                            elem = [elem];  // Create array
                        }
                        elem.push(num);
                    }
                    result.push(elem);
                    prevNum = num;
                });
            return result;
        }
    }
}
