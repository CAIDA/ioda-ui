import React, { Component } from 'react'
import { Map, TileLayer, GeoJSON } from 'react-leaflet';

const mapAccessToken = "pk.eyJ1Ijoid2ViZXIwMjUiLCJhIjoiY2tmNXp5bG0wMDAzaTMxbWQzcXQ1Y3k2eCJ9.NMu5bfrybATuYQ7HdYvq-g";
const thunderForestapiKey = "f3709489dd7c411580a4610ccb5c1370";

class TopoMap extends Component {
    render() {
        let position = [20, 0];
        console.log(this.props.topoData);
        return (
            <Map
                center={position}
                zoom={2}
                minZoom={1}
                style={{width: 'inherit', height: 'inherit', overflow: 'hidden'}}
            >
                <TileLayer
                    id="mapbox/streets-v11"
                    url={`https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=${mapAccessToken}`}
                /><GeoJSON
                data={this.props.topoData}
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
            /></Map>
        )
    }
}

export default TopoMap;
