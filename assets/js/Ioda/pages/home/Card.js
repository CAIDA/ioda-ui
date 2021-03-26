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
import React, { Component } from 'react';
// Internationalization
import T from 'i18n-react';
// Images
import otfLogo from 'images/logos/otf.png';
import dhsLogo from 'images/logos/dhs.svg';
import comcastLogo from 'images/logos/comcast.svg';
import nsfLogo from 'images/logos/nsf.svg';
import isocLogo from 'images/logos/isoc.svg';
// Constants
import urls from "../../constants/urls/urls";

class Card extends Component {
    render() {
        const org = this.props.partner;
        const text = "home." +  org;
        if (org !== "dos") {
            return (
                <a href={urls.home[`${org}`]}>
                    <div className="card" >
                        <div className="card__logo">
                            {
                                org === 'otf'
                                    ? <img src={otfLogo} alt={`${this.props.partner} logo`} className="card__logo-icon" />
                                    : org === 'dhs'
                                    ? <img src={dhsLogo} alt={`${this.props.partner} logo`} className="card__logo-icon" />
                                    : org === 'comcast'
                                        ? <img src={comcastLogo} alt={`${this.props.partner} logo`} className="card__logo-icon" />
                                        : org === 'nsf'
                                            ? <img src={nsfLogo} alt={`${this.props.partner} logo`} className="card__logo-icon" />
                                            : org === 'isoc'
                                                ? <img src={isocLogo} alt={`${this.props.partner} logo`} className="card__logo-icon" />
                                                : null
                            }
                        </div>
                        <div className="card__content">
                            <T.p className="card__text" text={text}/>
                        </div>
                    </div>
                </a>
            )
        } else {
            return (
                <div className="card">
                    <div className="card__logo">
                        <img src={null} alt={`${this.props.partner} logo`} className="card__logo-icon" />
                    </div>
                    <div className="card__content">
                        <p className="card__text">
                            <T.span className="card__text" text={"home.dos1"}/>
                            <a href={urls.home.dos1}>
                                <T.span className="card__text" text={"home.dos2"}/>
                            </a>
                            <T.span className="card__text" text={"home.dos3"}/>
                            <a href={urls.home.dos2}>
                                <T.span className="card__text" text={"home.dos4"}/>
                            </a>
                            <T.span className="card__text" text={"home.dos5"}/>
                        </p>
                    </div>
                </div>
            );
        }
    }
}


export default Card;
