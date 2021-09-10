import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from "prop-types";


class Tooltip extends Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: false
        }
    }

    componentDidMount = () => {
        document.addEventListener('click', this.handleClickOutside, {passive: true});
    }

    componentWillUnmount() {
        document.removeEventListener('click', this.handleClickOutside.bind(this), true);
    }

    handleTooltipClick() {
        this.setState({ visible: true })
    }

    handleClickOutside = event => {
        const domNode = ReactDOM.findDOMNode(this);

        if (!domNode || !domNode.contains(event.target)) {
            this.setState({
                visible: false
            });
        }
    }

    render() {
        return (
            <div className="help">
                <button className="help__button" onClick={() => this.handleTooltipClick()}>
                    ?
                </button>
                <div className="help__modal" style={this.state.visible ? { display: 'flex'} : { display: 'none'}}>
                    <div className="help__modal-content">
                        <div className="help__title">
                            {this.props.title}
                        </div>
                        {
                            this.props.text ? <div className="help__text">
                                {this.props.text}
                            </div> : null
                        }
                        {
                            this.props.customCode ? <div className="help__customCode">
                                {this.props.customCode}
                            </div> : null
                        }
                    </div>
                </div>
            </div>
        );
    }
}

export default Tooltip;

Tooltip.propTypes = {
    title: PropTypes.string,
    text: PropTypes.string,
    customCode: PropTypes.element
};
