import React, { Component } from 'react';
import Nav from 'react-bootstrap/lib/Nav';
import NavItem from 'react-bootstrap/lib/NavItem';
import { generateKeys } from "../../utils";

class Tabs extends Component {
    render() {
        const tabOptions = this.props.tabOptions;
        return (
            <Nav bsStyle="tabs" activeKey={this.props.activeTab} onSelect={this.props.handleSelectTab}>
                {
                    tabOptions.map((tabItem, index) => (
                        <NavItem key={generateKeys('tabOption')} eventKey={index+1}><span>{tabItem}</span></NavItem>
                    ))
                }
            </Nav>
        );
    }
}

export default Tabs;
