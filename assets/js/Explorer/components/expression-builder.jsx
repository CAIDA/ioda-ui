import PropTypes from 'prop-types';
import React from 'react';
import { Button } from 'react-bootstrap';
import $ from 'jquery';
import 'font-awesome/css/font-awesome.css';

import ExpressionTree from './expression-tree';
import ExpressionSet from "../expression/set";

class ToolbarBtn extends React.Component {
    static propTypes = {
        enabled: PropTypes.bool,
        title: PropTypes.string,
        onClick: PropTypes.func
    };

    static defaultProps = {
        enabled: true,
        title: '',
        onClick: function () {
        }
    };

    render() {
        return <Button
            bsStyle='primary'
            bsSize='xsmall'
            title={this.props.title}
            disabled={!this.props.enabled}
            onClick={this.props.onClick}
        >
            {this.props.children}
        </Button>;
    }
}

const BTN_STATES = [
    {
        btnState: 'enApplyFunction',
        unselected: true,   // show if nothing selected
        rootlevel: true,    // show if selection is all at root level
        multinode: true,    // show if there's more than one node selected
        multitype: true,    // show if there's more than one node type selected
        function: true,     // show if there's a function selected
        path: true,         // show if there's a path selected
        constant: true      // show if there's a constant selected
    },
    {
        btnState: 'enUnwrapFunction',
        unselected: false,
        rootlevel: true,
        multinode: true,
        multitype: false,
        function: true,
        path: false,
        constant: false
    },
    {
        btnState: 'enOutdentNode',
        unselected: false,
        rootlevel: false,
        multinode: true,
        multitype: true,
        'function': true,
        path: true,
        constant: true
    },
    {
        btnState: 'enAddConstant',
        unselected: true,
        rootlevel: true,
        multinode: false,
        multitype: false,
        'function': true,
        path: true,
        constant: true
    },
    {
        btnState: 'enEditNode',
        unselected: false,
        rootlevel: true,
        multinode: false,
        multitype: false,
        'function': true,
        path: true,
        constant: true
    },
    {
        btnState: 'enCloneNode',
        unselected: false,
        rootlevel: true,
        multinode: true,
        multitype: true,
        'function': true,
        path: true,
        constant: true
    },
    {
        btnState: 'enRemoveNode',
        unselected: false,
        rootlevel: true,
        multinode: true,
        multitype: true,
        'function': true,
        path: true,
        constant: true
    }
];

class ExpressionToolbar extends React.Component {
    static propTypes = {
        currentSelection: PropTypes.object,
        icons: PropTypes.object,
        onApplyFunction: PropTypes.func,
        onUnwrapFunction: PropTypes.func,
        onOutdentNode: PropTypes.func,
        onAddConstant: PropTypes.func,
        onEditNode: PropTypes.func,
        onCloneNode: PropTypes.func,
        onRemoveNode: PropTypes.func
    };

    static defaultProps = {
        currentSelection: {
            nodeTypes: [],      // Type of nodes selected
            multiNodes: false,  // Multiple nodes selected
            rootLevel: true     // Selection is all at root level
        },
        icons: {
            func: "glyphicon glyphicon-cog",
            path: "fa fa-leaf",
            constant: "charthousicon-constant"
        },
        onApplyFunction: function () {
        },
        onUnwrapFunction: function () {
        },
        onOutdentNode: function () {
        },
        onAddConstant: function () {
        },
        onEditNode: function () {
        },
        onCloneNode: function () {
        },
        onRemoveNode: function () {
        }
    };

    componentDidUpdate(prevProps) {
        if (JSON.stringify(this.props.currentSelection) != JSON.stringify(prevProps.currentSelection)) {
            // If selection changed, update button state
            this.setState(this._calcBtnState());
        }
    }

    _calcBtnState = () => {

        var currentSelection = $.extend({
            nodeTypes: [],
            multiNodes: false,
            rootLevel: true
        }, this.props.currentSelection || {});
        currentSelection.nodeTypes = currentSelection.nodeTypes.map(function (t) {
            return t.toLowerCase();
        });
        if (!currentSelection.nodeTypes.length) currentSelection.nodeTypes.push('unselected');

        var onBtns = BTN_STATES;

        if (currentSelection.rootLevel)
            onBtns = onBtns.filter(function (btn) {
                return btn.rootlevel;
            });
        if (currentSelection.multiNodes)
            onBtns = onBtns.filter(function (btn) {
                return btn.multinode;
            });
        if (currentSelection.nodeTypes.length > 1)
            onBtns = onBtns.filter(function (btn) {
                return btn.multitype;
            });

        currentSelection.nodeTypes.forEach(function (t) {
            onBtns = onBtns.filter(function (btn) {
                return btn[t];
            });
        });

        var btnState = {};

        // Switch them all off
        BTN_STATES.forEach(function (btn) {
            btnState[btn.btnState] = false;
        });

        // Switch some on
        onBtns.forEach(function (btn) {
            btnState[btn.btnState] = true;
        });

        return btnState;
    };

    state = this._calcBtnState();

    render() {
        return <div className="expression-toolbar">
            <div
                className="btn-group btn-group-xs"
                style={{
                    marginLeft: 'auto',
                    marginRight: 3
                }}
            >
                <ToolbarBtn title='Apply function'
                            onClick={this.props.onApplyFunction}
                            enabled={this.state.enApplyFunction}>
                    <i className={this.props.icons.func}/> f(x)
                </ToolbarBtn>
                <ToolbarBtn title='Unwrap and destroy function'
                            onClick={this.props.onUnwrapFunction}
                            enabled={this.state.enUnwrapFunction}>
                    <i className='fa fa-ban'/> <i className='fa fa-cogs'/>
                </ToolbarBtn>
                <ToolbarBtn title='Pop element one level'
                            onClick={this.props.onOutdentNode}
                            enabled={this.state.enOutdentNode}>
                    <i className='fa fa-level-up fa-flip-horizontal'/> ( )
                </ToolbarBtn>
            </div>

            <div
                className="btn-group btn-group-xs"
                style={{
                    marginLeft: 3,
                    marginRight: 3
                }}
            >
                <ToolbarBtn title='Add a constant value'
                            onClick={this.props.onAddConstant}
                            enabled={this.state.enAddConstant}>
                    <i className='glyphicon glyphicon-plus'/><i
                    className={this.props.icons.constant}/>
                </ToolbarBtn>
            </div>

            <div
                className="btn-group btn-group-xs"
                style={{
                    marginLeft: 3,
                    marginRight: 'auto'
                }}
            >
                <ToolbarBtn title='Edit [double-click on element]'
                            onClick={this.props.onEditNode}
                            enabled={this.state.enEditNode}>
                    <i className='glyphicon glyphicon-pencil'/>
                </ToolbarBtn>
                <ToolbarBtn title='Clone' onClick={this.props.onCloneNode}
                            enabled={this.state.enCloneNode}>
                    <i className='fa fa-copy'/>
                </ToolbarBtn>
                <ToolbarBtn title='Remove' onClick={this.props.onRemoveNode}
                            enabled={this.state.enRemoveNode}>
                    <i className='glyphicon glyphicon-trash'/>
                </ToolbarBtn>
            </div>
        </div>;
    }
}

class ErrorLogger extends React.Component {
    static propTypes = {
        errors: PropTypes.array
    };

    static defaultProps = {
        errors: []
    };

    render() {
        return <div className="expression-errors">
            {this.props.errors.map(function (error, idx) {
                return <div
                    key={idx}
                    className="alert alert-danger"
                >
                    <i className="fa fa-warning" style={{marginRight: 3}}/>
                    {error}
                </div>
            })}
        </div>;
    }
}

////

const ICONS = {
    func: "glyphicon glyphicon-cog",
    path: "fa fa-leaf",
    constant: "charthousicon-constant"
};

class ExpressionBuilder extends React.Component {
    static propTypes = {
        expressionSet: PropTypes.instanceOf(ExpressionSet),
        onChange: PropTypes.func,
        onValidStateChange: PropTypes.func
    };

    static defaultProps = {
        expressionSet: new ExpressionSet(),
        onChange: function (newExpression) {},
        onValidStateChange: function (newState) {}
    };

    state = {
        currentSelected: {
            nodeTypes: [],      // Type of nodes selected
            multiNodes: false,  // Multiple nodes selected
            rootLevel: true     // Selection is all at root level
        },
        isValid: true,
        errors: []
    };

    componentDidMount() {
        this._adjustToolbarState(this.refs.expressionTree.getSelected());

        // Log Errors
        var rThis = this;
        var nRetries = 10;
        var sleep = 250;
        (function fetchErrors() {
            var errors = rThis.refs.expressionTree.getErrors();
            if (errors != null) {
                success(errors);
            } else if (nRetries--) {
                // Can't parse yet, try again
                setTimeout(fetchErrors, sleep);
            }

            function success() {
                rThis.setState({
                    errors: errors,
                    isValid: !errors.length
                });
            }
        })();
    }

    componentDidUpdate(prevProps, prevState) {
        if (!prevProps.expressionSet.equals(this.props.expressionSet)) {
            this.componentDidMount();
        }

        if (prevState.isValid !== this.state.isValid) {
            this.props.onValidStateChange(this.state.isValid);
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        // Performance boost
        return (nextState.isValid !== this.state.isValid)
            || (JSON.stringify(nextState.errors) !== JSON.stringify(this.state.errors))
            || (JSON.stringify(nextState.currentSelected) !== JSON.stringify(this.state.currentSelected))
            || !nextProps.expressionSet.equals(this.props.expressionSet);
    }

    render() {
        return <div
            className="charthouse-expression-builder well well-sm"
            style={{borderColor: (!this.state.isValid ? 'red' : 'white')}}
        >
            <div className="text-center" style={{marginBottom: 10}}>
                <ExpressionToolbar
                    icons={ICONS}
                    currentSelection={this.state.currentSelected}
                    onApplyFunction={this._applyFunction}
                    onUnwrapFunction={this._unwrapFunction}
                    onOutdentNode={this._outdentNode}
                    onAddConstant={this._addConstant}
                    onEditNode={this._editNode}
                    onCloneNode={this._cloneNode}
                    onRemoveNode={this._removeNode}
                />
            </div>

            <ExpressionTree
                ref="expressionTree"
                expressionSet={this.props.expressionSet}
                onChange={this._expChanged}
                onSelectionChange={this._adjustToolbarState}
                icons={ICONS}
            />
            <p
                className="small text-center text-muted"
                style={{display: this.props.expressionSet.getSize() > 0 ? 'none' : false}}
            >
                Empty expression. Add metrics from the tree below...
            </p>
            <p
                className="text-center text-muted"
                style={{
                    fontSize: '65%',
                    marginBottom: 2
                }}
            >
                drag-and-drop to move expression elements
            </p>
            <ErrorLogger errors={this.state.errors}/>
        </div>;
    }

    // Private methods
    _expChanged = (exp) => {
        var errors = this.refs.expressionTree.getErrors();
        if (errors != null) {
            this.setState({
                errors: errors,
                isValid: !errors.length
            });
        }
        this.props.onChange(exp);
    };

    _adjustToolbarState = ($sel) => {
        var selTypes = {};
        $sel.forEach(function (t) {
            selTypes[t.type] = true;
        });

        var onlyRootLevel = $sel.every(function (t) {
            return t.parent == '#';
        });

        this.setState({
            currentSelected: {
                nodeTypes: Object.keys(selTypes),
                multiNodes: $sel.length > 1,
                rootLevel: onlyRootLevel
            }
        });
    };

    _applyFunction = () => {
        var rTree = this.refs.expressionTree;
        rTree.wrapInFunction(rTree.getSelected(true));
    };

    _unwrapFunction = () => {
        var rTree = this.refs.expressionTree;

        // Remove function layers
        rTree.getSelected(true).filter(function (n) {
            return n.type == 'function';
        }).forEach(function (n) {
            rTree.popOut(n.children);  // Pop out all function arguments
            rTree.removeNode(n);       // Remove function
        });
    };

    _outdentNode = () => {
        var rTree = this.refs.expressionTree;
        rTree.popOut(rTree.getSelected());
    };

    _addConstant = () => {
        var rTree = this.refs.expressionTree;
        var $sel = rTree.getSelected();
        if ($sel.length > 1) return;
        var $node = $sel.length > 0 ? $sel[0] : null;

        // Add inside for functions, otherwise next to it
        rTree.addConstant($node, !($node && $node.type == 'function'));
    };

    _editNode = () => {
        var rTree = this.refs.expressionTree;
        var $sel = rTree.getSelected();
        if ($sel.length != 1) return; // Can only edit one at a time

        rTree.editNode($sel[0]);
    };

    _cloneNode = () => {
        var rTree = this.refs.expressionTree;
        rTree.cloneNode(rTree.getSelected(true)); // Use DFS to append in order
    };

    _removeNode = () => {
        var rTree = this.refs.expressionTree;
        rTree.removeNode(rTree.getSelected());
    };

    // Public methods
    isValid = () => {
        return this.state.isValid;
    };

    injectExpression = (exp) => {
        var rTree = this.refs.expressionTree;
        var $sel = rTree.getSelected();
        var $node = $sel.length > 0 ? $sel[0] : null; // If multi selected, append to first

        // Add inside for functions, otherwise next to it
        rTree.addExpression(exp, $node, !($node && $node.type === 'function'));
    };
}

export default ExpressionBuilder;
