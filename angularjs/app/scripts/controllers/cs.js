'use strict';

angular.module('app')
    .config(function ($stateProvider) {
        $stateProvider
            .state('app.cs', {
                templateUrl: 'views/cs/cs.html',
                controller: 'case.AppCtrl'
            })
            .state('app.cs.website', {
                url: '/cs/website',
                templateUrl: 'views/cs/website.html',
                data: {caseType: 'Metro Website', title: 'Website Feedback'},
                controller: 'case.CSCtrl'
            })
            .state('app.cs.tripPlanner', {
                url: '/cs/tripPlanner',
                templateUrl: 'views/cs/trip-planner.html',
                data: {caseType: 'Trip Planner', title: 'Trip Planner Feedback'},
                controller: 'case.CSCtrl'
            })
            .state('app.cs.general', {
                url: '/cs/general',
                templateUrl: 'views/cs/general.html',
                data: {caseType: 'Comment', title: 'Other Topics Feedback'},
                controller: 'case.CSCtrl'
            })
            .state('app.cs.ride', {
                url: '/cs/ride',
                templateUrl: 'views/cs/ride.html',
                data: {caseType: 'Bus Ride', title: 'Bus Ride Feedback'},
                controller: 'case.CSCtrl'
            })
            .state('app.cs.driver', {
                url: '/cs/driver',
                templateUrl: 'views/cs/driver.html',
                data: {caseType: 'Bus Driver', title: 'Bus Driver Feedback'},
                controller: 'case.CSCtrl'
            })
            .state('app.cs.shelter', {
                url: '/cs/shelter',
                templateUrl: 'views/cs/shelter.html',
                data: {caseType: 'Bus Stop/Shelter', title: 'Bus Stop/Shelter Feedback'},
                controller: 'case.CSCtrl'
            })
            .state('app.cs.lostFound', {
                url: '/cs/lostFound',
                templateUrl: 'views/cs/lost-found.html',
                data: {caseType: 'Lost Item', title: 'Lost and Found'},
                controller: 'case.CSCtrl'
            })
            .state('app.cs.ro', {
                url: '/cs/ro',
                templateUrl: 'views/cs/ro.html',
                data: {caseType: 'Rideshare Operation', title: 'Van Pool'},
                controller: 'case.CSCtrl'
            })
            .state('app.cs.a3', {
                url: '/cs/a3',
                templateUrl: 'views/cs/a3.html',
                data: {caseType: 'A3', title: 'Access Link'},
                controller: 'case.CSCtrl'
            })
            .state('app.cs.response', {
                template: '<ui-view></ui-view>'
            })
            .state('app.cs.response.ro', {
                url: '/cs/response/ro/:key',
                templateUrl: 'views/cs/roResponse.html',
                controller: 'case.ROResponseCtrl'
            })
            .state('app.cs.response.c3', {
                url: '/cs/response/c3/:key',
                templateUrl: 'views/cs/c3Response.html',
                controller: 'case.IRResponseCtrl'
            })
            .state('app.cs.response.a3', {
                url: '/cs/response/a3/:key',
                templateUrl: 'views/cs/a3Response.html',
                controller: 'case.IRResponseCtrl'
            })
            .state('app.cs.response.general', {
                url: '/cs/response/:key',
                templateUrl: 'views/cs/csResponse.html',
                controller: 'case.ResponseCtrl'
            })
        ;
    })
    .controller('case.AppCtrl', function ($scope, $state, $q, $document, $http, Case, ND) {
        $scope.toggleMain = function (show) {
            var el = angular.element($document[0].querySelector('.main'));
            if (show) {
                el.removeAttr('aria-hidden');
            } else {
                el.attr('aria-hidden', true);
            }
        };
        $scope.cancel = function () {
            $state.go('home');
        };
        $scope.onFileSelect = function ($files) {
            ND.blur();
            if ($files && $files.length) {
                $scope.uploading = true;
                for (var i = 0; i < $files.length; i++) {
                    $scope.uploadFile($files[i]);
                }
            }
        };
        $scope.uploadFile = function (file) {
            var req = {name: file.name, type: file.type, size: file.size, uploading: true};
            $scope.files.push(req);
            var failure = function (json) {
                ND.alert(json.title || 'Upload Failed', json.message);
                _.remove($scope.files, req);
                $scope.uploading = _.some($scope.files, function (c) {
                    return c.uploading;
                });
            };
            var success = function (json) {
                console.log('request ' + JSON.stringify(json));
                angular.extend(req, json.payload);
                console.log('request merged ' + JSON.stringify(req));
                $http.put(json.payload.url, file, {headers: {'Content-Type': file.type}}).then(function () {
                    req.uploading = false;
                    $scope.uploading = _.some($scope.files, function (c) {
                        return c.uploading;
                    });
                }, failure);
            };
            Case.call({action: 'requestUpload', skipBusy: true}, req).then(success, failure);
        };
        $scope.checkUpload = function () {
            var deferred = $q.defer();
            if ($scope.uploading) {
                ND.showBusy('Uploading files');
                $scope.uploadListener = $scope.$watch('uploading', $scope.isUploaded(deferred));
            } else {
                deferred.resolve(true);
            }
            return deferred.promise;
        };
        $scope.isUploaded = function (deferred) {
            return function () {
                if (!$scope.uploading) {
                    ND.hideBusy();
                    if ($scope.uploadListener) {
                        $scope.uploadListener(); //unwatch
                        $scope.uploadListener = null;
                    }
                    deferred.resolve(true);
                }
            };
        };
        $scope.resetFiles = function () {
            $scope.files = [];
        };
        $scope.uploadedFileIds = function () {
            var ids = [];
            _.forEach($scope.files, function (c) {
                if (c.id) {
                    ids.push(c.id);
                }
            });
            return ids;
        };
        $scope.resetFiles();
        $scope.$on('modal.open', function () {
            $scope.toggleMain(false);
        });
        $scope.$on('modal.close', function () {
            $scope.toggleMain(true);
        });
    })
    .controller('case.CSCtrl', function ($scope, $state, $filter, $q, $location,Case, ND) {
        $scope.searchStops = function (query) {
            if (!query || query.length < 2) return [];
            return Case.call({action: 'searchStops', skipBusy: true}, {query: query}).then(function (json) {
                return json.payload.stops || [];
            });
        };
        $scope.onStopSelect = function (item) {
            $scope.input.location = item.label;
            $scope.input.stopId = item.id;
            $scope.map.setCenter(item);
            $scope.resetMarkers();
            var marker = new google.maps.Marker({
                position: item,
                map: $scope.map,
                title: item.label,
                icon: 'images/busstop.png',
                location: item
            });
            $scope.markers.push(marker);
        };
        $scope.resetMarkers = function () {
            angular.forEach($scope.markers, function (c) {
                c.setMap(null);
                google.maps.event.clearInstanceListeners(c);
            });
            $scope.markers = [];
        };
        $scope.checkCustomer = function () {
            $scope.control.allowTripLookup = $scope.input.name && $scope.input.date && $scope.input.category !== 'saw' && $scope.input.accessId;
        };
        $scope.findTrip = function () {
            if ($scope.input.name && $scope.input.date) {
                delete $scope.a3Trips;
                var req = angular.extend(_.pick($scope.input, 'name', 'accessId', 'phone', 'email'), {date: $filter('date')($scope.input.date, 'yyyy-MM-dd HH:mm:ss')});
                Case.call({action: 'searchTrips', skipBusy: true}, req).then(function (json) {
                    if (json.payload.contact) {
                        angular.extend($scope.input, json.payload.contact);
                    }
                    if (json.payload.a3Trips && json.payload.a3Trips.length) {
                        $scope.a3Trips = json.payload.a3Trips;
                    } else {
                        ND.alert('No Trip Found', 'No trip found for ' + $scope.input.name + ' on ' + $filter('date')($scope.input.date, 'shortDate'));
                    }
                });
            } else {
                delete $scope.a3Trips;
                ND.alert('No Trip Found', 'No trip found for ' + $scope.input.name + ' on ' + $filter('date')($scope.input.date, 'shortDate'));
            }
        };
        $scope.selectTrip = function () {
            if ($scope.input.trip) {
                var trip = _.find($scope.a3Trips, 'Id', $scope.input.trip);
                if (trip) {
                    var m = moment(trip.date + ' ' + trip.time, 'YYYY-MM-DD hh:mm a').second(0).millisecond(0);
                    $scope.input.time = new Date(m.valueOf());
                }
            }
        };
        $scope.setChoice = function () {
            if ($scope.input.category !== 'rider') {
                $scope.input.accessId = null;
            }
            $scope.checkCustomer();
        };
        $scope.selectContactPreference = function () {
            $scope.$broadcast('show-errors-reset');
        };
        $scope.setDate = function () {
            $scope.form.date.$setValidity('required', true);
            delete $scope.a3Trips;
            $scope.checkCustomer();
        };
        $scope.selectTime = function () {
            if ($scope.form.time) {
                $scope.form.time.$setValidity('required', $scope.input.time);
                $scope.$broadcast('show-errors-check-validity', 'time');
            }
        };
        $scope.submit = function () {
            if ($state.is('app.cs.ride') || $state.is('app.cs.driver') || $state.is('app.cs.lostFound')) {
                if ($scope.input.date) {
                    var d = moment($scope.input.date);
                    var minDate = $state.is('app.cs.lostFound') ? $scope.date.lostDate : $scope.date.minDate;
                    if (d.isBefore(minDate) || d.isAfter($scope.date.maxDate)) {
                        $scope.form.date.$setValidity('required', false);
                    }
                }
            }
            if ($scope.form.$error && $scope.form.$error.recaptcha) {
                $scope.form.recaptcha.$setValidity('required', false);
            }
            $scope.$broadcast('show-errors-check-validity');
            if ($scope.form.$valid) {
                $scope.checkUpload().then($scope.saveCase);
            } else {
                var count = 0;
                angular.forEach($scope.form.$error, function (val, key) {
                    if (key !== 'recaptcha') {
                        count += val.length;
                    }
                });
                ND.alert('Incomplete Information', 'There are ' + count + ' required fields to complete. They have been highlighted.');
            }
        };
        $scope.saveCase = function () {
            var d = $scope.input.date ? $scope.input.date : new Date();
            if ($scope.input.time) {
                d.setHours($scope.input.time.getHours());
                d.setMinutes($scope.input.time.getMinutes());
            }
            $scope.input.incidentDate = $filter('date')(d, 'yyyy-MM-dd HH:mm:ss');
            $scope.input.webRequest = $scope.tracker
            $scope.input.files = $scope.uploadedFileIds();
            Case.call('saveCase', angular.toJson($scope.input), $scope.control.forceSave).then(function (json) {
                if (json.success) {
                    if ($scope.files && $scope.files.length) {
                        var promises = _.map($scope.files, function (c) {
                            c.parentId = ND.id(json.payload);
                            return Case.call('finishUpload', c);
                        });
                        $q.all(promises).then(function () {
                            $scope.files = [];
                            ND.confirm(json.title, json.message, {btns: ['Close'], callback: $scope.cancel});
                        });
                    } else {
                        ND.confirm(json.title, json.message, {btns: ['Close'], callback: $scope.cancel});
                    }
                } else {
                    ND.confirm(json.title, json.message, {
                        btns: ['Yes', 'No'], callback: function () {
                            $scope.control.forceSave = true;
                            $scope.saveCase(true);
                        }
                    });
                }
            });
        };
        $scope.selectType = function () {
            var serviceType = $scope.input.serviceType ? _.find($scope.serviceTypes, 'value', $scope.input.serviceType) : null;
            if (serviceType) {
                if (serviceType.gtfs) {
                    $scope.useBus = true;
                } else {
                    $scope.useBus = false;
                }
                $scope.input.route = null;
                $scope.input.bus = null;
                $scope.input.direction = null;

                var routes = _.filter($scope.routes, 'serviceType', $scope.input.serviceType);
                if (routes.length === 0) {
                    $scope.useRoute = false;
                } else {
                    $scope.useRoute = true;
                    if (routes.length === 1) {
                        $scope.input.route = routes[0].value;
                    }
                }
            } else {
                $scope.useBus = true;
                $scope.useRoute = true;
                $scope.input.route = null;
                $scope.input.bus = null;
                $scope.input.direction = null;
            }
        };
        $scope.reset = function () {
            $scope.$broadcast('show-errors-reset');
            Case.setPageTitle($state.current.data.title + ' - King County Metro Transit');
            $scope.resetFiles();
            $scope.input = {date: null, time: null, caseType: $state.current.data.caseType, contactPreference: 'Email', 'contactTarget': 'rider', files: []};
            $scope.control = {forceSave: false, allowTripLookup: false};
            $scope.recaptchaKey = '6LdahQwTAAAAADHrTB2aL4EyzG7TRzajmMUQJjMR';
            var templateId = $location.search().templateId;
            if(templateId){
                $scope.input.templateId = templateId;
            }
            Case.call('initCase', $scope.input).then(function (json) {
                angular.extend($scope, json.payload);
                if($scope.templates && $scope.templates.length > 0){
                    $scope.formTitle = $scope.templates[0].Form_Title__c;
                    $scope.formHeader = $scope.templates[0].Header__c;
                }
                if ($state.is('app.cs.lostFound')) {
                    $scope.input.lostItemColorStyle = 'One Color';
                    $scope.serviceTypes = _.filter($scope.serviceTypes, 'lostEnabled', true);
                } else if ($state.is('app.cs.a3')) {
                    Case.setBannerTitle('Access Community');
                }
            });
        };
        $scope.date = {
            opened: false,
            lostDate: moment().subtract(30, 'days').startOf('day').toDate(),
            minDate: moment().subtract(30, 'days').startOf('day').toDate(),
            maxDate: moment().endOf('day').toDate(),
            format: 'shortDate',
            inputFormats: ['M!/d!/yyyy', 'M!/d!/yy', 'M!/d!'],
            clear: function () {
                $scope.input.date = null;
            },
            open: function ($event) {
                $event.preventDefault();
                $event.stopPropagation();
                this.opened = true;
            }
        };
        $scope.cal = {
            opened: {},
            format: 'shortDate',
            inputFormats: ['M!/d!/yyyy', 'M!/d!/yy', 'M!/d!'],
            options: {showWeeks: false, minDate: moment().subtract(60, 'days').startOf('day').toDate(), maxDate: moment().endOf('day').toDate()},
            birthdateOptions: {showWeeks: false, minDate: moment().subtract(120, 'years').startOf('day').toDate(), maxDate: moment().endOf('day').toDate()},
            open: function (which) {
                this.opened[which] = true;
            }
        };
        $scope.$on('mapInitialized', function (evt, map) {
            $scope.map = map;
            map.set('scrollwheel', false);
            google.maps.event.addListener(map, 'click', $scope.findNearbyStops);
            angular.forEach($scope.markers, function (c) {
                c.setMap($scope.map);
            });
        });
        $scope.markers = [];
        $scope.formTitle = null;
        $scope.formHeader = null;
        $scope.reset();
        $scope.$watch('input.time', $scope.selectTime);
    })
    .controller('case.ROResponseCtrl', function ($scope, $state, $stateParams, Case, ND) {
        $scope.submit = function () {
            $scope.$broadcast('show-errors-check-validity');
            if ($scope.form.$valid) {
                $scope.checkUpload().then($scope.saveComment);
            }
        };
        $scope.saveComment = function () {
            var fileIds = $scope.uploadedFileIds();
            Case.call('saveROComment', $scope.input, fileIds).then(function () {
                ND.confirm('Participant Response Submitted', "We've received your response.", {
                    btns: ['Close'], callback: $scope.cancel
                });
            });
        };
        $scope.input = {};
        $scope.resetFiles();
        Case.call('getROResponse', $stateParams.key).then(function (json) {
            angular.extend($scope, json.payload);
            $scope.input.id = ND.id($scope.response);
            $scope.input.name = $scope.response.Responder_Name__c;
            $scope.input.email = $scope.response.Responder_Email__c;
            Case.setBannerTitle('Rideshare Operation - ' + $scope.case.Service_Type__c);
        });
    })
    .controller('case.IRResponseCtrl', function ($scope, $state, $stateParams, Case, ND) {
        $scope.submit = function () {
            $scope.$broadcast('show-errors-check-validity');
            if ($scope.form.$valid) {
                $scope.checkUpload().then($scope.saveComment);
            }
        };
        $scope.saveComment = function () {
            var fileIds = $scope.uploadedFileIds();
            Case.call('saveIR', $scope.input, fileIds).then(function () {
                ND.confirm('Internal Response Submitted', "We've received your response.", {
                    btns: ['Close'], callback: $scope.cancel
                });
            });
        };
        $scope.input = {};
        $scope.resetFiles();
        Case.setPageTitle('Internal Response Form');
        Case.call('getIR', $stateParams.key).then(function (json) {
            angular.extend($scope, json.payload);
            $scope.input.id = ND.id($scope.response);
            $scope.input.name = $scope.response.Responder_Name__c;
            $scope.input.email = $scope.response.Responder_Email__c;
        });
    })
    .controller('case.ResponseCtrl', function ($scope, $state, $stateParams, $q, Case, ND) {
        $scope.submit = function () {
            $scope.$broadcast('show-errors-check-validity');
            if ($scope.form.$valid) {
                $scope.checkUpload().then($scope.saveComment);
            }
        };
        $scope.saveComment = function () {
            var fileIds = $scope.uploadedFileIds();
            Case.call('saveComment', $scope.case.Id, $scope.input.comment, fileIds).then(function () {
                ND.confirm('Case Response Submitted', "We've received your response.", {
                    btns: ['Close'], callback: function () {
                        $state.go('home');
                    }
                });
            });
        };
        $scope.close = function () {
            $state.go('home');
        };
        $scope.input = {};
        $scope.resetFiles();
        Case.setPageTitle('Case Response Form');
        Case.call('getCase', $stateParams.key).then(function (json) {
            angular.extend($scope, json.payload);
        }, function () {
            $state.go('home');
        });
    })
;
