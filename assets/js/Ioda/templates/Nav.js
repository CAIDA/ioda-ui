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

import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import T from 'i18n-react';
import iodaLogo from 'images/logos/ioda-logo.svg';

class Nav extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const dashboard = T.translate("header.dashboard");
        const iodaLogoAltText = T.translate("header.iodaLogoAltText");

        return(
            <div className="header">
                <div className="header__container">
                    <div className="header__logo">
                        <Link to="/">
                            <img src={iodaLogo} alt={iodaLogoAltText} />
                        </Link>
                    </div>
                    <nav className="header__nav">
                        <div className="header__nav--mobile">
                            <input type="checkbox" className="header__checkbox" ref={this.checkbox} id="nav-toggle" />
                            <label htmlFor="nav-toggle" className="header__button">
                                <span className="header__icon">&nbsp;</span>
                            </label>
                        </div>
                        <ul className="header__list">
                            <li className="header__item">
                                <a href="/dashboard" className="header__link">
                                    {dashboard}
                                </a>
                            </li>
                            {/*<li className="navigation__item">*/}
                            {/*    <Link to="/docs" className="navigation__link">*/}
                            {/*        Documentation*/}
                            {/*    </Link>*/}
                            {/*</li>*/}
                            {/*<li className="navigation__item">*/}
                            {/*    <Link to="/about" className="navigation__link">*/}
                            {/*        About*/}
                            {/*    </Link>*/}
                            {/*</li>*/}
                            {/*<li className="navigation__item">*/}
                            {/*    <Link to="/help" className="navigation__link">*/}
                            {/*        Help*/}
                            {/*    </Link>*/}
                            {/*</li>*/}
                        </ul>
                    </nav>
                </div>
            </div>
        );
    }
}

export default Nav;
