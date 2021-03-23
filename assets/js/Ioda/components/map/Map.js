import React, { Component } from 'react'
import { Map, TileLayer, GeoJSON } from 'react-leaflet';
import { humanizeNumber } from "../../utils";

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
            mouseout: () => this.mouseOutFeature()
        });
    };

    mouseOverFeature = (e, feature) => {
        if (feature.properties.score > 0) {
            this.setState({
                hoverName: feature.properties.name,
                hoverScore: humanizeNumber(feature.properties.score),
                hoverTooltipDisplay: true
            })
        }
    };

    mouseOutFeature = () => {
        this.setState({
            hoverName: "",
            hoverScore: 0,
            hoverTooltipDisplay: false
        })
    }


    render() {
        let position = [20, 0];
        let zoom = 2;
        return (
            <div style={{position: 'relative', height: 'inherit', width: '100%'}}>
                <div className={this.state.hoverTooltipDisplay ? "tooltip tooltip--visible" : "tooltip"}>
                    <p>{this.state.hoverName} - {this.state.hoverScore}</p>
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
                            color: '#fff',
                            weight: 2,
                            fillColor:
                                !feature.properties.score
                                    ? "transparent"
                                    : feature.properties.score < 250
                                    ? "rgb(254, 204, 92)"
                                    : feature.properties.score < 500
                                        ? "rgb(253, 141, 60)"
                                        : "rgb(227, 26, 28)"
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
