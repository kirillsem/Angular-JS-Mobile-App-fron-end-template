
angular.module("DPFMA.controllers", [])

///////////////////////////////
// Global controller

.controller("DPFMAcontroller", ["$scope", "$location", "$apiConnector", "$global", "$db", function($scope, $location, $apiConnector, $global, $db){
	// confirm mobile screen
	var mobileScreenFlag = function(){
		if(window.innerWidth > 768){
			$scope.mobileScreenFlag = false;
		} else {
			$scope.mobileScreenFlag = true;
		}
	};
	window.onresize = function(){
		$scope.$apply(function(){
			mobileScreenFlag();
		});
	};
	mobileScreenFlag();

	/////////////////////////////
	//// DB
	$db.init($scope);
	$db.tbl = $db.dbInfo().tables;
	
	///////////////////////////////
	//// init App DATA

	// get Label info
	$apiConnector.getData($scope,
		"GET",
		"labels",
		{}, 
		function(response){
			$__DATA.labels = {};
			response = response.Labels.Label;
			for(var i = 0; i < response.length; i++){
				var pattern = response[i].refLabel.replace(/ /g, "_");
				eval("\
					$__DATA.labels." + pattern + "_en = '" + response[i].langLabel + "';\
					$__DATA.labels." + pattern + " = '" + response[i].refLabel + "';\
				");
			/*	eval("\
					$__DATA.labels." + pattern + " = '" + response[i].langLabel + "';\
					$__DATA.labels." + pattern + "_en = '" + response[i].refLabel + "';\
				");*/
			}

			$scope.labels = $__DATA.labels;
			return;
		}
	);

	// get Clinical info
	$apiConnector.getData($scope,
		"GET",
		"clinical",
		{}, 
		function(response){
			$scope.ClinicalCodes = response.ClinicalCodes;
			return;
		}
	);

	// get Contacts info
	$apiConnector.getData($scope,
		"GET",
		"contacts",
		{}, 
		function(response){
			$scope.Contacts = response.Contacts;
			return;
		}
	);

	// get Patients info
	$apiConnector.getData($scope,
		"GET",
		"patients",
		{}, 
		function(response){
			$scope.InfoPatients = [];
			angular.forEach(response.Patients.Patient, function(p){
				p.ID = $global.createID();
				$scope.InfoPatients.push(p);
			});

			return;
		}
	);

	// get Settings info
	$apiConnector.getData($scope,
		"GET",
		"settings",
		{}, 
		function(response){
			$scope.InfoSettings = response.Settings;
			return;
		}
	);

	// get Analyses info
	$apiConnector.getData($scope,
		"GET",
		"analyses",
		{}, 
		function(response){
			$scope.InfoAnalyses = response.Daf;
			return;
		}
	);


	//////////////////////////////////
	//// Global Actions

	// Sign Out
	$scope.signOut = function(){
		$global.messageBox("Are you sure you want to Sign Out?", "confirm", function(){
			$scope.$apply(function(){
				$scope.SigninUserName = "";
				$scope.SigninUserOrganization = "";

				$location.path("/");
			});
		});
	};

	// init clinical array
	$scope.initClinical = function(currentClinical){
		if(currentClinical){
			var fixedClinicalCodes = [];
			angular.forEach($scope.ClinicalCodes, function(p_c){
				var addedFlag = false;
				angular.forEach(currentClinical, function(c_c){
					if(p_c.cliCode == c_c.cliCode){
						addedFlag = true;
					}
				});

				if(!addedFlag){
					fixedClinicalCodes.push(p_c);
				}
			});
			return fixedClinicalCodes;
		} else {
			return $scope.ClinicalCodes;
		};
	};

	// init contacts array
	$scope.initContacts = function(currentContacts){
		if(currentContacts){
			var fixedContacts = [];
			angular.forEach($scope.Contacts, function(c){
				var addedFlag = false;
				angular.forEach(currentContacts, function(c_c){
					if(c.conCode == c_c.conCode){
						addedFlag = true;
					}
				});

				if(!addedFlag){
					fixedContacts.push(c);
				}
			});
			return fixedContacts;
		} else {
			return $scope.Contacts;
		};
	};

	//////
}])

// Sign in Page Controller
.controller("SigninController", ["$scope", "$route", "$location", "$apiConnector", "$global", function($scope, $route, $location, $apiConnector, $global){	
	$scope.$parent.activedMenu = "signin";

	/////////////////////////////////////
	//// Actions
	
	// check UserName field by "Enter" keyup event
	$scope.enterUserName = function(e){
		if(e && e.keyCode == 13){
			if($scope.UserName){
				$scope.Password = "";
				$scope.focusPassword = true;
			}
		}
	};
	
	// check Password field by "Enter" keyup event
	$scope.enterPassword = function(e){
		if(e && e.keyCode == 13){
			$scope.focusPassword = false;
			$scope.SignIn();
		}
	};

	// Sign in
	$scope.SignIn = function(){
		// confirm UserName field
		if(!$scope.UserName || $scope.InfoSettings.AppUser.Authorisation.uName != $scope.UserName){
			$global.messageBox("Please enter " + $scope.labels.UserName + " correctly.", "alert", function(){
				$scope.$apply(function(){
					$scope.UserName = "";
					$scope.focusUserName = true;
				});
			});
			return;
		}

		// confirm Password field
		if(!$scope.Password || $scope.InfoSettings.AppUser.Authorisation.uPsw != $scope.Password){
			$global.messageBox("Please enter " + $scope.labels.Password + " correctly.", "alert", function(){
				$scope.$apply(function(){
					$scope.Password = "";
					$scope.focusPassword = true;
				});
			});
			return;
		}
		
		var foundPracticeFlag = false;
		angular.forEach($scope.InfoSettings.Registry.RegistryEntry, function(r){
			if(r.parClass == "Practice"){
				// setup header text
				$scope.$parent.SigninUserName = $scope.InfoSettings.Prescriber.presName + " " + $scope.InfoSettings.Prescriber.presFirstName.substring(0, 1);
				$scope.$parent.SigninUserOrganization = r.parValue;
				
				foundPracticeFlag = true;

				// redirect first work page(Welcome page)
				$location.path("/welcome");
			}
		});
		
		if(!foundPracticeFlag){
			$global.messageBox("Sorry, not found Practice info.");
		}

		//////
	};

	//////
}])

// Welcome Page Controller
.controller("WelcomeController", ["$scope", "$route", "$location", "$apiConnector", "$global", function($scope, $route, $location, $apiConnector, $global){
	$scope.$parent.activedMenu = "welcome";
}])

// Patient List Page Controller
.controller("PatientController", ["$scope", "$route", "$location", "$apiConnector", "$global", "$db", function($scope, $route, $location, $apiConnector, $global, $db){
	$scope.$parent.activedMenu = "patients";

	/////////////////////////////////////
	//// init form	
	
	// create pageination
	$scope.currentPage = 1;
	$scope.maxSize = 3;
	$scope.itemsPerPage = 10;	
	
	///////////////////////////////
	///// Actions

	$scope.newPatientFlag = false;

	// init selected info
	$scope.initPatient = function(){
		$scope.focus = {};

		$scope.selPatient = {
			ID:					"",
			name:				"",
			fName:				"",
			rrn:				"",
			socialSecurityNbr:	"",
			gender:				"",
			birthDate:			"",
			street:				"",
			zip:				"",
			city:				"",
			tel:				"",
			gcm:				"",
			email:				"",
			clinicals:			[],
			addtionalRemarks:	""
		};

		$scope.view_ClinicalCodes = $scope.$parent.initClinical();
	};
	$scope.initPatient();

	// init datepicker fields
	$global.datePicker("selPatient.birthDate", $scope);

	// select patient from patients list
	$scope.selectPatient = function(pID){
		angular.forEach($scope.$parent.InfoPatients, function(p){
			if(p.ID == pID){
				// get selected patient info
				$scope.selPatient = p;
				$scope.selPatient.clinicals = $scope.selPatient.clinicals? $scope.selPatient.clinicals: [];
				
				// init form by selected patient info
				$scope.newPatientFlag = false;
				$scope.view_ClinicalCodes = $scope.$parent.initClinical($scope.selPatient.clinicals);
			}
		});
	};

	// add new clinical to clinical list as selected Patient
	$scope.addClinical = function(){
		if($scope.newClinical){
			$scope.selPatient.clinicals.push($scope.newClinical);
			$scope.view_ClinicalCodes = $scope.$parent.initClinical($scope.selPatient.clinicals);
		} else {
			$global.messageBox("Please select " + $scope.labels.Clinical_Patients + ".", "alert", function(){
				$scope.$apply(function(){
					$scope.focus.newClinical = true;
				});
			});
		}		
		$scope.newClinical = "";
	};
	
	// remove selected clinical from clinical list as selected Patient
	$scope.deleteClinical = function(i){
		$scope.selPatient.clinicals.splice(i, 1);
		$scope.view_ClinicalCodes = $scope.$parent.initClinical($scope.selPatient.clinicals);
	}
	
	// clean up form for creating new patient
	$scope.cleanupForm = function(newFromFlag){
		$scope.initPatient();
		$scope.newPatientFlag = newFromFlag;
	};

	////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////
	// validate form
	var validation = function(){
		// validation name field
		if(!$scope.selPatient.name){
			$global.messageBox("Please enter " + $scope.labels.Name + " correctly.", "alert", function(){
				$scope.$apply(function(){
					$scope.focus.name = true;
				});
			});
			return;
		}

		// validation first name field
		if(!$scope.selPatient.fName){
			$global.messageBox("Please enter " + $scope.labels.FirstName + " correctly.", "alert", function(){
				$scope.$apply(function(){
					$scope.focus.fName = true;
				});
			});
			return;
		}

		// validation RRN field
		if(!$scope.selPatient.rrn){
			$global.messageBox("Please enter " + $scope.labels.RRN + " correctly.", "alert", function(){
				$scope.$apply(function(){
					$scope.focus.rrn = true;
				});
			});
			return;
		}

		// validation gender field
		if(!$scope.selPatient.gender){
			$global.messageBox("Please enter " + $scope.labels.Gender + " correctly.");
			return;
		}

		// validation birthday field
		var value_birthDate = moment($scope.selPatient.birthDate).format("DD/MM/YYYY") == "Invalid date"? $scope.selPatient.birthDate: moment($scope.selPatient.birthDate).format("DD/MM/YYYY");
		if(!$scope.selPatient.birthDate || moment(value_birthDate, "DD/MM/YYYY").format() >= moment(new Date()).format()){
			$global.messageBox("Please enter " + $scope.labels.Birthday + " correctly.");
			return;
		}
		
		// return validated data
		return {
			ID:					$scope.selPatient.ID? $scope.selPatient.ID: $global.createID(),
			name:				$scope.selPatient.name,
			fName:				$scope.selPatient.fName,
			rrn:				$scope.selPatient.rrn,
			socialSecurityNbr:	$scope.selPatient.socialSecurityNbr? $scope.selPatient.socialSecurityNbr: "",
			gender:				$scope.selPatient.gender,
			birthDate:			value_birthDate,
			street:				$scope.selPatient.street? $scope.selPatient.street: "",
			zip:				$scope.selPatient.zip? $scope.selPatient.zip: "",
			city:				$scope.selPatient.city? $scope.selPatient.city: "",
			tel:				$scope.selPatient.tel? $scope.selPatient.tel: "",
			gcm:				$scope.selPatient.gcm? $scope.selPatient.gcm: "",
			email:				$scope.selPatient.email? $scope.selPatient.email: "",
			clinicals:			$scope.selPatient.clinicals? $scope.selPatient.clinicals: "",
			addtionalRemarks:	$scope.selPatient.addtionalRemarks? $scope.selPatient.addtionalRemarks: ""
		};
	};
	
	// save new Patient
	$scope.createNewPatient = function(){
		var newP = validation();
		if(!newP){
			return;
		}

		$global.messageBox("Are you sure you want to create this patient?", "confirm", function(){
			$scope.$apply(function(){
				// add new patient to DB
				var db_field = $db.tbl.patient.fields;			
				console.log("INSERT INTO " + $db.tbl.patient.name + " (" + db_field.id + ", " + db_field.data + ", " + db_field.date + ") VALUES ('" + $global.createID() + "', '" + JSON.stringify(newP) + "', '" + moment().format() + "');");
				
				// add new patient to $scope array
				$scope.$parent.InfoPatients.push(newP); 

				// init form
				$scope.initPatient();
				
				// alert message
				$global.messageBox("Created new Patient info successfully!");
			});
		});
		return;
	};
	
	// update Patient
	$scope.updateSelectedPatient = function(){
		var updateP = validation();
		if(!updateP){
			return;
		}
		
		/////
		var db_field = $db.tbl.patient.fields;			
		console.log("UPDATE " + $db.tbl.patient.name + " SET " + db_field.data + " = '" + JSON.stringify(updateP) + "', " + db_field.date + " = '" + moment().format() + "' WHERE " + db_field.id + " = '" + $scope.selPatient.ID + "';");

		angular.forEach($scope.$parent.InfoPatients, function(p, $index){
			if(p.ID == $scope.selPatient.ID){
				$scope.$parent.InfoPatients[$index] = updateP;
				
				// alert message
				$global.messageBox("Updated selected Patient info successfully!");
			}
		});
		return;
	};
	
	// delete selected patient from patients list
	$scope.deleteSelectedPatient = function(){
		angular.forEach($scope.$parent.InfoPatients, function(p, $index){
			if(p.ID == $scope.selPatient.ID){
				$global.messageBox("Are you sure you want to delete selected Patient.", "confirm", function(){
					$scope.$apply(function(){

						// delete patient from DB
						var db_field = $db.tbl.patient.fields;
						console.log("DELETE FROM " + $db.tbl.patient.name + " WHERE " + db_field.id + " = '" + $scope.selPatient.ID + "';");

						// delte patient from array
						$scope.$parent.InfoPatients.splice($index, 1);

						// init form
						$scope.initPatient();
						
						// alert message
						$global.messageBox("Deleted selected Patient info successfully!");
					});
				});
			}
		});		
	};
}])

// Requested analyses Page Controller
.controller("RequestController", ["$scope", "$route", "$location", "$apiConnector", "$global", function($scope, $route, $location, $apiConnector, $global){
	$scope.$parent.activedMenu = "request";

	//////////////////////////////////////////////////////////////
	//// Analyses
	// get code items from Group Object
	$scope.getCodeItems = function(G, P, C){
		if(!G.Codes){
			return false;
		}

		////
		G.Codes.Code = G.Codes.Code.length? G.Codes.Code: [G.Codes.Code];
		
		angular.forEach(G.Codes.Code, function(cObj){
			$scope.codesList.push({
				type: "code",
				ChapterDescription: C.ChapterDescription,
				PartDescription: P.PartDescription,
				GroupDescription: G.GroupDescription,
				code: cObj.Code,
				longText: cObj.CodingSystem,
				finalPaymentType: cObj.PaymentType,
				isChecked: false,
				children: cObj.children,
				paymentType: cObj.PaymentType,
				matrix: cObj.Matrix,
				price: cObj.Price,
				description: cObj.Description
			});
		});
	};
	
	// get group items from Part Object
	$scope.getGroupItems = function(P, C){
		if(!P.Groups){
			return false;
		}

		////
		P.Groups.Group = P.Groups.Group.length? P.Groups.Group: [P.Groups.Group];

		angular.forEach(P.Groups.Group, function(G){
			if(G.GroupDescription){
				$scope.codesList.push({
					type: "group",
					description: G.GroupDescription
				});
			}
			
			
			$scope.getCodeItems(G, P, C);
		});
	};
	
	// get Part items from Chapter Object
	$scope.getPartItems = function(C){
		if(!C.Parts){
			return false;
		}

		////
		C.Parts.Part = C.Parts.Part.length? C.Parts.Part: [C.Parts.Part];

		angular.forEach(C.Parts.Part, function(P){
			$scope.codesList.push({
				type: "part",
				description: (P.PartDescription? P.PartDescription: "Part(No Name)")
			});

			$scope.getGroupItems(P, C);
		});
	};
	
	////
	$scope.tabs = [];
	$scope.codesByChapter = [];

	// create tabs
	angular.forEach($scope.InfoAnalyses.Chapters.Chapter, function(C){
		$scope.tabs.push(C.ChapterDescription);
		
		////
		$scope.codesList = [];
		$scope.getPartItems(C);
		$scope.codesByChapter[C.ChapterDescription] = $scope.codesList;
	});
	
	////////////////
	// change Code list when selected Tab
	$scope.selectTab = function(t){
		angular.forEach($scope.InfoAnalyses.Chapters.Chapter, function(C){
			if(t == C.ChapterDescription){
				$scope.codeItems = $scope.codesByChapter[C.ChapterDescription];
			}
		});
	};
	// display Code itemd by default tab (first Chapter)
	$scope.selectTab($scope.InfoAnalyses.Chapters.Chapter[0].ChapterDescription);

	////////
	// init selected info
	$scope.initRequestDetailForm = function(option){
		switch(option){
			case "cancel":
				$scope.detailFlag = false;
				break;
			default:
				///
				if(!$scope.$parent.InfoPatients.length){
					$global.messageBox("Please add a Patient at the least to create new Request.", "confirm", function(){
						$scope.$apply(function(){
							$location.path("/patients");
						});
					});
					return;
				}

				///		
				$scope.focus = {};

				var patientID = typeof($route.current.params.p_id) == "undefined"? null: $route.current.params.p_id;
				if(patientID){
					angular.forEach($scope.$parent.InfoPatients, function(p){
						if(patientID == p.ID){
							p.clinicals = p.clinicals? p.clinicals: [];
							$scope.selPatient = p;
							$scope.view_ClinicalCodes = $scope.$parent.initClinical($scope.selPatient.clinicals);
						}
					});
				} else {
					$scope.$parent.InfoPatients[0].clinicals = $scope.$parent.InfoPatients[0].clinicals? $scope.$parent.InfoPatients[0].clinicals: [];
					$scope.selPatient = $scope.$parent.InfoPatients[0]; console.log($scope.selPatient);
					$scope.view_ClinicalCodes = $scope.$parent.initClinical();
				}

				$scope.selRequest = {
					requestDate: moment().format("DD/MM/YYYY"),
					sampleDate: moment().format("DD/MM/YYYY"),
					urgent: "No",
					copyPatient: "No",
					contacts: [],
				};
				$scope.view_Contacts = $scope.$parent.initContacts();

				$scope.detailFlag = true;
				break;
		}
		
		///////
		return;
	};

	//// init datepicker fields
	$global.datePicker("selPatient.birthDate", $scope);

	$global.datePicker("selRequest.requestDate", $scope);
	$global.datePicker("selRequest.sampleDate", $scope);
	
	//// Actions
	// add new clinical to clinical list as selected Patient
	$scope.addClinical = function(){
		if($scope.newClinical){
			$scope.selPatient.clinicals.push($scope.newClinical);
			$scope.view_ClinicalCodes = $scope.$parent.initClinical($scope.selPatient.clinicals);
		} else {
			$global.messageBox("Please select " + $scope.labels.Clinical_Patients + ".", "alert", function(){
				$scope.$apply(function(){
					$scope.focus.newClinical = true;
				});
			});
		}		
		$scope.newClinical = "";
	};
	
	// remove selected clinical from clinical list as selected Patient
	$scope.deleteClinical = function(i){
		$scope.selPatient.clinicals.splice(i, 1);
		$scope.view_ClinicalCodes = $scope.$parent.initClinical($scope.selPatient.clinicals);
	};

	//// Actions
	// add new contact to contacts list as selected Patient
	$scope.addContact = function(){
		if($scope.newContact){
			$scope.selRequest.contacts.push($scope.newContact);
			$scope.view_Contacts = $scope.$parent.initContacts($scope.selRequest.contacts);
		} else {
			$global.messageBox("Please select " + $scope.labels.Contact + ".", "alert", function(){
				$scope.$apply(function(){
					$scope.focus.newContact = true;
				});
			});
		}		
		$scope.newContact = "";
	};
	
	// remove selected contact from contacts list as selected Patient
	$scope.deleteContact = function(i){
		$scope.selRequest.contacts.splice(i, 1);
		$scope.view_Contacts = $scope.$parent.initContacts($scope.selRequest.contacts);
	};

	//////////
	var validationPatient = function(){
		// validation name field
		if(!$scope.selPatient.name){
			$global.messageBox("Please enter " + $scope.labels.Name + " correctly.", "alert", function(){
				$scope.$apply(function(){
					$scope.focus.name = true;
				});
			});
			return;
		}

		// validation first name field
		if(!$scope.selPatient.fName){
			$global.messageBox("Please enter " + $scope.labels.FirstName + " correctly.", "alert", function(){
				$scope.$apply(function(){
					$scope.focus.fName = true;
				});
			});
			return;
		}

		// validation RRN field
		if(!$scope.selPatient.rrn){
			$global.messageBox("Please enter " + $scope.labels.RRN + " correctly.", "alert", function(){
				$scope.$apply(function(){
					$scope.focus.rrn = true;
				});
			});
			return;
		}

		// validation gender field
		if(!$scope.selPatient.gender){
			$global.messageBox("Please enter " + $scope.labels.Gender + " correctly.");
			return;
		}

		// validation birthday field
		var value_birthDate = moment($scope.selPatient.birthDate).format("DD/MM/YYYY") == "Invalid date"? $scope.selPatient.birthDate: moment($scope.selPatient.birthDate).format("DD/MM/YYYY");
		if(!$scope.selPatient.birthDate || moment(value_birthDate, "DD/MM/YYYY").format() >= moment(new Date()).format()){
			$global.messageBox("Please enter " + $scope.labels.Birthday + " correctly.");
			return;
		}

		return {
			ID:					$scope.selPatient.ID? $scope.selPatient.ID: $global.createID(),
			name:				$scope.selPatient.name,
			fName:				$scope.selPatient.fName,
			rrn:				$scope.selPatient.rrn,
			socialSecurityNbr:	$scope.selPatient.socialSecurityNbr? $scope.selPatient.socialSecurityNbr: "",
			gender:				$scope.selPatient.gender,
			birthDate:			value_birthDate,
			street:				$scope.selPatient.street? $scope.selPatient.street: "",
			zip:				$scope.selPatient.zip? $scope.selPatient.zip: "",
			city:				$scope.selPatient.city? $scope.selPatient.city: "",
			tel:				$scope.selPatient.tel? $scope.selPatient.tel: "",
			gcm:				$scope.selPatient.gcm? $scope.selPatient.gcm: "",
			email:				$scope.selPatient.email? $scope.selPatient.email: "",
			clinicals:			$scope.selPatient.clinicals? $scope.selPatient.clinicals: "",
			addtionalRemarks:	$scope.selPatient.addtionalRemarks? $scope.selPatient.addtionalRemarks: ""
		};
	};
	var validationRequest = function(){
		return {
			reqRequestDate:		moment($scope.selRequest.requestDate).format("DD/MM/YYYY") == "Invalid date"? $scope.selRequest.requestDate: moment($scope.selRequest.requestDate).format("DD/MM/YYYY"),
			reqSampleDate:		moment($scope.selRequest.sampleDate).format("DD/MM/YYYY") == "Invalid date"? $scope.selRequest.sampleDate: moment($scope.selRequest.sampleDate).format("DD/MM/YYYY"),
			reqUrgent:			$scope.selRequest.urgent,
			reqCopyPatient:		$scope.selRequest.copyPatient,
			reqContacts:		$scope.selRequest.contacts
		};
	};
	
	// update Patient/Request Info
	$scope.saveRequestInfo = function(){

		var detailInfoPatient = validationPatient();
		if(!detailInfoPatient){ return; }

		var detailInfoRequest = validationRequest();
		if(!detailInfoRequest){ return; }

		var requestInfo = $.extend({}, detailInfoPatient, detailInfoRequest);

		//////
		console.log($scope.codeItems);
		console.log(requestInfo);

		// hide edit form
		$scope.detailFlag = false;
		return;
	};

	///////////////////
}])

// Result Page Controller
.controller("ResultController", ["$scope", "$route", "$location", "$apiConnector", "$global", function($scope, $route, $location, $apiConnector, $global){
	$scope.$parent.activedMenu = "result";

	/////////
	$scope.processData = [
		{date: "18.07.2014", patient: "patient1", action: "PRINT"},	
		{date: "19.07.2014", patient: "patient2", action: "SEND"},	
		{date: "19.07.2014", patient: "patient32111", action: "SEND"},	
		{date: "19.07.2014", patient: "ppatient42111", action: "SEND"},	
		{date: "19.07.2014", patient: "ppatient52111", action: "SEND"},	
		{date: "19.07.2014", patient: "ppatient62111", action: "SEND"},	
		{date: "19.07.2014", patient: "ppatient72111", action: "SEND"},	
		{date: "19.07.2014", patient: "pppatient82111", action: "SEND"},	
		{date: "19.07.2014", patient: "pppatient92111", action: "SEND"},	
		{date: "19.07.2014", patient: "ppatient02111", action: "SEND"},	
		{date: "19.07.2014", patient: "ppatient42111", action: "SEND"},	
		{date: "19.07.2014", patient: "ppatient521", action: "SEND"},	
		{date: "19.07.2014", patient: "patient621", action: "SEND"},	
		{date: "19.07.2014", patient: "patient721", action: "SEND"},	
		{date: "19.07.2014", patient: "patient8211111", action: "SEND"},	
		{date: "19.07.2014", patient: "patient9211111", action: "SEND"},	
		{date: "19.07.2014", patient: "patient02", action: "SEND"},	
		{date: "19.07.2014", patient: "ppatient42", action: "SEND"},	
		{date: "19.07.2014", patient: "ppatient52", action: "SEND"},	
		{date: "19.07.2014", patient: "pppatient62", action: "SEND"},	
		{date: "19.07.2014", patient: "ppppatient72", action: "SEND"},	
		{date: "19.07.2014", patient: "ppatient82", action: "SEND"},	
		{date: "19.07.2014", patient: "patient92", action: "SEND"},	
		{date: "19.07.2014", patient: "patient02", action: "SEND"},	
	];
	$scope.currentPage = 1;
	$scope.maxSize = 3;
	$scope.itemsPerPage = 10;
}])


// Logistics Page Controller
.controller("LogisticsController", ["$scope", "$route", "$location", "$apiConnector", "$global", function($scope, $route, $location, $apiConnector, $global){
	$scope.$parent.activedMenu = "logistics";
}])

// Settings Page Controller
.controller("SettingsController", ["$scope", "$route", "$location", "$apiConnector", "$global", function($scope, $route, $location, $apiConnector, $global){
	$scope.$parent.activedMenu = "settings";
	////
}])
;