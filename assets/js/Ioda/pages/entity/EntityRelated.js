import React, {Component} from 'react';

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
                    <h2>
                        {
                            this.props.entityType === 'country'
                                ? `Regional Outages in ${this.props.entityName}`
                                : this.props.entityType === 'region'
                                    ? `Other Regions Affected in ${this.props.parentEntityName}`
                                    : this.props.entityType === 'asn'
                                        ? `Regional Outages Related to ${this.props.entityName}`
                                        : null
                        }

                    </h2>
                    <div className="map" style={{display: 'block', height: '400px'}}>
                    {
                        this.props.populateGeoJsonMap()
                    }
                    </div>
                </div>
                <div className="col-1-of-2">
                    <h2>ASNs/ISPs operating within {this.props.entityName}</h2>
                </div>
            </div>
        );
    }
}

export default EntityRelated;
