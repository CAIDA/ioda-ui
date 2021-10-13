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

import iconAddTextbox from 'images/icons/icon-addTextbox.png';
import iconRemoveTextbox from 'images/icons/icon-removeTextbox.png';
import iconAddArrow from 'images/icons/icon-addArrow.png';
import iconRemoveArrow from 'images/icons/icon-removeArrow.png';
import iconDownload from 'images/icons/icon-download.png';
import iconRefresh from 'images/icons/icon-refresh.png';
import iconTrash from 'images/icons/icon-trash.png';
import iconUndo from 'images/icons/icon-undo.png';
import Tooltip from "../tooltip/Tooltip";
import DragResizeContainer from 'react-drag-resize';
import DragAndDropArrow from "../dragAndDropTextBox/DragAndDropArrow";


class XyChartModal extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            // free-hand drawing
            color: secondaryColor,
            brushRadius: 5,
            lazyRadius: 0,
            renderCanvas: false,
            drawingEnabled: true,
            // drag and drop text box
            activeDrags: 0,
            textBoxComponents: [],
            textBoxComponentsStyles: [],
            dragMode: true,
            resizeMode: false,
            arrowComponents: [],
            arrowComponentsStyles: [],
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
        }, 300);
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
        const fromObj = convertSecondsToDateValues(this.props.tsDataLegendRangeFrom);
        const untilObj = convertSecondsToDateValues(this.props.tsDataLegendRangeUntil);
        const timestamp = `${fromObj.day}${fromObj.month.substr(0,3)}${fromObj.year}_${fromObj.hours}${fromObj.minutes}${fromObj.meridian.substr(0,1)}_${untilObj.day}${untilObj.month.substr(0,3)}${untilObj.year}_${untilObj.hours}${untilObj.minutes}${untilObj.meridian.substr(0,1)}`;

        html2canvas(input)
            .then((canvas) => {
                this.saveAs(canvas.toDataURL(), `${this.props.entityName} Chart-${timestamp}.png`);
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

    handleRenderTextBox = (i) => {
        const newComponents = [...this.state.textBoxComponents, i];
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

    handleRenderArrow = (i) => {
        const newComponents = [...this.state.arrowComponents, i];
        this.setState({
            arrowComponents: newComponents
        });
    };
    handleDeleteArrow = () => {
        const newComponents = [...this.state.arrowComponents];
        this.setState({
            arrowComponents: newComponents.slice(0,-1),
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

    handleDragResizeToggle() {
        this.setState({
            dragMode: !this.state.dragMode,
            resizeMode: !this.state.resizeMode
        });
    }

    genXyChart() {
        return (
            this.props.xyDataOptions && <div className="overview__xy-wrapper">
                <CanvasJSChart options={this.props.xyDataOptions}
                               onRef={ref => this.chart = ref}
                />
            </div>
        );
    }

    render() {
        const { textBoxComponents, arrowComponents } = this.state;
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
                        </div>
                        <div className="modal__content">
                            <div className="row">
                                <div className="col-1-of-1" ref={this.colRef}>
                                    <div className="modal__row">
                                        <div id="chart" ref={this.chartRef}>
                                            <div className="overview__buttons">
                                                <h3 className="section-header">Raw IODA Signals for {this.props.entityName}</h3>
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

                                </div>
                            </div>
                            <div className="row">
                                <div className="col-1-of-1">
                                    <h3 className="section-header">Annotator</h3>
                                    <div className="chartShare__modal__control-panel">
                                        <div className="chartShare__modal__control-panel-row">
                                            <div className="chartShare__modal__control-panel-col">
                                                <h4 className="chartShare__modal__control-panel-col-title">Chart Image</h4>
                                                <button className="related__modal-button" onClick={() => this.handleUpdateSnapshot()}>
                                                    <img className="related__modal-button-img" src={iconRefresh} title="Update Snapshot" alt="Update Snapshot"/>
                                                </button>
                                            </div>
                                            <div className="chartShare__modal__control-panel-col">
                                                <h4 className="chartShare__modal__control-panel-col-title">Drawing</h4>
                                                <div className="chartShare__button-blob">
                                                    <button className="chartShare__button" onClick={() => this.canvasRef.clear()}>
                                                        <img className="related__modal-button-img" src={iconTrash} title="Remove All Drawn Lines" alt="Remove all Drawn Lines"/>
                                                    </button>
                                                    <button className="chartShare__button" onClick={() => this.canvasRef.undo()}>
                                                        <img className="related__modal-button-img" src={iconUndo} title="Undo Last Line Drawn" alt="Undo Last Line Drawn"/>
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="chartShare__modal__control-panel-col">
                                                <h4 className="chartShare__modal__control-panel-col-title">Textbox</h4>
                                                <div className="chartShare__button-blob">
                                                    <button className="chartShare__button" onClick={() => this.handleRenderTextBox()}>
                                                        <img className="related__modal-button-img" src={iconAddTextbox} title="Add New Text Box" alt="Add New Text Box"/>
                                                    </button>
                                                    <button className="chartShare__button" onClick={() => this.handleDeleteTextBox()}>
                                                        <img className="related__modal-button-img" src={iconRemoveTextbox} title="Remove Last Text Box" alt="Remove Last Text Box"/>
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="chartShare__modal__control-panel-col">
                                                <h4 className="chartShare__modal__control-panel-col-title">Arrow</h4>
                                                <div className="chartShare__button-blob">
                                                    <button className="chartShare__button" onClick={() => this.handleRenderArrow()}>
                                                        <img className="related__modal-button-img" src={iconAddArrow} title="Add New Arrow" alt="Add New Arrow"/>
                                                    </button>
                                                    <button className="chartShare__button" onClick={() => this.handleDeleteArrow()}>
                                                        <img className="related__modal-button-img" src={iconRemoveArrow} title="Remove Last Arrow" alt="Remove Last Arrow"/>
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="chartShare__modal__control-panel-col chartShare__modal__control-panel-col--toggle">
                                                <ToggleButton
                                                    selected={this.state.dragMode}
                                                    toggleSelected={() => this.handleDragResizeToggle()}
                                                    label={"Toggle Drag Mode"}
                                                />
                                                <ToggleButton
                                                    selected={!this.state.drawingEnabled}
                                                    toggleSelected={() => this.handleLockDrawing()}
                                                    label={"Toggle Draw Mode"}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    {
                                        this.state.renderCanvas && <div id="annotation" className="annotation modal__row">
                                            {textBoxComponents.length !== 0 &&
                                            textBoxComponents.map((i, index) => <DragAndDropTextBox
                                                key={index} order={index}
                                                onStart={this.onStart.bind(this)}
                                                onStop={this.onStop.bind(this)}
                                                resizeMode={this.state.resizeMode}
                                                dragMode={this.state.dragMode}
                                            />)}
                                            {arrowComponents.length !== 0 &&
                                            arrowComponents.map((i, index) => <DragAndDropArrow
                                                key={index} order={index}
                                                onStart={this.onStart.bind(this)}
                                                onStop={this.onStop.bind(this)}
                                                resizeMode={this.state.resizeMode}
                                                dragMode={this.state.dragMode}
                                            />)}
                                            <div className={this.state.drawingEnabled ? "annotation__drawingLocked" : null}>
                                                <CanvasDraw
                                                    key={this.state.imageFile}
                                                    ref={canvasDraw => (this.canvasRef = canvasDraw)}
                                                    brushColor={this.state.color}
                                                    brushRadius={this.state.brushRadius}
                                                    lazyRadius={this.state.lazyRadius}
                                                    imgSrc={this.state.imageFile}
                                                    canvasWidth={this.chartRef && this.chartRef.current ? this.chartRef.current.clientWidth : null}
                                                    canvasHeight={this.chartRef && this.chartRef.current ? this.chartRef.current.clientHeight - 7 : null}
                                                    // canvasHeight={this.chartRef && this.chartRef.current ? (this.chartRef.current.clientHeight * this.headingRef.current.clientWidth) / this.chartRef.current.clientWidth : null}
                                                />
                                            </div>
                                        </div>
                                    }
                                    {
                                        this.state.renderCanvas
                                            ? null : <div className="annotation modal__row"><Loading/></div>
                                    }
                                    <button className="chartShare__button--download" onClick={() => this.downloadFile()}>
                                        <img className="chartShare__button--download-img" src={iconDownload} title="Download Image" alt="Download Image"/>
                                        Download
                                    </button>
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
