(function (dotted) {

	var Named = function (name) {
		this.name = name;
		this.object = function () {};
		this.modifiers = [];
	};

	var Modifier = function (name) {
		this.name = name;
	};

	var Nameds = function () {
		this.nameds = {};
		this.instantiators = [];
	};

	Nameds.prototype.add = function (name, named) {
		this.nameds[name] = named;
	};

	Nameds.prototype.get = function (name) {
		return this.nameds[name];
	};

	Nameds.prototype.instantiate = function (name, parameters) {
		return this.getInstantiator(parameters.length)(this.get(name).object, parameters);
	};

	Nameds.prototype.getInstantiator = function(length) {
		var instantiator;

		instantiator = this.instantiators[length];

		if (!instantiator) {
			instantiator = this.instantiators[length] = (function (length) {
				var i = 0;
				var parameters = [];

				for (i = 0; i < length; i++) {
					parameters.push('a[' + i + ']');
				}
				return new Function('f', 'a', 'return new f(' + parameters.join(',') + ')');
			})(length);
		}

		return instantiator;
    };

	var nameds = (function (dotted, dotted__) {
		var nameds = new Nameds();

		var addFormstereotype = function (stereotype) {
			var named = null;
			var propertyModififerStack = [];

			dotted__.begin(stereotype.name, function (name) {
				named = new Named();
				nameds.add(name, named);
			});

			stereotype.modififers.forEach(function (modififer) {
				dotted__.inline(modififer.name, function () {
					named.modifiers.push(new Modifier(modififer.name));
				});
			});

			stereotype.properties.forEach(function (property) {

				property.modififers.forEach(function (modififer) {
					dotted__.inline(modififer.name, function () {
						propertyModififerStack.push(new Modifier(modififer.name));
					});
				});

				dotted__.inline(property.name, function (name, value) {
					property.closure(named.object.prototype, name, value, propertyModififerStack);
					propertyModififerStack = [];
				});
			});

			dotted__.end();
		};

		dotted__.on('.stereotype new', addFormstereotype);

		return nameds;

	})(dotted, dotted['.dotted']);


	Object.defineProperty(dotted, 'create', {
		value: function (name) {
			var paramerters = Array.prototype.slice.call(arguments, 1);
			return nameds.instantiate(name, paramerters);
		}
	});

})(dotted);