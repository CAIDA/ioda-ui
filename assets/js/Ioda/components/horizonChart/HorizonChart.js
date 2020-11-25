import React, { Component } from 'react';
import HorizonTSChart from 'horizon-timeseries-chart';

class HorizonExample extends Component {
    constructor(props) {
        super(props);
        this.state = {

        };
    }

    componentDidMount() {
        const myChart = HorizonTSChart();
        myChart
            .data(<myData/>)
                (<myDOMElement/>);
    }

    render() {
        return (
            <div>

            </div>
        )
    }
}

export default HorizonExample;
