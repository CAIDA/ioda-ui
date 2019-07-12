import React from 'react';
import {HI3} from '../utils';

class About extends React.Component {
    render() {
        return <div className='container'>
            <div className="page-header">
                <h1>About {HI3}</h1>
            </div>
            <div className='row'>
                <div className='col-md-12'>
                    <p className='lead' style={{marginBottom: '30px'}}>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                        do eiusmod tempor incididunt ut labore et dolore magna
                        aliqua. Ut enim ad minim veniam, quis nostrud exercitation
                        ullamco laboris nisi ut aliquip ex ea commodo consequat.
                        Duis aute irure dolor in reprehenderit in voluptate velit
                        esse cillum dolore eu fugiat nulla pariatur.
                    </p>
                </div>
            </div>
            <h3>Coming Soon...</h3>
        </div>;
    }
}

export default About;
