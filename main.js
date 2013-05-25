dotted
.stereotype('klass')

	.property('attribute')
	.end()

	.property('method', function (scope, name, closure, modifiers) {
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

var a = dotted.create('AdrienClass');

a.sayHello();
