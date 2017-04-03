

var dump = require('./dump');

module.exports = {
	run: function () {

		var calc = require('../src/expressions');

		var tests = [
		  ['12 + 24', 36],
		  ['1 - 1', 0],
		  ['1* 1', 1],
		  ['1 /1', 1],
		  ['-123', -123],
		  ['123', 123],
		  ['2 /2+3 * 4.75- -6', 21.25],
		  ['12* 123', 1476],
		  ['2 / (2 + 3) * 4.33 - -6', 7.732],
		];
		tests.forEach(function (m) {			
			if(calc(m[0]) !== m[1]) {
				dump({ R: 'FAILED', 'Expression': m[0], 'Expected' : m[1]});
			}		  
		});		

	}
}