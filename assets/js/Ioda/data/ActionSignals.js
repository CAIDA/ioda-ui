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

/*
BUILDING CONNECTION CONFIGS
 */

import {fetchData, GET_EVENT_SIGNALS, GET_SIGNALS, GET_RAW_REGIONAL_SIGNALS, GET_RAW_ASN_SIGNALS} from "./ActionCommons";

const buildSignalsConfig = (entityType, entityCode, from, until, datasource, maxPoints=null) => {
    let url = `/signals/raw/${entityType}/${entityCode}?from=${from}&until=${until}`;
    url += datasource!==null ? `&datasource=${datasource}`: "";
    return {
        method: "get",
        url: url
    }
};

const buildEventSignalsConfig = (entityType, entityCode, from, until, datasource=null, maxPoints=null) => {
    let url = `/signals/events/${entityType}/${entityCode}?from=${from}&until=${until}`;
    url += datasource!==null ? `&datasource=${datasource}`: "";
    return {
        method: "get",
        url: url
    }
};

/*
PUBLIC ACTION FUNCTIONS
 */

export const getSignalsAction = (dispatch, entityType, entityCode, from, until, datasource=null, maxPoints=null) => {
    let config = buildSignalsConfig(entityType, entityCode, from, until, datasource, maxPoints);
    fetchData(config).then(data => {
        dispatch({
            type: GET_SIGNALS,
            payload: data.data.data,
        })
    });
};

export const getEventSignalsAction = (dispatch, entityType, entityCode, from, until, datasource=null, maxPoints=null) => {
    let config = buildEventSignalsConfig(entityType, entityCode, from, until, datasource, maxPoints);
    fetchData(config).then(data => {
        dispatch({
            type: GET_EVENT_SIGNALS,
            payload: data.data.data,
        })
    });
};

export const getRawRegionalSignalsAction = (dispatch, entityType, entityCode, from, until, attr=null, order=null, dataSource, maxPoints=null) => {
    let config = buildSignalsConfig(entityType, entityCode, from, until, dataSource, maxPoints);
    fetchData(config).then(data => {
        dispatch({
            type: GET_RAW_REGIONAL_SIGNALS,
            payload: data.data.data,
        })
    });
};

export const getRawAsnSignalsAction = (dispatch, entityType, entityCode, from, until,  attr=null, order=null, dataSource, maxPoints=null) => {
    let config = buildSignalsConfig(entityType, entityCode, from, until, dataSource, maxPoints);
    fetchData(config).then(data => {
        dispatch({
            type: GET_RAW_ASN_SIGNALS,
            payload: data.data.data,
        })
    });
};

