var app = angular.module("App.Directives", []);
app.directive('validatePhone', function () {
    var PHONE_REGEXP = /^[789]\d{9}$/;
    return {
        link: function (scope, elm) {
            elm.on("keyup", function () {
                var isMatchRegex = PHONE_REGEXP.test(elm.val());
                if (isMatchRegex && elm.hasClass('warning') || elm.val() == '') {
                    elm.removeClass('warning');
                } else if (isMatchRegex == false && !elm.hasClass('warning')) {
                    elm.addClass('warning');
                }
            });
        }
    }
});