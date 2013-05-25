(function (dotted) {

	var Stereotype = function (name) {
		this.name = name;

		this.isSingleton = false;

		this.properties = [];
		this.modififers = [];
	};

	var Property = function (name, closure) {
		this.name = name;
		this.closure = closure || function () {};
		this.modififers = [];
	};

	var Modifier = function (name) {
		this.name = name;
	};

	(function (dotted, dotted__) {
		var stereotype = new Stereotype();
		var property = new Property();

		dotted__
		.begin('stereotype',
			function (name) {
				stereotype = new Stereotype(name);
			},
			function () {
				dotted__.fire('.stereotype new', stereotype);
				stereotype = null;
			}
		)
			.flag('singleton', function () {
				stereotype.isSingleton = true;
			})
			.inline('modifier', function (name) {
				stereotype.modififers.push(new Modifier(name));
			})
			.begin('property',
				function (name, closure) {
					property = new Property(name, closure);
				},
				function () {
					stereotype.properties.push(property);
					property = null;
				}
			)
				.inline('modifier', function (name) {
					property.modififers.push(new Modifier(name));
				})
			.end()
		.end();

	})(dotted, dotted['.dotted']);

})(dotted);