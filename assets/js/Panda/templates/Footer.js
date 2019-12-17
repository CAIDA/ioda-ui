import React, { Component } from 'react';
import { Link } from 'react-router-dom';


class Footer extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const year = new Date().getFullYear();
        return (
            <div className="footer">
                <div className="footer__content">
                    <div className="col-1-of-2">
                        <div className="footer__copyright">
                            Ⓒ Copyright {year} &#8212; Center for Applied Internet Data Analysis
                        </div>
                    </div>
                    <div className="col-1-of-2">
                        <div className="footer__links">
                            <Link to="/acks" className="footer__links-item">
                                Acknowledgements
                            </Link>
                            <Link to="/contact" className="footer__links-item">
                                Contact
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default Footer;