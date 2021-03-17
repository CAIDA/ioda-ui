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

import d3 from "d3";

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
    const month = months[new Date(s * 1000).getMonth()];
    const day = new Date(s * 1000).getDate();
    const year = new Date(s * 1000).getFullYear();
    const hourValue = new Date(s * 1000).getHours();
    const hours = hourValue > 12
        ? hourValue - 12
        : hourValue < 10
            ? `0${hourValue}`
            : hourValue;
    const minuteValue = new Date(s * 1000).getMinutes();
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
    summaryDataRaw.map(summary => {
        let overallScore = null;
        let summaryScores = [];

        Object.entries(summary["scores"]).map((entry) => {
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

        // If entity type has ip_count/is an ASN
        let summaryItem;
        summary.entity.type === 'asn'
            ? summaryItem = {
                entityType: summary["entity"].type,
                entityCode: summary["entity"].code,
                name: summary["entity"].name,
                score: overallScore,
                scores: summaryScores,
                ipCount: humanizeNumber(summary["entity"]["attrs"]["ip_count"], 2)
            }
            : summaryItem = {
            entityType: summary["entity"].type,
            entityCode: summary["entity"].code,
            name: summary["entity"].name,
            score: overallScore,
            scores: summaryScores
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
        // console.log(entity);
        // console.log(entity.attrs.ip_count);
        // console.log(entity["attrs"]["ip_count"]);
        console.log(entity.type);
        let entityItem;
        entity.type === 'asn'
            ? entityItem = {
                entityType: entity.type,
                entityCode: entity.code,
                name: entity.name,
                score: 0,
                scores: [{source: "Overall Score", score: 0}],
                ipCount: humanizeNumber(entity.attrs.ip_count, 2)
                }
            : entityItem = {
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
            datasource: tsData.datasource,
            ts: new Date(tsData.from * 1000 + tsData.step * 1000 * index),
            val: value
        };
        seriesConverted.push(plotPoint);
    });
    return seriesConverted;
}
