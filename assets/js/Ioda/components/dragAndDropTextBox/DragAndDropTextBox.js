import React, {Component} from 'react';
import Draggable from "react-draggable";


class DragAndDropTextBox extends Component {
    constructor(props) {
        super(props);
        this.state = {
            height: 'auto'
        };
    }

    handleTextChange(e) {
        let newHeight = `${(Math.ceil(e.target.value.length / 44) * 2) + 1.33}rem`;
        this.setState({height: newHeight})
    }

    render() {
        return(
            <Draggable onStart={this.props.onStart} onStop={this.props.onStop}>
                <textarea
                    className={`textbox textbox--${this.props.order}`}
                    style={{height: this.state.height}}
                    onChange={(e) => this.handleTextChange(e)}
                    placeholder="annotation..."
                >
            </textarea></Draggable>
        );
    }
}

export default DragAndDropTextBox;
