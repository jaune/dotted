var dotted = (function () {

	var Dotted = function () {
		this.nodes = {
			'/' : {}
		};
		this.path = [];
		this.listeners = {};
	};

	Dotted.prototype.getCurrentPath = function () {
		return '/'+this.path.join('/');
	};


	Dotted.prototype.getCurrentNode = function () {
		return this.nodes[this.getCurrentPath()];
	};

	Dotted.prototype.on = function (name, closure) {
		if (!this.listeners.hasOwnProperty(name)) {
			this.listeners[name] = [closure];
		} else {
			this.listeners[name].push(closure);
		}
	};

	Dotted.prototype.fire = function (name) {
		if (!this.listeners.hasOwnProperty(name)) {
			return;
		}
		var paramerters = Array.prototype.slice.call(arguments, 1);
		this.listeners[name].forEach(function (closure) {
			closure.apply(null, paramerters);
		});
	};

	Dotted.prototype.begin = function (name, begin_action, end_action) {
		var parent = this.getCurrentPath();
		this.path.push(name);
		var path = this.getCurrentPath();
		var node = {};

		begin_action = begin_action || function () {};
		end_action = end_action || function () {};

		this.nodes[path] = node;
		this
			.chaineFunction(node, 'end', end_action, this.nodes[parent])
			.chaineFunction(this.nodes[parent], name, begin_action, node)
		;

		return this;
	};

	Dotted.prototype.end = function () {
		this.path.pop();
		return this;
	};

	Dotted.prototype.inline = function (name, action) {
		var parent = this.getCurrentNode();

		action = action || function () {};
		this.chaineFunction(parent, name, action, parent);

		return this;
	};

	Dotted.prototype.flag = function (name, action) {
		var parent = this.getCurrentNode();

		action = action || function () {};
		this.chaineValue(parent, name, action, parent);

		return this;
	};

	Dotted.prototype.chaineValue = function (node, name, action, chaine) {

		Object.defineProperty(node, name, {
			get: (function (action, chaine) {
					return function () {
						action.apply(null, arguments);
						return chaine;
				};
			})(action, chaine)
		});

		return this;
	};

	Dotted.prototype.chaineFunction = function (node, name, action, chaine) {

		Object.defineProperty(node, name, {
			value: (function (action, chaine) {
					return function () {
						action.apply(null, arguments);
						return chaine;
				};
			})(action, chaine)
		});

		return this;
	};

	var dotted__ = new Dotted();
	var root = dotted__.nodes['/'];

	Object.defineProperty(root, '.dotted', {
		value: dotted__
	});

	return root;
})();