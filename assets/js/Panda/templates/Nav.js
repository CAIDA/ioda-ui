import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import pandaLogo from 'images/PandaLogo.png';

class Nav extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return(
            <div className="navigation">
                <div className="navigation__container">
                    <div className="navigation__logo">
                        <Link to="/">
                            <img src={pandaLogo} alt="Panda Logo" />
                        </Link>
                    </div>
                    <nav className="navigation__nav">
                        <div className="navigation__mobile-nav">
                            <input type="checkbox" className="navigation__checkbox" ref={this.checkbox} id="nav-toggle" />
                            <label htmlFor="nav-toggle" className="navigation__button">
                                <span className="navigation__icon">&nbsp;</span>
                            </label>
                        </div>
                        <ul className="navigation__list">
                            <li className="navigation__item">
                                <Link to="/quickstart" className="navigation__link">
                                    Quickstart
                                </Link>
                            </li>
                            <li className="navigation__item">
                                <Link to="/docs" className="navigation__link">
                                    Documentation
                                </Link>
                            </li>
                            <li className="navigation__item">
                                <Link to="/about" className="navigation__link">
                                    About
                                </Link>
                            </li>
                            <li className="navigation__item">
                                <Link to="/help" className="navigation__link">
                                    Help
                                </Link>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>
        );
    }
}

export default Nav;