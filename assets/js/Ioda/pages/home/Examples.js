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
// Lazy Load Images
import PreloadImage from "react-preload-image";
// Images
import africa from 'images/exampleOutages/Africa-Jan2020.jpg';
import as209 from 'images/exampleOutages/AS209-Dec2018.jpg';
import as37680 from 'images/exampleOutages/AS37680-Sept2019.jpg';
import china from 'images/exampleOutages/China-May2019.jpg';
import gabon from 'images/exampleOutages/Gabon-Sept2016.jpg';
import iran from 'images/exampleOutages/Iran-Nov2019.jpg';
import iraq from 'images/exampleOutages/Iraq-Oct2016.jpg';
import syria from 'images/exampleOutages/Syria-June2020.jpg';
import venezuela from 'images/exampleOutages/Venezuela-Mar2019.jpg';

// Constants
import urls from "../../constants/urls/urls";
import {Link} from "react-router-dom";

class Examples extends PureComponent {
    render() {
        const syriaTitle = T.translate("home.examples.syria.title");
        const syriaText1 = T.translate("home.examples.syria.text1");
        const syriaText2 = T.translate("home.examples.syria.text2");
        const syriaText3 = T.translate("home.examples.syria.text3");

        const africaTitle = T.translate("home.examples.africa.title");
        const africaText1 = T.translate("home.examples.africa.text1");
        const africaText2 = T.translate("home.examples.africa.text2");
        const africaText3 = T.translate("home.examples.africa.text3");
        const africaText4 = T.translate("home.examples.africa.text4");
        const africaText5 = T.translate("home.examples.africa.text5");
        const africaText6 = T.translate("home.examples.africa.text6");
        const africaText7 = T.translate("home.examples.africa.text7");
        const africaText8 = T.translate("home.examples.africa.text8");
        const africaText9 = T.translate("home.examples.africa.text9");
        const africaText10 = T.translate("home.examples.africa.text10");

        const iranTitle = T.translate("home.examples.iran.title");
        const iranText1 = T.translate("home.examples.iran.text1");
        const iranText2 = T.translate("home.examples.iran.text2");
        const iranText3 = T.translate("home.examples.iran.text3");
        const iranText4 = T.translate("home.examples.iran.text4");
        const iranText5 = T.translate("home.examples.iran.text5");
        const iranText6 = T.translate("home.examples.iran.text6");
        const iranText7 = T.translate("home.examples.iran.text7");
        const iranText8 = T.translate("home.examples.iran.text8");
        const iranText9 = T.translate("home.examples.iran.text9");

        const as37680Title = T.translate("home.examples.as37680.title");
        const as37680Text1 = T.translate("home.examples.as37680.text1");
        const as37680Text2 = T.translate("home.examples.as37680.text2");
        const as37680Text3 = T.translate("home.examples.as37680.text3");
        const as37680Text4 = T.translate("home.examples.as37680.text4");
        const as37680Text5 = T.translate("home.examples.as37680.text5");

        const chinaTitle = T.translate("home.examples.china.title");
        const chinaText1 = T.translate("home.examples.china.text1");
        const chinaText2 = T.translate("home.examples.china.text2");
        const chinaText3 = T.translate("home.examples.china.text3");
        const chinaText4 = T.translate("home.examples.china.text4");
        const chinaText5 = T.translate("home.examples.china.text5");

        const venezuelaTitle = T.translate("home.examples.venezuela.title");
        const venezuelaText1 = T.translate("home.examples.venezuela.text1");
        const venezuelaText2 = T.translate("home.examples.venezuela.text2");
        const venezuelaText3 = T.translate("home.examples.venezuela.text3");

        const as209Title = T.translate("home.examples.as209.title");
        const as209Text1 = T.translate("home.examples.as209.text1");
        const as209Text2 = T.translate("home.examples.as209.text2");
        const as209Text3 = T.translate("home.examples.as209.text3");
        const as209Text4 = T.translate("home.examples.as209.text4");
        const as209Text5 = T.translate("home.examples.as209.text5");

        const iraqTitle = T.translate("home.examples.iraq.title");
        const iraqText1 = T.translate("home.examples.iraq.text1");

        const gabonTitle = T.translate("home.examples.gabon.title");
        const gabonText1 = T.translate("home.examples.gabon.text1");
        const gabonText2 = T.translate("home.examples.gabon.text2");
        const gabonText3 = T.translate("home.examples.gabon.text3");
        const gabonText4 = T.translate("home.examples.gabon.text4");
        const gabonText5 = T.translate("home.examples.gabon.text5");
        const gabonText6 = T.translate("home.examples.gabon.text6");

        return(
            <div className="examples">
                <div className="row">
                    <div className="col-1-of-1">
                        <h2 className="section-header">Example Outages</h2>
                    </div>
                </div>


                <div className="row">

{/*             */}
{/* Row 1 Col 1 - Syria June 2020 */}
{/*             */}
                    <div className="col-1-of-3">
                        <div className="thumbnail">
                            <div className="thumbnail__img">
                                <Link to="/country/SY?from=1592693703&until=1593557703">
                                    <PreloadImage className="thumbnail__img-container" src={syria} lazy/>
                                </Link>
                            </div>
                            <div className="thumbnail__text">
                                <h4>
                                    <Link className="thumbnail__title" to="/country/SY?from=1592693703&until=1593557703">
                                        {syriaTitle}
                                    </Link>
                                </h4>
                                <p>
                                    {syriaText1}
                                    <a href="https://blogs.oracle.com/internetintelligence/syria-goes-to-extremes-to-foil-cheaters-v3">
                                        {syriaText2}
                                    </a>
                                    {syriaText3}
                                </p>
                            </div>
                        </div>
                    </div>
{/*             */}
{/* Row 1 Col 2 -  Africa Jan 2020 */}
{/*             */}
                    <div className="col-1-of-3">
                        <div className="thumbnail">
                            <div className="thumbnail__img">
                                <Link to="/dashboard?from=1579108680&until=1579192320">
                                    <PreloadImage className="thumbnail__img-container" src={africa} lazy/>
                                </Link>
                            </div>
                            <div className="thumbnail__text">
                                <h4>
                                    <Link className="thumbnail__title" to="/dashboard?from=1579108680&until=1579192320">
                                        {africaTitle}
                                    </Link>
                                </h4>
                                <p>
                                    {africaText1}<a href="https://www.africanews.com/2020/01/17/africa-internet-outage-after-cable-issue/">{africaText2}</a>{africaText3}
                                    <Link to="/country/CG?from=1579100400&until=1579377960">{africaText4}</Link>{africaText5}
                                    <Link to="/country/NA?from=1579100400&until=1579377960">{africaText6}</Link>{africaText5}
                                    <Link to="/country/CD?from=1579100400&until=1579377960">{africaText7}</Link>{africaText8}
                                    <Link to="/country/AO?from=1579100400&until=1579377960">{africaText9}</Link>{africaText10}
                                </p>
                            </div>
                        </div>
                    </div>
{/*             */}
{/* Row 1 Col 3 - Iran Nov 2019 */}
{/*             */}
                    <div className="col-1-of-3">
                        <div className="thumbnail">
                            <div className="thumbnail__img">
                                <Link to="/country/IR?from=1573862400&until=1574035200">
                                    <PreloadImage className="thumbnail__img-container" src={iran} lazy/>
                                </Link>
                            </div>
                            <div className="thumbnail__text">
                                <h4>
                                <Link className="thumbnail__title" to="/country/IR?from=1573862400&until=1574035200">
                                    {iranTitle}
                                </Link>
                                </h4>
                                <p>
                                    {iranText1}
                                    <a href="https://www.aljazeera.com/news/2019/11/iran-protests-600-words-191118060831036.html">{iranText2}</a>
                                    {iranText3}
                                    <a href="https://www.wired.com/story/iran-internet-shutoff/">{iranText4}</a>
                                    {iranText5}
                                    <a href="https://ooni.org/post/2019-iran-internet-blackout/">{iranText6}</a>
                                    {iranText7}
                                    <a href="https://iran-shutdown.amnesty.org">{iranText8}</a>
                                    {iranText9}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="row">
{/*             */}
{/* Row 2 Col 1 - AS37680 Sept 2019 */}
{/*             */}
                    <div className="col-1-of-3">
                        <div className="thumbnail">
                            <div className="thumbnail__img">
                                <Link to="/asn/37680?from=1569024000&until=1569153600">
                                    <PreloadImage className="thumbnail__img-container" src={as37680} lazy/>
                                </Link>
                            </div>
                            <div className="thumbnail__text">
                                <h4>
                                <Link className="thumbnail__title" to="/asn/37680?from=1569024000&until=1569153600">
                                    {as37680Title}
                                </Link>
                                </h4>
                                <p>
                                    {as37680Text1}
                                    <a href="https://www.zdnet.com/article/carpet-bombing-ddos-attack-takes-down-south-african-isp-for-an-entire-day/">{as37680Text2}</a>
                                    {as37680Text3}
                                    <a href="https://coolzone.cisp.co.za/announcements.php?announcement=2038-international-traffic-ddos-cool-ideas">{as37680Text4}</a>
                                    {as37680Text5}
                                </p>
                            </div>
                        </div>
                    </div>
{/*             */}
{/* Row 2 Col 2 - China May 2019 #}*/}
{/*             */}
                    <div className="col-1-of-3">
                        <div className="thumbnail">
                            <div className="thumbnail__img">
                                <Link to="/country/CN?from=1557724024&until=1557810424">
                                    <PreloadImage className="thumbnail__img-container" src={china} lazy/>
                                </Link>
                            </div>
                            <div className="thumbnail__text">
                                <h4>
                                    <Link className="thumbnail__title" to="/country/CN?from=1557724024&until=1557810424">
                                        {chinaTitle}
                                    </Link>
                                </h4>
                                <p>
                                    {chinaText1}
                                    <a href="https://blog.thousandeyes.com/internet-outage-reveals-reach-of-chinas-connectivity/">{chinaText2}</a>
                                    {chinaText3}
                                    <a href="https://twitter.com/InternetIntel/status/1128102233810382850?s=20">{chinaText4}</a>
                                    {chinaText5}
                                </p>
                            </div>
                        </div>
                    </div>
{/*             */}
{/* Row 2 Col 3 - Venezuela Mar 2019 */}
{/*             */}
                    <div className="col-1-of-3">
                        <div className="thumbnail">
                            <div className="thumbnail__img">
                                <Link to="/country/VE?from=1551946200&until=1552528800">
                                    <PreloadImage className="thumbnail__img-container" src={venezuela} lazy/>
                                </Link>
                            </div>
                            <div className="thumbnail__text">
                                <h4>
                                    <Link className="thumbnail__title" to="/country/VE?from=1551946200&until=1552528800">
                                        {venezuelaTitle}
                                    </Link>
                                </h4>
                                <p>
                                    {venezuelaText1}
                                    <a href="https://www.npr.org/2019/03/11/702179263/this-is-going-to-end-ugly-venezuela-s-power-outages-drag-on">{venezuelaText2}</a>
                                    {venezuelaText3}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="row">
{/*             */}
{/* Row 3 Col 1 -- AS209 Dec 2018 #}*/}
{/*             */}
                    <div className="col-1-of-3">
                        <div className="thumbnail">
                            <div className="thumbnail__img">
                                <Link to="/asn/209?from=1545820620&until=1546047120">
                                    <PreloadImage className="thumbnail__img-container" src={as209} lazy/>
                                </Link>
                            </div>
                            <div className="thumbnail__text">
                                <h4>
                                    <Link className="thumbnail__title" to="/asn/209?from=1545820620&until=1546047120">
                                        {as209Title}
                                    </Link>
                                </h4>
                                <p>
                                    {as209Text1}
                                    <a href="https://arstechnica.com/information-technology/2019/08/centurylinks-37-hour-outage-blocked-911-service-for-17-million-people/#:~:text=CenturyLink's%20nationwide%2C%2037%2Dhour%20outage,Federal%20Communications%20Commission%20report%20said.&text=The%20outage%20resulted%20in%20extensive,broadband%20service%2C%20including%20911%20calling.">
                                        {as209Text2}
                                    </a>
                                    {as209Text3}
                                    <a href="https://docs.fcc.gov/public/attachments/DOC-359134A1.pdf">{as209Text4}</a>
                                    {as209Text5}
                                </p>
                            </div>
                        </div>
                    </div>
{/*             */}
{/* Row 3 Col 2 -- Iraq Oct 2016 */}
{/*             */}
                    <div className="col-1-of-3">
                        <div className="thumbnail">
                            <div className="thumbnail__img">
                                <Link to="/country/IQ?from=1475280000&until=1475884800">
                                    <PreloadImage className="thumbnail__img-container" src={iraq} lazy/>
                                </Link>
                            </div>
                            <div className="thumbnail__text">
                                <h4>
                                    <Link className="thumbnail__title" to="/country/IQ?from=1475280000&until=1475884800">
                                        {iraqTitle}
                                    </Link>
                                </h4>
                                <p>
                                    {iraqText1}
                                </p>
                            </div>
                        </div>
                    </div>
{/*             */}
{/* Row 3 Col 3 -- Gabon Sept 2016 */}
{/*             */}
                    <div className="col-1-of-3">
                        <div className="thumbnail">
                            <div className="thumbnail__img">
                                <Link to="/country/GA?from=1473033600&until=1473638400">
                                    <PreloadImage className="thumbnail__img-container" src={gabon} lazy/>
                                </Link>

                            </div>
                            <div className="thumbnail__text">
                                <h4>
                                    <Link className="thumbnail__title" to="/country/GA?from=1473033600&until=1473638400">
                                        {gabonTitle}
                                    </Link>
                                </h4>
                                <p>
                                    {gabonText1}
                                    <a href="http://money.cnn.com/2016/09/16/technology/internet-censorship-blackouts-gabon/">{gabonText2}</a>{gabonText5}
                                    <a href="https://blog.cloudflare.com/unrest-in-gabon-leads-to-internet-shutdown/">{gabonText3}</a>{gabonText5}
                                    <a href="https://blogs.akamai.com/2016/09/national-internet-outages-the-new-normal.html">{gabonText4}</a>{gabonText5}
                                    {gabonText6}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}


export default Examples;
