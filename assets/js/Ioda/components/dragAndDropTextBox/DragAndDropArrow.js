import React, {Component} from 'react';
import Draggable from "react-draggable";
import {Resizable} from "re-resizable";
import iconArrowRed from 'images/icons/icon-arrowRed.png';
import iconRotate from 'images/icons/icon-rotate.png';
import Style from "react-style-tag/lib/Style";
import {secondaryColor} from "../../utils";

class DragAndDropArrow extends Component {
    constructor(props) {
        super(props);
        this.state = {
            height: 90,
            width: 130,
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
        const rotateCSS = `background: linear-gradient(to left, ${secondaryColor} 0.25rem, transparent 0.25rem) 100% 100%, linear-gradient(to top, ${secondaryColor} 0.25rem, transparent 0.25rem) 100% 100%;`;
        const dragCSS = `background: none; cursor: move;`;
        const hideButtonsCSS = `display: none;`;
        const showButtonsCSS = `display: flex;`;
        const drawingEnabledCSS = 'pointer-events: none';
        const drawingDisabledCSS = 'pointer-events: auto';
        return(<React.Fragment>
                <Style>{`
                    .arrow {
                        ${!this.props.dragMode ? rotateCSS : dragCSS}
                        ${!this.props.drawingEnabled ? drawingEnabledCSS : drawingDisabledCSS}
                    }
                    .arrow__rotate {
                        ${this.props.hideButtons ? hideButtonsCSS : showButtonsCSS}
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
                        <img style={{transform: `rotate(${this.state.deg}deg)`}} className="arrow__image" src={iconArrowRed} alt="arrow"/>
                        <button className="arrow__rotate" onClick={() => this.rotateArrow()}><img className="arrow__rotate-icon" src={iconRotate} alt="Rotate Arrow"/></button>
                    </Resizable>
                </Draggable>
            </React.Fragment>

        );
    }
}

export default DragAndDropArrow;
