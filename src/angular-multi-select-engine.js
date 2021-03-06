var angular_multi_select_engine = angular.module('angular-multi-select-engine', [
	'angular-multi-select-utils',
	'angular-multi-select-constants'
]);

angular_multi_select_engine.factory('angularMultiSelectEngine', [
	'angularMultiSelectUtils',
	'angularMultiSelectConstants',
	function (angularMultiSelectUtils, angularMultiSelectConstants) {
		'use strict';
		/*
		 ██████  ██████  ███    ██ ███████ ████████ ██████  ██    ██  ██████ ████████  ██████  ██████
		██      ██    ██ ████   ██ ██         ██    ██   ██ ██    ██ ██         ██    ██    ██ ██   ██
		██      ██    ██ ██ ██  ██ ███████    ██    ██████  ██    ██ ██         ██    ██    ██ ██████
		██      ██    ██ ██  ██ ██      ██    ██    ██   ██ ██    ██ ██         ██    ██    ██ ██   ██
		 ██████  ██████  ██   ████ ███████    ██    ██   ██  ██████   ██████    ██     ██████  ██   ██
		*/
		var Engine = function (ops) {
			this.amsu = new angularMultiSelectUtils();
			Object.assign(this, this.amsu.sanitize_ops(ops));

			/*
			 * Initiate the database and setup index fields.
			 */
			this.db = new loki();

			this.on_data_change_fn = null;
			this.on_visual_change_fn = null;
		};

		/*
		 ██████  ███    ██     ██████   █████  ████████  █████       ██████ ██   ██  █████  ███    ██  ██████  ███████
		██    ██ ████   ██     ██   ██ ██   ██    ██    ██   ██     ██      ██   ██ ██   ██ ████   ██ ██       ██
		██    ██ ██ ██  ██     ██   ██ ███████    ██    ███████     ██      ███████ ███████ ██ ██  ██ ██   ███ █████
		██    ██ ██  ██ ██     ██   ██ ██   ██    ██    ██   ██     ██      ██   ██ ██   ██ ██  ██ ██ ██    ██ ██
		 ██████  ██   ████     ██████  ██   ██    ██    ██   ██      ██████ ██   ██ ██   ██ ██   ████  ██████  ███████
		*/
		Engine.prototype.on_data_change = function (ops) {
			/*
			 * Will be executed when the data in one or more of the items in the
			 * tree are changed. Changes such as open/close (visibility related)
			 * won't trigger this function.
			 *
			 * Note that this method will be ran only once after applying
			 * multiple data updates if there are more than one, like for example
			 * when checking a node that has multiple children.
			 */

			var default_ops = {
				skip_internal: false
			};

			ops = ops || {};
			for (var k in default_ops) {
				if (!ops.hasOwnProperty(k)) {
					ops[k] = default_ops[k];
				}
			}

			if (ops.skip_internal === false) {
				/*
				 * Handle situation where a maximum amount of checked leafs has been specified.
				 */
				if (this.MAX_CHECKED_LEAFS > -1 && this.stats[angularMultiSelectConstants.INTERNAL_STATS_CHECKED_LEAFS] > this.MAX_CHECKED_LEAFS) {
					this.uncheck_first(this.stats[angularMultiSelectConstants.INTERNAL_STATS_CHECKED_LEAFS] - this.MAX_CHECKED_LEAFS);
				}
			}

			if (typeof(this.on_data_change_fn) === 'function') {
				this.on_data_change_fn();
			}
		};

		/*
		 ██████  ███    ██     ██    ██ ██ ███████ ██    ██  █████  ██           ██████ ██   ██  █████  ███    ██  ██████  ███████
		██    ██ ████   ██     ██    ██ ██ ██      ██    ██ ██   ██ ██          ██      ██   ██ ██   ██ ████   ██ ██       ██
		██    ██ ██ ██  ██     ██    ██ ██ ███████ ██    ██ ███████ ██          ██      ███████ ███████ ██ ██  ██ ██   ███ █████
		██    ██ ██  ██ ██      ██  ██  ██      ██ ██    ██ ██   ██ ██          ██      ██   ██ ██   ██ ██  ██ ██ ██    ██ ██
		 ██████  ██   ████       ████   ██ ███████  ██████  ██   ██ ███████      ██████ ██   ██ ██   ██ ██   ████  ██████  ███████
		*/
		Engine.prototype.on_visual_change = function (ops) {
			/*
			* Will be executed when the tree changed somehow, visually speaking.
			* This function could be triggered by an open/close action for example.
			* Changes such as un/checking an item won't trigger this function.
			*
			* Note that this method will be ran only once, after applying all the
			* visual changes required by the action, like for example when closing
			* a node that has multiple children.
			*/

			var default_ops = {
				skip_internal: false
			};

			ops = ops || {};
			for (var k in default_ops) {
				if (!ops.hasOwnProperty(k)) {
					ops[k] = default_ops[k];
				}
			}

			if (ops.skip_internal === false) {
				//Do something here?
			}

			if (typeof(this.on_visual_change_fn) === 'function') {
				this.on_visual_change_fn();
			}
		};

		/*
		 ██████ ██████  ███████  █████  ████████ ███████      ██████  ██████  ██      ██      ███████  ██████ ████████ ██  ██████  ███    ██
		██      ██   ██ ██      ██   ██    ██    ██          ██      ██    ██ ██      ██      ██      ██         ██    ██ ██    ██ ████   ██
		██      ██████  █████   ███████    ██    █████       ██      ██    ██ ██      ██      █████   ██         ██    ██ ██    ██ ██ ██  ██
		██      ██   ██ ██      ██   ██    ██    ██          ██      ██    ██ ██      ██      ██      ██         ██    ██ ██    ██ ██  ██ ██
		 ██████ ██   ██ ███████ ██   ██    ██    ███████      ██████  ██████  ███████ ███████ ███████  ██████    ██    ██  ██████  ██   ████
		*/
		Engine.prototype.create_collection = function (name) {
			/*
			 * Create a collection in the database and create indices.
			 */
			if (this.DEBUG === true) console.time(this.NAME + " -> create_collection");

			this.collection = this.db.addCollection(name, {
				indices: [
					this.ID_PROPERTY,
					this.CHECKED_PROPERTY,
					angularMultiSelectConstants.INTERNAL_KEY_LEVEL,
					angularMultiSelectConstants.INTERNAL_KEY_PARENTS_ID,
					angularMultiSelectConstants.INTERNAL_KEY_TREE_VISIBILITY
				]
			});

			if (this.DEBUG === true) console.timeEnd(this.NAME + " -> create_collection");
		};

		/*
		██████  ███████ ███    ███  ██████  ██    ██ ███████      ██████  ██████  ██      ██      ███████  ██████ ████████ ██  ██████  ███    ██
		██   ██ ██      ████  ████ ██    ██ ██    ██ ██          ██      ██    ██ ██      ██      ██      ██         ██    ██ ██    ██ ████   ██
		██████  █████   ██ ████ ██ ██    ██ ██    ██ █████       ██      ██    ██ ██      ██      █████   ██         ██    ██ ██    ██ ██ ██  ██
		██   ██ ██      ██  ██  ██ ██    ██  ██  ██  ██          ██      ██    ██ ██      ██      ██      ██         ██    ██ ██    ██ ██  ██ ██
		██   ██ ███████ ██      ██  ██████    ████   ███████      ██████  ██████  ███████ ███████ ███████  ██████    ██    ██  ██████  ██   ████
		*/
		Engine.prototype.remove_collection = function (name) {
			/*
			 * Remove a collection from the database.
			 */
			if (this.DEBUG === true) console.time(this.NAME + " -> remove_collection");

			name = name || this.NAME;
			this.db.removeCollection(name);

			if (this.DEBUG === true) console.timeEnd(this.NAME + " -> remove_collection");
		};

		/*
		██ ███    ██ ███████ ███████ ██████  ████████
		██ ████   ██ ██      ██      ██   ██    ██
		██ ██ ██  ██ ███████ █████   ██████     ██
		██ ██  ██ ██      ██ ██      ██   ██    ██
		██ ██   ████ ███████ ███████ ██   ██    ██
		*/
		Engine.prototype.insert = function (items) {
			/*
			 * Iterate over an array of items and insert them.
			 */
			if (this.DEBUG === true) console.time(this.NAME + " -> insert");

			this.remove_collection(this.NAME);
			this.create_collection(this.NAME);

			this.reset_stats();

			items = items || [];

			if (Array.isArray(items)) {
				for (var i = 0; i < items.length; i++) {
					this.collection.insert(items[i]);
					this.update_stats(items[i]);
				}
			} else {
				this.collection.insert(items);
				this.update_stats(items);
			}

			if (this.DEBUG === true) console.timeEnd(this.NAME + " -> insert");

			this.on_data_change();
		};

		/*
		 ██████  ███████ ████████     ███████ ████████  █████  ████████ ███████
		██       ██         ██        ██         ██    ██   ██    ██    ██
		██   ███ █████      ██        ███████    ██    ███████    ██    ███████
		██    ██ ██         ██             ██    ██    ██   ██    ██         ██
		 ██████  ███████    ██        ███████    ██    ██   ██    ██    ███████
		*/
		Engine.prototype.get_stats = function () {
			return this.stats;
		};

		/*
		██    ██ ██████  ██████   █████  ████████ ███████     ███████ ████████  █████  ████████ ███████
		██    ██ ██   ██ ██   ██ ██   ██    ██    ██          ██         ██    ██   ██    ██    ██
		██    ██ ██████  ██   ██ ███████    ██    █████       ███████    ██    ███████    ██    ███████
		██    ██ ██      ██   ██ ██   ██    ██    ██               ██    ██    ██   ██    ██         ██
		 ██████  ██      ██████  ██   ██    ██    ███████     ███████    ██    ██   ██    ██    ███████
		*/
		Engine.prototype.update_stats = function (item) {
			switch (item[this.CHECKED_PROPERTY]) {
				case angularMultiSelectConstants.INTERNAL_DATA_NODE_CHECKED:
					this.stats[angularMultiSelectConstants.INTERNAL_STATS_CHECKED_NODES]++;
					this.stats[angularMultiSelectConstants.INTERNAL_STATS_TOTAL_NODES]++;
					break;
				case angularMultiSelectConstants.INTERNAL_DATA_NODE_UNCHECKED:
					this.stats[angularMultiSelectConstants.INTERNAL_STATS_UNCHECKED_NODES]++;
					this.stats[angularMultiSelectConstants.INTERNAL_STATS_TOTAL_NODES]++;
					break;
				case angularMultiSelectConstants.INTERNAL_DATA_NODE_MIXED:
					this.stats[angularMultiSelectConstants.INTERNAL_STATS_TOTAL_NODES]++;
					break;

				case angularMultiSelectConstants.INTERNAL_DATA_LEAF_CHECKED:
					this.stats[angularMultiSelectConstants.INTERNAL_STATS_CHECKED_LEAFS]++;
					this.stats[angularMultiSelectConstants.INTERNAL_STATS_TOTAL_LEAFS]++;
					break;
				case angularMultiSelectConstants.INTERNAL_DATA_LEAF_UNCHECKED:
					this.stats[angularMultiSelectConstants.INTERNAL_STATS_TOTAL_LEAFS]++;
					break;
			}
		};

		/*
		██████  ███████ ███████ ███████ ████████     ███████ ████████  █████  ████████ ███████
		██   ██ ██      ██      ██         ██        ██         ██    ██   ██    ██    ██
		██████  █████   ███████ █████      ██        ███████    ██    ███████    ██    ███████
		██   ██ ██           ██ ██         ██             ██    ██    ██   ██    ██         ██
		██   ██ ███████ ███████ ███████    ██        ███████    ██    ██   ██    ██    ███████
		*/
		Engine.prototype.reset_stats = function () {
			this.stats = {
				[angularMultiSelectConstants.INTERNAL_STATS_CHECKED_LEAFS]: 0,
				[angularMultiSelectConstants.INTERNAL_STATS_CHECKED_NODES]: 0,
				[angularMultiSelectConstants.INTERNAL_STATS_UNCHECKED_NODES]: 0,
				[angularMultiSelectConstants.INTERNAL_STATS_TOTAL_LEAFS]: 0,
				[angularMultiSelectConstants.INTERNAL_STATS_TOTAL_NODES]: 0
			};
		};

		/*
		 ██████  ███████ ████████     ███████ ██    ██ ██      ██          ████████ ██████  ███████ ███████
		██       ██         ██        ██      ██    ██ ██      ██             ██    ██   ██ ██      ██
		██   ███ █████      ██        █████   ██    ██ ██      ██             ██    ██████  █████   █████
		██    ██ ██         ██        ██      ██    ██ ██      ██             ██    ██   ██ ██      ██
		 ██████  ███████    ██        ██       ██████  ███████ ███████        ██    ██   ██ ███████ ███████
		*/
		Engine.prototype.get_full_tree = function () {
			/*
			 * Get the entire set of data currently inserted in Loki.
			 */
			if (this.DEBUG === true) console.time(this.NAME + " -> get_full_tree");

			//TODO: Strip LokiJS metadata. https://github.com/techfort/LokiJS/issues/346
			var tree = this.collection
				.chain()
				.find({})
				.simplesort(angularMultiSelectConstants.INTERNAL_KEY_ORDER, false)
				.data();

			if (this.DEBUG === true) console.time(this.NAME + " -> get_full_tree");

			return tree;
		};

		/*
		 ██████  ███████ ████████     ██    ██ ██ ███████ ██ ██████  ██      ███████     ████████ ██████  ███████ ███████
		██       ██         ██        ██    ██ ██ ██      ██ ██   ██ ██      ██             ██    ██   ██ ██      ██
		██   ███ █████      ██        ██    ██ ██ ███████ ██ ██████  ██      █████          ██    ██████  █████   █████
		██    ██ ██         ██         ██  ██  ██      ██ ██ ██   ██ ██      ██             ██    ██   ██ ██      ██
		 ██████  ███████    ██          ████   ██ ███████ ██ ██████  ███████ ███████        ██    ██   ██ ███████ ███████
		*/
		Engine.prototype.get_visible_tree = function () {
			/*
			 * Get only the visible elements from Loki.
			 */
			if (this.DEBUG === true) console.time(this.NAME + " -> get_visible_tree");

			//TODO: Strip LokiJS metadata. https://github.com/techfort/LokiJS/issues/346
			var tree = this.collection
				.chain()
				.find({
					[angularMultiSelectConstants.INTERNAL_KEY_TREE_VISIBILITY]: angularMultiSelectConstants.INTERNAL_DATA_VISIBLE
				})
				.simplesort(angularMultiSelectConstants.INTERNAL_KEY_ORDER, false)
				.data();

			if (this.DEBUG === true) console.timeEnd(this.NAME + " -> get_visible_tree");

			return tree;
		};

		/*
		 ██████  ███████ ████████     ███████ ██ ██   ████████ ███████ ██████  ███████ ██████      ████████ ██████  ███████ ███████
		██       ██         ██        ██      ██ ██      ██    ██      ██   ██ ██      ██   ██        ██    ██   ██ ██      ██
		██   ███ █████      ██        █████   ██ ██      ██    █████   ██████  █████   ██   ██        ██    ██████  █████   █████
		██    ██ ██         ██        ██      ██ ██      ██    ██      ██   ██ ██      ██   ██        ██    ██   ██ ██      ██
		 ██████  ███████    ██        ██      ██ ███████ ██    ███████ ██   ██ ███████ ██████         ██    ██   ██ ███████ ███████
		*/
		Engine.prototype.get_filtered_tree = function (query) {
			if (this.DEBUG === true) console.time(this.NAME + " -> get_filtered_tree");

			var filter = [];
			for (var i = 0; i < query.length; i++) {
				var item = query[i];
				filter.push({
					[item.field]: {
						'$contains': item.query
					}
				});
			}

			//TODO: Strip LokiJS metadata. https://github.com/techfort/LokiJS/issues/346
			var tree = this.collection
				.chain()
				.find({
					'$and': filter
				})
				.simplesort(angularMultiSelectConstants.INTERNAL_KEY_ORDER, false)
				.data();

                                //add parents node if needed, this will show a whole path
                                if(tree) {
                                    var parents = [];
                                    var parentsWhichExists = {};
                                    tree.forEach(function(t) {
                                        parentsWhichExists[t.id] = true;
                                        var amsParentsIds = t[angularMultiSelectConstants.INTERNAL_KEY_PARENTS_ID];
                                        if(amsParentsIds) {
                                            amsParentsIds.forEach(function(pid) {
                                                if(parentsWhichExists[pid] === undefined) {
                                                    parents.push(pid);
                                                }
                                            });
                                        }
                                    });
                                    filter = [];
                                    parents.forEach(function(pid) {
                                        filter.push({
                                            'id': {
                                                '$eq': pid
                                            }
                                        });
                                    });
                                    var parentsTree = this.collection.chain().find({
                                        '$or': filter
                                    }).simplesort(angularMultiSelectConstants.INTERNAL_KEY_ORDER, false).data();
                                    parentsTree.forEach(function(p) {
                                        //insert
                                        var len = tree.length;
                                        for(var i = 0; i < len; i++) {
                                            var t = tree[i];
                                            if(t[angularMultiSelectConstants.INTERNAL_KEY_PARENTS_ID].indexOf(p.id) !== -1) {
                                                tree.splice(i, 0, p);
                                                break;
                                            }
                                        }
                                    });
                                }
                                if (this.DEBUG === true) console.timeEnd(this.NAME + " -> get_filtered_tree");

                                return tree;
                };

                /*
                   ██████  ███████ ████████      ██████ ██   ██ ███████  ██████ ██   ██ ███████ ██████      ████████ ██████  ███████ ███████
                   ██       ██         ██        ██      ██   ██ ██      ██      ██  ██  ██      ██   ██        ██    ██   ██ ██      ██
                   ██   ███ █████      ██        ██      ███████ █████   ██      █████   █████   ██   ██        ██    ██████  █████   █████
                   ██    ██ ██         ██        ██      ██   ██ ██      ██      ██  ██  ██      ██   ██        ██    ██   ██ ██      ██
                   ██████  ███████    ██         ██████ ██   ██ ███████  ██████ ██   ██ ███████ ██████         ██    ██   ██ ███████ ███████
                   */
                Engine.prototype.get_checked_tree = function (filter) {
                    /*
                     * Get only the checked elements from Loki.
                     */
                    if (this.DEBUG === true) console.time(this.NAME + " -> get_checked_tree");

                    var query_filter;
                    switch (filter) {
                        case angularMultiSelectConstants.FIND_LEAFS:
                            query_filter = [
                                angularMultiSelectConstants.INTERNAL_DATA_LEAF_CHECKED
                            ];
                            break;

                        case angularMultiSelectConstants.FIND_LEAFS_MIXED_NODES:
                            query_filter = [
                                angularMultiSelectConstants.INTERNAL_DATA_LEAF_CHECKED,
                                angularMultiSelectConstants.INTERNAL_DATA_NODE_MIXED,
                            ];
                            break;

                        case angularMultiSelectConstants.FIND_LEAFS_CHECKED_NODES:
                            query_filter = [
                                angularMultiSelectConstants.INTERNAL_DATA_LEAF_CHECKED,
                                angularMultiSelectConstants.INTERNAL_DATA_NODE_CHECKED,
                            ];
                            break;

                        case angularMultiSelectConstants.FIND_LEAFS_MIXED_CHECKED_NODES:
                            query_filter = [
                                angularMultiSelectConstants.INTERNAL_DATA_LEAF_CHECKED,
                                angularMultiSelectConstants.INTERNAL_DATA_NODE_CHECKED,
                                angularMultiSelectConstants.INTERNAL_DATA_NODE_MIXED
                            ];
                            break;

                        case angularMultiSelectConstants.FIND_MIXED_NODES:
                            query_filter = [
                                angularMultiSelectConstants.INTERNAL_DATA_NODE_MIXED
                            ];
                            break;

                        case angularMultiSelectConstants.FIND_CHECKED_NODES:
                            query_filter = [
                                angularMultiSelectConstants.INTERNAL_DATA_NODE_CHECKED
                            ];
                            break;

                        case angularMultiSelectConstants.FIND_MIXED_CHECKED_NODES:
                            query_filter = [
                                angularMultiSelectConstants.INTERNAL_DATA_NODE_CHECKED,
                                angularMultiSelectConstants.INTERNAL_DATA_NODE_MIXED
                            ];
                            break;

                        default:
                            query_filter = [
                                angularMultiSelectConstants.INTERNAL_DATA_LEAF_CHECKED
                            ];
                            break;
                    }

                    //TODO: Strip LokiJS metadata. https://github.com/techfort/LokiJS/issues/346
                    var tree = this.collection
                        .chain()
                        .find({
                            [this.CHECKED_PROPERTY]: {
                                '$in': query_filter
                            }
                        })
                    .simplesort(angularMultiSelectConstants.INTERNAL_KEY_ORDER, false)
                        .data();

                    if (this.DEBUG === true) console.timeEnd(this.NAME + " -> get_checked_tree");

                    return tree;
                };

                /*
                   ██████  ███████ ████████     ██ ████████ ███████ ███    ███
                   ██       ██         ██        ██    ██    ██      ████  ████
                   ██   ███ █████      ██        ██    ██    █████   ██ ████ ██
                   ██    ██ ██         ██        ██    ██    ██      ██  ██  ██
                   ██████  ███████    ██        ██    ██    ███████ ██      ██
                   */
                Engine.prototype.get_item = function (item) {
                    if (typeof(item) !== 'object' || Object.keys(item).length === 0) return {};

                    var filter = [];
                    for (var k in item) {
                        filter.push({
                            [k]: item[k]
                        });
                    }

                    var res = this.collection.find({
                        '$and': filter
                    });

                    if (Array.isArray(res) && res.length > 0) {
                        return res[0];
                    } else {
                        return {};
                    }
                };

                /*
                   ████████  ██████   ██████   ██████  ██      ███████      ██████  ██████  ███████ ███    ██
                   ██    ██    ██ ██       ██       ██      ██          ██    ██ ██   ██ ██      ████   ██
                   ██    ██    ██ ██   ███ ██   ███ ██      █████       ██    ██ ██████  █████   ██ ██  ██
                   ██    ██    ██ ██    ██ ██    ██ ██      ██          ██    ██ ██      ██      ██  ██ ██
                   ██     ██████   ██████   ██████  ███████ ███████      ██████  ██      ███████ ██   ████
                   */
                Engine.prototype.toggle_open_node = function (item) {
                    /*
                     * Toggle the open/closed state of an element.
                     * Note that leafs are not supposed to be toggleable.
                     */
                    if (item[angularMultiSelectConstants.INTERNAL_KEY_CHILDREN_LEAFS] === 0) return;

                    if (item[this.OPEN_PROPERTY] === angularMultiSelectConstants.INTERNAL_DATA_OPEN) {
                        this.close_node(item);
                    } else {
                        this.open_node(item);
                    }

                    this.on_visual_change();
                };

                /*
                   ██████  ██████  ███████ ███    ██     ███    ██  ██████  ██████  ███████
                   ██    ██ ██   ██ ██      ████   ██     ████   ██ ██    ██ ██   ██ ██
                   ██    ██ ██████  █████   ██ ██  ██     ██ ██  ██ ██    ██ ██   ██ █████
                   ██    ██ ██      ██      ██  ██ ██     ██  ██ ██ ██    ██ ██   ██ ██
                   ██████  ██      ███████ ██   ████     ██   ████  ██████  ██████  ███████
                   */
                Engine.prototype.open_node = function (item) {
                    /*
                     * Open an item.
                     * First, mark the item itself as open, then find all
                     * the children items of that item and iterate over the
                     * results. For each item:
                     *
                     * If the item is a node and it's closed, we'll create
                     * a rule such that it will skip the next N items on the
                     * result. Else mark the item as visible.
                     */
                    if (this.DEBUG === true) console.time(this.NAME + " -> open_node");

                    var skip = 0;

                    this.collection
                        .chain()
                        .find({
                            [this.ID_PROPERTY]: item[this.ID_PROPERTY]
                        })
                    .update((obj) => {
                        obj[this.OPEN_PROPERTY] = angularMultiSelectConstants.INTERNAL_DATA_OPEN;
                    });

                    this.collection
                        .chain()
                        .find({
                            '$and': [
                            {
                                [angularMultiSelectConstants.INTERNAL_KEY_PARENTS_ID]: {
                                    '$contains': item[this.ID_PROPERTY]
                                }
                            },
                            {
                                [angularMultiSelectConstants.INTERNAL_KEY_LEVEL]: {
                                    '$gte': item[angularMultiSelectConstants.INTERNAL_KEY_LEVEL] + 1
                                }
                            }
                            ]
                        })
                    .limit(item[angularMultiSelectConstants.INTERNAL_KEY_CHILDREN_LEAFS] + item[angularMultiSelectConstants.INTERNAL_KEY_CHILDREN_NODES])
                        .update((obj) => {
                            if (skip > 0) {
                                skip--;
                                return;
                            }

                            if (
                                    obj[angularMultiSelectConstants.INTERNAL_KEY_CHILDREN_LEAFS] > 0 &&
                                    obj[this.OPEN_PROPERTY] === angularMultiSelectConstants.INTERNAL_DATA_CLOSED
                               ) {
                                skip = obj[angularMultiSelectConstants.INTERNAL_KEY_CHILDREN_LEAFS] + obj[angularMultiSelectConstants.INTERNAL_KEY_CHILDREN_NODES];
                            }

                            obj[angularMultiSelectConstants.INTERNAL_KEY_TREE_VISIBILITY] = angularMultiSelectConstants.INTERNAL_DATA_VISIBLE;
                        });

                    if (this.DEBUG === true) console.timeEnd(this.NAME + " -> open_node");
                };

                /*
                   ██████ ██       ██████  ███████ ███████     ███    ██  ██████  ██████  ███████
                   ██      ██      ██    ██ ██      ██          ████   ██ ██    ██ ██   ██ ██
                   ██      ██      ██    ██ ███████ █████       ██ ██  ██ ██    ██ ██   ██ █████
                   ██      ██      ██    ██      ██ ██          ██  ██ ██ ██    ██ ██   ██ ██
                   ██████ ███████  ██████  ███████ ███████     ██   ████  ██████  ██████  ███████
                   */
                Engine.prototype.close_node = function (item) {
                    /*
                     * Close an item.
                     * First, mark the item itself as closed, then find all
                     * children and mark then as invisible.
                     */
                    if (this.DEBUG === true) console.time(this.NAME + " -> close_node");

                    this.collection
                        .chain()
                        .find({
                            [this.ID_PROPERTY]: item[this.ID_PROPERTY]
                        })
                    .update((obj) => {
                        obj[this.OPEN_PROPERTY] = angularMultiSelectConstants.INTERNAL_DATA_CLOSED;
                    });

                    this.collection
                        .chain()
                        .find({
                            '$and': [
                            {
                                [angularMultiSelectConstants.INTERNAL_KEY_PARENTS_ID]: {
                                    '$contains': item[this.ID_PROPERTY]
                                }
                            },
                            {
                                [angularMultiSelectConstants.INTERNAL_KEY_LEVEL]: {
                                    '$gte': item[angularMultiSelectConstants.INTERNAL_KEY_LEVEL] + 1
                                }
                            }
                            ]
                        })
                    .limit(item[angularMultiSelectConstants.INTERNAL_KEY_CHILDREN_LEAFS] + item[angularMultiSelectConstants.INTERNAL_KEY_CHILDREN_NODES])
                        .update((obj) => {
                            obj[angularMultiSelectConstants.INTERNAL_KEY_TREE_VISIBILITY] = angularMultiSelectConstants.INTERNAL_DATA_INVISIBLE;
                        });

                    if (this.DEBUG === true) console.timeEnd(this.NAME + " -> close_node");
                };

                /*
                   ██████ ██   ██ ███████  ██████ ██   ██      █████  ██      ██
                   ██      ██   ██ ██      ██      ██  ██      ██   ██ ██      ██
                   ██      ███████ █████   ██      █████       ███████ ██      ██
                   ██      ██   ██ ██      ██      ██  ██      ██   ██ ██      ██
                   ██████ ██   ██ ███████  ██████ ██   ██     ██   ██ ███████ ███████
                   */
                //whether or not the 'item' need to be processed
                //if any of a parent of an item is already processed, the item iteself won't need to be processed
                function needToProcess(item, processed) {
                    var needProcess = true;
                    for(var i = processed.length - 1; i >=0; i--) {
                        if(item[angularMultiSelectConstants.INTERNAL_KEY_PARENTS_ID].indexOf(processed[i]) !== -1) {
                            needProcess = false;
                            break;
                        }
                    }
                    return needProcess;
                }
                Engine.prototype.check_filtered = function(filter) {
                    var self = this;
                    var ret= this.collection.chain().find(filter).simplesort(angularMultiSelectConstants.INTERNAL_KEY_ORDER, false).data();
                    if(ret) {
                        var processed = [];
                        ret.forEach(function(r) {
                            if(needToProcess(r, processed)) {
                                self.check_node(r);
                                processed.push(r.id);
                            }
                        });
                    }
                };
                Engine.prototype.uncheck_filtered = function(filter) {
                    var self = this;
                    var ret= this.collection.chain().find(filter).simplesort(angularMultiSelectConstants.INTERNAL_KEY_ORDER, false).data();
                    if(ret) {
                        var processed = [];
                        ret.forEach(function(r) {
                            if(needToProcess(r, processed)) {
                                self.uncheck_node(r);
                                processed.push(r.id);
                            }
                        });
                    }
                };
                Engine.prototype.check_all = function () {
                    if (this.DEBUG === true) console.time(this.NAME + " -> check_all");

                    this.collection
                        .chain()
                        .find({})
                        .update((obj) => {
                            if (obj[angularMultiSelectConstants.INTERNAL_KEY_CHILDREN_LEAFS] === 0) {
                                obj[this.CHECKED_PROPERTY] = angularMultiSelectConstants.INTERNAL_DATA_LEAF_CHECKED;
                            } else {
                                obj[this.CHECKED_PROPERTY] = angularMultiSelectConstants.INTERNAL_DATA_NODE_CHECKED;
                                obj[angularMultiSelectConstants.INTERNAL_KEY_CHECKED_CHILDREN] = obj[angularMultiSelectConstants.INTERNAL_KEY_CHILDREN_LEAFS];
                            }
                        });

                    this.stats[angularMultiSelectConstants.INTERNAL_STATS_UNCHECKED_NODES] = 0;
                    this.stats[angularMultiSelectConstants.INTERNAL_STATS_CHECKED_LEAFS] = this.stats[angularMultiSelectConstants.INTERNAL_STATS_TOTAL_LEAFS];
                    this.stats[angularMultiSelectConstants.INTERNAL_STATS_CHECKED_NODES] = this.stats[angularMultiSelectConstants.INTERNAL_STATS_TOTAL_NODES];

                    if (this.DEBUG === true) console.time(this.NAME + " -> check_all");

                    this.on_data_change();
                };

                /*
                   ██    ██ ███    ██  ██████ ██   ██ ███████  ██████ ██   ██      █████  ██      ██
                   ██    ██ ████   ██ ██      ██   ██ ██      ██      ██  ██      ██   ██ ██      ██
                   ██    ██ ██ ██  ██ ██      ███████ █████   ██      █████       ███████ ██      ██
                   ██    ██ ██  ██ ██ ██      ██   ██ ██      ██      ██  ██      ██   ██ ██      ██
                   ██████  ██   ████  ██████ ██   ██ ███████  ██████ ██   ██     ██   ██ ███████ ███████
                   */
                Engine.prototype.uncheck_all = function () {
                    if (this.DEBUG === true) console.time(this.NAME + " -> uncheck_all");

                    this.collection
                        .chain()
                        .find({})
                        .update((obj) => {
                            if (obj[angularMultiSelectConstants.INTERNAL_KEY_CHILDREN_LEAFS] === 0) {
                                obj[this.CHECKED_PROPERTY] = angularMultiSelectConstants.INTERNAL_DATA_LEAF_UNCHECKED;
                            } else {
                                obj[this.CHECKED_PROPERTY] = angularMultiSelectConstants.INTERNAL_DATA_NODE_UNCHECKED;
                                obj[angularMultiSelectConstants.INTERNAL_KEY_CHECKED_CHILDREN] = 0;
                            }
                        });

                    this.stats[angularMultiSelectConstants.INTERNAL_STATS_CHECKED_LEAFS] = 0;
                    this.stats[angularMultiSelectConstants.INTERNAL_STATS_CHECKED_NODES] = 0;
                    this.stats[angularMultiSelectConstants.INTERNAL_STATS_UNCHECKED_NODES] = this.stats[angularMultiSelectConstants.INTERNAL_STATS_TOTAL_NODES];

                    if (this.DEBUG === true) console.time(this.NAME + " -> uncheck_all");

                    this.on_data_change();
                };

                /*
                   ████████  ██████   ██████   ██████  ██      ███████      ██████ ██   ██ ███████  ██████ ██   ██
                   ██    ██    ██ ██       ██       ██      ██          ██      ██   ██ ██      ██      ██  ██
                   ██    ██    ██ ██   ███ ██   ███ ██      █████       ██      ███████ █████   ██      █████
                   ██    ██    ██ ██    ██ ██    ██ ██      ██          ██      ██   ██ ██      ██      ██  ██
                   ██     ██████   ██████   ██████  ███████ ███████      ██████ ██   ██ ███████  ██████ ██   ██
                   */
                Engine.prototype.toggle_check_node = function (item, ops) {
                    /*
                     * Toggle the checked state on an item.
                     * Note that there are, in total, 5 different states:
                     *
                     * true: checked leaf.
                     * false: unchecked leaf.
                     * -1: all children leafs of the node are unchecked.
                     * 0: at least one children leaf of the node is checked.
                     * 1: all children leafs of the node are checked.
                     *
                     * If the node/item is (fully) checked, uncheck, else check.
                     */
                    switch (item[this.CHECKED_PROPERTY]) {
                        case angularMultiSelectConstants.INTERNAL_DATA_NODE_CHECKED:
                        case angularMultiSelectConstants.INTERNAL_DATA_LEAF_CHECKED:
                            this.uncheck_node(item, ops);
                            break;
                        case angularMultiSelectConstants.INTERNAL_DATA_NODE_MIXED:
                        case angularMultiSelectConstants.INTERNAL_DATA_NODE_UNCHECKED:
                        case angularMultiSelectConstants.INTERNAL_DATA_LEAF_UNCHECKED:
                            this.check_node(item, ops);
                            break;
                    }
                };

                /*
                   ██████ ██   ██ ███████  ██████ ██   ██     ███    ██  ██████  ██████  ███████     ██████  ██    ██
                   ██      ██   ██ ██      ██      ██  ██      ████   ██ ██    ██ ██   ██ ██          ██   ██  ██  ██
                   ██      ███████ █████   ██      █████       ██ ██  ██ ██    ██ ██   ██ █████       ██████    ████
                   ██      ██   ██ ██      ██      ██  ██      ██  ██ ██ ██    ██ ██   ██ ██          ██   ██    ██
                   ██████ ██   ██ ███████  ██████ ██   ██     ██   ████  ██████  ██████  ███████     ██████     ██
                   */
                Engine.prototype.check_node_by = function (where) {
                    if (this.DEBUG === true) console.time(this.NAME + " -> check_node_by");

                    var [key, value] = where;
                    var item = this.collection
                        .findOne({
                            "$and": [
                            {
                                [key]: value
                            },
                            {
                                [this.CHECKED_PROPERTY]: {
                                    '$nin': [
                                        angularMultiSelectConstants.INTERNAL_DATA_NODE_CHECKED,
                                        angularMultiSelectConstants.INTERNAL_DATA_LEAF_CHECKED
                                    ]
                                }
                            }
                            ]
                        });

                    if (item !== null) {
                        this.check_node(item);
                    }

                    if (this.DEBUG === true) console.timeEnd(this.NAME + " -> check_node_by");
                };

                /*
                   ██████ ██   ██ ███████  ██████ ██   ██     ███    ██  ██████  ██████  ███████
                   ██      ██   ██ ██      ██      ██  ██      ████   ██ ██    ██ ██   ██ ██
                   ██      ███████ █████   ██      █████       ██ ██  ██ ██    ██ ██   ██ █████
                   ██      ██   ██ ██      ██      ██  ██      ██  ██ ██ ██    ██ ██   ██ ██
                   ██████ ██   ██ ███████  ██████ ██   ██     ██   ████  ██████  ██████  ███████
                   */
                Engine.prototype.check_node = function (item, ops) {
                    if (this.DEBUG === true) console.time(this.NAME + " -> check_node");

                    var default_ops = {
                        call_on_data_change: true
                    };

                    ops = ops || {};
                    for (var k in default_ops) {
                        if (!ops.hasOwnProperty(k)) {
                            ops[k] = default_ops[k];
                        }
                    }

                    /*
                     * Used for internal calculations.
                     */
                    var time = new Date();
                    var diff_checked_children = 0;
                    var currently_checked_children = item[angularMultiSelectConstants.INTERNAL_KEY_CHECKED_CHILDREN];

                    //TODO: Optimize when MAX_CHECKED_LEAFS is set?

                    /*
                     * If the item is a leaf, mark it as checked.
                     * If the item is a note, set it's counter of checked leafs to the number of leafs it contains.
                     */
                    this.collection
                        .chain()
                        .find({
                            [this.ID_PROPERTY]: item[this.ID_PROPERTY]
                        })
                    .update((obj) => {
                        if (item[angularMultiSelectConstants.INTERNAL_KEY_CHILDREN_LEAFS] === 0) {
                            //if it is not checked yet, increase the count of checked leafs 
                            if(obj[this.CHECKED_PROPERTY] !== angularMultiSelectConstants.INTERNAL_DATA_LEAF_CHECKED)
                                this.stats[angularMultiSelectConstants.INTERNAL_STATS_CHECKED_LEAFS]++;

                            obj[this.CHECKED_PROPERTY] = angularMultiSelectConstants.INTERNAL_DATA_LEAF_CHECKED;
                        } else {
                            if (obj[this.CHECKED_PROPERTY] === angularMultiSelectConstants.INTERNAL_DATA_NODE_UNCHECKED) {
                                this.stats[angularMultiSelectConstants.INTERNAL_STATS_UNCHECKED_NODES]--;
                            }
                            this.stats[angularMultiSelectConstants.INTERNAL_STATS_CHECKED_NODES]++;

                            obj[this.CHECKED_PROPERTY] = angularMultiSelectConstants.INTERNAL_DATA_NODE_CHECKED;
                            obj[angularMultiSelectConstants.INTERNAL_KEY_CHECKED_CHILDREN] = obj[angularMultiSelectConstants.INTERNAL_KEY_CHILDREN_LEAFS];
                            diff_checked_children = obj[angularMultiSelectConstants.INTERNAL_KEY_CHECKED_CHILDREN] - currently_checked_children;
                        }

                        obj[angularMultiSelectConstants.INTERNAL_KEY_CHECKED_MODIFICATION] = time.getTime();
                    });

                    /*
                     * If the passed item is a leaf, search all parent nodes,
                     * add 1 to their checked_children counter and set their
                     * checked state based on the checked_children counter.
                     *
                     */
                    if (item[angularMultiSelectConstants.INTERNAL_KEY_CHILDREN_LEAFS] === 0) {
                        this.collection
                            .chain()
                            .find({
                                [this.ID_PROPERTY]: {
                                    '$in': item[angularMultiSelectConstants.INTERNAL_KEY_PARENTS_ID]
                                }
                            })
                        .simplesort(angularMultiSelectConstants.INTERNAL_KEY_ORDER, true)
                            .update((obj) => {
                                if (obj[this.CHECKED_PROPERTY] === angularMultiSelectConstants.INTERNAL_DATA_NODE_UNCHECKED) {
                                    this.stats[angularMultiSelectConstants.INTERNAL_STATS_UNCHECKED_NODES]--;
                                }
                                if (obj[angularMultiSelectConstants.INTERNAL_KEY_CHECKED_CHILDREN] + 1 === obj[angularMultiSelectConstants.INTERNAL_KEY_CHILDREN_LEAFS]) {
                                    this.stats[angularMultiSelectConstants.INTERNAL_STATS_CHECKED_NODES]++;
                                }

                                if(obj[angularMultiSelectConstants.INTERNAL_KEY_CHECKED_CHILDREN] < obj[angularMultiSelectConstants.INTERNAL_KEY_CHILDREN_LEAFS])
                                    obj[angularMultiSelectConstants.INTERNAL_KEY_CHECKED_CHILDREN]++; // We can't overflow this as we're checking an unchecked item
                                if (obj[angularMultiSelectConstants.INTERNAL_KEY_CHECKED_CHILDREN] === obj[angularMultiSelectConstants.INTERNAL_KEY_CHILDREN_LEAFS]) {
                                    obj[this.CHECKED_PROPERTY] = angularMultiSelectConstants.INTERNAL_DATA_NODE_CHECKED;
                                } else {
                                    obj[this.CHECKED_PROPERTY] = angularMultiSelectConstants.INTERNAL_DATA_NODE_MIXED;
                                }

                                obj[angularMultiSelectConstants.INTERNAL_KEY_CHECKED_MODIFICATION] = time.getTime();
                            });
                        /*
                         * If it's a node:
                         *     1. Search all children leafs and nodes and mark them as checked.
                         *     2. Search all parent nodes,
                         *        add N to their checked_children counter and
                         *        set their checked state based on the checked_children counter.
                         *        N is the difference between the checked leafs of the nodes we're checking
                         *        before and after the operation.
                         */
                    } else {
                        this.collection
                            .chain()
                            .find({
                                '$and': [
                                {
                                    [angularMultiSelectConstants.INTERNAL_KEY_PARENTS_ID]: {
                                        '$contains': item[this.ID_PROPERTY]
                                    }
                                },
                                {
                                    [angularMultiSelectConstants.INTERNAL_KEY_LEVEL]: {
                                        '$gte': item[angularMultiSelectConstants.INTERNAL_KEY_LEVEL] + 1
                                    }
                                },
                                {
                                    [this.CHECKED_PROPERTY]: {
                                        '$in': [
                                            angularMultiSelectConstants.INTERNAL_DATA_NODE_MIXED,
                                            angularMultiSelectConstants.INTERNAL_DATA_NODE_UNCHECKED,
                                            angularMultiSelectConstants.INTERNAL_DATA_LEAF_UNCHECKED
                                        ]
                                    }
                                }
                                ]
                            })
                        .simplesort(angularMultiSelectConstants.INTERNAL_KEY_ORDER, false)
                            .update((obj) => {
                                if (obj[angularMultiSelectConstants.INTERNAL_KEY_CHILDREN_LEAFS] === 0) {
                                    this.stats[angularMultiSelectConstants.INTERNAL_STATS_CHECKED_LEAFS]++;

                                    obj[this.CHECKED_PROPERTY] = angularMultiSelectConstants.INTERNAL_DATA_LEAF_CHECKED;
                                } else {
                                    this.stats[angularMultiSelectConstants.INTERNAL_STATS_CHECKED_NODES]++;
                                    if (obj[this.CHECKED_PROPERTY] === angularMultiSelectConstants.INTERNAL_DATA_NODE_UNCHECKED) {
                                        this.stats[angularMultiSelectConstants.INTERNAL_STATS_UNCHECKED_NODES]--;
                                    }

                                    obj[this.CHECKED_PROPERTY] = angularMultiSelectConstants.INTERNAL_DATA_NODE_CHECKED;
                                    obj[angularMultiSelectConstants.INTERNAL_KEY_CHECKED_CHILDREN] = obj[angularMultiSelectConstants.INTERNAL_KEY_CHILDREN_LEAFS];
                                }

                                obj[angularMultiSelectConstants.INTERNAL_KEY_CHECKED_MODIFICATION] = time.getTime();
                            });

                        this.collection
                            .chain()
                            .find({
                                [this.ID_PROPERTY]: {
                                    '$in': item[angularMultiSelectConstants.INTERNAL_KEY_PARENTS_ID]
                                }
                            })
                        .simplesort(angularMultiSelectConstants.INTERNAL_KEY_ORDER, true)
                            .update((obj) => {
                                if (obj[this.CHECKED_PROPERTY] === angularMultiSelectConstants.INTERNAL_DATA_NODE_UNCHECKED) {
                                    this.stats[angularMultiSelectConstants.INTERNAL_STATS_UNCHECKED_NODES]--;
                                }
                                if (obj[angularMultiSelectConstants.INTERNAL_KEY_CHECKED_CHILDREN] + diff_checked_children === obj[angularMultiSelectConstants.INTERNAL_KEY_CHILDREN_LEAFS]) {
                                    this.stats[angularMultiSelectConstants.INTERNAL_STATS_CHECKED_NODES]++;
                                }

                                obj[angularMultiSelectConstants.INTERNAL_KEY_CHECKED_CHILDREN] += diff_checked_children;
                                if (obj[angularMultiSelectConstants.INTERNAL_KEY_CHECKED_CHILDREN] === obj[angularMultiSelectConstants.INTERNAL_KEY_CHILDREN_LEAFS]) {
                                    obj[this.CHECKED_PROPERTY] = angularMultiSelectConstants.INTERNAL_DATA_NODE_CHECKED;
                                } else {
                                    obj[this.CHECKED_PROPERTY] = angularMultiSelectConstants.INTERNAL_DATA_NODE_MIXED;
                                }

                                obj[angularMultiSelectConstants.INTERNAL_KEY_CHECKED_MODIFICATION] = time.getTime();
                            });
                    }

                    if (this.DEBUG === true) console.timeEnd(this.NAME + " -> check_node");

                    if (ops.call_on_data_change) {
                        this.on_data_change();
                    }
                };

                /*
                   ██    ██ ███    ██  ██████ ██   ██ ███████  ██████ ██   ██     ███    ██  ██████  ██████  ███████
                   ██    ██ ████   ██ ██      ██   ██ ██      ██      ██  ██      ████   ██ ██    ██ ██   ██ ██
                   ██    ██ ██ ██  ██ ██      ███████ █████   ██      █████       ██ ██  ██ ██    ██ ██   ██ █████
                   ██    ██ ██  ██ ██ ██      ██   ██ ██      ██      ██  ██      ██  ██ ██ ██    ██ ██   ██ ██
                   ██████  ██   ████  ██████ ██   ██ ███████  ██████ ██   ██     ██   ████  ██████  ██████  ███████
                   */
                Engine.prototype.uncheck_node = function (item, ops) {
                    if (this.DEBUG === true) console.time(this.NAME + " -> uncheck_node");

                    var default_ops = {
                        call_on_data_change: true
                    };

                    ops = ops || {};
                    for (var k in default_ops) {
                        if (!ops.hasOwnProperty(k)) {
                            ops[k] = default_ops[k];
                        }
                    }

                    /*
                     * Used for internal calculations.
                     */
                    var time = new Date();
                    var diff_checked_children = 0;
                    var currently_checked_children = item[angularMultiSelectConstants.INTERNAL_KEY_CHECKED_CHILDREN];

                    /*
                     * If the item is a leaf, mark it as unchecked.
                     * If the item is a note, set it's counter of checked leafs to the number of leafs it contains.
                     */
                    this.collection
                        .chain()
                        .find({
                            [this.ID_PROPERTY]: item[this.ID_PROPERTY]
                        })
                    .update((obj) => {
                        if (item[angularMultiSelectConstants.INTERNAL_KEY_CHILDREN_LEAFS] === 0) {
                            if(obj[this.CHECKED_PROPERTY] === angularMultiSelectConstants.INTERNAL_DATA_LEAF_CHECKED)
                                this.stats[angularMultiSelectConstants.INTERNAL_STATS_CHECKED_LEAFS]--;

                            obj[this.CHECKED_PROPERTY] = angularMultiSelectConstants.INTERNAL_DATA_LEAF_UNCHECKED;
                        } else {
                            this.stats[angularMultiSelectConstants.INTERNAL_STATS_CHECKED_NODES]--;
                            this.stats[angularMultiSelectConstants.INTERNAL_STATS_UNCHECKED_NODES]++;

                            obj[this.CHECKED_PROPERTY] = angularMultiSelectConstants.INTERNAL_DATA_NODE_UNCHECKED;
                            obj[angularMultiSelectConstants.INTERNAL_KEY_CHECKED_CHILDREN] = 0;
                            diff_checked_children = currently_checked_children - obj[angularMultiSelectConstants.INTERNAL_KEY_CHECKED_CHILDREN];
                        }

                        obj[angularMultiSelectConstants.INTERNAL_KEY_CHECKED_MODIFICATION] = time.getTime();
                    });

                    /*
                     * If the passed item is a leaf, search all parent nodes,
                     * substract 1 from their checked_children counter and set their
                     * checked state based on the checked_children counter.
                     */
                    if (item[angularMultiSelectConstants.INTERNAL_KEY_CHILDREN_LEAFS] === 0) {
                        this.collection
                            .chain()
                            .find({
                                [this.ID_PROPERTY]: {
                                    '$in': item[angularMultiSelectConstants.INTERNAL_KEY_PARENTS_ID]
                                }
                            })
                        .simplesort(angularMultiSelectConstants.INTERNAL_KEY_ORDER, true)
                            .update((obj) => {
                                if (obj[this.CHECKED_PROPERTY] === angularMultiSelectConstants.INTERNAL_DATA_NODE_CHECKED) {
                                    this.stats[angularMultiSelectConstants.INTERNAL_STATS_CHECKED_NODES]--;
                                }
                                if (obj[angularMultiSelectConstants.INTERNAL_KEY_CHECKED_CHILDREN] - 1 === 0) {
                                    this.stats[angularMultiSelectConstants.INTERNAL_STATS_UNCHECKED_NODES]++;
                                }

                                if(obj[angularMultiSelectConstants.INTERNAL_KEY_CHECKED_CHILDREN] > 0) 
                                    obj[angularMultiSelectConstants.INTERNAL_KEY_CHECKED_CHILDREN]--; // We can't underflow this as we're unchecking a checked item
                                if (obj[angularMultiSelectConstants.INTERNAL_KEY_CHECKED_CHILDREN] === 0) {
                                    obj[this.CHECKED_PROPERTY] = angularMultiSelectConstants.INTERNAL_DATA_NODE_UNCHECKED;
                                } else {
                                    obj[this.CHECKED_PROPERTY] = angularMultiSelectConstants.INTERNAL_DATA_NODE_MIXED;
                                }

                                obj[angularMultiSelectConstants.INTERNAL_KEY_CHECKED_MODIFICATION] = time.getTime();
                            });
                        /*
                         * If it's a node:
                         *     1. Search all children leafs and nodes and mark them as unchecked.
                         *     2. Search all parent nodes,
                         *        substract N from their checked_children counter and
                         *        set their checked state based on the checked_children counter.
                         *        N is the difference between the checked leafs of the nodes we're checking
                         *        before and after the operation.
                         */
                    } else {
                        this.collection
                            .chain()
                            .find({
                                '$and': [
                                {
                                    [angularMultiSelectConstants.INTERNAL_KEY_PARENTS_ID]: {
                                        '$contains': item[this.ID_PROPERTY]
                                    }
                                },
                                {
                                    [angularMultiSelectConstants.INTERNAL_KEY_LEVEL]: {
                                        '$gte': item[angularMultiSelectConstants.INTERNAL_KEY_LEVEL] + 1
                                    }
                                },
                                {
                                    [this.CHECKED_PROPERTY]: {
                                        '$in': [
                                            angularMultiSelectConstants.INTERNAL_DATA_NODE_MIXED,
                                            angularMultiSelectConstants.INTERNAL_DATA_NODE_CHECKED,
                                            angularMultiSelectConstants.INTERNAL_DATA_LEAF_CHECKED
                                        ]
                                    }
                                }
                                ]
                            })
                        .simplesort(angularMultiSelectConstants.INTERNAL_KEY_ORDER, false)
                            .update((obj) => {
                                if (obj[angularMultiSelectConstants.INTERNAL_KEY_CHILDREN_LEAFS] === 0) {
                                    this.stats[angularMultiSelectConstants.INTERNAL_STATS_CHECKED_LEAFS]--;

                                    obj[this.CHECKED_PROPERTY] = angularMultiSelectConstants.INTERNAL_DATA_LEAF_UNCHECKED;
                                } else {
                                    this.stats[angularMultiSelectConstants.INTERNAL_STATS_UNCHECKED_NODES]++;
                                    if (obj[this.CHECKED_PROPERTY] === angularMultiSelectConstants.INTERNAL_DATA_NODE_CHECKED) {
                                        this.stats[angularMultiSelectConstants.INTERNAL_STATS_CHECKED_NODES]--;
                                    }

                                    obj[this.CHECKED_PROPERTY] = angularMultiSelectConstants.INTERNAL_DATA_NODE_UNCHECKED;
                                    obj[angularMultiSelectConstants.INTERNAL_KEY_CHECKED_CHILDREN] = 0;
                                }

                                obj[angularMultiSelectConstants.INTERNAL_KEY_CHECKED_MODIFICATION] = time.getTime();
                            });

                        this.collection
                            .chain()
                            .find({
                                [this.ID_PROPERTY]: {
                                    '$in': item[angularMultiSelectConstants.INTERNAL_KEY_PARENTS_ID]
                                }
                            })
                        .simplesort(angularMultiSelectConstants.INTERNAL_KEY_ORDER, true)
                            .update((obj) => {
                                if (obj[this.CHECKED_PROPERTY] === angularMultiSelectConstants.INTERNAL_DATA_NODE_CHECKED) {
                                    this.stats[angularMultiSelectConstants.INTERNAL_STATS_CHECKED_NODES]--;
                                }
                                if (obj[angularMultiSelectConstants.INTERNAL_KEY_CHECKED_CHILDREN] - diff_checked_children === 0) {
                                    this.stats[angularMultiSelectConstants.INTERNAL_STATS_UNCHECKED_NODES]++;
                                }

                                obj[angularMultiSelectConstants.INTERNAL_KEY_CHECKED_CHILDREN] -= diff_checked_children;
                                if (obj[angularMultiSelectConstants.INTERNAL_KEY_CHECKED_CHILDREN] === 0) {
                                    obj[this.CHECKED_PROPERTY] = angularMultiSelectConstants.INTERNAL_DATA_NODE_UNCHECKED;
                                } else {
                                    obj[this.CHECKED_PROPERTY] = angularMultiSelectConstants.INTERNAL_DATA_NODE_MIXED;
                                }

                                obj[angularMultiSelectConstants.INTERNAL_KEY_CHECKED_MODIFICATION] = time.getTime();
                            });
                    }

                    if (this.DEBUG === true) console.timeEnd(this.NAME + " -> uncheck_node");

                    if (ops.call_on_data_change) {
                        this.on_data_change();
                    }
                };

                /*
                   ██    ██ ███    ██  ██████ ██   ██ ███████  ██████ ██   ██     ███████ ██ ██████  ███████ ████████
                   ██    ██ ████   ██ ██      ██   ██ ██      ██      ██  ██      ██      ██ ██   ██ ██         ██
                   ██    ██ ██ ██  ██ ██      ███████ █████   ██      █████       █████   ██ ██████  ███████    ██
                   ██    ██ ██  ██ ██ ██      ██   ██ ██      ██      ██  ██      ██      ██ ██   ██      ██    ██
                   ██████  ██   ████  ██████ ██   ██ ███████  ██████ ██   ██     ██      ██ ██   ██ ███████    ██
                   */
                Engine.prototype.uncheck_first = function (n) {
                    /*
                     * Find the oldest n leaf that have been marked as checked and uncheck them.
                     * This function is used to control the maximum amount of checked leafs.
                     */
                    if (this.DEBUG === true) console.time(this.NAME + " -> uncheck_first");

                    n = n || 1;

                    var leaf = this.collection
                        .chain()
                        .find({
                            '$and': [
                            {
                                [this.CHECKED_PROPERTY]: angularMultiSelectConstants.INTERNAL_DATA_LEAF_CHECKED
                            },
                            {
                                [angularMultiSelectConstants.INTERNAL_KEY_CHILDREN_LEAFS]: 0
                            }
                            ]

                        })
                    /*
                     * Each element is guaranteed to have an INTERNAL_KEY_CHECKED_MODIFICATION
                     * field that contains a unixtime date of the last time the item has
                     * changed it's checked state.
                     * If the fields of two elements match, then sort by the order field.
                     * This exception should happen only when this method is called on a verbatim
                     * tree that hasn't been modified in any way, meaning, right after a
                     * call to this.insert().
                     */
                    .sort(function (a, b) {
                        var diff = a[angularMultiSelectConstants.INTERNAL_KEY_CHECKED_MODIFICATION] - b[angularMultiSelectConstants.INTERNAL_KEY_CHECKED_MODIFICATION];
                        if (diff === 0) {
                            return a[angularMultiSelectConstants.INTERNAL_KEY_ORDER] - b[angularMultiSelectConstants.INTERNAL_KEY_ORDER];
                        } else {
                            return diff;
                        }
                    })
                    .limit(n)
                        .data();

                    for (var i = 0; i < leaf.length; i++) {
                        this.toggle_check_node(leaf[i], {
                            call_on_data_change: false
                        });
                    }

                    if (this.DEBUG === true) console.timeEnd(this.NAME + " -> uncheck_first");
                };

                return Engine;
        }
]);
