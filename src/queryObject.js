/* Query object is a light wright comonent that allows performing */
// SQL style queries and projection on JS arrays and objects.


function query() {
	var emptyFn = function () { };
	var utils = {
		isArray: function(obj) {
			return obj && (Object.prototype.toString.call(obj) === '[object Array]' );
		}
	};

	var queryObj = {	
		errors: [],
		filters: [],
		groupLambdas: [],
		groupFilters: [],
		projection : []
	};

	queryObj.select = function(mapFn) {

		if(queryObj._select) {
			queryObj.errors.push({ message: 'Duplicate SELECT' });
			return queryObj;
		}

		queryObj._select = function (argument) {
			if(mapFn) {
				var refined = [];
				if(queryObj._joinedCollections) {
					for(var x= 0; x < queryObj._joinedCollections.length; ++ x) {
						refined.push(mapFn(queryObj._joinedCollections[x]));
					}
				} else {
					for(var x= 0; x < queryObj.projection.length; ++ x) {
						refined.push(mapFn(queryObj.projection[x]));
					}	
				}
				queryObj.projection = refined;
			}
		}
		return queryObj;
	}

	queryObj.from = function () {
		if(queryObj._from) {
			queryObj.errors.push({ message: 'Duplicate FROM' });
			return queryObj;
		}

		var colsureArgs = arguments;

		queryObj._from = function () {
			queryObj._fromCollections = colsureArgs;
			if(colsureArgs) {
				switch(colsureArgs.length) {
					case 1:					
						if(utils.isArray(colsureArgs[0])) {						
							queryObj.projection = colsureArgs[0];
						}
						break;
					case 2: break;
				}
			}
		}	
		
		return queryObj;
	}

	queryObj.where = function () {
		if(arguments.length > 0) { 
			queryObj.filters.push({ filterFunctions : arguments });
		}



		if(!queryObj._where) {

			queryObj._checkORConditions = function(lambdaCollection, payload) {				
				for(var k=0; k< lambdaCollection.length; ++ k) {
					if(lambdaCollection[k](payload)) {
						return true;
					}
				}
				return false;
			}

			queryObj._where = function () {
				
				var fromCollections = queryObj._fromCollections;
				if(fromCollections.length > 1) {
					var refinedCollection = [];
					for(var i=0; i< fromCollections[0].length; ++ i) {
						for(var j=0; j< fromCollections[1].length; ++ j) {							
							var join = [fromCollections[0][i], fromCollections[1][j]];
							if(queryObj.filters.length > 0) {
								var include = true;
								for(var f = 0; f < queryObj.filters.length; ++ f) {
									var evalResult = queryObj._checkORConditions(queryObj.filters[f].filterFunctions, join);									
									if(!evalResult) {
										include = false
									}
								}
								if(include) {							
									refinedCollection.push(join);
								}
							} else {						
								refinedCollection.push(join);
							}							
						}
					}
					queryObj._joinedCollections = refinedCollection;
				} else {
					var filteredItems = [];
					for(var c = 0; c < queryObj.projection.length; ++ c) {
						var citem = queryObj.projection[c];
						if(queryObj.filters.length > 0) {
							var include = true;
							for(var f = 0; f < queryObj.filters.length; ++ f) {
								var evalResult = queryObj._checkORConditions(queryObj.filters[f].filterFunctions, citem);									
								if(!evalResult) {
									include = false
								}
							}
							if(include) {							
								filteredItems.push(citem);
							}
						} else {						
							filteredItems.push(citem)
						}
					}
					queryObj.projection = filteredItems;
				}
			}
		}
		return queryObj;
	}

	queryObj.groupBy = function (gpLambda) {
		if(gpLambda) {			
			for(var x = 0; x < arguments.length; ++ x) {
				queryObj.groupLambdas.push(arguments[x]);
			}
		}

		if(!queryObj._applyGroupLambda) {
			queryObj._applyGroupLambda = function(collection, lambda) {
				var refined = [];
				for(var x= 0; x < collection.length; ++ x) {
					var item = collection[x], lambdaItem = lambda(item);
					if(lambdaItem) {
						var gpObj = null;
						for(var y = 0; y< refined.length; ++ y) {
							if(refined[y][0] === lambdaItem) {
								gpObj = refined[y];
								break;
							}
						}

						if(gpObj) {
							gpObj[1].push(item);
						} else {
							refined.push([lambdaItem, [item]]);
						}
					}
				}
				return refined;
			}
		}

		if(!queryObj._groupBy) {
			queryObj._groupBy = function () {
				if(queryObj.groupLambdas.length > 0) {					
					queryObj.projection = queryObj._applyGroupLambda(queryObj.projection, queryObj.groupLambdas[0]);
				}
				if(queryObj.groupLambdas.length > 1) {
					var refinedGroups = [];
					for(var p = 0; p < queryObj.projection.length; ++ p) {
						var gpArr = queryObj.projection[p];
						var gpItems = queryObj._applyGroupLambda(gpArr[1], queryObj.groupLambdas[1]);
						refinedGroups.push([gpArr[0], gpItems]);
					}
					queryObj.projection = refinedGroups;
				}
			}			
		}

		return queryObj;
	}

	queryObj.having = function(filterFn) {
		if(filterFn) {
			queryObj.groupFilters.push(filterFn);
		}
		if(!queryObj._having) {
			queryObj._having = function () {
				var filteredItems = [];				
				for(var c = 0; c < queryObj.projection.length; ++ c) {
					var citem = queryObj.projection[c];
					if(queryObj.groupFilters.length > 0) {
						var exclude = false;						
						for(var f = 0; f < queryObj.groupFilters.length; ++ f) {
							if(!queryObj.groupFilters[f](citem)) {								
								exclude = true;
							}
						}
						if(!exclude) {							
							filteredItems.push(citem)	
						}
					} else {						
						filteredItems.push(citem)
					}
				}
				queryObj.projection = filteredItems;							
			}
		}
		return queryObj;
	}

	queryObj.orderBy = function(sortLambda) {
		if(!queryObj._orderBy) {
			var closureLambda = sortLambda;
			queryObj._orderBy = function() {
				queryObj.projection.sort(closureLambda);
			}
		}
		return queryObj;
	}

	queryObj.execute = function () {
		if(queryObj.errors.length > 0) {
			throw new Error(queryObj.errors[0].message);
		}
		(queryObj._from || emptyFn)();
		(queryObj._where || emptyFn)();		
		(queryObj._groupBy || emptyFn)();
		(queryObj._having || emptyFn)();
		(queryObj._select || emptyFn)();
		(queryObj._orderBy || emptyFn)();
		return queryObj.projection;	
	}

	return queryObj;
}



module.exports = query;