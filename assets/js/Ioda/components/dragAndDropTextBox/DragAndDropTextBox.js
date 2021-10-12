import React, {Component} from 'react';
import Draggable from "react-draggable";
import {Resizable} from "re-resizable";


// const oldJSXBetweenReturn = <Draggable onStart={this.props.onStart} onStop={this.props.onStop}>
//                 <textarea
//                     className={`textbox textbox--${this.props.order}`}
//                     style={{height: this.state.height}}
//                     onChange={(e) => this.handleTextChange(e)}
//                     placeholder="annotation..."
//                 >
//             </textarea></Draggable>;

class DragAndDropTextBox extends Component {
    constructor(props) {
        super(props);
        this.state = {
            height: 40,
            width: 300,
            resizeEnabled: false
        };
    }

    handleTextChange(e) {
        let newHeight = `${(Math.ceil(e.target.value.length / 44) * 2) + 1.33}rem`;
        this.setState({height: newHeight})
    }

    componentDidUpdate(prevProps) {
        if (this.props.dragMode !== prevProps.dragMode) {
            console.log(this.props.dragMode);
            this.setState({
                resizeEnabled: !this.state.resizeEnabled
            })
        }
    }

    render() {
        return(
            <Draggable key={this.props.order} disabled={!this.props.dragMode} onStart={this.props.onStart} onStop={this.props.onStop}>
                <Resizable
                    className={`textbox textbox--${this.props.order}`}
                    size={{ width: this.state.width, height: this.state.height }}
                    style={{resize: this.state.resizeEnabled ? 'auto' : 'none!important'}}
                    // enable={this.state.resizeEnabled}
                    onResizeStop={(e, direction, ref, d) => {
                        this.setState({
                            width: this.state.width + d.width,
                            height: this.state.height + d.height,
                        });
                    }}
                >
                    <textarea
                        style={{height: 'inherit', width: '100%'}}
                        // onChange={(e) => this.handleTextChange(e)}
                        placeholder="annotation..."
                    >
                    </textarea>
                    {/*<div>text text text</div>*/}
                </Resizable>

                {/*<textarea*/}
                {/*    className={`textbox textbox--${this.props.order}`}*/}
                {/*    style={{height: this.state.height}}*/}
                {/*    onChange={(e) => this.handleTextChange(e)}*/}
                {/*    placeholder="annotation..."*/}
                {/*>*/}
            {/*</textarea>*/}
            </Draggable>
        );
    }
}

export default DragAndDropTextBox;