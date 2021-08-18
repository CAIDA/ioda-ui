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
import dosLogo from 'images/logos/dos.png';
// Constants
import urls from "../../constants/urls/urls";
import PreloadImage from "react-preload-image";
import {Style} from "react-style-tag";

class Card extends Component {
    render() {
        const org = this.props.partner;
        const text = "home." +  org;

        const squareLogoCSS = `position: relative!important;
                        width: 15rem!important;
                        height: 15rem!important;
                        background-size: contain!important;`;
        const rectangleLogoCSS = `position: relative!important;
                        width: 22rem!important;
                        height: 7rem!important;
                        background-size: contain!important;`;

        if (org !== "dos") {
            return (
                <a className="card__link" href={urls.home[`${org}`]}>
                    <Style>{`
                    /* Styles to size the image based on image shape */ 
                    .card--nsf .card__logo-icon div, 
                    .card--dos .card__logo-icon div, 
                    .card--dhs .card__logo-icon div {
                       ${squareLogoCSS}
                    }
                    .card--comcast .card__logo-icon div, 
                    .card--isoc .card__logo-icon div,
                    .card--otf .card__logo-icon div {
                       ${rectangleLogoCSS}
                    }
                `}</Style>
                    <div className={`card card--${org}`}>
                        <div className="card__logo">
                            {
                                org === 'otf'
                                ? <PreloadImage className="card__logo-icon" src={otfLogo} lazy/>
                                // <img src={otfLogo} alt={`${this.props.partner} logo`} className="card__logo-icon" />
                                : org === 'dhs'
                                ? <PreloadImage className="card__logo-icon" src={dhsLogo} lazy/>
                                // <img src={dhsLogo} alt={`${this.props.partner} logo`} className="card__logo-icon" />
                                : org === 'comcast'
                                ? <PreloadImage className="card__logo-icon" src={comcastLogo} lazy/>
                                // <img src={comcastLogo} alt={`${this.props.partner} logo`} className="card__logo-icon" />
                                : org === 'nsf'
                                ? <PreloadImage className="card__logo-icon" src={nsfLogo} lazy/>
                                // <img src={nsfLogo} alt={`${this.props.partner} logo`} className="card__logo-icon" />
                                : org === 'isoc'
                                ? <PreloadImage className="card__logo-icon" src={isocLogo} lazy/>
                                // <img src={isocLogo} alt={`${this.props.partner} logo`} className="card__logo-icon" />
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
                <div className={`card card--${org}`}>
                    <Style>{`
                    /* Styles to size the image based on image shape */ 
                    .card__logo-icon div {
                        ${squareLogoCSS}
                    }
                `}</Style>
                    <div className="card__logo">
                        <PreloadImage className="card__logo-icon" src={dosLogo} lazy/>
                        {/*<img src={dosLogo} alt={`${this.props.partner} logo`} className="card__logo-icon" />*/}
                    </div>
                    <div className="card__content">
                        <p className="card__text">
                            <T.span className="card__text" text={"home.dos1"}/>
                            <a className="card__text-link" href={urls.home.dos1}>
                                <T.span className="card__text" text={"home.dos2"}/>
                            </a>
                            <T.span className="card__text" text={"home.dos3"}/>
                            <a className="card__text-link" href={urls.home.dos2}>
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
