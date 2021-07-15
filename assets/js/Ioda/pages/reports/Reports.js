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




class Reports extends PureComponent {

    render() {
        const title = T.translate("reports.title");
        const text = T.translate("reports.text");
        const link1 = T.translate("reports.link1");
        const link2 = T.translate("reports.link2");
        const link3 = T.translate("reports.link3");
        const link4 = T.translate("reports.link4");
        const link5 = T.translate("reports.link5");

        return (
            <div className="reports">
                <div className="row list">
                    <div className="col-1-of-1">
                        <h1 className="section-header">{title}</h1>
                        <p className="reports__text">{text}</p>
                        <ul className="reports__list">
                            <li className="reports__list-item">
                                <a href="https://ooni.org/post/2021-uganda-general-election-blocks-and-outage/" target="_blank">
                                    {link1}
                                </a>
                            </li>
                            <li className="reports__list-item">
                                <Link to="https://ooni.org/post/2021-uganda-general-election-blocks-and-outage/">
                                    {link2}
                                </Link>
                            </li>
                            <li className="reports__list-item">
                                <a href="https://ooni.org/post/2019-iran-internet-blackout/" target="_blank">
                                    {link3}
                                </a>
                            </li>
                            <li className="reports__list-item">
                                <a href="https://ooni.org/post/2019-benin-social-media-blocking/" target="_blank">
                                    {link4}
                                </a>
                            </li>
                            <li className="reports__list-item">
                                <a href="https://ooni.org/post/gabon-internet-disruption/" target="_blank">
                                    {link5}
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

            </div>
        );
    }
}

export default Reports;
