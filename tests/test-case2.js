


var dump = require('./dump');

module.exports = {
	run: function () {
		var query = require('./sql-kata');

		function name(person) {
		  return person.name;
		}
		function professionGroup(group) {
		  return group[0];
		}

		function profession(person) {
		  return person.profession;
		}
		function isTeacher(person) {
		  return person.profession === 'teacher';
		}
		var persons = [
		  {name: 'Peter', profession: 'teacher', age: 20, maritalStatus: 'married'},
		  {name: 'Michael', profession: 'teacher', age: 50, maritalStatus: 'single'},
		  {name: 'Peter', profession: 'teacher', age: 20, maritalStatus: 'married'},
		  {name: 'Anna', profession: 'scientific', age: 20, maritalStatus: 'married'},
		  {name: 'Rose', profession: 'scientific', age: 50, maritalStatus: 'married'},
		  {name: 'Anna', profession: 'scientific', age: 20, maritalStatus: 'single'},
		  {name: 'Anna', profession: 'politician', age: 50, maritalStatus: 'married'}
		];


		//dump(query().select().from(persons).execute());

		//dump(query().select(profession).from(persons).execute()); 


		//SELECT profession FROM persons WHERE profession="teacher" 
		query().select(profession).from(persons).where(isTeacher).execute(); //["teacher", "teacher", "teacher"]

		//SELECT * FROM persons WHERE profession="teacher" 
		query().select().from(persons).where(isTeacher).execute(); //[{person: 'Peter', profession: 'teacher', ...}, ...]



		
		//dump(query().select(name).from(persons).where(isTeacher).execute());//["Peter", "Michael", "Peter"]		
		//dump(query().select().from(persons).groupBy(profession).execute());
		//dump(query().select().from(persons).where(isTeacher).groupBy(profession).execute());
		//dump(query().select(professionGroup).from(persons).groupBy(profession).execute());


		var teachers = [
		  {
		    teacherId: '1',
		    teacherName: 'Peter'
		  },
		  {
		    teacherId: '2',
		    teacherName: 'Anna'
		  }
		];


		var students = [
		  {
		    studentName: 'Michael',
		    tutor: '1'
		  },
		  {
		    studentName: 'Rose',
		    tutor: '2'
		  }
		];

		function teacherJoin(join) {
		  return join[0].teacherId === join[1].tutor;
		}

		function student(join) {
		  return {studentName: join[1].studentName, teacherName: join[0].teacherName};
		}

		
		//dump(query().select(student).from(teachers, students).where(teacherJoin).execute()); 
		//[{"studentName":"Michael","teacherName":"Peter"},{"studentName":"Rose","teacherName":"Anna"}]		
	
	}
}




