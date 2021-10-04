import React, {PureComponent} from 'react';
import PropTypes from "prop-types";
import CanvasDraw from "react-canvas-draw";
import {convertSecondsToDateValues, secondaryColor} from "../../utils";
import html2canvas from "html2canvas";
import Draggable from 'react-draggable';
import DragAndDropTextBox from "../../components/dragAndDropTextBox/DragAndDropTextBox";
import Loading from "../../components/loading/Loading";
import CanvasJSChart from "../../libs/canvasjs-non-commercial-3.2.5/canvasjs.react";
import ToggleButton from "../toggleButton/ToggleButton";
import T from "i18n-react";
import TimeStamp from "../timeStamp/TimeStamp";

const TextBox = ({order, textBoxComponentsStyles, onStart, onStop, handleTextAreaUpdate}) => <Draggable onStart={onStart} onStop={onStop}>
    <textarea className={`textbox textbox--${order}`} style={{height: textBoxComponentsStyles && textBoxComponentsStyles[order] ? `${textBoxComponentsStyles[order]}rem` : 'auto'}} onChange={(e) => handleTextAreaUpdate(e)} placeholder="wrong one">
</textarea></Draggable>;

class XyChartModal extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            // free-hand drawing
            color: secondaryColor,
            brushRadius: 5,
            lazyRadius: 0,
            renderCanvas: false,
            drawingEnabled: false,
            // drag and drop text box
            activeDrags: 0,
            textBoxComponents: [],
            textBoxComponentsStyles: [],
            // for updating the image snapshot
            imageFile: null,
            initialSnapshotLoaded: false,
            loading: true
        };
        this.headingRef = React.createRef();
        this.canvasRef = React.createRef();
        this.colRef = React.createRef();
        this.chartRef = React.createRef();
        this.onStop = this.onStop.bind(this);
        this.onStart = this.onStart.bind(this);
    }

    componentDidMount() {
        setTimeout(() => {
            this.setState({ renderCanvas: true })
        }, 600);
    }

    componentDidUpdate(prevState) {
        if (this.colRef && this.colRef.current && !this.state.initialSnapshotLoaded) {
            this.setState({
                initialSnapshotLoaded: true
            });
            this.handleUpdateSnapshot();
        }
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

    handleUpdateSnapshot() {
        // save current drawings
        localStorage.setItem(
            "drawing",
            this.canvasRef.getSaveData()
        );
        // take new snapshot and update
        const input = document.getElementById('chart');
        html2canvas(input)
            .then((canvas) => {
                this.setState({
                    imageFile: canvas.toDataURL('img/png'),
                }, () => {
                    this.canvasRef.loadSaveData(
                        localStorage.getItem("drawing")
                    );
                })
            })
    }

    genXyChart() {
        return (
            this.props.xyDataOptions && <div className="overview__xy-wrapper">
                <CanvasJSChart options={this.props.xyDataOptions}
                               onRef={ref => this.chart = ref}
                />
                {/*You can get reference to the chart instance as shown above using onRef. This allows you to access all chart properties and methods*/}
            </div>
        );
    }

    render() {
        const { textBoxComponents } = this.state;
        const xyChartAlertToggleLabel = T.translate("entity.xyChartAlertToggleLabel");
        const xyChartNormalizedToggleLabel = T.translate("entity.xyChartNormalizedToggleLabel");

        if (this.props.modalStatus === false) {
            return null;
        } else {
            return(
                <div className="modal chartShare__modal">
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
                            </div>
                        </div>
                        <div className="modal__content">
                            <div className="row">
                                <div className="col-1-of-1" ref={this.colRef}>
                                    <div className="modal__row">
                                        <div id="chart" ref={this.chartRef}>
                                            <div className="overview__buttons">
                                                <h3 className="section-header">Raw Signals for {this.props.entityName}</h3>
                                                <div className="overview__buttons-col">
                                                    <ToggleButton
                                                        selected={this.props.tsDataDisplayOutageBands}
                                                        toggleSelected={() => this.props.handleDisplayAlertBands()}
                                                        label={xyChartAlertToggleLabel}
                                                    />
                                                    <ToggleButton
                                                        selected={this.props.tsDataNormalized}
                                                        toggleSelected={() => this.props.changeXyChartNormalization()}
                                                        label={xyChartNormalizedToggleLabel}
                                                    />
                                                </div>
                                            </div>
                                            {
                                                this.props.xyDataOptions
                                                    ? this.genXyChart()
                                                    : <Loading/>
                                            }
                                            <div className="overview__timestamp">
                                                <TimeStamp from={convertSecondsToDateValues(this.props.tsDataLegendRangeFrom)}
                                                           until={convertSecondsToDateValues(this.props.tsDataLegendRangeUntil)} />
                                            </div>
                                        </div>
                                    </div>
                                    <button className="related__modal-button" onClick={() => this.handleUpdateSnapshot()}>
                                        Update Snapshot
                                    </button>
                                </div>

                            </div>
                            <div className="row">
                                <div className="col-1-of-1">
                                    <h3 className="section-header">Annotator</h3>
                                    {
                                        this.state.renderCanvas && <div id="annotation" className="annotation modal__row">
                                            {textBoxComponents.length !== 0 &&
                                            textBoxComponents.map((TextBox, i) => <DragAndDropTextBox key={i} order={i} onStart={this.onStart.bind(this)} onStop={this.onStop.bind(this)}/>)}
                                            <div className={this.state.drawingEnabled ? "annotation__drawingLocked" : null}>
                                                <CanvasDraw
                                                    key={this.state.imageFile}
                                                    ref={canvasDraw => (this.canvasRef = canvasDraw)}
                                                    brushColor={this.state.color}
                                                    brushRadius={this.state.brushRadius}
                                                    lazyRadius={this.state.lazyRadius}
                                                    imgSrc={this.state.imageFile}
                                                    canvasWidth={this.chartRef && this.chartRef.current ? this.chartRef.current.clientWidth : null}
                                                    canvasHeight={this.chartRef && this.chartRef.current ? this.chartRef.current.clientHeight - 10 : null}
                                                    // canvasHeight={this.chartRef && this.chartRef.current ? (this.chartRef.current.clientHeight * this.headingRef.current.clientWidth) / this.chartRef.current.clientWidth : null}
                                                />
                                            </div>
                                        </div>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
    }
}

XyChartModal.propTypes = {

};

export default XyChartModal;
