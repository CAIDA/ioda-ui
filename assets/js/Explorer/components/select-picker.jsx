import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';

import 'bootstrap/dist/js/bootstrap';
import 'bootstrap-select/dist/js/bootstrap-select';
import 'bootstrap-select/dist/css/bootstrap-select.css';

class SelectPicker extends React.Component {

    componentDidMount() {
        this.element = $(ReactDOM.findDOMNode(this)).selectpicker(this.props.options);
        this.element.selectpicker("val", this.props.defaultValue || []);
        this.element.on("changed.bs.select", () => {
            this.props.onChange(this.element.selectpicker("val"));
        });
    }

    componentWillUnmount() {
        this.element.off("changed.bs.select");
        this.element.selectpicker("destroy");
    }

    componentDidUpdate() {
        this.element.selectpicker("refresh");
    }

    setValue(newValue) {
        this.element.selectpicker("val", newValue);
        this.element.selectpicker("refresh");
    }

    hide() {
        this.element.parent("div.bootstrap-select").removeClass("open");
    }

    render() {
        const { onChange, ...props } = this.props;

        return (
            <select {...props}>
                {this.props.children}
            </select>

        );
    }
}

export default SelectPicker;
