import React, {Component} from 'react';
import Draggable from "react-draggable";
import {Resizable} from "re-resizable";
import iconRotate from 'images/icons/icon-rotate.png';
import Style from "react-style-tag/lib/Style";
import {secondaryColor} from "../../utils";

class DragAndDropArrow extends Component {
    constructor(props) {
        super(props);
        this.state = {
            height: 60,
            width: 200,
            resizeEnabled: false,
            deg: 0
        };
    }

    rotateArrow() {
        if (this.state.deg !== 330) {
            this.setState({
                deg: this.state.deg + 30
            });
        } else {
            this.setState({
                deg: 0
            });
        }
    }

    componentDidUpdate(prevProps) {
        if (this.props.dragMode !== prevProps.dragMode) {
            this.setState({
                resizeEnabled: !this.state.resizeEnabled
            })
        }
    }

    render() {
        const activeCSS = `background: linear-gradient(to left, ${secondaryColor} 0.25rem, transparent 0.25rem) 100% 100%, linear-gradient(to top, ${secondaryColor} 0.25rem, transparent 0.25rem) 100% 100%;`;
        const inactiveCSS = `background: none; cursor: move;`;
        return(<React.Fragment>
                <Style>{`
                    .arrow {
                        ${!this.props.dragMode ? activeCSS : inactiveCSS}
                        
                    }
                `}</Style>
                <Draggable key={this.props.order} disabled={!this.props.dragMode} onStart={this.props.onStart} onStop={this.props.onStop}>
                    <Resizable
                        className={`arrow arrow--${this.props.order}`}
                        size={{ width: this.state.width, height: this.state.height }}
                        style={{
                            resize: this.state.resizeEnabled ? 'auto' : 'none!important'
                        }}
                        enable={{ top:false, right:false, bottom:false, left:false, topRight:false, bottomRight:true, bottomLeft:false, topLeft:false }}
                        onResizeStop={(e, direction, ref, d) => {
                            this.setState({
                                width: this.state.width + d.width,
                                height: this.state.height + d.height,
                            });
                        }}
                    >
                        <img style={{transform: `rotate(${this.state.deg}deg)`}} className="arrow__image" src="https://pngimg.com/uploads/red_arrow/red_arrow_PNG1.png" alt="arrow"/>
                        <button className="arrow__rotate" onClick={() => this.rotateArrow()}><img className="arrow__rotate-icon" src={iconRotate} alt="Rotate Arrow"/></button>
                    </Resizable>
                </Draggable>
            </React.Fragment>

        );
    }
}

export default DragAndDropArrow;
