'use strict';
angular
    .module('app', [
        'nd', 'ngAria','ngSanitize','ngMap'
    ])
    .config(function ($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('/');
        $stateProvider
            .state('home', {
                url: '/',
                controller: 'HomeCtrl'
            })
            .state('app', {
                templateUrl: 'views/app.html'
            });
    })
  .run(function ($state, $rootScope, $http) {
      $http.get('https://api.ndcloud.com/v1/device-info').then(function (resp) {
        var payload = resp.data.payload;
        var browser = payload.ua ? payload.ua.browser || {} : {};
        var os = payload.ua ? payload.ua.os || {} : {};
        var ua = {ip: payload.ip, browser: browser.name, version: browser.version, os: os.name};
        $rootScope.tracker = ua;
      });
  })
  .filter('address', function () {
        return function (addr, addrType, separator) {
            if (addr) {
                addrType = _.capitalize(addrType);
                separator = separator ? (separator + ' ') : ' ';
                return _.filter([addr[addrType + 'Street'], addr[addrType + 'City'], addr[addrType + 'State'], addr[addrType + 'PostalCode']],
                    function (c) {
                        return !!c;
                    }).join(separator);
            } else {
                return '';
            }
        };
    })
    .factory('Case', function ($rootScope, ND) {
        var $scope = ND.service('CS_AppController');
        $rootScope.copyrightYear = new Date().getFullYear();
        $rootScope.bannerTitle = 'Customer Community';
        $scope.setPageTitle = function (title) {
            $rootScope.pageTitle = title;
        };
        $scope.setBannerTitle = function (title) {
            $rootScope.bannerTitle = title;
        };
        return $scope;
    })
    .factory('ORCA', function ($rootScope, ND) {
        var $scope = ND.service('ORCA_AppController');
        $scope.setPageTitle = function (title) {
            $rootScope.pageTitle = title;
        };
        return $scope;
    })
    .directive('numberInput', function () {
        return {
            restrict: 'A',
            require: '?ngModel',
            link: function (scope, elem, attrs, ctrl) {
                if (!ctrl) return;
                var sanitize = function(s) {
                    var cleaned;
                    console.log('input:' + s)
                    if (s && (typeof s === 'string' || s instanceof String)) {
                        cleaned = s.replace(',', '');
                    } else {
                        cleaned = s;
                    }
                    console.log('cleaned: ' + cleaned);
                    return cleaned;
                }
                ctrl.$formatters.unshift(function (a) {
                    console.log('***input: ' + a);
                    return a;
                });
                ctrl.$parsers.unshift(function(a) {
                    return sanitize(a);
                });
            }
        };
    })
;
