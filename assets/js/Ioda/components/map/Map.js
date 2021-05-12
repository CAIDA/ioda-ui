import React, { Component } from 'react'
import { Map, TileLayer, GeoJSON } from 'react-leaflet';
import { humanizeNumber, shadeColor } from "../../utils";
import d3 from "d3";

const mapAccessToken = "pk.eyJ1Ijoid2ViZXIwMjUiLCJhIjoiY2tmNXp5bG0wMDAzaTMxbWQzcXQ1Y3k2eCJ9.NMu5bfrybATuYQ7HdYvq-g";
const thunderForestapiKey = "f3709489dd7c411580a4610ccb5c1370";

class TopoMap extends Component {
    constructor(props) {
        super(props);
        this.state = {
            hoverName: "",
            hoverScore: 0,
            hoverTooltipDisplay: false
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
            hoverScore: humanizeNumber(feature.properties.score),
            hoverTooltipDisplay: true
        }, () => {
            if (e.target.options && e.target.options.fillColor) {
                let hoverColor = shadeColor(e.target.options.fillColor, -10);
                e.target.setStyle({
                    fillColor: hoverColor,
                    color: '#fff',
                    fillOpacity: 0.4,
                    weight: 3,
                    dashArray: '2'
                });
            }
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
        let zoom = 2;
        const colorSet = ["rgb(254, 204, 92)", "rgb(253, 141, 60)", "rgb(227, 26, 28)", "rgb(227, 26, 28)"];
        let colScaleLinear = d3.scale.linear()
            .domain([scores[Math.round((scores.length - 1) / 4)], scores[Math.round((scores.length - 1) / 2)], scores[Math.round((scores.length - 1) * .9)], scores[Math.round(scores.length - 1)]])
            .range(colorSet);

        return (
            <div style={{position: 'relative', height: 'inherit', width: '100%'}}>
                <div className={this.state.hoverTooltipDisplay ? "tooltip tooltip--visible" : "tooltip"}>
                    <p>{this.state.hoverName}{this.state.hoverScore > 0 ? ` - ${this.state.hoverScore}`: null}</p>
                </div>
                <Map
                    center={this.props.bounds ? null : position}
                    zoom={this.props.bounds ? null : zoom}
                    bounds={this.props.bounds ? this.props.bounds : null}
                    minZoom={1}
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
                                !feature.properties.score
                                    ? "transparent"
                                    : colScaleLinear(feature.properties.score)
                            ,
                            fillOpacity: 0.7,
                            dashArray: '2'
                        })}
                    />
                </Map>
            </div>

        )
    }
}

export default TopoMap;
