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
        this.setState({value: e.target.value})
    }

    componentDidUpdate(prevProps) {
        if (this.props.dragMode !== prevProps.dragMode) {
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
                    enable={{ top:false, right:false, bottom:false, left:false, topRight:false, bottomRight:true, bottomLeft:false, topLeft:false }}
                    onResizeStop={(e, direction, ref, d) => {
                        this.setState({
                            width: this.state.width + d.width,
                            height: this.state.height + d.height,
                        });
                    }}
                >
                    <textarea
                        className="textbox__textarea"
                        style={{height: 'inherit', width: '100%', cursor: this.props.dragMode ? 'move' : 'initial'}}
                        placeholder="annotation..."
                        value={this.state.value}
                        onChange={(e) => this.handleTextChange(e)}
                    />
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
