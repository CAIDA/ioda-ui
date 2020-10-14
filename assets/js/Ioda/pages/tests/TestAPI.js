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

// React Components
import React, { Component } from 'react';
import {searchEntities} from "../../data/ActionEntities";
import {connect} from "react-redux";
import {getDatasourcesAction} from "../../data/ActionDatasources";
import {getTopoAction} from "../../data/ActionTopo";
import {searchAlerts, searchEvents, searchSummary} from "../../data/ActionOutages";
import {getSignalsAction} from "../../data/ActionSignals";

class TestAPI extends Component {
    constructor(props) {
        super(props);
        this.state = {
            mounted: false,
            suggestedSearchResults: null,
            searchTerm: null,
        };
    }

    componentDidMount() {
        this.setState({mounted: true});
        this.props.searchEntitiesAction("united states");
        this.props.getDatasourcesAction();
        this.props.getTopoAction("country");
        this.props.searchAlertsAction(1602544098, 1602630498, "country", null, null, 30, null);
        this.props.searchEventsAction(1602544098, 1602630498, "country", null, null, false, null, 30, null);
        this.props.searchSummaryAction(1602544098, 1602630498, "country", null, 30, null);
        this.props.getSignalsAction("country", "TM", 1602544098, 1602630498, null, null);
    }

    componentDidUpdate(prevProps) {
        // After API call for suggested search results completes, update suggestedSearchResults state with fresh data
        if (this.props.iodaApi.entities !== prevProps.iodaApi.entities) {
            console.assert(this.props.iodaApi.entities[0].code==="US")
            console.log("entities test passed")
        }
        if (this.props.iodaApi.datasources !== prevProps.iodaApi.datasources) {
            console.assert(this.props.iodaApi.datasources.length===3)
            console.log("datasources test passed");
        }
        if (this.props.iodaApi.topo !== prevProps.iodaApi.topo) {
            console.assert("country" in this.props.iodaApi.topo)
            console.log("topology data test passed");
        }
        if (this.props.iodaApi.alerts !== prevProps.iodaApi.alerts) {
            console.assert(this.props.iodaApi.alerts.length===14);
            console.log("alerts search test passed");
        }
        if (this.props.iodaApi.events !== prevProps.iodaApi.events) {
            console.assert(this.props.iodaApi.events.length===9);
            console.log("events search test passed");
        }
        if (this.props.iodaApi.summary !== prevProps.iodaApi.summary) {
            console.assert(this.props.iodaApi.summary.length===8);
            console.log("summary search test passed");
        }
        if (this.props.iodaApi.signals !== prevProps.iodaApi.signals) {
            console.assert(this.props.iodaApi.signals.length===3);
            console.log("signals search test passed");
        }
    }

    render() {
        return (
            <div className='home'>
                <h1>TestAPI</h1>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        iodaApi: state.iodaApi,
    }
};

const mapDispatchToProps = (dispatch) => {
    return {
        searchEntitiesAction: (searchQuery, limit=15) => {
            searchEntities(dispatch, searchQuery, limit);
        },
        getDatasourcesAction: () => {
            getDatasourcesAction(dispatch);
        },
        getTopoAction: (type) => {
            getTopoAction(dispatch, type);
        },
        searchAlertsAction: (from, until, entityType=null, entityCode=null, datasource=null, limit=null, page=null) => {
            searchAlerts(dispatch, from, until, entityType, entityCode, datasource, limit, page);
        },
        searchEventsAction: (from, until, entityType=null, entityCode=null, datasource=null,
                             includeAlerts=null, format=null, limit=null, page=null) => {
            searchEvents(dispatch, from, until, entityType, entityCode, datasource, includeAlerts, format, limit, page);
        },
        searchSummaryAction: (from, until, entityType=null, entityCode=null, limit=null, page=null) => {
            searchSummary(dispatch, from, until, entityType, entityCode, limit, page);
        },
        getSignalsAction: (entityType, entityCode, from, until, datasource=null, maxPoints=null) => {
            getSignalsAction(dispatch, entityType, entityCode, from, until, datasource, maxPoints);
        }
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(TestAPI);
