
var dump = require('./dump');

module.exports = {
	run: function () {
		var query = require('../src/queryObject');
		var numbers = [1, 2, 3];
		//dump(query().select().from(numbers).execute());		
		//dump(query().from(numbers).select().execute());


		//dump(query().select().execute()); //[]
		//dump(query().from(numbers).execute()); // [1, 2, 3]
		//dump(query().execute()); // []


		function isEven(number) {
		  return number % 2 === 0;
		}

		function parity(number) {
		  return isEven(number) ? 'even' : 'odd';
		}

		var numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9]; 

		//SELECT * FROM numbers
		//dump(query().select().from(numbers).execute()); //[1, 2, 3, 4, 5, 6, 7, 8, 9]

		//SELECT * FROM numbers GROUP BY parity
		//dump(query().select().from(numbers).groupBy(parity).execute()); //[["odd",[1,3,5,7,9]],["even",[2,4,6,8]]]		

		function isPrime(number) {
		  if (number < 2) {
		    return false;
		  }
		  var divisor = 2;
		  for(; number % divisor !== 0; divisor++);
		  return divisor === number;
		}

		function prime(number) {
		  return isPrime(number) ? 'prime' : 'divisible';
		}
		
		// dump(query().select().from(numbers).groupBy(parity, prime).execute());

		function odd(group) {
		  return group[0] === 'odd';
		}
		
		//dump(query().select().from(numbers).groupBy(parity).having(odd).execute()); //[["odd",[1,3,5,7,9]]]

		var numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];

		function descendentCompare(number1, number2) {
		  return number2 - number1;
		}
		
		// dump(query().select().from(numbers).orderBy(descendentCompare).execute()); //[9,8,7,6,5,4,3,2,1]		


		var numbers = [1, 2, 3, 4, 5, 7];

		function lessThan3(number) {
		  return number < 3;
		}

		function greaterThan4(number) {
		  return number > 4;
		}

		
		//dump(query().select().from(numbers).where(lessThan3, greaterThan4).execute()); 
		//[1, 2, 5, 7] <- OR filter


		var numbers = [1, 2, 1, 3, 5, 6, 1, 2, 5, 6];

		function greatThan1(group) {
		  return group[1].length > 1;
		}

		function isPair(group) {
		  return group[0] % 2 === 0;
		}

		function id(value) {
		  return value;
		}

		function frequency(group) {
		  return { value: group[0], frequency: group[1].length };      
		}

		
		//dump(query().select(frequency).from(numbers).groupBy(id).having(greatThan1).having(isPair).execute());
		// [{"value":2,"frequency":2},{"value":6,"frequency":2}])		

	}
}


