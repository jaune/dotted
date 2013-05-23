var dotted = (function () {

	var Dotted = function () {
		this.nodes = {
			'/' : {}
		};
		this.path = [];
	};

	Dotted.prototype.getCurrentPath = function () {
		return '/'+this.path.join('/');
	};


	Dotted.prototype.getCurrentNode = function () {
		return this.nodes[this.getCurrentPath()];
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


(function (dotted) {
	var dotted__ = dotted['.dotted'];
	var stereotypes = {};

	var current_stereotype = null;
	var current_property = null;

	var nameds = {};

	dotted__
		.begin('stereotype',
			function (name) {
				console.debug('#stereotype `'+name+'`');
				current_stereotype = stereotypes[name] = {
					name: name,
					singleton: false,
					properties: [],
					modififers: []
				};
			},
			function () {
				var c = current_stereotype;
				var n = null;

				dotted__.begin(c.name, function (name) {
					console.debug('<<'+c.name+'>>'+name);
					n = nameds[name] = {
						name: name,
						object: function () {}
					};
				});

				c.modififers.forEach(function (modififer) {
					dotted__.inline(modififer.name);
				});

				c.properties.forEach(function (property) {

					property.modififers.forEach(function (modififer) {
						dotted__.inline(modififer.name);
					});

					dotted__.inline(property.name, function (name, value) {
						property.closure(n.object.prototype, name, value);
					});
				});

				dotted__.end();
			}
		)
			.flag('singleton', function () {
				console.debug('<<'+current_stereotype.name+'>> is now a `singleton`');
				current_stereotype.singleton = true;
			})
			.inline('modifier', function (name) {
				console.debug('append stereotype modifier `'+name+'`');
				current_stereotype.modififers.push({
					name: name
				});
			})
			.begin('property',
				function (name, closure) {
					console.debug('#property `'+current_stereotype.name+'#'+name+'`');
					current_property = current_stereotype.properties.push({
						name: name,
						closure: closure || function () {},
						modififers: []
					});
				},
				function () {
					console.debug('/property');
				}
			)
				.inline('modifier', function (name) {
					console.debug('append property modifier `'+name+'`');
					current_property.modififers.push({
						name: name
					});
				})
			.end()
		.end();

	dotted['.stereotype'] = {
		getStereotypesName: function () {
			return Object.keys(stereotypes);
		},
		getStereotype: function (name) {
			return stereotypes[name];
		},
		create: function (name) {
			return new nameds[name].object();
		}
	};
})(dotted);


dotted
.stereotype('klass')

	.property('attribute')
	.end()

	.property('method', function (scope, name, closure) {
		Object.defineProperty(scope, name, {
			value: closure
		});
	})
	.end()

.end()
;

dotted
.stereotype('kontroller')

	.singleton

	.modifier('service')

	.property('action')
	.end()

.end()
;

console.debug(dotted['.stereotype'].getStereotypesName());
console.debug(dotted['.stereotype'].getStereotype('klass'));


dotted
.klass('AdrienClass')

/**
 *
 */
	.attribute('bob')

/**
 *
 */
	.method('sayHello', function() {
		console.log('Hello World !');
	})
;


dotted
.kontroller('AdrienController')

/**
 *
 */
	.service('mysql')

/**
 *
 */
	.action('aaaaa', function() {
		console.log('Hello World !');
	})
;

var a = dotted['.stereotype'].create('AdrienClass');

a.sayHello();
