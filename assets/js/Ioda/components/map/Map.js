import React, { Component } from 'react'
import { Map, TileLayer, GeoJSON } from 'react-leaflet';
import { humanizeNumber, shadeColor, interpolateColor } from "../../utils";
import d3 from "d3";

const mapAccessToken = "pk.eyJ1Ijoid2ViZXIwMjUiLCJhIjoiY2tmNXp5bG0wMDAzaTMxbWQzcXQ1Y3k2eCJ9.NMu5bfrybATuYQ7HdYvq-g";
const thunderForestapiKey = "f3709489dd7c411580a4610ccb5c1370";

class TopoMap extends Component {
    constructor(props) {
        super(props);
        this.state = {
            hoverName: "",
            hoverScore: 0,
            hoverTooltipDisplay: false,
            screenWidthBelow680 : false
        }
    }

    componentDidMount() {
        window.addEventListener("resize", this.resize.bind(this));
    }

    resize() {
        let screenWidthBelow680 = (window.innerWidth <= 680);
        if (screenWidthBelow680 !== this.state.screenWidthBelow680) {

            this.setState({
                screenWidthBelow680: screenWidthBelow680
            });
        }
    }

    onEachFeature = (feature, layer) => {
        layer.on({
            mouseover: (e) => this.mouseOverFeature(e, feature),
            mouseout: (e) => this.mouseOutFeature(e),
            click: () => this.clickFeature(feature)
        });
    };

    mouseOverFeature = (e, feature) => {
        this.setState({
            hoverName: feature.properties.name,
            hoverScore: feature.properties.score ? humanizeNumber(feature.properties.score) : 0,
            hoverTooltipDisplay: true
        }, () => {
            let hoverColor = e.target.options && e.target.options.fillColor ? shadeColor(e.target.options.fillColor, -10) : shadeColor("#f2f2f0", -10);
            e.target.setStyle({
                fillColor: hoverColor,
                color: '#fff',
                opacity: 1,
                fillOpacity: 0.4,
                weight: 3,
                dashArray: '2'
            });
        })
    };

    mouseOutFeature = (e) => {
            e.target.setStyle({
                weight: 2,
                fillOpacity: 0.7,
            });

        this.setState({
            hoverName: "",
            hoverScore: 0,
            hoverTooltipDisplay: false
        })
    };

    clickFeature = (feature) => {
        this.props.handleEntityShapeClick(feature);
    };

    render() {
        let { scores } = this.props;
        let position = [20, 0];
        let zoom = this.state.screenWidthBelow680 ? 1 : 2;

        return (
            <div style={{position: 'relative', height: 'inherit', width: '100%'}}>
                <div className={this.state.hoverTooltipDisplay ? "tooltip tooltip--visible" : "tooltip"}>
                    <p>{this.state.hoverName}{this.state.hoverScore !== 0 ? ` - ${this.state.hoverScore}`: null}</p>
                </div>
                <Map
                    center={this.props.bounds ? null : position}
                    zoom={this.props.bounds ? null : zoom}
                    bounds={this.props.bounds ? this.props.bounds : null}
                    minZoom={1}
                    scrollWheelZoom={false}
                    touchZoom={true}
                    dragging={!this.state.screenWidthBelow680}
                    style={{width: 'inherit', height: 'inherit', overflow: 'hidden'}}
                >
                    <TileLayer
                        id="mapbox/light-v10"
                        url={`https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=${mapAccessToken}`}
                    />
                    <GeoJSON
                        data={this.props.topoData}
                        onEachFeature={this.onEachFeature}
                        style={(feature) => ({
                            color: 'transparent',
                            weight: 2,
                            fillColor:
                                !scores ? "#f2f2f0" :
                                !feature.properties.score
                                    ? "#f2f2f0"
                                    : interpolateColor("#1387CB", "#E8080D", scores[0], scores[scores.length -1], feature.properties.score)
                            ,
                            fillOpacity: !feature.properties.score
                                    ? 0.2
                                    : 0.5,
                            dashArray: '2'
                        })}
                    />
                </Map>
            </div>

        )
    }
}

export default TopoMap;
