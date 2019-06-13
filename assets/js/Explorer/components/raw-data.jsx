import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';
import {SplitButton, MenuItem} from 'react-bootstrap';

import {CharthouseDataSet} from '../utils/dataset';
import CHARTHOUSE_PLUGIN_SPECS from '../viz-plugins/plugin-specs';
import PluginContent from './plugin-content';
import Dialog from './dialog';

class RawData extends React.Component {

    static propTypes = {
        data: PropTypes.instanceOf(CharthouseDataSet).isRequired
    };

    render() {
        return <SplitButton
            bsStyle='info'
            bsSize='xsmall'
            title={<div>
                <span className="glyphicon glyphicon-align-left"/>
                &nbsp;&nbsp;View JSON
            </div>}
            onClick={this._toggleShowData}
            id='raw-json'
        >
            <MenuItem
                eventKey="download"
                href={this._downloadData()}
                download='hi3-data.json'
            >Download JSON ({this.props.data.jsonSizeHuman()})</MenuItem>
            <MenuItem
                eventKey="curl"
                onClick={this._toggleShowCurl}
            >
                Get cURL command
            </MenuItem>
        </SplitButton>
    }

    _toggleShowData = () => {
        const $anchor = $('<span>');
        ReactDOM.render(
            <Dialog
                title="Raw JSON Data"
                onClose={function () {
                    // GC rogue modal
                    ReactDOM.unmountComponentAtNode($anchor[0]);
                }}
            >
                <PluginContent
                    data={this.props.data}
                    pluginCfg={CHARTHOUSE_PLUGIN_SPECS.rawText}
                />
            </Dialog>,
            $anchor[0]
        );
    };

    _toggleShowCurl = () => {
        const $anchor = $('<span>');
        ReactDOM.render(
            <Dialog
                title='Download JSON using cURL'
                onClose={function () {
                    // GC rogue modal
                    ReactDOM.unmountComponentAtNode($anchor[0]);
                }}
            >
                <p>
                    Copy and paste the following command into a terminal to
                    manually download the JSON data used in this visualization.
                    This can be useful as a starting point for accessing Hi³
                    data from scripts.
                </p>
                <p className='text-danger'>
                    This command contains an authentication token which belongs
                    to you only. <b>Do not share this command.</b>
                </p>
                <pre style={{maxHeight: window.innerHeight * .8}}>
                    <code>{this.props.data.getRequestAsCurl()}</code>
                </pre>
            </Dialog>,
            $anchor[0]
        );
    };

    _downloadData = () => {
        // this dumps all the data into the DOM, might be better to render the
        // download link only when the user wants it
        // TODO: only render data URL when user needs it
        return 'data:application/json;charset=utf-8,' +
            encodeURIComponent(this.props.data.dataAsJSON());
    };

}

export default RawData;
