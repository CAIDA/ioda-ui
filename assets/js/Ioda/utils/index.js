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

        // console.log(summary);
        const summaryItem = {
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
