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
    ENTITIES_SEARCH,
    GET_RELATED_ENTITIES,
    ENTITY_METADATA,
    GET_DATASOURCES,
    GET_SIGNALS,
    GET_EVENT_SIGNALS,
    GET_TOPO_DATA,
    OUTAGE_ALERTS_SEARCH,
    OUTAGE_EVENTS_SEARCH,
    OUTAGE_OVERALL_EVENTS_SEARCH,
    OUTAGE_SUMMARY_SEARCH,
    OUTAGE_RELATED_TO_MAP_SUMMARY_SEARCH,
    OUTAGE_RELATED_TO_TABLE_SUMMARY_SEARCH,
    OUTAGE_TOTAL_COUNT,
    GET_REGIONAL_SIGNALS_TABLE_SUMMARY_DATA,
    GET_ASN_SIGNALS_TABLE_SUMMARY_DATA,
    GET_RAW_REGIONAL_SIGNALS_PINGSLASH24,
    GET_RAW_REGIONAL_SIGNALS_BGP,
    GET_RAW_REGIONAL_SIGNALS_UCSDNT,
    GET_RAW_ASN_SIGNALS_PINGSLASH24,
    GET_RAW_ASN_SIGNALS_BGP,
    GET_RAW_ASN_SIGNALS_UCSDNT,
    GET_ADDITIONAL_RAW_SIGNAL
} from './ActionCommons';

const initialState = {
    entities: null,
    relatedToMapSummary: null,
    relatedToTableSummary: null,
    entityMetadata: null,
    signals: null,
    eventSignals: null,
    alerts: null,
    events: null,
    overallEvents: null,
    summary: null,
    summaryTotalCount: null,
    topo: null,
    datasources: null,
    // Map Modal
    regionalSignalsTableSummaryData: null,
    rawRegionalSignalsPingSlash24: null,
    rawRegionalSignalsBgp: null,
    rawRegionalSignalsUcsdNt: null,
    // Table Modal
    asnSignalsTableSummaryData: null,
    rawAsnSignalsPingSlash24: null,
    rawAsnSignalsBgp: null,
    rawAsnSignalsUcsdNt: null,
    additionalRawSignal: null

}

export function iodaApiReducer(state = initialState, action) {
    switch (action.type) {
        case ENTITIES_SEARCH:
            return Object.assign({}, state, {
                entities: action.payload
            });
        case GET_RELATED_ENTITIES:
            return Object.assign({}, state, {
                relatedEntities: action.payload
            });
        case ENTITY_METADATA:
            return Object.assign({}, state, {
                entityMetadata: action.payload
            });
        case OUTAGE_ALERTS_SEARCH:
            return Object.assign({}, state, {
                alerts: action.payload
            });
        case OUTAGE_EVENTS_SEARCH:
            return Object.assign({}, state, {
                events: action.payload
            });
        case OUTAGE_OVERALL_EVENTS_SEARCH:
            return Object.assign({}, state, {
                overallEvents: action.payload
            });
        case OUTAGE_SUMMARY_SEARCH:
            return Object.assign({}, state, {
                summary: action.payload
            });
        case OUTAGE_RELATED_TO_MAP_SUMMARY_SEARCH:
            return Object.assign({}, state, {
                relatedToMapSummary: action.payload
            });
        case OUTAGE_RELATED_TO_TABLE_SUMMARY_SEARCH:
            return Object.assign({}, state, {
                relatedToTableSummary: action.payload
            });
        case OUTAGE_TOTAL_COUNT:
            return Object.assign({}, state, {
                summaryTotalCount: action.payload
            });
        case GET_TOPO_DATA:
            return Object.assign({}, state, {
                topo: {
                    [action.subtype]: action.payload
                }
            });
        case GET_DATASOURCES:
            return Object.assign({}, state, {
                datasources: action.payload
            });
        case GET_SIGNALS:
            return Object.assign({}, state, {
                signals: action.payload
            });
        case GET_RAW_REGIONAL_SIGNALS_PINGSLASH24:
            return Object.assign({}, state, {
                rawRegionalSignalsPingSlash24: action.payload
            });
        case GET_RAW_REGIONAL_SIGNALS_BGP:
            return Object.assign({}, state, {
                rawRegionalSignalsBgp: action.payload
            });
        case GET_RAW_REGIONAL_SIGNALS_UCSDNT:
            return Object.assign({}, state, {
                rawRegionalSignalsUcsdNt: action.payload
            });
        case GET_RAW_ASN_SIGNALS_PINGSLASH24:
            return Object.assign({}, state, {
                rawAsnSignalsPingSlash24: action.payload
            });
        case GET_RAW_ASN_SIGNALS_BGP:
            return Object.assign({}, state, {
                rawAsnSignalsBgp: action.payload
            });
        case GET_RAW_ASN_SIGNALS_UCSDNT:
            return Object.assign({}, state, {
                rawAsnSignalsUcsdNt: action.payload
            });
        case GET_EVENT_SIGNALS:
            return Object.assign({}, state, {
                eventSignals: action.payload
            });
        case GET_REGIONAL_SIGNALS_TABLE_SUMMARY_DATA:
            return Object.assign({}, state, {
                regionalSignalsTableSummaryData: action.payload
            });
        case GET_ASN_SIGNALS_TABLE_SUMMARY_DATA:
            return Object.assign({}, state, {
                asnSignalsTableSummaryData: action.payload
            });
        case GET_ADDITIONAL_RAW_SIGNAL:
            return Object.assign({}, state, {
                additionalRawSignal: action.payload
            });
        default:
            return state;
    }
}
