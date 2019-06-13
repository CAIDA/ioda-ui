import React from 'react';
import { Redirect } from 'react-router-dom';

import { auth } from 'Auth';
import hi3Logo from 'images/logos/hicube-full.png';

class PendingPage extends React.Component {

    constructor(props) {
        super(props);
    }

    state = {
        relogin: false
    };

    render() {
        if (this.state.relogin) {
            return <Redirect to='/login'/>;
        }
        return <div className='container'>
            <div className="jumbotron">
                <h1>
                    <img id="hi3-logo" src={hi3Logo}/>
                    <p><span style={{fontSize: '100px'}}
                             className='glyphicon glyphicon-bullhorn'/></p>
                </h1>
            </div>
            <div className='row text-center'>
                <p className='lead'>
                    Hello, {auth.getName()}.
                    <br/>
                    You have successfully signed into Hi³, but your
                    account has not yet been approved by an administrator.
                    <br/>
                    If you think you are seeing this page in error, please
                    contact <a href='mailto:hicube-info@caida.org'>
                    hicube-info.caida.org</a>.
                </p>
                <p className='lead'>
                    If you think your account has been approved recently,
                    you can <a href="javascript:void(0);" onClick={this._relogin}>log in</a> again.
                </p>
            </div>
        </div>;
    }


    _relogin = () => {
        auth.logout();
        this.setState({relogin: true});
    };

}

export default PendingPage;
