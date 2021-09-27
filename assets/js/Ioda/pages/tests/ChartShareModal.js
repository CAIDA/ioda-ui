import React, {PureComponent} from 'react';
import PropTypes from "prop-types";
import CanvasDraw from "react-canvas-draw";
import {secondaryColor} from "../../utils";
import html2canvas from "html2canvas";
// import {
//     EmailShareButton,
//     FacebookShareButton,
//     TwitterShareButton,
//     TwitterIcon
// } from "react-share";
import Helmet from "react-helmet";
import Draggable from 'react-draggable';
import { Style } from "react-style-tag";
import DragAndDropTextBox from "../../components/dragAndDropTextBox/DragAndDropTextBox";

const TextBox = ({order, textBoxComponentsStyles, onStart, onStop, handleTextAreaUpdate}) => <Draggable onStart={onStart} onStop={onStop}>
    <textarea className={`textbox textbox--${order}`} style={{height: textBoxComponentsStyles && textBoxComponentsStyles[order] ? `${textBoxComponentsStyles[order]}rem` : 'auto'}} onChange={(e) => handleTextAreaUpdate(e)} placeholder="wrong one">
</textarea></Draggable>;

class ChartShareModal extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            // free-hand drawing
            color: secondaryColor,
            brushRadius: 5,
            lazyRadius: 0,
            renderCanvas: false,
            drawingEnabled: false,
            // drag and drop textbox
            activeDrags: 0,
            textBoxComponents: [],
            textBoxComponentsStyles: []
        };
        this.headingRef = React.createRef();
        this.onStop = this.onStop.bind(this);
        this.onStart = this.onStart.bind(this);
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

    onStart = () => {
        this.setState({activeDrags: ++this.state.activeDrags});
    };

    onStop = () => {
        this.setState({activeDrags: --this.state.activeDrags});
    };

    handleLockDrawing = () => {
        this.setState({
            drawingEnabled: !this.state.drawingEnabled
        })
    };
    handleRenderTextBox = () => {
        const newComponents = [...this.state.textBoxComponents, TextBox];
        this.setState({
            textBoxComponents: newComponents
        });
    };

    handleDeleteTextBox = () => {
        const newComponents = [...this.state.textBoxComponents];
        this.setState({
            textBoxComponents: newComponents.slice(0,-1),
        });
    };

    render() {
        const { textBoxComponents } = this.state;
        return(
            <div className="modal chartShare__modal">
                <Helmet>
                    {/*<meta property="og:image" content={this.props.imageFile} />*/}
                    {/*<meta property="og:image:secure_url" content={this.props.imageFile} />*/}
                    {/*<meta name="twitter:image" content={this.props.imageFile} />*/}
                </Helmet>
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
                        <div className="chartShare__modal__control-panel">
                            <div className="chartShare__modal__control-panel-row">
                                <button className="related__modal-button" style={{marginRight: '2rem'}} onClick={() => this.saveableCanvas.clear()}>
                                    Clear
                                </button>
                                <button className="related__modal-button" style={{marginRight: '2rem'}} onClick={() => this.saveableCanvas.undo()}>
                                    Undo
                                </button>
                                <button className="related__modal-button" style={{marginRight: '2rem'}} onClick={() => this.downloadFile()}>
                                    Download
                                </button>
                                <button className="related__modal-button" style={{marginRight: '2rem'}} onClick={() => this.handleLockDrawing()}>
                                    {
                                        this.state.drawingEnabled ? "Drawing Disabled" : "Drawing Enabled"
                                    }
                                </button>
                                <button className="related__modal-button" style={{marginRight: '2rem'}} onClick={() => this.handleRenderTextBox()}>
                                    Add New Text Box
                                </button>
                                <button className="related__modal-button" style={{marginRight: '2rem'}} onClick={() => this.handleDeleteTextBox()}>
                                    Remove Last Text Box
                                </button>
                            </div>
                            <div className="chartShare__modal__control-panel-row">

                            </div>
                            {/*<TwitterShareButton*/}
                            {/*    title={`IODA Signals for ${this.props.entityName}`}*/}
                            {/*    via={["caida_ioda"]}*/}
                            {/*    url={window.location.pathname}>*/}
                            {/*<TwitterIcon*/}
                            {/*    size={32}*/}
                            {/*    round />*/}
                            {/*</TwitterShareButton>*/}
                        </div>
                    </div>
                    <div className="modal__content">
                        <div className="row">
                            <h3 style={{fontSize: '3rem', margin: '1rem 0'}}>Annotator</h3>
                            {
                                this.state.renderCanvas && <div id="annotation">
                                    {textBoxComponents.length !== 0 &&
                                    textBoxComponents.map((TextBox, i) => <DragAndDropTextBox key={i} order={i} onStart={this.onStart.bind(this)} onStop={this.onStop.bind(this)}/>)}
                                    <div className={this.state.drawingEnabled ? "annotation__drawingLocked" : null}>
                                        <CanvasDraw
                                            ref={canvasDraw => (this.saveableCanvas = canvasDraw)}
                                            brushColor={this.state.color}
                                            brushRadius={this.state.brushRadius}
                                            lazyRadius={this.state.lazyRadius}
                                            imgSrc={this.props.imageFile}
                                            canvasWidth={this.headingRef.current.clientWidth}
                                            canvasHeight={(this.props.imageHeight * this.headingRef.current.clientWidth) / this.props.imageWidth}
                                        />
                                    </div>
                                </div>
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
