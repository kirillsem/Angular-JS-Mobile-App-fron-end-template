
angular.module("DPFMA.global", [])
    .factory("$global", [function(){
		return {
			datePicker: function(elemId, $scope){
				var F = elemId.replace(".", "_");
				eval("\
					$scope.today_" + F + " = function(){\
						$scope." + F + " = new Date();\
					};\
					$scope.today_" + F + "();\
					\
					$scope.clear_" + F + " = function () {\
						$scope." + F + " = null;\
					};\
					\
					/* Disable weekend selection */\
					$scope.disabled_" + F + " = function(date, mode) {\
						return(mode === \"day\" && (date.getDay() === 0 || date.getDay() === 6));\
					};\
					\
					$scope.toggleMin_" + F + " = function() {\
						$scope.minDate_" + F + " = $scope.minDate_" + F + "? null: new Date();\
					};\
					$scope.toggleMin_" + F + "();\
					\
					$scope.open_" + F + " = function($event) {\
						$event.preventDefault();\
						$event.stopPropagation();\
						\
						$scope.opened_" + F + " = true;\
					};\
					\
					$scope.dateOptions_" + F + " = {\
						formatYear: \"yy\",\
						startingDay: 1\
					};\
				");
			},
			messageBox: function(text, type, okCallback){
				if(type == "close"){
					if($(".messageBox").length){
						$(".messageBox").remove();
					}
					return false;
				}

				////////////////
				var html = "\
					<div class = \"messageBox\">\
						<div class = \"box-section\">\
							<p class = \"box-title\">Match Organiser</p>\
							<p class = \"box-text\">" + (text? text: "Match Organiser") + "</p>\
				";
				////
				switch(type){
					case "confirm":
						html += "\
							<p class = \"box-control control-col-2\">\
								<a class = \"button-cancel\">Cancel</a>\
								<a class = \"button-ok\">OK</a>\
							</p>\
						";
						break;
					default:
						html += "\
							<p class = \"box-control control-col-1\">\
								<a class = \"button-ok\">OK</a>\
							</p>\
						";
						break;
				}
				html += "\
						</div>\
					</div>\
				";
				$("body").append(html);
				$(".messageBox").show();
				var top = (window.innerHeight - $(".messageBox .box-section").height() - 20) / 2;
				$(".messageBox .box-section").css({"top": top + "px"}).animate({ transform: "scale(2.0)", opacity: 0.5}, 10, "linear", function(){
					$(this).animate({ transform: "scale(0.6)", opacity: 0.7}, 5, "linear", function(){
						$(this).animate({ transform: "scale(1.0)", opacity: 0.9}, 2);
					}).delay(100);
				}).delay(100);
				
				/// actions
				$(".messageBox .box-section .button-ok").click(function(){
					// close popup
					$(".messageBox .box-section").fadeOut(200, function(){
						$(".messageBox").remove();

						if(okCallback){
							okCallback();
						}
					});
					return;
				});
				$(".messageBox .box-section .button-cancel").click(function(){
					// close popup
					$(".messageBox .box-section").fadeOut(200, function(){
						$(".messageBox").remove();
					});
					return;
				});
				return true;
			},
			isEmail: function(email){
				var pattern = new RegExp(/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i);
				if(pattern.test(email)){
					return true;
				} else {
					return false;
				}
			},
			createID: function(){
				return new Date().getTime() + "" +  Math.floor((Math.random() * 100000) + 1);
			}
		}
    }])