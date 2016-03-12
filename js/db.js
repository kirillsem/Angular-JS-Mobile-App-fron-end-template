
angular.module("DPFMA.db", [])
	.constant("dbConfig", {
		db: false,
		shortName: "DPFMA",
		version: "1.0",
		displayName: "Digital prescriptions for medical analyses",
		maxSize: 10 * 1024 * 1024,
		tables: {
			patient: {
				name: "Patient",
				fields: {
					id: "ID",
					data: "DATA",
					date: "DATE"
				}
			},
			prescriber: {
				name: "Prescriber",
				fields: {
					id: "ID", 
					data: "DATA",
					date: "DATE"
				}
			},
			request: {
				name: "Request",
				fields: {
					id: "ID", 
					data: "DATA",
					date: "DATE"
				}
			},
			analyses: {
				name: "Analyses",
				fields: {
					id: "ID", 
					data: "DATA",
					date: "DATE"
				}
			}
		}
    })
	.factory("$db", ["dbConfig", "$global", function(dbConfig, $global){
		return {
			dbInfo: function(){
				return dbConfig;
			},

			// this is called when an error happens in a transaction
			errorHandler: function(error){
				console.log("Error: " + error.message + " code: " + error.code);
			},

			// this is called when a successful transaction happens
			successCallBack: function(){
				//alert("DEBUGGING: success");
			},

			nullHandler: function(){},

			// init local DB
			init: function($scope){
				///
				if (!window.openDatabase){
					console.log("Databases are not supported in this browser.");
					return;
				}

				$scope.$parent.loadingBar = true;

				dbConfig.db = window.openDatabase(dbConfig.shortName, dbConfig.version, dbConfig.displayName, dbConfig.maxSize);

				// create new Tables
				dbConfig.db.transaction(function(tx){
					for(var tb in dbConfig.tables){
						// if not exisr table, create new table
						var sqlStr = "CREATE TABLE IF NOT EXISTS " + dbConfig.tables[tb].name + " (";
						for(var i in dbConfig.tables[tb].fields){
							sqlStr += dbConfig.tables[tb].fields[i] + ", ";
						}
						sqlStr = sqlStr.substr(0, sqlStr.length - 2) + ");";
						
						tx.executeSql(sqlStr, [], this.nullHandler, this.errorHandler);						
					}
				}, this.errorHandler, this.successCallBack);

				$scope.$parent.loadingBar = false;
				return;
			},
			
			// select query
			run_query: function($scope, sql, callback){

				switch(sql.substr(0, 6).toLowerCase()){
					case "select":						
						$scope.$parent.loadingBar = true;
						
						dbConfig.db.transaction(function(transaction){
							transaction.executeSql(sql, [],
								function(transaction, result){
									$scope.$parent.loadingBar = false;

									if (result !== null && result.rows !== null){
										var returnArray = [];
										for(var i = 0; i < result.rows.length; i++){
											returnArray.push(result.rows.item(i));
										}
										if(callback){
											callback(returnArray);
										}
									}
								}, this.errorHandler);
						}, this.errorHandler, this.successCallBack);
						break;
					default:
						// update DB
						dbConfig.db.transaction(function(transaction){
							transaction.executeSql(sql, [], this.nullHandler, this.errorHandler);
						}, this.errorHandler, this.successCallBack);
						break;
				}
				return;
			}
		}
    }])