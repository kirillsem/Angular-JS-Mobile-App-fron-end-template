
angular.module("DPFMA.services", [])
	.constant("servicesConfig", {
		urlRoot: "./json/",
		urlSub: {
			labels: "Labels.json",
			patients: "Patients.json",
			settings: "Settings.json",
			analyses: "CodeRep.json",
			clinical: "ClinicalCodes.json",
			contacts: "Contacts.json",
		}
    })
    .factory("$apiConnector", ["servicesConfig", "$http", "$global", function(servicesConfig, $http, $global) {
        return {
			getData: function($scope, type, func, params, callback){
				var ajaxURL = servicesConfig.urlRoot + servicesConfig.urlSub[func];
				
				////
				$scope.$parent.loadingBar = true;
				$http({method: type, url: ajaxURL, headers: {"Content-Type": "application/json; charset=UTF-8"}, data: params})
					.success(function(response, status, headers, servicesConfig){
						$scope.$parent.loadingBar = false;

						if(callback){
							callback(response);
						}
					})
					.error(function(response, status, headers, servicesConfig){
						$scope.$parent.loadingBar = false;
						alert("Ajax Error");
						
						if(callback){
							callback(response);
						}
					});
				return;
            },
        };
    }]);