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
// Internationalization
import T from 'i18n-react';

class Methodology extends PureComponent {
    render() {

        return(
            <div className="methodology">
                <div className="row">
                    <div className="col-1-of-1">
                        <h2 className="section-header">Methodology</h2>
                        <p>
                            IODA combines information from three
                            data sources, establishes the relevance of an event and generates
                            alerts. The outage events and the corresponding signals obtained
                            through automated analysis are displayed on dashboards and
                            interactive graphs that allow the user to further inspect the data.
                        </p>
                    </div>
                </div>
                <div className="row">
                    <div className="col-1-of-3">
                        <h4>Global Internet routing (BGP)</h4>
                        <p>We use data from ~500 monitors
                        participating in the RouteViews and RIPE RIS projects to establish
                        which network blocks are reachable based on the Internet control
                            plane.</p>
                    </div>
                    <div className="col-1-of-3">
                        <h4>Internet Background Radiation</h4>
                        <p>We process unsolicited traffic
                        reaching the UCSD Network Telescope monitoring an unutilized /8
                            address block.</p>
                    </div>
                    <div className="col-1-of-3">
                        <h4>Active Probing</h4>
                        <p>We continuously probe a large fraction of the
                        (routable) IPv4 address space from CAIDA servers
                        and use a <a href="https://www.isi.edu/~johnh/PAPERS/Quan13c.html">methodology developed by
                        University
                        of Southern California</a> to infer when a /24 block is affected by a
                            network outage.</p>
                    </div>
                </div>
                <div className="row">
                    <div className="col-1-of-1">
                        <p>
                            See the <a href="http://www.caida.org/projects/ioda/">IODA project page</a> for scientific
                            references and for more information about our methodology.
                        </p>
                    </div>
                </div>
            </div>
        );
    }
}


export default Methodology;
