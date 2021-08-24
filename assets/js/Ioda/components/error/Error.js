import React, {Component} from 'react';
import T from "i18n-react";


class Error extends Component {
    constructor(props) {
        super(props);
        this.config = React.createRef();
    }

    render() {
        return(
            <div className="error">
                <div className="row">
                    <div className="col-1-of-1">
                        <p className="error-message">Please enter a valid time range. <em>From</em> Value cannot be later than <em>Until</em> Value.</p>
                    </div>
                </div>
            </div>
        );
    }
}

export default Error;
