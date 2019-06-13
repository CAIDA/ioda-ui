import React from 'react';

import {HI3} from 'Hi3/utils';

import dhsLogo from 'images/logos/dhs.svg';
import nsfLogo from 'images/logos/nsf.svg';
import nerscLogo from 'images/logos/nersc.png';
import xsedeLogo from 'images/logos/xsede-black.png';
import sdscLogo from 'images/logos/sdsc.svg';
import ucsdLogo from 'images/logos/UCSanDiegoLogo-BlueGold.png';


import 'Hi3/css/pages/acks.css';

class Acks extends React.Component {
    render() {
        return <div className='container'>
            <div className="page-header">
                <h1>Acknowledgements</h1>
            </div>
            <div className='ackgroup'>
                <h2>Major Support</h2>
                <div className='row'>
                    <div className='col-md-4 ackbox'>
                        <img src={dhsLogo}/>
                        <p>
                            {HI3} is funded by the US Department of Homeland
                            Security (DHS) Information Marketplace for Policy and
                            Analysis of Cyber-risk & Trust
                            (<a href="https://www.impactcybertrust.org/">IMPACT</a>)
                            project.
                        </p>
                    </div>
                </div>
            </div>
            <div className='ackgroup'>
                <h2>Additional Support</h2>
                <div className='row'>
                    <div className='col-md-4 ackbox'>
                        <img src={nsfLogo}/>
                        <p>
                            The {HI3} platform is based on infrastructure developed
                            under support from NSF grant CNS-1228994
                            [Detection and Analysis of Large-scale Internet
                            Infrastructure Outages (IODA)].
                        </p>
                    </div>
                </div>
                <div className='row'>
                    <div className='col-md-4 ackbox'>
                        <img src={nerscLogo}/>
                        <p>
                            Storage resources are supported by NERSC, a DOE Office
                            of Science User Facility
                            supported by the Office of Science of the U.S.
                            Department of Energy under Contract No.
                            DE-AC02-05CH11231.
                        </p>
                    </div>
                    <div className='col-md-4 ackbox'>
                        <img src={xsedeLogo}/>
                        <p>
                            Computational resources are supported by National
                            Science Foundation grant number
                            ACI-1053575.
                        </p>
                    </div>
                </div>
                <div className='row'>
                    <div className='col-md-4 ackbox'>
                        <img src={sdscLogo}/>
                    </div>
                    <div className='col-md-4 ackbox'>
                        <img src={ucsdLogo}/>
                    </div>
                </div>
            </div>
        </div>;
    }
}

export default Acks;
