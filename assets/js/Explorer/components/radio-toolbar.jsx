import PropTypes from 'prop-types';
import React from 'react';
import { ButtonGroup, Button } from 'react-bootstrap';

class RadioToolbar extends React.Component {
    static propTypes = {
        options: PropTypes.arrayOf(PropTypes.object),    // Each { val: [string], display: [React component] }
        selected: PropTypes.string,
        fontSize: PropTypes.string,
        description: PropTypes.string,
        onChange: PropTypes.func
    };

    static defaultProps = {
        options: [],
        description: '',
        fontSize: '13px',
        onChange: function (newVal) {
        }
    };

    render() {
        const rThis = this;

        return <ButtonGroup
            bsSize="xsmall"
            style={{verticalAlign: 'middle'}}
            title={this.props.description}
        >
            {this.props.options.map(function (option) {
                return <Button
                    key={option.val}
                    active={rThis.props.selected === option.val}
                    onClick={function () {
                        rThis.props.onChange(option.val);
                    }}
                    style={{fontSize: rThis.props.fontSize}}
                >
                    {option.display}
                </Button>;
            })}
        </ButtonGroup>;
    }
}

export default RadioToolbar;
