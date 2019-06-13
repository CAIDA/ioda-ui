import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';
import ReactDOMServer from 'react-dom/server';
import $ from 'jquery';
import 'jstree';
import 'jstree/dist/themes/default/style.css';
import 'font-awesome/css/font-awesome.css';

import Dialog from './dialog';
import DataApi from '../connectors/data-api';
import HeirarchyExplorer from './hierarchy-explorer';
import FunctionBrowser from './function-browser';
import ExpressionSet from "../expression/set";
import ExpressionFactory from "../expression/factory";
import FunctionExpression from "../expression/function";
import ConstantExpression from "../expression/constant";
import PathExpression from "../expression/path";

// TODO: this tree still uses a lot of json hax instead of using Expression objects directly

const CHANGE_DAMPER_DELAY = 100; //ms. How long to wait for other chained events before triggering a global change

class ExpressionTree extends React.Component {
    static propTypes = {
        expressionSet: PropTypes.instanceOf(ExpressionSet),
        onChange: PropTypes.func,
        onSelectionChange: PropTypes.func,
        icons: PropTypes.object
    };

    static defaultProps = {
        expressionSet: new ExpressionSet(),
        onChange: function (newExpression) { },
        onSelectionChange: function ($selectedNodes) { },
        icons: {
            func: "glyphicon glyphicon-cog",
            path: "fa fa-leaf",
            constant: "charthousicon-constant"
        }
    };

    state = {
        functionSpecs: null
    };

    componentDidMount() {
        var rThis = this;

        // Wrapped jQuery plugin
        var $tree = (this.$tree = $(ReactDOM.findDOMNode(this.refs.ExpressionTree)));

        $tree.jstree({
            core: {
                check_callback: true,
                themes: {
                    //stripes: true
                    variant: "small",
                    dots: true
                }
            },
            types: {
                function: {
                    icon: "folder-color " + this.props.icons.func
                },
                path: {
                    icon: "leaf-color " + this.props.icons.path,
                    valid_children: "none"
                },
                constant: {
                    icon: "leaf-color " + this.props.icons.constant,
                    valid_children: "none"
                }
            },
            dnd: {
                check_while_dragging: true
            },
            plugins: ["types", "dnd"]
        });

        // Event handlers //

        // Node selected
        var _selectedNodeId;
        $tree.bind("select_node.jstree", function (e, data) {
            if (_selectedNodeId == data.node.id) { // Toggle selection on click selected node
                $tree.jstree('deselect_node', data.node);
                _selectedNodeId = null;
            } else {
                _selectedNodeId = data.node.id;
            }
            rThis.props.onSelectionChange(rThis.getSelected());
        });

        // Node double-clicked -> edit node
        $tree.bind("dblclick.jstree", function (e, data) {
            var nodeId = $(e.target).closest("li").attr('id');
            rThis.editNode(nodeId);
        });

        // Update constant data on edit
        $tree.on('set_text.jstree', function (event, evData) {
            var node = evData.obj;
            if (node.type == 'constant') {
                node.text = htmlDecode(node.text);
                node.data.value = node.text.trim();
                node.data.value = (!node.data.value.length || isNaN(node.data.value)) // Store numbers without quotes
                    ? node.data.value
                    : parseFloat(node.data.value);
            }

            // Use jQuery to decode html chars (&amp; > & , etc)
            function htmlDecode(str) {
                return $('<span>').html(str).text();
            }
        });

        // Prevent propagation up the dom of constant text edit events
        $tree.on('change', function (event) {
            event.stopPropagation();
        });

        // Trigger expression changes
        var changeEventDamper = false;
        $tree.on('create_node.jstree move_node.jstree delete_node.jstree rename_node.jstree', function (event, target) {
            // Ignore adding empty constants
            if (target.node.type == "constant" && event.type == "create_node" && !target.node.text) return;

            if (changeEventDamper !== false)
                clearTimeout(changeEventDamper);
            changeEventDamper = setTimeout(
                function () {
                    rThis.props.onChange(rThis._getExpressionSet());
                    rThis._refreshArgsCounters();
                },
                CHANGE_DAMPER_DELAY
            );
        });

        // Deselect children nodes when closing folders, to avoid occlusion operation problems
        $tree.on('close_node.jstree', function (event, target) {
            rThis._getAllChildrenNodes(target.node).filter(function (c) {
                return c.state.selected;
            }).forEach(function (c) {
                $tree.jstree(true).deselect_node(c, false);
            });
            rThis.props.onSelectionChange(rThis.getSelected());
        });

        /////

        if (this.props.expressionSet) {
            this.props.expressionSet.getExpressions().forEach(this.addExpression);
        }

        this._loadFunctionSpecs();
    }

    componentDidUpdate(prevProps) {
        if (!this.props.expressionSet.equals(prevProps.expressionSet)
            && !this.props.expressionSet.equals(this._getExpressionSet())) {
            // Expression changed
            this._clear();
            this.props.expressionSet.getExpressions().forEach(this.addExpression);
        }
    }

    componentWillUnmount() {
        // Destroy jQuery plugin
        var $elem = $(ReactDOM.findDOMNode(this.refs.ExpressionTree));
        $.removeData($elem.get(0));
    }

    render() {
        return <div
            className="expression-tree"
            ref="ExpressionTree"
        />;
    }

    // Private methods
    _loadFunctionSpecs = () => {
        var rThis = this;
        var apiConnector = new DataApi();

        apiConnector.getFunctionSpecs(
            function (json) {
                rThis.setState({functionSpecs: json.data});

                // Refresh function descriptions already in tree
                rThis._getAllChildrenNodes()
                    .filter(function (n) {
                        return (n.type == 'function');
                    })
                    .forEach(function (n) {
                        rThis.$tree.jstree(true).rename_node(
                            n.id,
                            rThis._buildFunctionNodeHtml(n.data.func, n.data.args)
                        );
                    });

            },
            function () { // Error handle
            }
        );
    };

    _refreshArgsCounters = () => {
        var rThis = this;
        var $tree = this.$tree;
        this._getAllChildrenNodes()
            .filter(function (n) {
                return (n.type == 'function' && n.children.length != n.data.args);
            })
            .forEach(function (n) {
                n.data.args = n.children.length;
                $tree.jstree(true).rename_node(
                    n.id,
                    rThis._buildFunctionNodeHtml(n.data.func, n.data.args)
                );
            });
    };

    _buildFunctionNodeHtml = (func, nArgs) => {
        var specTxt = '';

        if (this.state.functionSpecs &&
            this.state.functionSpecs.prototypes.hasOwnProperty(func)) {
            var spec = this.state.functionSpecs.prototypes[func];

            specTxt = spec.title + ': ' + func + '('
                + spec.parameters.map(function (arg) {
                    var argTxt = '<' + arg.type + '> ' + (arg.multiple ? '✲' : '') + arg.name;
                    return arg.mandatory ? argTxt : ('[' + argTxt + ']');
                }).join(', ')
                + ')';
        }

        return ReactDOMServer.renderToStaticMarkup(<span title={specTxt}>{func}</span>)
            + '('
            + ReactDOMServer.renderToStaticMarkup(<span
                className="badge"
                title={'Function has ' + nArgs + ' argument' + (nArgs == 1 ? '' : 's')}
            >{nArgs}</span>)
            + ')';
    };

    _expression2tree = (exp) => {
        const rThis = this;
        return json2tree(exp.getJson());

        function json2tree(json) {
            if (json == null) {
                return [];
            }

            if (!json) {
                return json;
            }

            // Array
            if ($.isArray(json)) {
                return json.map(json2tree);
            }

            // Obj
            switch (json.type) {
                case 'constant':
                    return {
                        text: "" + json.value,
                        data: json,
                        type: 'constant',
                        children: false
                    };
                case 'path':
                    return {
                        text: json.path,
                        data: json,
                        type: 'path',
                        children: false
                    };
                case 'function':
                    var args = $.isArray(json.args) ? json.args : [json.args];
                    var data = $.extend({}, json, {args: json.args.length}); // Bind only number of args in the data

                    return {
                        text: rThis._buildFunctionNodeHtml(data.func, data.args),
                        data: data,
                        type: 'function',
                        children: json2tree(args),
                        state: {
                            opened: false
                        }
                    }
            }
        }
    };

    _tree2expression = ($tree, nodeId, asSet) => {

        nodeId = nodeId || '#';
        nodeId = nodeId.hasOwnProperty('id') ? nodeId.id : nodeId;

        var tree = $tree.jstree(true);

        const json = node2json(tree.get_node(nodeId));
        if (!json) {
            return new ExpressionSet();
        }
        if (!Array.isArray(json)) {
            throw new TypeError("Ensure node2json always returns an array");
        }
        if (asSet) {
            return ExpressionSet.createFromJsonArray(json);
        } else {
            if (json.length !== 1) {
                throw new TypeError(`Expecting a single expression, but found ${json.length}`);
            }
            return ExpressionFactory.createFromJson(json[0]);
        }

        //

        function node2json(node) {

            if (node.id == '#') { // Root level
                var rootData = node.children.map(function (childId) {
                    return node2json(tree.get_node(childId));
                }).filter(function (c) {
                    return c != null;
                });
                return rootData.length === 0
                    ? null           // Empty
                    : rootData; // Return single element
            }

            if (node.type == 'default') { // Just default folder with values
                return node.children.map(function (childId) {
                    return node2json(tree.get_node(childId));
                }).filter(function (c) {
                    return c != null;
                });
            }

            if (node.data.type == 'function') {
                return $.extend(
                    true,
                    {},
                    node.data,
                    {
                        args: node.children.map(function (childId) {
                            return node2json(tree.get_node(childId));
                        }).filter(function (c) {
                            return c != null;
                        })
                    }
                );
            }

            if (node.data.type == 'constant') {
                if ((typeof node.data.value === 'string') && !node.data.value.length) return null; // Ignore empty constants
            }

            // All other types
            return $.extend(true, {}, node.data);
        }
    };

    _getExpressionSet = (nodeId) => {
        return this._tree2expression(this.$tree, nodeId, true);
    };

    _getAllChildrenNodes = (parentId, dfs) => {

        dfs = dfs || false; // DFS or BFS
        parentId = parentId || '#';

        var rThis = this;
        var $tree = this.$tree;
        var parent = $tree.jstree('get_node', parentId);

        if (!parent.children) return [];

        var children = [];
        if (dfs) {
            parent.children.forEach(function (cId) {    // DFS mode
                children.push($tree.jstree('get_node', cId));
                children.push.apply(children, rThis._getAllChildrenNodes(cId, dfs));
            });
        } else {
            children = parent.children.map(function (cId) { // BFS mode
                return $tree.jstree('get_node', cId);
            });
            parent.children.forEach(function (cId) {
                children.push.apply(children, rThis._getAllChildrenNodes(cId, dfs))
            });
        }

        return children;
    };

    _clear = () => {
        var $tree = this.$tree;
        var root = $tree.jstree('get_node', '#');
        root.children.map(function (c) {
            return c;
        }).forEach(function (c) {
            $tree.jstree('delete_node', c);
        });
    };

    _addNode = (nodeJson, parentId, inline) => {
        var $tree = this.$tree;
        parentId = $tree.jstree('get_node', parentId || '#'); // Add to root by default
        inline = inline || false; // Whether to insert after or add inside (default)
        var newNodeIds = [];
        ($.isArray(nodeJson) ? nodeJson : [nodeJson]).forEach(function (node) {
            newNodeIds.push($tree.jstree(true).create_node(parentId, node, inline ? 'after' : 'last'));
        });
        return newNodeIds.length == 1 ? newNodeIds[0] : newNodeIds;
    };

    _moveNodes = (nodeIds, newParentId, inline) => {
        newParentId = this.$tree.jstree('get_node', newParentId || '#'); // Move to root by default
        inline = inline || false; // Whether to move after or inside (default)
        this.$tree.jstree(true).move_node(nodeIds, newParentId, inline ? 'after' : 'last');
    };

    // Public methods
    getErrors = () => {

        var $tree = this.$tree;
        var functionProtos = this.state.functionSpecs && this.state.functionSpecs.prototypes;

        if (!functionProtos || !Object.keys(functionProtos).length) return null; // Can't validate

        var errors = [];

        this._getAllChildrenNodes()
            .filter(function (n) {
                return n.type == 'function';
            })
            .forEach(function (func) {
                var name = func.data.func;
                if (!functionProtos.hasOwnProperty(name)) {
                    errors.push('Unrecognized function: ' + name + '()');
                } else {
                    const spec = functionProtos[name];
                    const params = spec.parameters;
                    var mandatoryArgs = params.filter(function (arg) {
                        return arg.mandatory;
                    }).length;
                    var hasMultiple = params.some(function (arg) {
                        return arg.multiple;
                    });
                    if (func.children.length < mandatoryArgs) {
                        errors.push(name + '() is missing ' + (mandatoryArgs - func.children.length) + ' mandatory arguments');
                    }
                    if (func.children.length > params.length && !hasMultiple) {
                        errors.push(name + '() has too many arguments (should be max ' + params.length + ')');
                    }
                    for (var i = 0, len = func.children.length; i < len; i++) {

                        var child = $tree.jstree('get_node', func.children[i]);
                        var argType = params[Math.min(i, params.length - 1)].type;
                        if (i >= params.length && !hasMultiple && child.data) {
                            argType = child.data.type
                        }

                        if (
                            (argType == 'timeSeries' && child.data && child.data.type == 'constant') ||
                            (
                                (argType == 'number' || argType == 'string') &&
                                (
                                    (child.data.type != 'constant') ||
                                    (argType == 'number' && isNaN(child.data.value))
                                )
                            )
                        ) {
                            errors.push(name + "'s argument " + (i + 1) + " should be of type " + argType);
                        }
                    }
                }
            });

        return errors;
    };

    getSelected = (dfs) => {
        return this._getAllChildrenNodes('#', dfs)
            .filter(function (n) {
                return n.state.selected;
            });
    };

    addExpression = (exp, parentId, inline) => {
        return this._addNode(this._expression2tree(exp), parentId, inline);
    };

    addFunction = (parentId, inline, callback) => {
        parentId = parentId || '#';
        parentId = parentId.hasOwnProperty('id') ? parentId.id : parentId;

        var rThis = this;
        var $anchor = $('<span>');
        var rModal = ReactDOM.render(
            <Dialog
                title="Choose a function"
                onClose={function () {
                    // GC rogue modal
                    ReactDOM.unmountComponentAtNode($anchor[0]);
                }}
            >
                <FunctionBrowser
                    functionSpecs={this.state.functionSpecs}
                    onFunctionSelected={
                        function (func) {
                            rModal.close();
                            var newNode = rThis.addExpression(
                                new FunctionExpression(func),
                                parentId,
                                inline
                            );
                            if (callback) callback(newNode);
                        }
                    }
                />
            </Dialog>,
            $anchor[0]
        );
    };

    addConstant = (parentId, inline) => {
        parentId = parentId || '#';
        parentId = parentId.hasOwnProperty('id') ? parentId.id : parentId;

        var nodeId = this.addExpression(new ConstantExpression(''),
            parentId,
            inline
        );
        this.editNode(nodeId);
    };

    wrapInFunction = (nodeId, callback) => {
        // Also accepts multiple nodes as an array

        var rThis = this;
        var $tree = this.$tree;
        var nodesToMove = nodeId ? (Array.isArray(nodeId) ? nodeId : [nodeId]) : [];
        nodesToMove = nodesToMove.map(function (n) {
            return n.hasOwnProperty('id') ? n.id : n;
        });

        var rootLevel = !nodesToMove.length; // Wrap root nodes in function
        if (rootLevel) nodesToMove.push($tree.jstree(true).get_node('#').children);
        var nodeToMoveTo = rootLevel ? '#' : nodesToMove[0];

        this.addFunction(nodeToMoveTo, !rootLevel, function (funcId) {
            rThis._moveNodes(nodesToMove, funcId);
            $tree.jstree(true).open_node(funcId);
            if (callback) callback(funcId);
        });
    };

    popOut = (nodeId) => {
        var nodes = nodeId ? (Array.isArray(nodeId) ? nodeId : [nodeId]) : [];
        var nodeIds = nodes.map(function (n) {
            return n.hasOwnProperty('id') ? n.id : n;
        });
        var $tree = this.$tree;
        nodeIds.forEach(function (n) {
            var parentId = $tree.jstree('get_node', n).parent;
            if (parentId == '#') return; // Already at top level
            $tree.jstree(true).move_node(n, parentId, 'before');
        });
    };

    editNode = (nodeId) => {
        nodeId = nodeId.hasOwnProperty('id') ? nodeId.id : nodeId;

        var rThis = this;
        var tree = this.$tree.jstree(true);
        var $node = tree.get_node(nodeId);
        switch ($node.type) {
            case "function":
                var $anchor = $('<span>');
                var rModal = ReactDOM.render(
                    <Dialog
                        title={'Change function: ' + $node.data.func}
                        onClose={function () {
                            // GC rogue modal
                            ReactDOM.unmountComponentAtNode($anchor[0]);
                        }}
                    >
                        <FunctionBrowser
                            functionSpecs={this.state.functionSpecs}
                            initHighlight={$node.data.func}
                            onFunctionSelected={
                                function (func) {
                                    rModal.close();
                                    tree.rename_node($node, rThis._buildFunctionNodeHtml(func, $node.data.args));
                                    $node.data.func = func;
                                }
                            }
                        />
                    </Dialog>,
                    $anchor[0]
                );

                break;
            case "path":
                var $anchor = $('<span>');
                var rModal = ReactDOM.render(
                    <Dialog
                        title={'Edit metric: ' + $node.text}
                        onClose={function () {
                            // GC rogue modal
                            ReactDOM.unmountComponentAtNode($anchor[0]);
                        }}
                    >
                        <HeirarchyExplorer
                            initExpandPath={[new PathExpression($node.data.path)]}
                            onLeafSelected={
                                function (id) {
                                    rModal.close();
                                    tree.rename_node($node, id);
                                    $node.data = new PathExpression(id).getJson();
                                }
                            }
                        />
                    </Dialog>,
                    $anchor[0]
                );

                break;
            case "constant":
                // Is it already being edited?
                if (!$('#' + nodeId, this.$tree).find('input').length) {
                    tree.edit(nodeId);
                }
                break;
        }
    };

    cloneNode = (nodeId) => {
        // Also accepts multiple nodes as an array
        var nodes = Array.isArray(nodeId) ? nodeId : [nodeId];
        var nodeToAppendAfter = nodes[nodes.length - 1]; // Last node in selection
        nodeToAppendAfter = nodeToAppendAfter.hasOwnProperty('id') ? nodeToAppendAfter.id : nodeToAppendAfter;

        var rThis = this;
        var $tree = this.$tree;
        nodes.reverse().forEach(function (node) {
            nodeId = node.hasOwnProperty('id') ? node.id : node;
            rThis.addExpression(
                rThis._tree2expression($tree, nodeId),
                nodeToAppendAfter,
                true
            );
        });
    };

    removeNode = (nodeId) => {
        // Accepts multiple nodes as an array too
        var nodes = Array.isArray(nodeId) ? nodeId : [nodeId];
        nodes = nodes.map(function (n) {
            return n.hasOwnProperty('id') ? n.id : n;
        });
        this.$tree.jstree(true).delete_node(nodes);
    };
}

export default ExpressionTree;
