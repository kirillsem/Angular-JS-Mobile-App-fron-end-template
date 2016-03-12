
var $__DATA = {};
var app = angular.module("DPFMA", [
		"ui.bootstrap", 
		"DPFMA.controllers",
		"DPFMA.services", 
		"DPFMA.global", 
		"DPFMA.db", 
		"ngRoute",
		"ngAnimate", 
		"ngTouch", 
		"infinite-scroll"
	])
    .config(["$routeProvider", function(routeProvider){
        routeProvider
            .when("/", {
                templateUrl: "./views/signin.html",
                controller: "SigninController"
            })
            .when("/welcome", {
                templateUrl: "./views/welcome.html",
                controller: "WelcomeController"
            })
            .when("/patients",{
                templateUrl: "./views/patients.html",
                controller: "PatientController"
            })
            .when("/request",{
                templateUrl: "./views/request.html",
                controller: "RequestController"
            })
            .when("/result",{
                templateUrl: "./views/result.html",
                controller: "ResultController"
            })
            .when("/logistics",{
                templateUrl: "./views/logistics.html",
                controller: "LogisticsController"
            })
            .when("/settings",{
                templateUrl: "./views/settings.html",
                controller: "SettingsController"
            })
			.otherwise({redirectTo: "/"})
        ;
    }])
////////////////
.directive('ngFocus', function($timeout, $parse){
	return {
		//scope: true,   // optionally create a child scope
		link: function(scope, element, attrs){
			var model = $parse(attrs.ngFocus);
			scope.$watch(model, function(value) {
				//console.log('value=', value);
				if(value === true) { 
					$timeout(function() {
						element[0].focus(); 
					});
				} else {
					$timeout(function() {
						element[0].blur(); 
					});
				}
			});
			// to address @blesh's comment, set attribute value to 'false'
			// on blur event:
			element.bind('blur', function() {
				//console.log('blur');
				scope.$apply(model.assign(scope, false));
			});
		}
	};
});