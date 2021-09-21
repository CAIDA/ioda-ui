import React, {PureComponent} from 'react';
import PropTypes from "prop-types";
import CanvasDraw from "react-canvas-draw";
import {secondaryColor} from "../../utils";
import html2canvas from "html2canvas";

class ChartShareModal extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            color: secondaryColor,
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

    downloadFile() {
        const input = document.getElementById('annotation');
        html2canvas(input)
            .then((canvas) => {
                this.saveAs(canvas.toDataURL(), `${this.props.entityName}Chart.png`);
            })
    }

    saveAs(uri, filename) {
        let link = document.createElement('a');
        if (typeof link.download === 'string') {
            link.href = uri;
            link.download = filename;
            //Firefox requires the link to be in the body
            document.body.appendChild(link);
            //simulate click
            link.click();
            //remove the link when done
            document.body.removeChild(link);
        } else {
            window.open(uri);
        }
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
                            <button className="related__modal-button" style={{marginRight: '2rem'}} onClick={() => this.saveableCanvas.clear()}>
                                Clear
                            </button>
                            <button className="related__modal-button" style={{marginRight: '2rem'}} onClick={() => this.saveableCanvas.undo()}>
                                Undo
                            </button>
                            <button className="related__modal-button" onClick={() => this.downloadFile()}>
                                Download
                            </button>
                            {
                                this.state.renderCanvas && <div id="annotation"><CanvasDraw
                                    ref={canvasDraw => (this.saveableCanvas = canvasDraw)}
                                    brushColor={this.state.color}
                                    brushRadius={this.state.brushRadius}
                                    lazyRadius={this.state.lazyRadius}
                                    imgSrc={this.props.imageFile}
                                    canvasWidth={this.headingRef.current.clientWidth}
                                    canvasHeight={(this.props.imageHeight * this.headingRef.current.clientWidth) / this.props.imageWidth}
                                /></div>
                            }
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
