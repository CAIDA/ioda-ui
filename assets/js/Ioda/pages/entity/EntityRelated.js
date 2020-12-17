import React, {Component} from 'react';
// Map Dependencies
import TopoMap from "../../components/map/Map";
import * as topojson from 'topojson';

class EntityRelated extends Component {
    constructor(props) {
        super(props);
        this.state = {
        }
    }

    render() {
        return(
            <div className="row related">
                <div className="col-1-of-2">
                    <h2>Regional Outages in {this.props.entity}</h2>
                </div>
                <div className="col-1-of-2">
                    <h2>ASNs/ISPs operating within {this.props.entity}</h2>
                </div>
            </div>
        );
    }
}

export default EntityRelated;
