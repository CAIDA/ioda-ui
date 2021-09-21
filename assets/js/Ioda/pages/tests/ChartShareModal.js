import React, {PureComponent} from 'react';
import PropTypes from "prop-types";
import CanvasDraw from "react-canvas-draw";
import {secondaryColor} from "../../utils";

class ChartShareModal extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            color: secondaryColor,
            width: 400,
            height: 400,
            brushRadius: 5,
            lazyRadius: 6,
            renderCanvas: false
        };
        this.headingRef = React.createRef();
    }

    componentDidMount() {
        setTimeout(() => {
            this.setState({ renderCanvas: true })
        }, 600);
    }

    componentDidUpdate(prevProps) {

    }

    render() {
        return(
            <div className="modal">
                <div className="modal__background"></div>
                <div className="modal__window">
                    <div className="modal__row">
                        <div className="modal__heading" ref={this.headingRef}>
                            <div className="modal__heading-title">
                                <h2 className="heading-h2" >{this.props.entityName}</h2>
                            </div>
                            <button className="modal__button" onClick={() => this.props.toggleModal()}>
                                ×
                            </button>
                        </div>
                    </div>
                    <div className="modal__content">
                        <div className="row">
                            <h3 style={{fontSize: '3rem', margin: '1rem 0'}}>Image standalone</h3>
                            <img src={this.props.imageFile} alt={this.props.entityName} style={{width: '100%', height: 'auto'}}/>
                            <h3 style={{fontSize: '3rem', margin: '1rem 0'}}>Image with drawing capability</h3>
                            <button
                                onClick={() => {
                                    this.saveableCanvas.clear();
                                }}
                            >
                                Clear
                            </button>
                            <button
                                onClick={() => {
                                    this.saveableCanvas.undo();
                                }}
                            >
                                Undo
                            </button>
                            {
                                this.state.renderCanvas && <CanvasDraw
                                    ref={canvasDraw => (this.saveableCanvas = canvasDraw)}
                                    brushColor={this.state.color}
                                    imgSrc={this.props.imageFile}
                                    canvasWidth={this.headingRef.current.clientWidth}
                                    canvasHeight={(this.props.imageHeight * this.headingRef.current.clientWidth) / this.props.imageWidth}
                                />
                            }
                            <h3 style={{fontSize: '3rem', margin: '1rem 0'}}>Flattened Image with Drawing</h3>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

ChartShareModal.propTypes = {

};

export default ChartShareModal;
