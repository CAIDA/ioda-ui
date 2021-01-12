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

import {
    fetchData,
    OUTAGE_ALERTS_SEARCH,
    OUTAGE_EVENTS_SEARCH,
    OUTAGE_SUMMARY_SEARCH,
    OUTAGE_RELATED_TO_SUMMARY_SEARCH,
    OUTAGE_TOTAL_COUNT
} from "./ActionCommons";

/*
BUILDING CONNECTION CONFIGS
 */

const buildAlertsConfig = (from, until, entityType=null, entityCode=null, datasource=null, limit=null, page=null) => {
    let url = "/outages/alerts/";
    if(entityType !== null){
        url += `${entityType}/`;
        if(entityCode !== null) {
            url += `${entityCode}/`;
        }
    }
    url += `?from=${from}&until=${until}`;

    url += datasource!==null ? `&datasource=${datasource}`: "";
    url += limit!==null ? `&limit=${limit}`: "";
    url += page!==null ? `&page=${page}`: "";

    return {
        method: "get",
        url: url
    }
};

const buildEventsConfig = (from, until, entityType=null, entityCode=null, attr, order, datasource=null,
                           includeAlerts=null, format=null,
                           limit=null, page=null, ) => {
    let url = "/outages/events/";
    if(entityType !== null){
        url += `${entityType}/`;
        if(entityCode !== null) {
            url += `${entityCode}/`;
        }
    }
    url += `?from=${from}&until=${until}`;

    url += datasource!==null ? `&datasource=${datasource}`: "";
    url += format!==null ? `&format=${format}`: "";
    url += includeAlerts!==null ? `&includeAlerts=${includeAlerts}`: "";
    url += limit!==null ? `&limit=${limit}`: "";
    url += page!==null ? `&page=${page}`: "";
    url += attr!==null && order!==null ? `&orderBy=${attr}/${order}`: "";

    return {
        method: "get",
        url: url
    }
};

const buildSummaryConfig = (from, until, entityType=null, entityCode=null, limit=null, page=null) => {
    let url = "/outages/summary/";
    if(entityType !== null){
        url += `${entityType}/`;
        if(entityCode !== null) {
            url += `${entityCode}/`;
        }
    }
    url += `?from=${from}&until=${until}`;

    url += limit!==null ? `&limit=${limit}`: "";
    url += page!==null ? `&page=${page}`: "";

    return {
        method: "get",
        url: url
    }
};

const buildRelatedToSummaryConfig = (from, until, entityType, relatedToEntityType, relatedToEntityCode, entityCode=null, limit=null, page=null) => {
    let url = "/outages/summary/";
    if(entityType !== null){
        url += `${entityType}/`;
        // if(entityCode !== null) {
        //     url += `${entityCode}/`;
        // }
    }
    url += `?from=${from}&until=${until}`;

    url += limit!==null ? `&limit=${limit}`: "";
    url += page!==null ? `&page=${page}`: "";
    url += relatedToEntityType!==null ? `&relatedTo=${relatedToEntityType}/${relatedToEntityCode}` : "";

    return {
        method: "get",
        url: url
    }
};

/*
PUBLIC ACTION FUNCTIONS
 */

export const searchAlerts = (dispatch, from, until, entityType=null, entityCode=null, datasource=null, limit=null, page=null) => {
    let config = buildAlertsConfig(from, until, entityType, entityCode, datasource, limit, page);
    fetchData(config).then(data => {
        dispatch({
            type: OUTAGE_ALERTS_SEARCH,
            payload: data.data.data,
        })
    });
}

export const searchEvents = (dispatch, from, until, entityType=null, entityCode=null, datasource=null,
                             includeAlerts=null, format=null, limit=null, page=null, attr=null, order=null) => {
    let config = buildEventsConfig(from, until, entityType, entityCode, datasource, includeAlerts, format, limit, page, attr, order);
    fetchData(config).then(data => {
        dispatch({
            type: OUTAGE_EVENTS_SEARCH,
            payload: data.data.data,
        })
    });
}

// Getting outage information to use for populating topoJSON data
export const searchSummary = (dispatch, from, until, entityType, entityCode, limit, page, includeMetadata) => {
    let config = buildSummaryConfig(from, until, entityType, entityCode, limit, page, includeMetadata);
    includeMetadata
        ? config.url = config.url + "&includeMetadata=true"
        : config.url;
    fetchData(config).then(data => {
        dispatch({
            type: OUTAGE_SUMMARY_SEARCH,
            payload: data.data.data,
        })
    });
}

// Getting outage information to use for populating topoJSON data
export const searchRelatedToSummary = (dispatch, from, until, entityType, relatedToEntityType, relatedToEntityCode, entityCode, limit, page, includeMetadata) => {
    let config = buildRelatedToSummaryConfig(from, until, entityType, relatedToEntityType, relatedToEntityCode, entityCode, limit, page, includeMetadata);
    includeMetadata
        ? config.url = config.url + "&includeMetadata=true"
        : config.url;
    fetchData(config).then(data => {
        console.log(data);
        dispatch({
            type: OUTAGE_RELATED_TO_SUMMARY_SEARCH,
            payload: data.data.data,
        })
    });
}

// Getting outage information to use for populating topoJSON data
export const totalOutages = (dispatch, from, until, entityType=null, limit=null, page=null, includeMetadata=null) => {
    let config = buildSummaryConfig(from, until, entityType, limit, page, includeMetadata);
    fetchData(config).then(data => {
        dispatch({
            type: OUTAGE_TOTAL_COUNT,
            payload: data.data.data,
        })
    });
}
