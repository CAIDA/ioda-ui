/*
 * This software is Copyright (c) 2013 The Regents of the University of
 * California. All Rights Reserved. Permission to copy, modify, and distribute this
 * software and its documentation for academic research and education purposes,
 * without fee, and without a written agreement is hereby granted, provided that
 * the above copyright notice, this paragraph and the following three paragraphs
 * appear in all copies. Permission to make use of this software for other than
 * academic research and education purposes may be obtained by contacting:
 *
 * Office of Innovation and Commercialization
 * 9500 Gilman Drive, Mail Code 0910
 * University of California
 * La Jolla, CA 92093-0910
 * (858) 534-5815
 * invent@ucsd.edu
 *
 * This software program and documentation are copyrighted by The Regents of the
 * University of California. The software program and documentation are supplied
 * "as is", without any accompanying services from The Regents. The Regents does
 * not warrant that the operation of the program will be uninterrupted or
 * error-free. The end-user understands that the program was developed for research
 * purposes and is advised not to rely exclusively on the program for any reason.
 *
 * IN NO EVENT SHALL THE UNIVERSITY OF CALIFORNIA BE LIABLE TO ANY PARTY FOR
 * DIRECT, INDIRECT, SPECIAL, INCIDENTAL, OR CONSEQUENTIAL DAMAGES, INCLUDING LOST
 * PROFITS, ARISING OUT OF THE USE OF THIS SOFTWARE AND ITS DOCUMENTATION, EVEN IF
 * THE UNIVERSITY OF CALIFORNIA HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH
 * DAMAGE. THE UNIVERSITY OF CALIFORNIA SPECIFICALLY DISCLAIMS ANY WARRANTIES,
 * INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
 * FITNESS FOR A PARTICULAR PURPOSE. THE SOFTWARE PROVIDED HEREUNDER IS ON AN "AS
 * IS" BASIS, AND THE UNIVERSITY OF CALIFORNIA HAS NO OBLIGATIONS TO PROVIDE
 * MAINTENANCE, SUPPORT, UPDATES, ENHANCEMENTS, OR MODIFICATIONS.
 */
import d3 from 'd3';


// Humanize number with rounding, abbreviations, etc.
export function humanizeNumber(value, precisionDigits) {
    precisionDigits = precisionDigits || 3;
    return d3.format(
            (isNaN(precisionDigits) ? '' : '.' + precisionDigits)
            + ((Math.abs(value) < 1) ? 'r' : 's')
        )(value);
}

// For event/alert table
export function convertSecondsToDateValues(s) {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = months[new Date(s * 1000).getUTCMonth()];
    const day = new Date(s * 1000).getUTCDate();
    const year = new Date(s * 1000).getFullYear();
    const hourValue = new Date(s * 1000).getUTCHours();
    const hours = hourValue > 12
        ? hourValue - 12
        : hourValue > 0
            ? `0${hourValue}`
            : hourValue === 0
                ? 12
                : hourValue;
    const minuteValue = new Date(s * 1000).getUTCMinutes();
    const minutes = minuteValue < 10
        ? `0${minuteValue}`
        : minuteValue;
    const meridian = hourValue > 12 ? "pm" : "am";
    return {
        month: month,
        day: day,
        year: year,
        hours: hours,
        minutes: minutes,
        meridian: meridian
    }
}

export function toDateTime(s) {
    var t = new Date(1970, 0, 1); // Epoch
    t.setSeconds(s);
    return t;
}

export function generateKeys(prefix) {
    var key = (prefix) ? prefix : '';
    return (key + Math.random().toString(34).slice(2));
}

export function convertValuesForSummaryTable(summaryDataRaw) {
    let summaryData = [];
    const colorSet = ["#E2EDF6", "#E9DFE4", "#EFD1D3", "#F6C3C1"];
    // let colScaleLinear = d3.scale.linear()
    //     .domain([scores[Math.round((scores.length - 1) / 4)], scores[Math.round((scores.length - 1) / 2)], scores[Math.round((scores.length - 1) * .9)], scores[Math.round(scores.length - 1)]])
    //     .range(colorSet);
    summaryDataRaw.map((summary, index) => {
        let overallScore = null;
        let summaryScores = [];
        let color = 'transparent';

        // Map through individual scores
        Object.entries(summary["scores"]).map(entry => {
            if (entry[0] !== "overall") {
                const entryItem = {
                    source: entry[0],
                    score: entry[1]
                };
                summaryScores.push(entryItem);
            } else {
                overallScore = entry[1]
            }
        });

        // Select background color for score cell, scores bottom 25%, 25%-50%, 50-90%, 90%-100%
        switch (index > -1) {
            // index value is less than or equal to 10% through the array
            case index <= Math.round((summaryDataRaw.length -1) * .1):
                color = colorSet[3];
                break;
            // index value is under 25% through the array
            case index < Math.round((summaryDataRaw.length -1) / 4):
                color = colorSet[2];
                break;
            // index value is less than 50% through the array
            case index < Math.round((summaryDataRaw.length -1) / 2):
                color = colorSet[1];
                break;
            // index value is less than 90% through the array
            case index >= Math.round((summaryDataRaw.length -1) / 2):
                color = colorSet[0];
                break;
            default:
                break;
        }

        // If entity type has ip_count/is an ASN
        let summaryItem;
        summary.entity.type === 'asn'
            ? summaryItem = {
                entityType: summary["entity"].type,
                entityCode: summary["entity"].code,
                name: summary["entity"].name,
                score: overallScore,
                scores: summaryScores,
                ipCount: humanizeNumber(summary["entity"]["attrs"]["ip_count"], 2),
                color: color
            }
            : summaryItem = {
            entityType: summary["entity"].type,
            entityCode: summary["entity"].code,
            name: summary["entity"].name,
            score: overallScore,
            scores: summaryScores,
            color: color
        };
        summaryData.push(summaryItem);
    });
    return summaryData;
}

export function combineValuesForSignalsTable(entitiesWithOutages, additionalEntities) {
    let summaryData = [];
    let duplicatesRemoved = additionalEntities;
    entitiesWithOutages.map(entity => {
        let overallScore = null;
        let summaryScores = [];
        // Get each score value for score table
        Object.entries(entity["scores"]).map((entry) => {
            if (entry[0] !== "overall") {
                const entryItem = {
                    source: entry[0],
                    score: entry[1]
                };
                summaryScores.push(entryItem);
            } else {
                overallScore = entry[1]
            }
        });
        // Remove entity from raw entity list
        duplicatesRemoved = duplicatesRemoved.filter(obj => obj.code !== entity["entity"].code);

        // Display entity with outage on signal table, if asn add ip count property
        let summaryItem;
        entity.entity.type === 'asn'
            ? summaryItem = {
                visibility: true,
                entityType: entity["entity"].type,
                entityCode: entity["entity"].code,
                name: entity["entity"].name,
                score: overallScore,
                scores: summaryScores,
                ipCount: humanizeNumber(entity["entity"]["attrs"]["ip_count"], 2)
                }
            : summaryItem = {
            visibility: true,
            entityType: entity["entity"].type,
            entityCode: entity["entity"].code,
            name: entity["entity"].name,
            score: overallScore,
            scores: summaryScores
            };
        summaryData.push(summaryItem);
    });

    // Display scoreless entities on signal table, if asn add ip count property
    duplicatesRemoved.map(entity => {
        let entityItem;
        entity.type === 'asn'
            ? entityItem = {
                visibility: true,
                entityType: entity.type,
                entityCode: entity.code,
                name: entity.name,
                score: 0,
                scores: [{source: "Overall Score", score: 0}],
                ipCount: humanizeNumber(entity.attrs.ip_count, 2)
                }
            : entityItem = {
                    visibility: true,
                    entityType: entity.type,
                    entityCode: entity.code,
                    name: entity.name,
                    score: 0,
                    scores: [{source: "Overall Score", score: 0}]
                };
        summaryData.push(entityItem);
    });
    return summaryData;
}

export function getIsoStringFromDate() {
    var tzo = -this.getTimezoneOffset(),
        dif = tzo >= 0 ? '+' : '-',
        pad = function(num) {
            var norm = Math.floor(Math.abs(num));
            return (norm < 10 ? '0' : '') + norm;
        };
    return this.getFullYear() +
        '-' + pad(this.getMonth() + 1) +
        '-' + pad(this.getDate()) +
        'T' + pad(this.getHours()) +
        ':' + pad(this.getMinutes()) +
        ':' + pad(this.getSeconds()) +
        dif + pad(tzo / 60) +
        ':' + pad(tzo % 60);
}

export function sortByKey(array, key) {
    return array.sort(function(a, b) {
        var x = a[key]; var y = b[key];
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
}

// Used for table component pagination
export function nextPage(data, dataLength, pageNumber, currentDisplayHigh, currentDisplayLow) {
    if (data && dataLength > pageNumber + currentDisplayHigh) {
        let newPageNumber = pageNumber + 1;
        let newCurrentDisplayLow = currentDisplayLow + 10;
        let newCurrentDisplayHigh = currentDisplayHigh + 10 < dataLength
            ? currentDisplayHigh + 10
            : dataLength;
        return {newPageNumber: newPageNumber, newCurrentDisplayLow: newCurrentDisplayLow, newCurrentDisplayHigh: newCurrentDisplayHigh};
    } else {
        return {newPageNumber: pageNumber, newCurrentDisplayLow: currentDisplayLow, newCurrentDisplayHigh: currentDisplayHigh};
    }
}
export function prevPage(data, dataLength, pageNumber, currentDisplayHigh, currentDisplayLow) {
    if (data && pageNumber > 0) {
        let newPageNumber = pageNumber - 1;
        let newCurrentDisplayLow = currentDisplayLow + 10 > dataLength
            ? 10 * pageNumber - 10
            : currentDisplayLow - 10;
        let newCurrentDisplayHigh = currentDisplayHigh + 10 > dataLength
            ? 10 * pageNumber
            : currentDisplayHigh - 10;
        return {newPageNumber: newPageNumber, newCurrentDisplayLow: newCurrentDisplayLow, newCurrentDisplayHigh: newCurrentDisplayHigh};
    } else {
        return {newPageNumber: pageNumber, newCurrentDisplayLow: currentDisplayLow, newCurrentDisplayHigh: currentDisplayHigh};
    }
}

// Function for raw signals table on entity page
// Will process time series data and return in a format compatible with the Horizon-time-series visual
export function convertTsDataForHtsViz(tsData) {
    let seriesConverted = [];
    tsData.values.map((value, index) => {
        const plotPoint = {
            entityCode: tsData.entityCode,
            entityName: tsData.entityName,
            datasource: tsData.datasource,
            ts: new Date(tsData.from * 1000 + tsData.step * 1000 * index),
            val: value
        };
        seriesConverted.push(plotPoint);
    });
    return seriesConverted;
}

// take a list of outages that will populate on a map and create a bounding box the map will use for zoom location
export function getOutageCoords(features) {
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
    }).map(function (coords) { return coords.reverse(); }); // Invert lat long coords
}

// Convert color range for outages that populate on map when hovered (color gets lighter)
export function shadeColor(color, percent) {

    let R = parseInt(color.substring(1,3),16);
    let G = parseInt(color.substring(3,5),16);
    let B = parseInt(color.substring(5,7),16);

    R = parseInt(R * (100 + percent) / 100);
    G = parseInt(G * (100 + percent) / 100);
    B = parseInt(B * (100 + percent) / 100);

    R = (R<255)?R:255;
    G = (G<255)?G:255;
    B = (B<255)?B:255;

    let RR = ((R.toString(16).length==1)?"0"+R.toString(16):R.toString(16));
    let GG = ((G.toString(16).length==1)?"0"+G.toString(16):G.toString(16));
    let BB = ((B.toString(16).length==1)?"0"+B.toString(16):B.toString(16));

    return "#"+RR+GG+BB;
}

// Convert values from control panel range input (date range, time range) into seconds from epoch
export function dateRangeToSeconds(dateRange, timeRange) {
    // initialize values from parameters
    let dStart = dateRange.startDate;
    let tStart = timeRange[0].split(":");
    let dEnd = dateRange.endDate;
    let tEnd = timeRange[1].split(":");
    // set time stamp on date with timezone offset
    dStart = dStart.setHours(tStart[0], tStart[1], tStart[2]);
    dEnd = dEnd.setHours(tEnd[0], tEnd[1], tEnd[2]);
    // account for timezone to ensure selection returns to UTC
    dStart = dStart - (dateRange.startDate.getTimezoneOffset() * 60000);
    dEnd = dEnd - (dateRange.endDate.getTimezoneOffset() * 60000);
    // convert to seconds
    dStart = Math.round(dStart / 1000);
    dEnd = Math.round(dEnd / 1000);
    return [ dStart, dEnd ];
}
