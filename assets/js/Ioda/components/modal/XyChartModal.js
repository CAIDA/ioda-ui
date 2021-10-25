import React, {PureComponent} from 'react';
import CanvasDraw from "react-canvas-draw";
import {convertSecondsToDateValues, secondaryColor} from "../../utils";
import DragAndDropTextBox from "../dragAndDropBox/DragAndDropTextBox";
import DragAndDropArrow from "../dragAndDropBox/DragAndDropArrow";
import domtoimage from 'dom-to-image';
import html2canvas from "html2canvas";
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


class XyChartModal extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            // free-hand drawing
            color: secondaryColor,
            brushRadius: 4,
            lazyRadius: 0,
            drawingEnabled: true,
            // drag and drop text box
            textBoxComponents: [],
            textBoxComponentsStyles: [],
            dragMode: true,
            resizeMode: false,
            arrowComponents: [],
            arrowComponentsStyles: [],
            // for updating the image snapshot
            imageFile: null,
            loading: true,
            // for hiding buttons like rotate arrow when a snapshot is taken
            hideButtons: false
        };
        this.headingRef = React.createRef();
        this.canvasRef = React.createRef();
        this.chartRef = React.createRef();
    }

    downloadFile(entityName) {
        const input = document.getElementById('annotation');
        const fromObj = convertSecondsToDateValues(this.props.tsDataLegendRangeFrom);
        const untilObj = convertSecondsToDateValues(this.props.tsDataLegendRangeUntil);
        const timestamp = `${fromObj.day}${fromObj.month.substr(0,3)}${fromObj.year}_${fromObj.hours}${fromObj.minutes}${fromObj.meridian.substr(0,1)}_${untilObj.day}${untilObj.month.substr(0,3)}${untilObj.year}_${untilObj.hours}${untilObj.minutes}${untilObj.meridian.substr(0,1)}`;

        // download image
        domtoimage.toJpeg(input, { quality: 0.85, width: 1200})
            .then(function (dataUrl) {
                var link = document.createElement('a');
                link.download = `${entityName} Chart-${timestamp}.jpeg`;
                link.href = dataUrl;
                link.click();
            });
    }

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

    handleClearAllAnnotations = () => {
        // Remove all drawings
        this.canvasRef.clear();
        // Remove all arrows and text boxes
        this.setState({
            textBoxComponents: [],
            textBoxComponentsStyles: [],
            arrowComponents: [],
            arrowComponentsStyles: [],
            activeDrags: 0,
        });
    };

    handleDragResizeToggle() {
        // disable drawing if enabled
        if (!this.state.drawingEnabled) {
            this.handleLockDrawing();
        }
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
        const entityName  = this.props.entityName;

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
                                <div className="col-1-of-1">
                                    <div className="modal__row modal__row--annotation">
                                        <div className="annotation" id="annotation">
                                            {textBoxComponents.length !== 0 &&
                                            textBoxComponents.map((i, index) => <DragAndDropTextBox
                                                key={index} order={index}
                                                resizeMode={this.state.resizeMode}
                                                dragMode={this.state.dragMode}
                                                hideButtons={this.state.hideButtons}
                                            />)}
                                            <div className={this.state.drawingEnabled ? "annotation__canvas annotation__canvas--drawingLocked" : "annotation__canvas"}>
                                                <CanvasDraw
                                                    key={this.state.imageFile}
                                                    ref={canvasDraw => (this.canvasRef = canvasDraw)}
                                                    brushColor={this.state.color}
                                                    brushRadius={this.state.brushRadius}
                                                    lazyRadius={this.state.lazyRadius}
                                                    canvasWidth={this.chartRef && this.chartRef.current ? this.chartRef.current.clientWidth : null}
                                                    canvasHeight={this.chartRef && this.chartRef.current ? this.chartRef.current.clientHeight - 7 : null}
                                                    hideGrid
                                                />
                                            </div>
                                            {arrowComponents.length !== 0 &&
                                            arrowComponents.map((i, index) => <DragAndDropArrow
                                                key={index} order={index}
                                                resizeMode={this.state.resizeMode}
                                                dragMode={this.state.dragMode}
                                                hideButtons={this.state.hideButtons}
                                                drawingEnabled={this.state.drawingEnabled}
                                            />)}
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
                                        <div className="chartShare__modal__control-panel">
                                            <div className="chartShare__modal__control-panel-row">
                                                <div className="chartShare__modal__control-panel-col">
                                                    <button className="related__modal-button" onClick={() => this.handleClearAllAnnotations()}>
                                                        Clear All Annotations
                                                    </button>
                                                    <h4 className="chartShare__modal__control-panel-col-title">Clear All</h4>
                                                </div>
                                                <div className="chartShare__modal__control-panel-col">
                                                    <div className="chartShare__button-blob">
                                                        <button className="chartShare__button" onClick={() => this.canvasRef.clear()}>
                                                            <img className="related__modal-button-img" src={iconTrash} title="Remove All Drawn Lines" alt="Remove all Drawn Lines"/>
                                                        </button>
                                                        <button className="chartShare__button" onClick={() => this.canvasRef.undo()}>
                                                            <img className="related__modal-button-img" src={iconUndo} title="Undo Last Line Drawn" alt="Undo Last Line Drawn"/>
                                                        </button>
                                                    </div>
                                                    <h4 className="chartShare__modal__control-panel-col-title">Drawing</h4>
                                                </div>
                                                <div className="chartShare__modal__control-panel-col">
                                                    <div className="chartShare__button-blob">
                                                        <button className="chartShare__button" onClick={() => this.handleRenderTextBox()}>
                                                            <img className="related__modal-button-img" src={iconAddTextbox} title="Add New Text Box" alt="Add New Text Box"/>
                                                        </button>
                                                        <button className="chartShare__button" onClick={() => this.handleDeleteTextBox()}>
                                                            <img className="related__modal-button-img" src={iconRemoveTextbox} title="Remove Last Text Box" alt="Remove Last Text Box"/>
                                                        </button>
                                                    </div>
                                                    <h4 className="chartShare__modal__control-panel-col-title">Textbox</h4>
                                                </div>
                                                <div className="chartShare__modal__control-panel-col">
                                                    <div className="chartShare__button-blob">
                                                        <button className="chartShare__button" onClick={() => this.handleRenderArrow()}>
                                                            <img className="related__modal-button-img" src={iconAddArrow} title="Add New Arrow" alt="Add New Arrow"/>
                                                        </button>
                                                        <button className="chartShare__button" onClick={() => this.handleDeleteArrow()}>
                                                            <img className="related__modal-button-img" src={iconRemoveArrow} title="Remove Last Arrow" alt="Remove Last Arrow"/>
                                                        </button>
                                                    </div>
                                                    <h4 className="chartShare__modal__control-panel-col-title">Arrow</h4>
                                                </div>
                                                <div className="chartShare__modal__control-panel-col chartShare__modal__control-panel-col--toggle">
                                                    <ToggleButton
                                                        selected={this.state.dragMode}
                                                        toggleSelected={() => this.handleDragResizeToggle()}
                                                        label={"Toggle Drag/Resize"}
                                                        customTextOn={"DRAG"}
                                                        customTextOff={"RESIZE"}
                                                    />
                                                    <ToggleButton
                                                        selected={!this.state.drawingEnabled}
                                                        toggleSelected={() => this.handleLockDrawing()}
                                                        label={"Toggle Draw Mode"}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <button className="chartShare__button--download" onClick={() => this.downloadFile(entityName)}>
                                            <img className="chartShare__button--download-img" src={iconDownload} title="Download Image" alt="Download Image"/>
                                            Download
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
    }
}

export default XyChartModal;
