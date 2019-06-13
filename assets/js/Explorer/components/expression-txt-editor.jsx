import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';
import ExpressionSet from "../expression/set";

const KEYPRESS_DAMPER_DELAY = 400; //ms. How long to wait for a typing gap before evaluating expression and propagate changes

class ExpressionTxtEditor extends React.Component {
    static propTypes = {
        expressionSet: PropTypes.instanceOf(ExpressionSet),
        onChange: PropTypes.func,
        onValidStateChange: PropTypes.func
    };

    static defaultProps = {
        expressionSet: new ExpressionSet(),
        onChange: function (newExpression) { },
        onValidStateChange: function (newState) { }
    };

    state = {
        expTxt: this.props.expressionSet.getCanonicalStr(true),
        isValid: !!this.props.expressionSet
    };

    componentDidUpdate(prevProps, prevState) {
        var curExp = this._createExpressionSet();
        if (!this.props.expressionSet.equals(prevProps.expressionSet)
            && (!curExp || !this.props.expressionSet.equals(curExp))) {
            this.setState({
                expTxt: this.props.expressionSet.getCanonicalStr(true),
                isValid: !!this.props.expressionSet
            });
        }

        if (prevState.isValid !== this.state.isValid) {
            this.props.onValidStateChange(this.state.isValid);
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        // Performance boost
        return (nextState.isValid !== this.state.isValid)
            || (nextState.expTxt !== this.state.expTxt)
            || !nextProps.expressionSet.equals(this.props.expressionSet);
    }

    render() {
        return <div className="charthouse-expression-txt-editor">
            <samp
                className={classNames('form-group', {'has-error': !this.state.isValid})}>
                    <textarea
                        ref="expTxt"
                        className="form-control"
                        rows="8"
                        placeholder={'Write an expression...\ne.g.: scale(my.favorite.target, 10)'}
                        value={this.state.expTxt}
                        onChange={this._onExpTxtChange}
                        onKeyUp={this._onKeyUp}
                    />
            </samp>
        </div>
    }

    _onExpTxtChange = (e) => {
        this.setState({expTxt: e.target.value});
    };

    // Private methods
    _onKeyUp = (e) => {
        if ([16, 17, 18, 20, 27, 33, 34, 35, 36, 37, 38, 39, 40].indexOf(e.keyCode) != -1) return; // Just navigation

        // Wait for user to pause typing
        if (this.keyPressDamper !== false)
            clearTimeout(this.keyPressDamper);

        this.keyPressDamper = setTimeout(
            this._evalExpression,
            KEYPRESS_DAMPER_DELAY
        );
    };

    _evalExpression = () => {
        const set = this._createExpressionSet();
        this.setState({isValid: !!set});
        if (set) {
            this.props.onChange(set);
        }
    };

    _createExpressionSet = () => {
        try {
            return ExpressionSet.createFromCanonicalStr(this.state.expTxt);
        } catch (err) {
            if (err instanceof TypeError) {
                return false;
            } else {
                throw err;
            }
        }
    };

    // Public methods
    isValid = () => {
        return this.state.isValid;
    };

    injectExpression = (exp) => {
        if (!this.state.isValid)
            return; // Can't append

        var newExp = this._createExpressionSet();
        if (newExp) {
            newExp.addExpression(exp);
            this.setState({expTxt: newExp.getCanonicalStr(true)});
            this._evalExpression();
        }
    };
}

export default ExpressionTxtEditor;
