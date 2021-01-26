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

import axios from "axios";
import { merge } from 'lodash';

// Action for getting search-result results based on query
export const ENTITIES_SEARCH = "ENTITIES_SEARCH";
export const ENTITY_METADATA = "ENTITY_METADATA";
export const GET_RELATED_ENTITIES = "GET_RELATED_ENTITIES";
export const OUTAGE_ALERTS_SEARCH = "OUTAGE_ALERTS_SERACH";
export const OUTAGE_EVENTS_SEARCH = "OUTAGE_EVENTS_SERACH";
export const OUTAGE_OVERALL_EVENTS_SEARCH = "OUTAGE_OVERALL_EVENTS_SEARCH";
export const OUTAGE_SUMMARY_SEARCH = "OUTAGE_SUMMARY_SERACH";
export const OUTAGE_RELATED_TO_MAP_SUMMARY_SEARCH = "OUTAGE_RELATED_TO_MAP_SUMMARY_SEARCH";
export const OUTAGE_RELATED_TO_TABLE_SUMMARY_SEARCH = "OUTAGE_RELATED_TO_TABLE_SUMMARY_SEARCH";
export const OUTAGE_TOTAL_COUNT = "OUTAGE_TOTAL_COUNT";
export const GET_DATASOURCES = "GET_DATASOURCES";
export const GET_TOPO_DATA = "GET_TOPO_DATA";
export const GET_SIGNALS = "GET_SIGNALS";

export const fetchData = (config) => {
    const baseURL = 'https://api.ioda.caida.org/dev';
    // const baseURL = 'https://api.ioda.caida.org/v2';
    let concatURL = `${baseURL}${config.url}`;
    const configHeader = merge({}, config, {
        headers: {
            "x-requested-with": "XMLHttpRequest",
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        url: concatURL
        // url: concatURL.replace(/\s/g, "") NOTE: this won't work if search query are like "united states" (with space)
    });

    return axios(configHeader)
        .then(response => {
            return Promise.resolve(response);
        })
        .then(response => {
            return response;
        })
        .catch(error => {
            return Promise.reject(error);
        });
};
