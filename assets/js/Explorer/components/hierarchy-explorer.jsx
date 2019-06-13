import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';
import _ from 'underscore';
import $ from 'jquery';
import 'jstree';
import 'jstree/dist/themes/default/style.css';
import 'font-awesome/css/font-awesome.css';

import '../utils/proto-mods';
import DataApi from '../connectors/data-api';

const MAX_BRANCHES = 100; // If a node has more than these it will be split into 'dummy' folders of this size
const MAX_MANY_BRANCHES = 100000; // If a node has more than these, split into 10x larger dummy folders (MAX_BRANCHES*10)

const PATHS_WITHOUT_WILDCARDS = [
    'bgp.visibility.provider',
    'darknet.ucsd-nt.non-erratic.routing.provider'
];

class HeirarchyExplorer extends React.Component {
    static propTypes = {
        initExpandPath: PropTypes.array,
        onLeafSelected: PropTypes.func
    };

    static defaultProps = {
        initExpandPath: null,
        onLeafSelected: function (id, name) {
        }
    };

    componentDidMount() {
        var rThis = this;
        var apiConnector = new DataApi();

        // Wrapped jQuery plugin
        this.$tree = $(ReactDOM.findDOMNode(this.refs.treeExplorer));

        this.$tree.jstree({
            "core": {
                themes: {
                    stripes: false,
                    variant: "small"
                    //dots: true
                },
                data: function (obj, callback) {
                    // Unwrap the data attached to dummy folders
                    if (obj.type && obj.type.indexOf('Dummy') != -1) {
                        callback(obj.data);
                        return;
                    }

                    var target = (obj.id === '#' ? '' : obj.data);
                    var query = (target.length ? target + '.' : '') + '*';

                    apiConnector.getHierarchicalMetaData(query,
                        function (apiData) {
                            callback(
                                genChildrenNodes(target, apiData.data,
                                    MAX_BRANCHES * (apiData.data.length < MAX_MANY_BRANCHES ? 1 : 10)
                                )
                            );
                        },
                        function (errorMsg) {
                            var MAX_TEXT_SIZE = 20;
                            var elemId = obj.id.replace('#', '_') + '--error';
                            callback([{
                                id: elemId,
                                text: errorMsg.substring(0, MAX_TEXT_SIZE) + (errorMsg.length > MAX_TEXT_SIZE ? '...' : ''),
                                type: 'error'
                            }]);
                            setTimeout(function () { // Allow time for element to be created
                                $('#' + elemId + ' a').attr('title', errorMsg); // Show full error msg on hover
                            }, 200);
                        }
                    );
                }
            },
            types: {
                root: {
                    icon: "glyphicon glyphicon-globe regular-node-color"
                },
                branch: {
                    icon: "glyphicon glyphicon-folder-open regular-node-color"
                },
                leaf: {
                    icon: "fa fa-leaf regular-node-color"
                },
                branchAll: {
                    icon: "glyphicon glyphicon-folder-open star-node-color"
                },
                leafAll: {
                    icon: "fa fa-leaf star-node-color"
                },
                branchDummy: {
                    icon: "glyphicon glyphicon-folder-open star-node-color"
                },
                leafDummy: {
                    icon: "fa fa-leaf star-node-color"
                },
                error: {
                    icon: "glyphicon glyphicon-exclamation-sign error-node-color"
                }
            },
            plugins: ["types", "wholerow"]
        });

        // Enable open/close node when clicking on name
        this.$tree.delegate(".jstree-open>a", "click.jstree", function (e) {
            $.jstree.reference(this).close_node(this, false, false);
        })
            .delegate(".jstree-closed>a", "click.jstree", function (e) {
                $.jstree.reference(this).open_node(this, false, false);
            });

        // Node/leaf selected
        this.$tree.bind("select_node.jstree", function (e, data) {
            $(this).jstree('deselect_all', true);
            if (data.node.type.indexOf("leaf") == -1) return; // Ignore branch selection
            rThis.props.onLeafSelected(
                data.node.data,                                         // Id
                getFullNodeNames($(this), data.node.id).join(' > ')     // Name
            );
        });

        if (this.props.initExpandPath) {
            this.expandPath(this.props.initExpandPath);
        }

        //////

        function genChildrenNodes(target, treeData, maxBranches) {

            var getChildStruct = function (child) {
                return {
                    data: (target.length ? target + '.' : '') + child.path,
                    text: child.human_name + ((child.leaf && child.hasOwnProperty('path_count') && child.path_count > 1)
                            ? '<span class="badge" title="Generates total of ' + child.path_count + ' series">' + child.path_count + '</span>'
                            : ''
                    ),
                    type: ((child.leaf ? 'leaf' : 'branch') + (child.path === '*' ? 'All' : '')),
                    children: !child.leaf
                };
            };

            treeData.alphanumSort(false, 'human_name')
                .forEach(function (node) {
                    node.path = node.path.replace(/([\?\*])/g, "\\$1");
                });

            var newNodes = [];

            var includeWildcards = PATHS_WITHOUT_WILDCARDS.every(function (path) {
                return target.indexOf(path) == -1;
            });

            // Leaf star (if there's more than one leaf)
            if (includeWildcards && treeData.filter(function (child) {
                return child.leaf
            }).length > 1) {
                newNodes.push(getChildStruct({
                    path: '*',
                    human_name: '✲',
                    leaf: true,
                    path_count: _.reduce(treeData, function (prev, cur) {
                            return prev + (cur.leaf ? cur.path_count : 0);
                        },
                        0
                    )
                }));
            }

            // Leaves
            newNodes = newNodes.concat(
                treeData
                    .filter(function (child) {
                        return child.leaf;
                    })
                    .map(getChildStruct)
            );

            // Branch star (if there's more than one branch)
            if (includeWildcards && treeData.filter(function (child) {
                return !child.leaf
            }).length > 1) {
                newNodes.push(getChildStruct({
                    path: '*',
                    human_name: '✲',
                    leaf: false
                    //path_count: treeData.filter(function(child) { return !child.leaf }).length
                }));
            }

            // Branches

            var branches = treeData
                .filter(function (child) {
                    return !child.leaf;
                })
                .map(getChildStruct);

            // Create sub-folders
            if (maxBranches && branches.length > maxBranches) {
                var folderNodes = [];
                _.chain(branches)
                // Split in chunks
                    .groupBy(function (el, i) {
                        return Math.floor(i / maxBranches);
                    })
                    .each(function (chunk) {
                        folderNodes.push({
                            text: '['
                                + [chunk[0], chunk[chunk.length - 1]].map(
                                    function (branch) {
                                        return branch.text.split('<')[0].trim();
                                    }).join(' - ')
                                + ']'
                                + '<span class="badge">' + chunk.length + '</span>',
                            type: 'branchDummy',
                            children: true,
                            data: chunk // Attach data of sub-nodes to be unwrapped on folder click
                        });
                    });

                // Add only dummy folders
                newNodes = newNodes.concat(folderNodes);
            } else {  // No need to split, attach branches directly
                newNodes = newNodes.concat(branches);
            }

            return newNodes;
        }

        function getFullNodeNames($tree, nodeId) {
            var nodeIds = $tree.jstree('get_node', nodeId).parents.slice().reverse();
            nodeIds.shift(); // Remove root node
            nodeIds.push(nodeId);
            return nodeIds
                .filter(function (id) { // Bypass dummy folders
                    return $tree.jstree('get_node', id).type.indexOf('Dummy') == -1;
                })
                .map(function (id) {
                    return $tree.jstree('get_node', id).text.split('<')[0].trim(); // Remove all from right of 1st html tag
                });
        }
    }

    componentWillUnmount() {
        // Destroy jQuery plugin
        var $elem = $(ReactDOM.findDOMNode(this.refs.treeExplorer));
        $.removeData($elem.get(0));
    }

    render() {
        return <div className="tree-explorer" ref="treeExplorer"/>;
    }

    // Public methods

    // Also accepts a list of paths in an array structure
    expandPath = (path) => {

        if (Array.isArray(path)) {
            path.forEach(this.expandPath);
            return;
        }

        path = path.getPath().split('.').slice(0, -1); // Leaf doesn't need expansion

        var $tree = this.$tree;
        waitForInit();

        function waitForInit() {
            if ($tree.jstree('get_node', '#').state.loaded) {
                traverseTree();
            } else {
                setTimeout(waitForInit, 300);
            }
        }

        function traverseTree(curNode, curLevel) {

            curNode = curNode || $tree.jstree('get_node', '#');
            curLevel = curLevel || 0;

            if (curNode.type.indexOf('Dummy') == -1) {
                curLevel++; // Move along in the path if it's not a dummy folder
            }

            if (curLevel > path.length) return; // Reached end of path

            var childNode = $tree.jstree(
                'get_node',
                getChildNode(curNode, path.slice(0, curLevel).join('.'))
            );

            if (childNode) {
                $tree.jstree('open_node', childNode, function () {
                    childNode = $tree.jstree('get_node', childNode.id); // Refresh pointer to node
                    traverseTree(childNode, curLevel);
                });
            }

            function getChildNode(parentNode, childData) {
                return _(parentNode.children).find(function (c) {
                    var node = $tree.jstree('get_node', c);
                    return node.type.indexOf("leaf") == -1 &&
                    node.type.indexOf('Dummy') == -1
                        ? node.data === childData
                        // Dummy folder, see if it's in this range
                        : _(node.data).some(function (n) {
                            return n.data === childData;
                        });
                });
            }
        }
    };
}

export default HeirarchyExplorer;
