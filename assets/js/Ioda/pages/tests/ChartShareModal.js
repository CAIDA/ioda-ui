import React, {PureComponent} from 'react';
import PropTypes from "prop-types";

class ChartShareModal extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {

        };
    }

    componentDidUpdate(prevProps) {

    }



    render() {
        return(
            <div className="modal">
                <div className="modal__background"></div>
                <div className="modal__window">
                    <div className="modal__row">
                        <div className="modal__heading">
                            <div className="modal__heading-title">
                                <h2 className="heading-h2">{this.props.entityName}</h2>
                            </div>
                            <button className="modal__button" onClick={() => this.props.toggleModal()}>
                                ×
                            </button>
                        </div>
                    </div>
                    <div className="modal__content">
                        <div className="row">
                            <img src={this.props.imageFile} alt={this.props.entityName} style={{width: '100%', height: 'auto'}}/>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

ChartShareModal.propTypes = {

};

export default ChartShareModal;
