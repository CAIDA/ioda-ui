import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';
import 'jstree';
import 'jstree/dist/themes/default/style.css';
import 'font-awesome/css/font-awesome.css';

import '../utils/proto-mods';

class FunctionTree extends React.Component {
    static propTypes = {
        functionSpecs: PropTypes.object.isRequired,
        filterBy: PropTypes.string,
        onFunctionClick: PropTypes.func,
        onFunctionHover: PropTypes.func,
        onFunctionDehover: PropTypes.func
    };

    static defaultProps = {
        filterBy: null,
        onFunctionClick: function (funcId) {},
        onFunctionHover: function (funcId) {},
        onFunctionDehover: function (funcId) {}
    };

    componentDidMount() {
        const rThis = this;

        // Wrapped jQuery plugin
        this.$tree = $(ReactDOM.findDOMNode(this.refs.functionTree));

        this.$tree.jstree({
            "core": {
                "check_callback": true,
                themes: {
                    //stripes: true
                    variant: "small",
                    dots: false
                },
                data: specs2tree(rThis.props.functionSpecs)
            },
            types: {
                function: {
                    icon: "glyphicon glyphicon-cog"
                },
                tagGroup: {
                    icon: "fa fa-folder-open"
                }
            },
            search: {
                show_only_matches: true,
                fuzzy: false,
                case_sensitive: false,
                search_leaves_only: true,
                close_opened_onclear: true,
                search_callback: function (str, node) {
                    // Matches name or id
                    return node.data
                        && (node.data.id + '|' + node.data.name).toLowerCase().indexOf(str.toLowerCase()) != -1;
                }
            },
            plugins: ["types", "search"]
        });

        this.$tree.delegate(".jstree-open>a", "click.jstree", function (e) {
            $.jstree.reference(this).close_node(this, false, false);
        })
            .delegate(".jstree-closed>a", "click.jstree", function (e) {
                $.jstree.reference(this).open_node(this, false, false);
            });

        // Node/leaf selected
        this.$tree.bind("select_node.jstree", function (e, data) {
            if (data.node.type != "function") return; // Ignore tag folder selection
            rThis.props.onFunctionClick(data.node.data.id);
        });

        // Node/leaf hover
        this.$tree.bind("hover_node.jstree", function (e, data) {
            if (data.node.type === "function") {
                rThis.props.onFunctionHover(data.node.data.id);
            }
            // TODO: add hover/dehover for tag groups (show descr)
        });

        // Node/leaf hover
        this.$tree.bind("dehover_node.jstree", function (e, data) {
            if (data.node.type != "function") return; // Ignore folder dehover
            rThis.props.onFunctionDehover(data.node.data.id);
        });

        if (this.props.filterBy) {
            this.$tree.on('ready.jstree', function (e, data) {
                data.instance.search(rThis.props.filterBy);
            });
        }

        //

        function specs2tree(specs) {

            const tags = specs.tags;
            const byTag = indexByTag(specs.prototypes);

            return Object.keys(byTag).sort().map(function (tag) {
                return {
                    text: tags[tag].name,
                    data: $.extend({id: tag}, tags[tag]),
                    type: 'tagGroup',
                    children: byTag[tag].map(func2tree)
                }
            });

            //

            function func2tree(func) {
                return {
                    text: specs.prototypes[func].title,
                    data: $.extend({id: func}, specs[func]),
                    type: 'function',
                    children: false
                };
            }
        }

        function indexByTag(protos) {

            const byTag = {};

            Object.keys(protos)
                .sort(function (a, b) {
                    return protos[a].title.alphanumCompare(protos[b].title);
                })
                .forEach(function (func) {
                    protos[func].tags.forEach(function (tag) {
                        if (!byTag.hasOwnProperty(tag)) {
                            byTag[tag] = [];
                        }
                        byTag[tag].push(func);
                    });
                });

            return byTag;
        }
    }

    componentDidUpdate(oldProps) {
        if (this.props.filterBy != oldProps.filterBy) {
            this.$tree.jstree(true).search(this.props.filterBy || '');
        }
    }

    componentWillUnmount() {
        // Destroy jQuery plugin
        var $elem = $(ReactDOM.findDOMNode(this.refs.functionTree));
        $.removeData($elem.get(0));
    }

    render() {
        return <div ref="functionTree"/>;
    }

    getFirstVisibleFunction = () => {
        var $tree = this.$tree;
        var topLeaf;
        $tree.jstree('get_node', '#').children_d.some(function (c) {
            var node = $tree.jstree('get_node', c);
            if (node.type == 'function' && $('#' + c).is(':visible')) {
                topLeaf = node.data.id;
                return true; // Break out of loop
            }
        });
        return topLeaf;
    };
}

class FunctionInfo extends React.Component {
    static propTypes = {
        funcProtos: PropTypes.object
    };

    static defaultProps = {
        funcProtos: null
    };

    render() {
        var func = this.props.funcProtos;

        // Empty
        if (!func) return <div/>;

        var hasMultiple = func.parameters.some(function (arg) {
            return arg.multiple;
        });

        return <div>
            <h3>{func.title}</h3>
            <p>({func.id})</p>
            <small style={{marginLeft: 10}}>{func.description}</small>
            <h4>Arguments (
                {func.parameters.length}
                {hasMultiple ? ' [*]' : ''}
                )
                {func.parameters.length ? ':' : ''}
            </h4>
            {func.parameters.map(function (arg) {
                return <div key={arg.name}>
                    {arg.multiple ? '* ' : ''}
                    <b>{arg.name}</b> ({arg.type})
                    {arg.mandatory ? '' : ' [optional]'}
                    <br/>
                    <small className="small" style={{marginLeft: 10}}>
                        {arg.description}
                    </small>
                </div>;
            })}
        </div>;
    }
}

// Main component
class FunctionBrowser extends React.Component {
    static propTypes = {
        functionSpecs: PropTypes.object.isRequired,
        initSearch: PropTypes.string,
        initHighlight: PropTypes.string,
        onFunctionSelected: PropTypes.func
    };

    static defaultProps = {
        initSearch: '',
        initHighlight: null,
        onFunctionSelected: function (funcId) {
        }
    };

    state = {
        search: this.props.initSearch,
        highlightFunction: this.props.initHighlight
    };

    componentDidMount() {
        this._isMounted = true;
        // Allow time for dom to be built, say on an animated modal, before setting focus on the search bar
        var rThis = this;
        setTimeout(function () {
            ReactDOM.findDOMNode(rThis.refs.SearchBox).focus();
        }, 500);
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    _handleSearchChange = (event) => {
        this.setState({search: event.target.value});
    };

    _handleSearchKeyPress = (event) => {
        if (event.key == 'Enter' && this.state.search.length) {
            // Auto-select first match on enter
            var funcId = this.refs.FunctionTree.getFirstVisibleFunction();
            if (funcId) this.props.onFunctionSelected(funcId);
        }
    };

    render() {
        var rThis = this;

        function highlight(funcId) {
            if (rThis._isMounted)
                rThis.setState({highlightFunction: funcId});
        }

        return <div
            style={{fontSize: 14}}
        >
            <input type="text"
                   ref="SearchBox"
                   className="form-control input-sm"
                   placeholder="Search"
                   style={{
                       'marginRight': 0,
                       'marginLeft': 'auto',
                       'width': 150,
                       'height': 25
                   }}
                   value={this.state.search}
                   onChange={this._handleSearchChange}
                   onKeyDown={this._handleSearchKeyPress}
            />
            <div className="row">
                <div className="col-sm-5">
                    <FunctionTree
                        ref="FunctionTree"
                        functionSpecs={this.props.functionSpecs}
                        filterBy={this.state.search || null}
                        onFunctionClick={this.props.onFunctionSelected}
                        onFunctionHover={highlight}
                        onFunctionDehover={function () {
                            highlight(null);
                        }}
                    />
                </div>
                <div className="col-sm-7">
                    <FunctionInfo
                        funcProtos={this.state.highlightFunction
                            ? $.extend(
                                {id: this.state.highlightFunction},
                                this.props.functionSpecs.prototypes[this.state.highlightFunction]
                            )
                            : null
                        }
                    />
                </div>
            </div>
        </div>;
    }
}

export default FunctionBrowser;
