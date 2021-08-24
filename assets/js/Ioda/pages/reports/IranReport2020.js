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
// Images
import apr3itc from 'images/iran-report/apr-3-2020-itc.png';
import feb27shatel from 'images/iran-report/feb-27-2020-shatel.png';
import mar3 from 'images/iran-report/mar-3-2020.png';
import mar3iranCell from 'images/iran-report/mar-3-2020-iran-cell.png';
import mar3iranTelecom from 'images/iran-report/mar-3-2020-iran-telecom.png';
import mar3itc from 'images/iran-report/mar-3-2020-itc.png';
import mar3mcci from 'images/iran-report/mar-3-2020-mcci.png';
import mar3pars from 'images/iran-report/mar-3-2020-pars.png';
import mar3shatel from 'images/iran-report/mar-3-2020-shatel.png';
import mar11iranCell from 'images/iran-report/mar-11-2020-iran-cell.png';
import mar11iranTelecom from 'images/iran-report/mar-11-2020-iran-telecom.png';
import mar11shatel from 'images/iran-report/mar-11-2020-shatel.png';
import timeline from 'images/iran-report/timeline.png';
import zeus from 'images/iran-report/zeus.png';
import PreloadImage from "react-preload-image";
import {Helmet} from "react-helmet";




class IranReport2020 extends PureComponent {



    render() {
        const title = T.translate("iranReport2020.title");
        const authors = T.translate("iranReport2020.authors");

        return (
            <div className="report">
                <Helmet>
                    <title>IODA | Iran Internet Outage 2020 Report</title>
                    <meta name="description" content="An analysis of Internet outages in Iran from February 17, 2020 to April 17, 2020, covering the legislative election and the early spread of COVID-19 cases." />
                </Helmet>
                <div className="row list">
                    <div className="col-1-of-1">
                        <h1 className="section-header">{title}</h1>
                        <p className="reports__text">{authors}</p>
                        <div className="nav">
                            <h2>Index</h2>
                            <ul className="nav__list">
                                <li className="nav__list-item"><Link to="/reports/2020-iran-report#overview">
                                    Overview
                                </Link></li>
                                <li className="nav__list-item"><Link to="/reports/2020-iran-report#overview">
                                    Background and motivation
                                </Link></li>
                                <li className="nav__list-item"><Link to="/reports/2020-iran-report#overview">
                                    Methodology
                                </Link>
                                    <ul>
                                        <li className="nav__list-item"><Link to="/reports/2020-iran-report#overview">
                                            Existing data sources
                                        </Link></li>
                                        <li className="nav__list-item"><Link to="/reports/2020-iran-report#overview">
                                            ZeusPing
                                        </Link></li>
                                        <li className="nav__list-item"><Link to="/reports/2020-iran-report#overview">
                                            CDN dataset
                                        </Link></li>
                                        <li className="nav__list-item"><Link to="/reports/2020-iran-report#overview">
                                            Towards a more acccurate, nuanced view
                                        </Link></li>
                                    </ul>
                                </li>
                                <li className="nav__list-item"><Link to="/reports/2020-iran-report#overview">
                                    Detected outages
                                </Link>
                                    <ul>
                                        <li className="nav__list-item"><Link to="/reports/2020-iran-report#overview">
                                            Several overlapping network outages on Mar 3 2020
                                        </Link></li>
                                        <li className="nav__list-item"><Link to="/reports/2020-iran-report#overview">
                                            Several overlapping network outages on Mar 11 2020
                                        </Link></li>
                                        <li className="nav__list-item"><Link to="/reports/2020-iran-report#overview">
                                            Internet outage on Apr 3 2020 for ITC (AS12880)
                                        </Link></li>
                                        <li className="nav__list-item"><Link to="/reports/2020-iran-report#overview">
                                            Internet outage on Feb 27 2020 for Shatel (AS31549)
                                        </Link></li>
                                    </ul>
                                </li>
                                <li className="nav__list-item"><Link to="/reports/2020-iran-report#overview">
                                    Conclusion
                                </Link></li>
                                <li className="nav__list-item"><Link to="/reports/2020-iran-report#overview">
                                    Acknowledgement
                                </Link></li>
                            </ul>

                            <h2 id="overview">Overview</h2>
                            <p>
                                Internet connectivity in Iran has been known to suffer from disruptions, especially during times of
                                <a href="https://www.newsweek.com/iran-internet-down-outages-protests-plane-crash-websites-offline-flight-752-1481842?amp=1&amp;__twitter_impression=true">crises</a>
                                and
                                <a href="https://ooni.org/post/2019-iran-internet-blackout/">political upheavals</a>
                                . In this post, we use several complementary data sources to examine Internet connectivity in Iranian networks in a two-month period (February 17 to April 17 2020) covering events such as the legislative election (held on Feb 21 2020) and the early spread of COVID-19 cases in Iran. We analyze four Internet connectivity outages affecting Iranian networks during this time.
                            </p>
                            <PreloadImage className="img-container" src={timeline} lazy/>
                                <p>Our findings show:</p>
                                <p>
                                    a) Widespread Internet connectivity outages, affecting
                                    multiple networks simultaneously, continued to occur in Iran.
                                </p>
                                <ul className="bulleted-list">
                                    <li>
                                        On March 3 and March 11, we observed outages that affected many large Iranian networks, including cellular networks.
                                    </li>
                                    <li>
                                        These outages bore similarities to the
                                        <a href="https://ooni.org/post/2019-iran-internet-blackout/">
                                            widespread outages observed in Iran in November 2019
                                        </a>
                                        due to a government-mandated Internet connectivity shutdown: during all of these outages, many major Internet Service Providers (ISPs) were affected, with some ISPs suffering a near-complete loss in connectivity. However, the causes of the outages on March 3 and 11 are unclear.
                                    </li>
                                    <li>
                                        Unlike the November 2019 outages, the outages on March 3 and 11 affected non-state-owned Internet Service Providers (ISPs) to a much larger extent than state-owned ISPs.
                                    </li>
                                    <li>
                                        Differently from the outages in November 2019 where ISPs observed outages that
                                        began several hours apart, the
                                        outages on March 3 and 11 affected several ISPs at nearly the same times. This
                                        simultaneity in outage start
                                        times could be the result of a single point of failure being affected.
                                        Alternatively, some mechanism
                                        (intentional or unintentional) that caused synchronized outages may have played
                                        a role.
                                    </li>
                                </ul>
                                <p>
                                    b) Isolated outages (non-widespread across ISPs) can
                                    significantly impact individual major ISPs but without large effects on other ISPs.
                                </p>
                                <ul className="bulleted-list">
                                    <li>On April 3, Information Technology Company (ITC, AS12880) experienced a
                                        90-minute Internet outage that affected
                                        a large share of its customers.
                                    </li>
                                    <li>On February 27, Shatel (AS31549) experienced a 30-minute Internet outage.</li>
                                    <li>During both these outages, other major providers did not seem to experience
                                        substantial drops in connectivity.
                                    </li>
                                </ul>
                                <p>
                                    c) The complementary views offered by multiple data sources
                                    increases outage detection accuracy and also allows us to uncover additional
                                    nuances.
                                </p>
                                <ul className="bulleted-list">
                                    <li>The range of data sources we use includes Internet routing data (IODA’s BGP
                                        signal), active probing data (IODA’s
                                        active probing signal, ZeusPing signal), and data from end-user machines (IODA’s
                                        Darknet signal, CDN data
                                        signal). These sources provide lenses into different aspects of Internet
                                        connectivity.
                                    </li>
                                    <li>Depending upon the nature of an outage and the networks it affects, the outage
                                        may be visible in some sources,
                                        but not others. For example, the outage affecting Shatel on February 27 was
                                        visible in the ZeusPing data source
                                        but not in other data sources.
                                    </li>
                                    <li>By combining inferences from multiple data sources, we are able to discover
                                        additional nuances. For example,
                                        during the outage affecting ITC on April 3, the CDN and Darknet signals show
                                        that there was a short-lived
                                        recovery from the outage that lasted a handful of minutes before connectivity
                                        dropped again to previous levels.
                                        Evidence of this recovery was not present in the other signals.
                                    </li>
                                </ul>


                                <h2 id="background">Background and motivation</h2>

                                <p>
                                    <strong>Iran’s Internet connectivity has experienced several large-scale outages in
                                        the recent past.</strong>
                                    The most notorious of these occurred in November 2019, when the
                                    Iranian government mandated a <a
                                    href="https://en.wikipedia.org/wiki/2019_Internet_blackout_in_Iran">week-long
                                    Internet connectivity shutdown</a> in response to widespread protests over fuel
                                    prices. Several reports (
                                    <a href="https://blogs.oracle.com/internetintelligence/historic-internet-blackout-in-iran">Oracle</a>,
                                    <a href="https://netblocks.org/reports/internet-restored-in-iran-after-protest-shutdown-dAmqddA9">Netblocks</a>),
                                    including our <a href="https://ooni.org/post/2019-iran-internet-blackout/">collaborative
                                    post with OONI</a>, showed
                                    the unprecedented scale and complexity of this event. During this event, cellular
                                    ISPs such as IranCell (AS44244)
                                    and MCCI (AS197207) were first affected on November 16th. A few hours later, most of
                                    the other large ISPs also
                                    experienced outages, including both state-owned ISPs such as Iran Telecom Co
                                    (AS58224) as well as non-state-owned
                                    ISPs such as Shatel (AS31549). Recovery from the outage occurred a week later, from
                                    November 23rd onwards.
                                </p>
                                <p>
                                    In the time since, there have been additional reports of
                                    Internet outages in Iran but <strong>there has been uncertainty regarding the extent
                                    to which various networks were
                                    affected</strong>. A potential Internet connectivity shutdown event in December 2019
                                    was covered by media
                                    outlets (<a href="https://www.bbc.com/news/world-middle-east-50911457">BBC</a>, <a
                                    href="https://www.usnews.com/news/world/articles/2019-12-25/iran-starts-internet-shutdown-ahead-of-possible-new-protests-report">U.S.
                                    News</a>) but the scale of the outage was unclear. <a
                                    href="https://www.newsweek.com/iran-internet-down-outages-protests-plane-crash-websites-offline-flight-752-1481842?amp=1&amp;__twitter_impression=true">Newsweek</a>
                                    reported upon several “mild outages” in the wake of the <a
                                    href="https://en.wikipedia.org/wiki/Ukraine_International_Airlines_Flight_752#Flight_and_crash">downing</a>
                                    of Ukraine International Airlines Flight 752 in early January 2020 but the evidence
                                    for these outages was sometimes
                                    anecdotal. There were also reports of an <a
                                    href="https://www.forbes.com/sites/daveywinder/2020/02/09/powerful-iran-cyber-attack-takes-down-25-of-national-internet/#5dfe1bc020dc">outage
                                    due to a cyber-attack</a> on February 8 2020 but which networks were affected and to
                                    what extent is unclear.
                                </p>
                                <p>
                                    <strong>The ambiguity in assessing the extent of outages arises from the inherent
                                        challenges in detecting outages</strong>
                                    of various kinds: depending upon the nature of the
                                    outage and the networks affected, it may be apparent in some outage monitoring tools
                                    but not others. For example,
                                    even a widespread power outage that affects primarily end-users may not be visible
                                    in Internet routing data, since
                                    Internet routers are often in well-provisioned data-centers with backup power.
                                    However, such an outage may be
                                    visible in a data source containing measurements from user’s machines (such as
                                    IODA’s darknet data source).
                                </p>
                                <p>
                                    Given the increasing susceptibility of Iranian ISPs to
                                    Internet outages on the one hand and the challenges in accurately detecting outages
                                    on the other, we studied Iranian
                                    Internet connectivity from February 17 to April 17 2020 using diverse measurement
                                    “lenses” obtained from a variety
                                    of data sources. This period includes the quadrennial
                                    <a href="https://en.wikipedia.org/wiki/2020_Iranian_legislative_election">Iranian
                                        legislative election</a> and
                                    also the early spread of <a
                                    href="https://en.wikipedia.org/wiki/COVID-19_pandemic_in_Iran">COVID-19 cases in
                                    Iran</a>. In this initial report, we cover four large outages that we observed
                                    during this time.
                                </p>

                                <h2 id="method">Methodology</h2>

                                <p>
                                    We used a variety of data sources
                                    to investigate Internet connectivity in Iranian networks. We first describe IODA’s
                                    data sources. Next, we describe
                                    two novel and experimental data sources: (a) <strong>ZeusPing, a prototype
                                    fine-grained active probing system under
                                    development at CAIDA</strong> and (b) <strong>a dataset from a large Content
                                    Delivery Network (CDN)</strong>.
                                    These diverse data sources helped us detect outages more accurately and also
                                    discover additional nuances about these
                                    outages.
                                </p>

                                <h3 id="data">Existing IODA data sources</h3>
                                <p>
                                    The Internet Outage Detection and Analysis (<Link to="/">IODA</Link>)
                                    project of the Center for Applied Internet Data Analysis
                                    (<a href="https://www.caida.org/home/">CAIDA</a>) at University of California San
                                    Diego measures Internet connectivity outages worldwide in near real-time.
                                </p>
                                <p>
                                    In order to track and confirm Internet disruptions with greater confidence, IODA
                                    uses three complementary measurement and
                                    inference methods based on Internet routing (BGP) announcements, active probing, and
                                    Internet Background Radiation
                                    (IBR) traffic. The routing announcements from BGP allow us to track reachability
                                    according to the Internet global
                                    routing system (the so-called Internet control plane). IODA uses routing data
                                    extracted from RouteViews and RIPE RIS
                                    to obtain the BGP “signal”. IODA’s existing active probing approach uses the <a
                                    href="https://www.isi.edu/~johnh/PAPERS/Quan13c.pdf">Trinocular</a>
                                    methodology developed at USC’s ISI to
                                    detect outages. Our implementation of Trinocular pings a few addresses at random
                                    from /24 blocks that are likely to
                                    respond to pings. We send pings to each block in 10-minute rounds. Using Bayesian
                                    inference, the system reasons
                                    about responses from blocks and detects outages when a /24 block’s responsiveness is
                                    lower than expected.The Darknet
                                    data source represents Internet Background Radiation (IBR) traffic that is often
                                    from actual user machines. IBR
                                    traffic is generated by millions of machines worldwide and is often a result of
                                    these machines being infected by
                                    malware or misconfigured in some other way. These methods result in connectivity
                                    “liveness” signals, whose status
                                    (for each country) is always publicly visible in the
                                    <Link to="/dashboard">IODA dashboard</Link>.
                                </p>

                                <h3 id="zeus">ZeusPing</h3>
                                <p>
                                    To augment IODA’s existing Trinocular-based active-probing
                                    scheme, we launched ZeusPing, a novel fine-grained active-probing-based system under
                                    development at CAIDA. IODA’s
                                    existing Trinocular-based system detects outages at the /24 granularity and may not
                                    identify an outage if even a
                                    single address in a /24 block responds to probing. Thus, it potentially neglects
                                    outages affecting /24 blocks only
                                    partially, including larger outages affecting multiple /24 blocks. <strong>The
                                    ZeusPing system probes much more
                                    broadly than Trinocular and is therefore capable of detecting a superset of
                                    Trinocular outages, including those
                                    that affect </strong><em><strong>many</strong></em><strong> /24 blocks
                                    only </strong><em><strong>partially</strong></em>. Thus, ZeusPing complements IODA’s
                                    existing data sources
                                    and enables fine-grained analysis of outages that allows detailed characterization
                                    about the IP addresses
                                    affected by outages, their geographic-scope (which regions are affected), and the
                                    outages’ durations.
                                </p>

                                <p>
                                    Since mid February 2020, ZeusPing has been sending pings from 4
                                    globally distributed vantage points provided by the <a
                                    href="https://twitter.com/kandoo_tech">Kandoo team</a> to 50%
                                    of the IP addresses geolocating to Iran (around 6M addresses) every 10 minutes. We
                                    call these 10-minute periods “
                                    rounds” of measurement; every measured address receives a ping from 4 different
                                    vantage points in each round.
                                </p>
                                <p>
                                    Figure 1 shows the number of addresses that responded to
                                    pings from the distributed vantage points in each 10-minute round for various
                                    address aggregates. <strong>The first
                                    high-level observation from this figure is that these signals contain diurnal
                                    patterns</strong>: more addresses
                                    tend to be ping-responsive during the day and fewer during the night. We can also
                                    observe some unusual peaks and
                                    drops: <strong>the drop on Mar 3 corresponds to an outage that we analyze in detail
                                    further below,</strong> whereas
                                    the peak on Mar 25 likely corresponds to network reconfiguration events.
                                </p>
                                <PreloadImage className="img-container" src={zeus} lazy/>
                                    <p>
                                        <em>
                                            Figure 1: Visualizing ZeusPing's inferences
                                            about Internet connectivity for various IODA address-aggregates in Iran:
                                            each curve shows the
                                            number of addresses that were responding to pings sent from any of the
                                            globally distributed vantage points in a
                                            10-minute measurement round for a group of addresses. For example, the
                                            orange curve displays the signal when
                                            considering all addresses in Iran: we see that roughly 650K - 750K of the
                                            addresses in Iran were responding to
                                            pings in most 10-minute rounds. The graph also shows the curves for two of
                                            the largest ASes in Iran (AS58224
                                            (Iran Telecom Co) and AS31549 (Shatel)) and also two large Iranian provinces
                                            (Tehran and East Azerbaijan).
                                        </em>
                                    </p>
                                    <p>
                                        We find evidence of potential outages by analyzing responses
                                        (or the lack thereof) to these pings per round. <strong>By finding rounds where
                                        there is a significant drop (and
                                        subsequent increase) in ping-responsive addresses, we are able to determine with
                                        fine granularity when outages
                                        begin and end</strong>.
                                    </p>

                                    <h3 id="cdn">CDN dataset</h3>

                                    <p>
                                        Among IODA’s data sources, the Darknet data source offers the
                                        best view into outages affecting end-users. However, it uses the count of IP
                                        addresses that are sending traffic from
                                        a network to measure “liveness”. This address-based view can distort the
                                        liveness signal in networks that use
                                        Carrier Grade NAT (CGN) since multiple users may be using the same IP address in
                                        such networks. Cellular networks
                                        often use CGN technology; consequently, the Darknet data source can sometimes
                                        lack visibility into cellular address
                                        space.
                                    </p>
                                    <p>
                                        We collaborated with a large commercial CDN vendor
                                        to obtain a complementary “liveness” signal that may be able to capture end-user
                                        outages from cellular and
                                        non-cellular networks. We term this dataset the “CDN dataset”. <strong>This
                                        dataset consists of the total number of
                                        requests per minute from Iranian ASNs that were sent to the global CDN
                                        platform</strong>. The time series of the
                                        number of requests for each ASN was scaled by a value unique to that ASN, thus
                                        only preserving the “trends”, i.e.,
                                        fluctuations seen during the analysis period. Consequently, signals across ASNs
                                        cannot be compared for volume since
                                        they are scaled differently. However, for the purpose of determining if an ASN
                                        continues to have Internet
                                        connectivity, we are interested in the trend of its signal and not its volume.
                                        Thus, in the results that we present
                                        below, we further normalized these scaled values to fall between 0 and 1, to
                                        enable easy trend-comparison with
                                        signals from the other data sources.We expect that during an outage, users that
                                        lose connectivity will not be able
                                        to reach the CDN for fetching content. This should result in a drop in the
                                        number of requests seen from the
                                        network/ASN to the CDN. Thus, a drop in the number of requests signal from the
                                        CDN not only serves as ground truth
                                        for validating outages seen in other active or passive outage detection systems
                                        but also provides visibility into
                                        ASNs where existing tools might lack visibility (such as wireless providers).
                                        Additionally, like the darknet data,
                                        the CDN data is available at fine time-granularity—-once every minute for each
                                        ASN.
                                    </p>

                                    <h3 id="toward">Towards a more accurate, nuanced view</h3>
                                    <p>
                                        By using these complementary data sources, we obtain a more
                                        complete view of outages. This complementarity is a result of (a) the different
                                        network phenomena that each data
                                        source measures and (b) the different time-granularities of measurements.
                                    </p>
                                    <p><strong>The data sources we used present lenses into
                                        different aspects of Internet connectivity.</strong> While the BGP data source
                                        measures Internet routing traffic
                                        and can therefore yield highly accurate outage inferences when there is a
                                        measured drop, outages do not always
                                        affect Internet routers (and consequently routing traffic) and can therefore be
                                        invisible in the BGP signal. Active
                                        probing has the potential to yield fine-grained outage data in networks which
                                        respond to active probes but several
                                        networks block probing traffic. While the Darknet and CDN data represent
                                        liveness traffic collected from
                                        user-machines, they can sometimes be erratic, leading to difficulties in
                                        accurately interpreting their signals for
                                        outage detection.
                                    </p>
                                    <p><strong>The different time granularities
                                        of these data sources also results in more effective outage
                                        detection.</strong> The Darknet and CDN data sources
                                        have 1 minute time granularities, the BGP data source has 5-minute, and the
                                        active probing data sources (both IODA’s
                                        Trinocular-based system and ZeusPing) have 10 minute time granularities.
                                        Consequently, the active probing data
                                        sources may not be able to detect sub-10-minute outages but the Darknet and CDN
                                        Requests data may be able to detect
                                        such short-duration-outages as well.
                                    </p>


                                    <h2 id="outages">Detected outages</h2>

                                    <p>
                                        Here, we report upon four large Internet outages in Iran during
                                        this period. We present a summary of our findings about each outage and then
                                        follow-up with detailed visualizations
                                        and analyses.
                                    </p>

                                    <h3 id="#mar-3-2020"><strong>Several overlapping network outages on Mar 3
                                        2020</strong></h3>
                                    <PreloadImage className="img-container" src={mar3} lazy/>
                                        <p>
                                            <em>
                                                All three IODA signals for Iran experienced a significant drop.
                                            </em>&nbsp;
                                            <a href="https://ioda.caida.org/ioda/dashboard#view=inspect&amp;entity=country/IR&amp;lastView=overview&amp;from=1583179200&amp;until=1583208000">https://ioda.caida.org/ioda/dashboard#view=inspect&amp;entity=country/IR&amp;lastView=overview&amp;from=1583179200&amp;until=1583208000</a>
                                            &nbsp;[publicly accessible]
                                        </p>

                                        <h4>Summary</h4>
                                        <ul className="bulleted-list">
                                            <li>The largest outage we found, in terms of both addresses and networks
                                                affected, occurred around midnight between
                                                Mar 2 2020 and Mar 3 2020.
                                            </li>
                                            <li><strong>Several of the affected networks, including cellular networks,
                                                had outages that began nearly
                                                simultaneously.</strong> This finding is in contrast to the outages we
                                                observed during the November 2019
                                                shutdown in Iran; the outages during that event began at different times
                                                for different ASes.
                                            </li>
                                            <li>However,<strong> the extent of the outages varied across
                                                providers.</strong> Two large state-owned providers
                                                (Iran Telecom Co (AS58224) and ITC (AS12880)) observed only small
                                                outages whereas some non-state-owned providers
                                                (such as Shatel (AS31549), Asiatech (AS43754), Mobin Net (AS50810),
                                                DATAK (AS25124)) observed outages that
                                                appeared to affect the entirety of their address-space.
                                            </li>
                                            <li>The fine-grained ZeusPing data corroborates that the extent of the
                                                outage varied across networks. In addition,
                                                ZeusPing data reveals which addresses continued to remain connected even
                                                when most others in that network did
                                                not. Addresses detected by ZeusPing as remaining connected may represent
                                                potential candidate relays for
                                                circumventing outages.
                                            </li>
                                        </ul>


                                        <h4>Shatel (AS31549)</h4>
                                        <PreloadImage className="img-container" src={mar3shatel} lazy/>
                                            <ul className="bulleted-list">
                                                <li>We observe that one of the largest non-state-owned Iranian
                                                    ISPs, <strong>Shatel (AS31549) lost connectivity for
                                                        the entirety of its address-space</strong> in all three of
                                                    IODA’s data sources.
                                                </li>
                                                <li>This complete loss of connectivity is corroborated by the ZeusPing
                                                    and CDN signals, which also dropped to zero.
                                                </li>
                                                <li>The BGP, Darknet, ZeusPing, and CDN signals suggest that the outage
                                                    lasted from approximately 12:40 AM to 1:30
                                                    AM.
                                                </li>
                                            </ul>

                                            <h4>Pars Online (AS16322)</h4>
                            <PreloadImage className="img-container" src={mar3pars} lazy/>
                                                <ul className="bulleted-list">
                                                    <li>Another large non-state-owned ISP, <strong>Pars Online (AS16322)
                                                        lost connectivity for a large part of its
                                                        address-space</strong> in all three of IODA’s data sources as
                                                        well as in the ZeusPing and CDN request
                                                        signals.
                                                    </li>
                                                    <li><strong>The timing of the outage is almost identical to that of
                                                        Shatel’s</strong>, with the outage lasting from
                                                        approximately 12:40 AM to 1:30 AM.
                                                    </li>
                                                    <li>In contrast to the outage that affected Shatel, a small number
                                                        of addresses from Pars Online continued to have
                                                        Internet connectivity, as evidenced by IODA’s active probing and
                                                        Darknet signals and by ZeusPing’s signal; these
                                                        signals did not drop to 0.
                                                    </li>
                                                    <li><strong>The ZeusPing data allows us to determine exactly which
                                                        addresses had an outage, and which continued to
                                                        be ping-responsive throughout the outage</strong>. Addresses
                                                        which remain connected may serve as potential
                                                        relays for other addresses to circumvent the outage (if local
                                                        connectivity between addresses exists).
                                                    </li>
                                                </ul>

                                                <h4>Iran Telecom Co (AS58224)</h4>
                                                    <PreloadImage className="img-container" src={mar3iranTelecom} lazy/>
                                                    <ul className="bulleted-list">
                                                        <li>Iran Telecom Co, a state-owned ISP, experienced multiple
                                                            outages between 11:45 PM on March 02 and 1:30 AM UTC.
                                                        </li>
                                                        <li>However, <strong>the extent of each outage is small relative
                                                            to non-state-owned providers such as Shatel
                                                            (AS31549) and Pars Online (AS16322)</strong>.
                                                        </li>
                                                    </ul>

                                                    <h4>ITC (AS12880)</h4>
                                                        <PreloadImage className="img-container" src={mar3itc} lazy/>
                                                        <ul className="bulleted-list">
                                                            <li><strong>Similar to the other state-owned ISP (Iran
                                                                Telecom Co), ITC (AS12880) also observed several
                                                                relatively-small outages between 11:45 PM on March 02
                                                                and 1:30 AM UTC</strong>.
                                                            </li>
                                                            <li>Each individual outage appears to begin and end at the
                                                                same time in both ITC (AS12880) and Iran Telecom Co
                                                                (AS58224).
                                                            </li>
                                                        </ul>

                                                        <h4>Iran Cell (AS44244)</h4>
                                                        <PreloadImage className="img-container" src={mar3iranCell} lazy/>
                                                            <ul className="bulleted-list">
                                                                <li>Although IODA can sometimes have limited visibility
                                                                    into cellular outages, IODA’s BGP signal for Iran
                                                                    Cell
                                                                    observed a significant drop at around 12:40 AM. The
                                                                    timing of this drop aligns with the times at which
                                                                    drops
                                                                    were observed for several other ISPs, including
                                                                    Shatel (AS31549) and Pars Online (AS16322),
                                                                    suggesting that
                                                                    these outages are related.
                                                                </li>
                                                                <li>The outage is also visible in IODA’s active probing
                                                                    signal and is visible particularly clearly in the
                                                                    ZeusPing
                                                                    signal. We see from this signal that there was a
                                                                    relatively small outage that occurred at 12:40 AM
                                                                    and a larger
                                                                    one at 1:30 AM, followed by recovery of most
                                                                    addresses affected by both outages at 1:40 AM.
                                                                </li>
                                                                <li><strong>We also observe that there appears to be a
                                                                    reduction in the CDN Requests signal between 12:40
                                                                    to 01:40
                                                                    AM providing additional corroboration</strong>.
                                                                </li>
                                                            </ul>

                                                            <h4>MCCI (AS197207)</h4>
                            <PreloadImage className="img-container" src={mar3mcci} lazy/>
                                                                <ul className="bulleted-list">
                                                                    <li>MCCI is another major cellular ISP in Iran which
                                                                        observed drops in Internet connectivity in the
                                                                        hours before and
                                                                        after midnight on March 03.
                                                                    </li>
                                                                    <li>IODA’s BGP and active probing signals suggest
                                                                        that AS197207 observed an outage at 10 PM on
                                                                        March 02 that lasted
                                                                        for twenty minutes. The ZeusPing signal offers
                                                                        additional corroboration for this outage;
                                                                        however, there does not
                                                                        seem to have been a significant drop in the CDN
                                                                        request signal at this time.
                                                                    </li>
                                                                    <li>Like other networks, AS197207 also experienced a
                                                                        drop in the BGP signal at 12:40 AM on March 03
                                                                        but there is no
                                                                        significant drop in IODA’s Active Probing and
                                                                        ZeusPing signals. However, the CDN request
                                                                        signal experienced a
                                                                        drop during the same time that may be consistent
                                                                        with an outage.
                                                                    </li>
                                                                </ul>

                                                                <h3 id="mar-11-2020"><strong>Several overlapping network
                                                                    outages on Mar 11 2020</strong></h3>

                                                                <h4>Summary</h4>
                                                                <ul className="bulleted-list">
                                                                    <li>This outage affected multiple networks at
                                                                        approximately 14:00 UTC on Mar 11 2020 and
                                                                        lasted less than 10
                                                                        minutes.
                                                                    </li>
                                                                    <li>Similar to the outage that occurred on Mar 3
                                                                        2020, the outages affected multiple ASes,
                                                                        including cellular ASes,
                                                                        at roughly the same times.
                                                                    </li>
                                                                    <li>Like the Mar 3 2020 outage, some large
                                                                        non-state-owned ASes (Shatel, Pars Online)
                                                                        appear to have experienced a
                                                                        more severe outage compared to state-owned ASes.
                                                                    </li>
                                                                </ul>

                                                                <h4>Shatel (AS31549)</h4>
                                                                    <PreloadImage className="img-container" src={mar11shatel} lazy/>
                                                                    <ul className="bulleted-list">
                                                                        <li><strong>Shatel (AS31549), a large
                                                                            non-state-owned ISP, appears to suffer
                                                                            near-complete loss in Internet
                                                                            connectivity</strong> according to IODA’s
                                                                            Darknet data source where the signal drops
                                                                            to 0 from 14:00 to
                                                                            14:08 UTC.
                                                                        </li>
                                                                        <li>Although the ZeusPing data corroborates that
                                                                            an outage occurred at 14:00, there still
                                                                            remain more than 90,000
                                                                            addresses that remain ping-responsive.
                                                                            ZeusPing detects outages at the 10-minute
                                                                            granularity using pings from
                                                                            distributed vantage points; thus, if
                                                                            addresses respond to pings at least once
                                                                            within a 10-minute round, they
                                                                            will not dropout.
                                                                        </li>
                                                                    </ul>

                                                                    <h4>Iran Telecom Co (AS58224)</h4>
                                                                    <PreloadImage className="img-container" src={mar11iranTelecom} lazy/>
                                                                        <ul className="bulleted-list">
                                                                            <li>Iran Telecom Co, a large state-owned ISP
                                                                                also experienced a significant outage at
                                                                                14:00, though <strong>the
                                                                                    outage appears to affect a smaller
                                                                                    part of its address-space compared
                                                                                    to outages that affected
                                                                                    non-state-owned
                                                                                    ISPs such as Shatel</strong>.
                                                                            </li>
                                                                            <li>The IODA and ZeusPing signals indicate
                                                                                that recovery from the outage occurred
                                                                                within the next 20 minutes.
                                                                            </li>
                                                                            <li>We also observe a second potential
                                                                                outage for AS58224 in the ZeusPing
                                                                                signal at 16:20 UTC.
                                                                            </li>
                                                                        </ul>

                                                                        <h4>Iran Cell (AS44244)</h4>
                            <PreloadImage className="img-container" src={mar11iranCell} lazy/>
                                                                            <ul className="bulleted-list">
                                                                                <li>The IODA signals indicate an outage
                                                                                    for Iran Cell, a major cellular ISP,
                                                                                    at 14:00. The start-time of the
                                                                                    outage
                                                                                    for Iran Cell is identical to the
                                                                                    start-times of the outages for the
                                                                                    other networks above (and several
                                                                                    others).
                                                                                </li>
                                                                                <li>The ZeusPing signal does not show a
                                                                                    significant drop. We examined the
                                                                                    ZeusPing data during this time in
                                                                                    more
                                                                                    detail and found that pings to many
                                                                                    addresses from AS44244 timed out
                                                                                    during this round (14:00 to 14:10)
                                                                                    from
                                                                                    some of the vantage points but
                                                                                    responded to others. Since this
                                                                                    outage only lasted 8 minutes, we
                                                                                    suspect that the
                                                                                    majority of addresses responded to
                                                                                    pings from at least one of the
                                                                                    vantage points during the other 2
                                                                                    minutes.
                                                                                </li>
                                                                                <li>The CDN signal observed
                                                                                    an <em>increase</em> during this
                                                                                    time. Recall that the CDN signal
                                                                                    represents a
                                                                                    normalized view of the number of
                                                                                    requests from users in the AS.
                                                                                    Consider the scenario where some
                                                                                    customers in
                                                                                    Iran Cell experience an outage but
                                                                                    other customers retain cellular
                                                                                    connectivity. If the customers who
                                                                                    continued
                                                                                    to have cellular connectivity from
                                                                                    Iran Cell had experienced an outage
                                                                                    for their residential provider
                                                                                    (Shatel
                                                                                    customers, for example), and had
                                                                                    switched to Iran Cell for hotspot
                                                                                    services, there would have been an
                                                                                    increase
                                                                                    in requests from these users. The
                                                                                    signal we observe is consistent with
                                                                                    this scenario.
                                                                                </li>
                                                                            </ul>

                                                                            <h3 id="apr-3-2020"><strong>Internet outage
                                                                                on Apr 3 2020 for ITC (AS12880)</strong>
                                                                            </h3>
                                                                            <h4>Summary</h4>
                                                                            <ul className="bulleted-list">
                                                                                <li>ITC (AS12880) experienced a
                                                                                    significant outage on Apr 3 2020
                                                                                    that began at approximately 8:50 AM
                                                                                    UTC and lasted
                                                                                    for around 90 minutes.
                                                                                </li>
                                                                                <li>The outage is visible in both IODA’s
                                                                                    current active probing data source
                                                                                    as well as in ZeusPing signals,
                                                                                    although
                                                                                    the finer-grained ZeusPing signals
                                                                                    show that the outage affected
                                                                                    the <em>majority</em> of AS12880’s
                                                                                    address-space (as opposed to only
                                                                                    ~40% as indicated by IODA’s active
                                                                                    probing data source). ZeusPing’s
                                                                                    estimate
                                                                                    of the extent of the outage is
                                                                                    consistent with the massive drop
                                                                                    observed in the Darknet signal.
                                                                                </li>
                                                                                <li>The CDN signal further corroborates
                                                                                    that the outage was particularly
                                                                                    severe, as evidenced by the steep
                                                                                    drop in
                                                                                    the signal at the same time as the
                                                                                    drops in the ZeusPing and Darknet
                                                                                    signals.
                                                                                </li>
                                                                                <li>Since the darknet and CDN data
                                                                                    sources are collected with 1-minute
                                                                                    time-granularity (compared to IODA’s
                                                                                    active
                                                                                    probing and ZeusPing sources that
                                                                                    are collected with 10-minute
                                                                                    time-granularity), <strong>we
                                                                                        observe in these
                                                                                        signals a small-recovery at
                                                                                        around 9:30 am that is
                                                                                        immediately followed by another
                                                                                        massive outage</strong>.
                                                                                    Since this recovery appears to have
                                                                                    lasted for only 3 minutes, it is not
                                                                                    clearly visible in the other sources
                                                                                    but the timing of the recovery in
                                                                                    the CDN and Darknet signals aligns
                                                                                    well. Further, just before the
                                                                                    outage ended
                                                                                    at 10:00 am, the CDN and Darknet
                                                                                    signals plummeted to nearly 0,
                                                                                    indicating that there was a brief
                                                                                    outage that
                                                                                    affected nearly all of ITC’s
                                                                                    address-space just before recovery.
                                                                                </li>
                                                                            </ul>
                                                                            <PreloadImage className="img-container" src={apr3itc} lazy/>


                                                                                <h3 id="feb-27-2020"><strong>Internet
                                                                                    outage on Feb 27 2020 for Shatel
                                                                                    (AS31549)</strong></h3>
                                                                                <h4>Summary</h4>
                                                                                <ul className="bulleted-list">
                                                                                    <li>The ZeusPing signal suggests
                                                                                        that Shatel (AS31549)
                                                                                        experienced an outage on Feb 27
                                                                                        2020 that began at around
                                                                                        12:20 AM and lasted for around
                                                                                        30 minutes. The other data
                                                                                        sources do not seem to observe
                                                                                        drops during this time.
                                                                                    </li>
                                                                                    <li>We investigated why this outage
                                                                                        had not been detected by IODA’s
                                                                                        current active probing data
                                                                                        source. <strong>We
                                                                                            determined that the likely
                                                                                            cause was because this
                                                                                            outage affected most /24
                                                                                            address blocks only
                                                                                            partially</strong>. More
                                                                                        than 15,000 addresses that had
                                                                                        been responding to pings in the
                                                                                        previous round
                                                                                        (12:10 to 12:20 AM) had stopped
                                                                                        responding to pings in this
                                                                                        round. 13,000 of these addresses
                                                                                        were from 749 /24
                                                                                        blocks that each had at least 10
                                                                                        addresses that stopped
                                                                                        responding to pings. However,
                                                                                        each of these 749 /24
                                                                                        blocks had at least a few other
                                                                                        addresses that were continuing
                                                                                        to be ping-responsive through
                                                                                        this outage. Since
                                                                                        the current active probing data
                                                                                        source in IODA is based upon the
                                                                                        Trinocular methodology, which
                                                                                        detects outages
                                                                                        at the /24 granularity, the
                                                                                        presence of some responsive
                                                                                        addresses in each /24 prevented
                                                                                        the detection of the
                                                                                        outage.
                                                                                    </li>
                                                                                    <li>This event shows the value in
                                                                                        using multiple data sources for
                                                                                        outage detection since some
                                                                                        outages may
                                                                                        only be visible in a subset of
                                                                                        data sources.
                                                                                    </li>
                                                                                </ul>
                            <PreloadImage className="img-container" src={feb27shatel} lazy/>
                                                                                    <h2 id="conclusion">Conclusion</h2>
                                                                                    <p>
                                                                                        In this post, we used diverse
                                                                                        data sources to study Internet
                                                                                        connectivity in Iran between
                                                                                        February 17 to April 17 2020. We
                                                                                        presented analyses about four
                                                                                        significant outages from
                                                                                        this period that were visible in
                                                                                        at least one of the data sources
                                                                                        and highlighted our findings
                                                                                        about the outages
                                                                                        (how many networks were
                                                                                        affected, duration etc.) and
                                                                                        about their visibility in
                                                                                        different data sources. We found
                                                                                        that
                                                                                        the lenses offered by these data
                                                                                        sources allowed us to detect
                                                                                        outages more accurately and also
                                                                                        discover additional
                                                                                        nuances about these outages,
                                                                                        thereby reinforcing the need for
                                                                                        multiple data sources to study
                                                                                        Internet
                                                                                        connectivity.
                                                                                    </p>
                                                                                    <p>
                                                                                        While this post analyzed some of
                                                                                        the largest
                                                                                        outages, other outages occurred
                                                                                        during this period as well. With
                                                                                        the exception of the CDN data
                                                                                        source, the data
                                                                                        collected from the other sources
                                                                                        are publicly available. The data
                                                                                        from IODA’s data sources for all
                                                                                        these outages can
                                                                                        be accessed through the <Link
                                                                                        to="/">IODA
                                                                                        platform</Link>. Data collected
                                                                                        from the prototype
                                                                                        ZeusPing data source (which is
                                                                                        currently under development) in
                                                                                        this blogpost will eventually be
                                                                                        released publicly;
                                                                                        for now, it is available upon
                                                                                        request.
                                                                                    </p>


                                                                                    <h2 id="ack"> Acknowledgments </h2>
                                                                                    <p>
                                                                                        We are deeply grateful to the <a
                                                                                        href="https://www.opentech.fund/">Open
                                                                                        Technology Fund</a> for
                                                                                        supporting this research. We
                                                                                        would also like to thank David
                                                                                        Belson for his helpful feedback.
                                                                                    </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default IranReport2020;
