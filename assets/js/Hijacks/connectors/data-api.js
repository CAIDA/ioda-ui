import $ from 'jquery';

const API_URL = '//bgp.caida.org/json';
const EVENTS_QUERY = '/events';
const STATS_QUERY = '/stats';

class ApiConnector {

    constructor() {
        this.apiUrl = API_URL;
        this.timeout = 20 * 1000;
    };

    _getJson(httpMethod, url, params, headerParams, success, error) {
        headerParams = headerParams || {};

        error = error || function () { }; // Error function optional

        const xThis = this;
        return $.ajax({
            url: url,
            data: httpMethod === 'POST' ? JSON.stringify(params) : params,
            headers: headerParams,
            contentType: httpMethod === 'POST' ? 'application/json; charset=utf-8' : 'text/plain',
            type: httpMethod,
            dataType: 'json',
            xhrFields: {
                withCredentials: false
            },
            timeout: xThis.timeout
        })
            .done(function (json, textStatus, xOptions) {
                success({
                    jsonResponseSize: xOptions.responseText.length, // Tag json size (bytes) in data
                    data: json
                });
            })
            .fail(function (jqXHR, textStatus, errorThrown) {
                if (textStatus === "abort") return;  // Call intentionally aborted
                const rJson = jqXHR.responseJSON;
                error((errorThrown ? errorThrown + ': ' : '') +
                    (rJson && rJson.error ? rJson.error : 'An unknown error occurred'));
            });
    }

    getEvents(type, params, success, error) {
        return this._getJson(
            'GET',
            this.apiUrl + EVENTS_QUERY + '/' + type,
            params,
            {},
            success,
            error
        );
    }

    getStats(type, success, error) {
        return this._getJson(
            'GET',
            this.apiUrl + STATS_QUERY + '/' + type,
            {},
            {},
            success,
            error
        );
    }
}

export default ApiConnector;
