import PropTypes from "prop-types";
import React, { Component } from "react";
import T from "i18n-react";


class ToggleButton extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        const toggleOn = T.translate("entity.toggleOn");
        const toggleOff = T.translate("entity.toggleOff");
        const { selected, toggleSelected } = this.props;
        return (
            <div className="toggle" onClick={toggleSelected}>
                <span className="toggle__label">{this.props.label}</span>
                <div className={`toggle__container ${selected ? "" : "toggle__container--disabled"}`}>
                    <span className="toggle__text">{selected ? toggleOn : toggleOff}</span>
                    <div className={`dialog-button ${selected ? "" : "disabled"}`}>&nbsp;</div>
                </div>
            </div>
        );
    }
}

export default ToggleButton;

ToggleButton.propTypes = {
    selected: PropTypes.bool.isRequired,
    toggleSelected: PropTypes.func.isRequired
};
