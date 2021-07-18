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

// React Imports
import React, { PureComponent } from 'react';
import { Link } from 'react-router-dom';
// Internationalization
import T from 'i18n-react';


class Help extends PureComponent {

    render() {
        const title = T.translate("IODA Help");
        const text = T.translate("reports.text");
        const link1 = T.translate("reports.link1");
        const link2 = T.translate("reports.link2");
        const link3 = T.translate("reports.link3");
        const link4 = T.translate("reports.link4");
        const link5 = T.translate("reports.link5");

        return (
            <div className="helpPage">
                <div className="row list">
                    <div className="col-1-of-1">
                        <h1 className="section-header">{title}</h1>
                        <h2>Screencasts</h2>
                        <p>
                            We have created screencasts that walk you through using IODA's Dashboard
                            and Explorer.  The screencasts discuss the most important user interface
                            elements, IODA's data sources, and show how to use both the Dashboard
                            and the Explorer effectively.
                        </p>
                        <ul>
                            <li><a href="https://www.youtube.com/watch?v=jpOkIjAHKNc">NEW: Dashboard - Overview and Case Studies</a></li>
                            <li><a href="https://www.youtube.com/watch?v=VzOv7g1Xy3k">Dashboard screencast</a></li>
                            <li><a href="https://www.youtube.com/watch?v=X4vlllI2TVU">Explorer screencast</a></li>
                        </ul>

                        <h2>Datasources</h2>

                        <h3>BGP</h3>
                        <ul>
                            <li>
                                Data is obtained by processing <em>all updates</em> from <em>all Route Views and
                                RIPE RIS collectors</em>.
                            </li>
                            <li>
                                Every 5 minutes, we calculate the number of full-feed peers that
                                observe each prefix. A peer is <em>full-feed</em> if it has more than 400k IPv4 prefixes, and/or more than 10k IPv6 prefixes (i.e., suggesting that it shares its entire routing table).
                            </li>
                            <li>
                                A prefix is <em>visible</em> if more than 50% of the full-feed peers observe it.
                                We aggregate prefix visibility statistics by country, region and ASN.
                            </li>
                        </ul>

                        <h3>Active Probing</h3>
                        <ul>
                            <li>
                                We use a custom implementation of the <a href="https://www.isi.edu/~johnh/PAPERS/Quan13c.html">Trinocular</a> technique.
                            </li>
                            <li>
                                We probe ~4.2M /24 blocks at least once every 10 minutes (as opposed to 11 minutes used in the Trinocular paper).
                            </li>
                            <li>
                                Currently the alerts IODA shows use data from a team of
                                20 probers located at SDSC.
                            </li>
                            <li>
                                The trinocular measurement and inference technique labels a /24 block as <em>up</em>,
                                <em>down</em>, or <em>unknown</em>.
                                In addition, we then aggregate <em>up</em> /24s into country, region and ASN
                                statistics.
                            </li>
                        </ul>

                        <h3>Network Telescope</h3>
                        <ul>
                            <li>
                                We analyze traffic data from both the <a href="https://www.caida.org/projects/network_telescope/">UCSD</a> and <a href="https://www.merit.edu/a-data-repository-for-cyber-security-research-and-education/">Merit</a> Network Telescopes.
                                (Currently IODA uses only data from the UCSD Telescope for generating alerts.)
                            </li>
                            <li>
                                We apply <a href="http://www.caida.org/publications/papers/2014/passive_ip_space_usage_estimation/">anti-spoofing heuristics and noise reduction filters</a> to the
                                            raw traffic.
                            </li>
                            <li>
                                For each packet that passes the filters, we perform geolocation (using the Netacuity IP geolocation DB) and ASN lookups on the source IP address,
                                and then compute the <em>number of unique source IPs per minute</em>, aggregated by  country, region, and ASN.
                            </li>
                        </ul>

                        <h2>Outage Detection</h2>
                        <ul>
                            <li>
                                For each data source (BGP, Active Probing, and Darknet), we currently
                                monitor for three types of outages: country-level, region-level and
                                AS-level.
                            </li>
                            <li>
                                Detection is performed by comparing the <em>current</em> value for
                                each datasource/aggregation (e.g. the number of /24 networks visible
                                on <em>BGP</em> and geolocated to <em>Italy</em>) to an
                                <em>historical</em> value that is computed by finding the
                                <em>median</em> of a sliding window of recent values (the length of
                                the window varies between data sources and is listed below).
                            </li>
                            <li>
                                If the <em>current</em> value is lower than a given fraction of the
                                <em>history</em> value, an alert is generated. Each data source is
                                configured with two <em>history-fraction</em> thresholds; one that
                                triggers a <em>warning</em> alert, and one that triggers a
                                <em>critical</em> alert. The warning and critical thresholds for each
                                data source are listed below. These values are experimental and are based on empirical observations of the signal to noise ratio for each data source.
                            </li>
                        </ul>

                        <h3>Detection Criteria</h3>

                        <h4>BGP</h4>
                        <ul>
                            <li>
                                <b>Metric:</b> # /24 blocks (visible by > 50% of peers)
                            </li>
                            <li>
                                <b>History Sliding Window Length:</b> 24 hours
                            </li>
                            <li>
                                <b>Thresholds:</b>
                                <ul>
                                    <li>
                                        <b>Warning:</b> 99%
                                    </li>
                                    <li>
                                        <b>Critical:</b> 50%
                                    </li>
                                </ul>
                            </li>
                        </ul>

                        <h4>Active Probing</h4>
                        <ul>
                            <li>
                                <b>Metric:</b> # /24 blocks up
                            </li>
                            <li>
                                <b>History Sliding Window Length:</b> 7 days
                            </li>
                            <li>
                                <b>Thresholds:</b>
                                <ul>
                                    <li>
                                        <b>Warning:</b> 80%
                                    </li>
                                    <li>
                                        <b>Critical:</b> 50%
                                    </li>
                                </ul>
                            </li>
                        </ul>

                        <h4>Darknet</h4>
                        <ul>
                            <li>
                                <b>Metric:</b> # unique source IP addresses
                            </li>
                            <li>
                                <b>History Sliding Window Length:</b> 7 days
                            </li>
                            <li>
                                <b>Thresholds:</b>
                                <ul>
                                    <li>
                                        <b>Warning:</b> 25%
                                    </li>
                                    <li>
                                        <b>Critical:</b> 10%
                                    </li>
                                </ul>
                            </li>
                        </ul>

                        <h2>Outage Severity Scores</h2>

                        <h3>Alert Area</h3>
                        <p>
                            To quantify the <em>severity</em> of an outage, we use a concept we call
                            <em>Alert Area</em>, which takes into account both the magnitude of the
                            outage and the duration of the outage. The alert area is computed by
                            multiplying the relative drop (i.e. <em>((history - current) / history) * 100</em>)
                            by the length of the outage (in minutes). All alert tables in IODA show
                            Alert Area values as per-datasource outage severity scores.
                        </p>

                        <h3>Overall Score</h3>
                        <p>
                            While we perform outage detection on a per-datasource basis, we use multiple
                            datasources to gain confidence about an outage. To do this, we compute
                            an <em>Overall Score</em> by <em>multiplying</em> the
                            <em>Alert Area</em> scores for each data source that triggered an alert.
                            We multiply Alert Area scores together (rather than summing them) to
                            give weight to outages that have been detected through multiple datasources.
                        </p>
                        <p>
                            <b>Caveat:</b> While the "Overall Score" values given in the alert tables
                            reflect a multiplication of the total alert area for each data source,
                            the "Overall Score" value shown in the "Outage Severity Levels"
                            visualizations is instead the
                            sum of the overall score values for each minute in the time window.
                            That is, an overall score is computed for each minute by multiplying
                            together the alert areas for that minute, and then these per-minute
                            overall scores are summed to give the total shown when hovering over a
                            country or region.
                        </p>
                    </div>
                </div>
            </div>
        );
    }
}

export default Help;
