'use strict';

angular.module('app')
    .config(function ($stateProvider) {
        $stateProvider
            .state('app.orca', {
                template: '<ui-view></ui-view>'
            })
            .state('app.orca.inquiry', {
                url: '/orca/inquiry/:key',
                templateUrl: 'views/orca/csInquiry.html',
                controller: 'ORCA.InquiryCtrl'
            })
            .state('app.orca.cs', {
                template: '<ui-view></ui-view>'
            })
            .state('app.orca.cs.new', {
                url: '/orca/cs',
                templateUrl: 'views/orca/cs.html',
                controller: 'ORCA.CSCtrl'
            })
            .state('app.orca.cs.response', {
                url: '/orca/cs/response/:key',
                templateUrl: 'views/orca/csResponse.html',
                controller: 'ORCA.CSRCtrl'
            })
            .state('app.orca.cif', {
                url: '/cif/:key',
                templateUrl: 'views/orca/cifform.html',
                controller: 'ORCA.CIFCtrl'
            })
            .state('app.orca.password', {
                url: '/orca/password/:key',
                templateUrl: 'views/orca/password.html',
                controller: 'ORCA.PasswordCtrl'
            })
        ;
    })
    .controller('ORCA.CSCtrl', function ($scope, $state, ORCA, ND) {
        $scope.input = {state: 'WA'};
        ORCA.setPageTitle('ORCA - Employer Commute Services Form');
        $scope.reset = function () {
            $scope.input = {};
            $scope.$broadcast('show-errors-reset');
        };
        $scope.submit = function () {
            $scope.$broadcast('show-errors-check-validity');
            if ($scope.form.$valid) {
                ORCA.call('saveCase', angular.toJson($scope.input)).then(function (json) {
                    ND.confirm('Request Submitted', 'We\'ve received your request. Case No: ' + json.payload.CaseNumber, {
                        btns: ['Close'], callback: function () {
                            $state.go('home');
                        }
                    });
                });
            } else {
                var count = 0;
                angular.forEach($scope.form.$error, function (val) {
                    count += val.length;
                });
                ND.alert('Incomplete Information', 'There are ' + count + ' required fields to complete. They have been highlighted.');

            }
        };
    })
    .controller('ORCA.CSRCtrl', function ($scope, $state, $stateParams, $q, ORCA, ND) {
        $scope.onFileSelect = function ($files) {
            if ($files && $files.length) {
                $scope.uploading = true;
                var success = function (file) {
                    return function (json) {
                        file.uploading = false;
                        file.id = json.id;
                        $scope.input.files.push(json.id);
                        $scope.uploading = _.some($scope.files, function (c) {
                            return c.uploading;
                        });
                    };
                };
                var failure = function (file) {
                    return function () {
                        _.remove($scope.files, file);
                        $scope.uploading = _.some($scope.files, function (c) {
                            return c.uploading;
                        });
                    };
                };
                for (var i = 0; i < $files.length; i++) {
                    var file = {name: $files[i].name, uploading: true};
                    $scope.files.push(file);
                    ND.upload($files[i], {
                        action: 'ORCA_AppController.upload',
                        skipBusy: true
                    }).then(success(file), failure(file));
                }
            }
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
        $scope.submit = function () {
            $scope.$broadcast('show-errors-check-validity');
            if ($scope.form.$valid) {
                $scope.checkUpload().then($scope.saveComment);
            }
        };
        $scope.saveComment = function () {
            ORCA.call('saveComment', $scope.case.Id, $scope.input.comment, $scope.input.files).then(function () {
                ND.confirm('Case Response Submitted', "We've received your response.", {
                    btns: ['Close'], callback: function () {
                        $state.go('home');
                    }
                });
            });
        };
        $scope.close = function () {
            var pop = ND.modal({
                templateUrl: 'views/orca/csRate.html', controller: 'ORCA.CSCloseCtrl', resolve: {
                    $case: function () {
                        return $scope.case;
                    }
                }
            });
            pop.result.then(function (json) {
                if (json) {
                    ND.confirm('Case Closed', 'We\'ve successfully closed your case.', {
                        btns: ['Close'], callback: function () {
                            $state.go('home');
                        }
                    })
                }
            });
        };
        $scope.input = {files: []};
        $scope.files = [];
        ORCA.setPageTitle('ORCA - Case Response Form');
        ORCA.call('getCase', $stateParams.key).then(function (json) {
            angular.extend($scope, json.payload);
        }, function () {
            $state.go('home');
        });
    })
    .controller('ORCA.CSCloseCtrl', function ($scope, $case, ORCA) {
        $scope.input = {};
        $scope.case = $case;
        $scope.submit = function () {
            $scope.$broadcast('show-errors-check-validity');
            if ($scope.form.$valid) {
                ORCA.call('closeCase', $case.Id, $scope.input.rating, $scope.input.feedback || '').then(function () {
                    $scope.$close(true);
                });
            }
        };
    })
    .controller('ORCA.CIFCtrl', function ($scope, $state, $stateParams, $filter, ORCA, ND) {
        $scope.copyAddress = function (index) {
            if ($scope.control.copyAddress[index]) {
                var contact = $scope.input.contacts[index].con;
                var company = $scope.input.company;
                contact.MailingStreet = company.BillingStreet;
                contact.MailingCity = company.BillingCity;
                contact.MailingState = company.BillingState;
                contact.MailingPostalCode = company.BillingPostalCode;
            }
        };
        $scope.copyPrimaryAddress = function () {
            if ($scope.control.copyAddress.primary) {
                var company = $scope.input.company;
                company.ShippingStreet = company.BillingStreet;
                company.ShippingCity = company.BillingCity;
                company.ShippingState = company.BillingState;
                company.ShippingPostalCode = company.BillingPostalCode;
            }
        };
        $scope.submit = function (completed) {
            $scope.$broadcast('show-errors-check-validity');
            if ($scope.form.$valid) {
                //check roles
                var assignedRoles = {Primary: false, Billing: false, Signatory: false};
                _.forEach($scope.input.contacts, function (c) {
                    _.forEach(c.roles, function (val, key) {
                        if (val) {
                            assignedRoles[key] = true;
                        }
                    });
                });
                var unassignedRoles = [];
                _.forEach(assignedRoles, function (val, key) {
                    if (!val) {
                        unassignedRoles.push(key);
                    }
                });
                if (unassignedRoles.length > 0) {
                    ND.alert('Missing Contacts', unassignedRoles.join(', ') + ' contact is not assigned.');
                } else {
                    //sync address
                    if ($scope.control.copyAddress.primary) {
                        $scope.copyPrimaryAddress();
                    }
                    _.forEach($scope.input.contacts, function (c, index) {
                        if ($scope.control.copyAddress[index]) {
                            $scope.copyAddress(index);
                        }
                    });
                    var input = angular.copy($scope.input);
                    //remove contact without any role
                    _.remove(input.contacts, function (c) {
                        return !_.some(c.roles, function (val, key) {
                            return val;
                        });
                    });
                    if (input.copay) {
                        _.forEach(input.sites, function (c, index) {
                            if (!$scope.control.copay[index]) {
                                c.copay = input.copay;
                                c.copayType = input.copayType;
                            }
                        });
                    }
                    input.completed = completed;
                    ORCA.call('saveCIF', angular.toJson(input)).then(function () {
                        if (input.completed) {
                            ND.confirm('Form Submitted', 'We\'ve received your form.', {btns: ['Close'], callback: $scope.home});
                        } else {
                            ND.confirm('Form Saved', 'We\'ve saved your form.', {btns: ['Close'], callback: $scope.reset});
                        }
                    });
                }
            } else {
                var count = 0;
                angular.forEach($scope.form.$error, function (val) {
                    count += val.length;
                });
                ND.alert('Incomplete Information', 'There are ' + count + ' required fields to complete. They have been highlighted.');
            }
        };
        $scope.home = function () {
            $state.go('home');
        };
        $scope.reset = function () {
            ORCA.setPageTitle('ORCA - Customer Information Form');
            $scope.states = [
                {value: "AL", label: "Alabama"},
                {value: "AK", label: "Alaska"},
                {value: "AZ", label: "Arizona"},
                {value: "AR", label: "Arkansas"},
                {value: "CA", label: "California"},
                {value: "CO", label: "Colorado"},
                {value: "CT", label: "Connecticut"},
                {value: "DE", label: "Delaware"},
                {value: "DC", label: "District Of Columbia"},
                {value: "FL", label: "Florida"},
                {value: "GA", label: "Georgia"},
                {value: "HI", label: "Hawaii"},
                {value: "ID", label: "Idaho"},
                {value: "IL", label: "Illinois"},
                {value: "IN", label: "Indiana"},
                {value: "IA", label: "Iowa"},
                {value: "KS", label: "Kansas"},
                {value: "KY", label: "Kentucky"},
                {value: "LA", label: "Louisiana"},
                {value: "ME", label: "Maine"},
                {value: "MD", label: "Maryland"},
                {value: "MA", label: "Massachusetts"},
                {value: "MI", label: "Michigan"},
                {value: "MN", label: "Minnesota"},
                {value: "MS", label: "Mississippi"},
                {value: "MO", label: "Missouri"},
                {value: "MT", label: "Montana"},
                {value: "NE", label: "Nebraska"},
                {value: "NV", label: "Nevada"},
                {value: "NH", label: "New Hampshire"},
                {value: "NJ", label: "New Jersey"},
                {value: "NM", label: "New Mexico"},
                {value: "NY", label: "New York"},
                {value: "NC", label: "North Carolina"},
                {value: "ND", label: "North Dakota"},
                {value: "OH", label: "Ohio"},
                {value: "OK", label: "Oklahoma"},
                {value: "OR", label: "Oregon"},
                {value: "PA", label: "Pennsylvania"},
                {value: "RI", label: "Rhode Island"},
                {value: "SC", label: "South Carolina"},
                {value: "SD", label: "South Dakota"},
                {value: "TN", label: "Tennessee"},
                {value: "TX", label: "Texas"},
                {value: "UT", label: "Utah"},
                {value: "VT", label: "Vermont"},
                {value: "VA", label: "Virginia"},
                {value: "WA", label: "Washington"},
                {value: "WV", label: "West Virginia"},
                {value: "WI", label: "Wisconsin"},
                {value: "WY", label: "Wyoming"}
            ];
            $scope.control = {copyAddress: {}, copay: {}};
            $scope.input = {};
            $scope.mode = null;
            $scope.$broadcast('show-errors-reset');
            ORCA.call('initCIF', $stateParams.key).then(function (json) {
                angular.extend($scope, json.payload);
                if ($scope.allowEdit) {
                    $scope.mode = 'edit';
                    //init copay
                    $scope.control.newCards = $scope.input.newCards;
                    $scope.input.copayType = $scope.input.copayType || '';
                    $scope.input.copay = $scope.input.copay || null;
                    _.forEach($scope.input.contacts, function (c, index) {
                        if ($scope.isAddressSame(c.con, $scope.input.company, 'Mailing')) {
                            $scope.control.copyAddress[index] = true;
                        }
                    });
                    if ($scope.isAddressSame($scope.input.company, $scope.input.company, 'Shipping')) {
                        $scope.control.copyAddress.primary = true;
                    }
                    _.forEach($scope.input.sites, function (c, index) {
                        c.copayType = c.copayType || '';
                        c.copay = c.copay || null;
                        if (!$scope.isCopaySame(c, $scope.input)) {
                            $scope.control.copay[index] = true;
                        }
                    });
                } else {
                    $scope.mode = 'view';
                    $scope.contacts = [];
                    _.forEach($scope.roles, function (c) {
                        var con = _.find($scope.input.contacts, function (p) {
                            return p.roles[c];
                        });
                        if (con) {
                            var cr = angular.extend({role: c}, con.con);
                            $scope.contacts.push(cr);
                        }
                    });
                    _.forEach($scope.input.services, function (c) {
                        var arr = [];
                        _.forEach(c.transitAgencies, function (value, key) {
                            if (!!value) {
                                arr.push(key);
                            }
                        });
                        c.agencyNames = arr.join(', ');
                    });
                }
            }, $scope.home);
        };
        $scope.showContribution = function (r) {
            var contribution = 'No Employee Contribution';
            if ($scope.input.copayType === 'Amount') {
                contribution = 'Amount: ' + $filter('currency')($scope.input.copay);
            } else if ($scope.input.copayType === 'Percentage') {
                contribution = 'Percentage: ' + $scope.input.copay + '%';
            }
            return contribution;
        };
        $scope.isCopaySame = function (site, main) {
            if (main.copayType) {
                return site.copayType === main.copayType && site.copay === main.copay;
            } else {
                return !site.copayType && !site.copay;
            }
        };
        $scope.isAddressSame = function (obj, company, addrType) {
            var addr1 = addrType === 'Shipping' ? $scope.toAddress([obj.ShippingStreet, obj.ShippingCity, obj.ShippingState, obj.ShippingPostalCode]) : $scope.toAddress([obj.MailingStreet, obj.MailingCity, obj.MailingState, obj.MailingPostalCode]);
            var addr2 = $scope.toAddress([company.BillingStreet, company.BillingCity, company.BillingState, company.BillingPostalCode]);
            return addr1 === addr2;
        };
        $scope.toAddress = function (arr) {
            var str = '';
            _.forEach(arr, function (c) {
                if (c) {
                    str += c.trim().toLowerCase();
                }
            });
            return str;
        };
        $scope.newSite = function () {
            ND.blur();
            $scope.input.sites.push({site: {ShippingState: 'WA'}});
            var elementId = '#site_' + ($scope.input.sites.length - 1);
            ND.focus(elementId, 100);
        };
        $scope.newService = function () {
            ND.blur();
            var pop = ND.modal({
                templateUrl: 'views/orca/service.html', controller: 'ORCA.ServiceCtrl', resolve: {
                    $req: function () {
                        return _.extend({services: $scope.input.services}, _.pick($scope, 'serviceTypes', 'transitAgencies'));
                    }
                }
            });
            pop.result.then(function (json) {
                if (json) {

                    $scope.input.services.push(json);
                }
            });
        };
        $scope.removeService = function (r) {
            ND.confirm('Resmove Service', 'Are you sure you want to remove this service?', {
                btns: ['Yes', 'No'], callback: function () {
                    _.remove($scope.input.services, r);
                }
            });
        };
        $scope.checkTransitAgency = function (r, t) {
            var checked = r.transitAgencies[t];
            if (checked) { //check duplicated transit
                var used = _.find($scope.input.services, function (c) {
                    return c !== r && c.serviceType === r.serviceType && c.transitAgencies[t];
                });
                if (used) {
                    ND.alert('Transit Agency Already Added', t + ' is already been added to Service ' + r.serviceType);
                    r.transitAgencies[t] = false;
                }
            }

        };
        $scope.newContact = function () {
            ND.blur();
            var assignedRoles = [];
            _.forEach($scope.input.contacts, function (c) {
                _.forEach(c.roles, function (val, key) {
                    if (val && !_.includes(assignedRoles, key)) {
                        assignedRoles.push(key);
                    }
                });
            });
            if (assignedRoles.length >= $scope.roles.length) {
                ND.alert('All Roles Are Defined', 'All contact roles are assigned. No new contact is needed');
            } else {
                var missingRoles = _.difference($scope.roles, assignedRoles);
                var pop = ND.modal({
                    templateUrl: 'views/orca/contact.html', controller: 'ORCA.ContactCtrl', resolve: {
                        $req: function () {
                            return {
                                roles: missingRoles, states: $scope.states, con: {
                                    MailingStreet: $scope.input.company.BillingStreet,
                                    MailingCity: $scope.input.company.BillingCity, MailingState: $scope.input.company.BillingState,
                                    MailingPostalCode: $scope.input.company.BillingPostalCode
                                }
                            }
                        }
                    }
                });
                pop.result.then(function (json) {
                    if (json) {
                        json.con.AccountId = ND.id($scope.input.company);
                        $scope.input.contacts.push(json);
                        ORCA.call('checkContact', json.con).then(function (json2) {
                            if (json2.payload.dupes) {
                                ND.modal({
                                    templateUrl: 'views/orca/match.html', controller: 'ORCA.MatchCtrl', resolve: {
                                        $req: function () {
                                            return {input: json, dupes: json2.payload.dupes}
                                        }
                                    }
                                });
                            }
                        });
                    }
                });
            }
        };
        $scope.removeContact = function (r) {
            if (r.con.Name) {
                ND.confirm('Remove Contact', 'Are you sure you want to remove ' + r.con.Name + '?', {
                    btns: ['Yes', 'No'], callback: function () {
                        _.remove($scope.input.contacts, r);
                    }
                });
            } else {
                _.remove($scope.input.contacts, r);
            }
            ND.blur();
        };
        $scope.removeSite = function (r) {
            if (r.site && r.site.Name) {
                ND.confirm('Remove Site', 'Are you sure you want to remove ' + r.site.Name + '?', {
                    btns: ['Yes', 'No'], callback: function () {
                        _.remove($scope.input.sites, r);
                    }
                });
            } else {
                _.remove($scope.input.sites, r);
            }
            ND.blur();
        };
        $scope.checkRole = function (r, role) {
            var checked = r.roles[role];
            if (checked) { //check if this role is assigned by other contact
                var used = _.find($scope.input.contacts, function (c) {
                    return c !== r && c.roles[role];
                });
                if (used) {
                    ND.confirm('Role Already Assigned', used.con.Name + ' has been assigned as ' + role + '. Do you want to reassign it to ' + r.con.Name + '?', {
                        btns: ['Yes', 'No'], callback: function () {
                            used.roles[role] = false;
                        }, close: function () {
                            r.roles[role] = false;
                        }
                    });
                }
            }
        };
        $scope.calcCards = function () {
            if (!$scope.control.newCards && !$scope.input.isRenew) {
                $scope.input.newCards = $scope.input.eligibleEmployees;
                _.forEach($scope.input.sites, function (c) {
                    if (c.eligibleEmployees) {
                        $scope.input.newCards += c.eligibleEmployees;
                    }
                });
            }
        };
        $scope.reset();
    })
    .controller('ORCA.PasswordCtrl', function ($scope, $state, $stateParams, ORCA, ND) {
        $scope.changed = function () {
            ORCA.call('disablePassword', ND.id($scope.company)).then(function (json) {
                $state.go('home');
            });
        };
        $scope.enter = function ($event) {
            if ($event.which === 13) {
                $scope.submit();
            }
        };
        $scope.submit = function () {
            ORCA.call('retrievePassword', ND.id($scope.company), $scope.company.ORCA_User_Name__c).then(function (json) {
                angular.extend($scope, json.payload);
                $scope.mode = 'password';
            });
        };
        $scope.refresh = function () {
            $scope.company = {};
            ORCA.call('initPassword', $stateParams.key).then(function (json) {
                angular.extend($scope, json.payload);
                $scope.mode = 'start';
            });
        };
        $scope.refresh();
    })
    .controller('ORCA.InquiryCtrl', function ($scope, $state, $stateParams, ORCA, ND) {
        $scope.toggleContact = function () {
            if ($scope.input.newContact) {
                angular.extend($scope.input, _.pick($scope.contact, 'Name', 'Email', 'Phone'));
            }
        };
        $scope.reset = function () {
            $scope.input = {newContact: false};
            $scope.$broadcast('show-errors-reset');
        };
        $scope.submit = function () {
            $scope.$broadcast('show-errors-check-validity');
            if ($scope.form.$valid) {
                ORCA.call('saveInquiry', $scope.input).then(function (json) {
                    ND.confirm('Inquiry Submitted', 'We\'ve received your request. Case No: ' + json.payload.CaseNumber, {
                        btns: ['Close'], callback: function () {
                            $state.go('app.orca.cs.response', {key: json.payload.ExternalKey__c});
                        }
                    });
                });
            } else {
                var count = 0;
                angular.forEach($scope.form.$error, function (val) {
                    count += val.length;
                });
                ND.alert('Incomplete Information', 'There are ' + count + ' required fields to complete. They have been highlighted.');

            }
        };
        $scope.reset();
        ORCA.setPageTitle('ORCA - Customer Inquiry Form');
        ORCA.call('initInquiry', $stateParams.key).then(function (json) {
            angular.extend($scope, json.payload);
        }, function () {
            $state.go('app.orca.cs.new');
        });
    })
    .controller('ORCA.ServiceCtrl', function ($scope, $req, ND) {
        $scope.submit = function () {
            if($scope.form.emptyAgency) {
                $scope.form.emptyAgency.$setValidity('required', false);
                var checked = _.find($scope.input.transitAgencies, function (value, key) {
                    return !!value;
                });
                if (checked) {
                    $scope.form.emptyAgency.$setValidity('required', true);
                }
            }
            $scope.$broadcast('show-errors-check-validity');
            if ($scope.form.$valid) {
                var selected = [];
                _.forEach($scope.input.transitAgencies, function (value, key) {
                    if (!!value) {
                        selected.push(key)
                    }
                });
                var dupes = _.filter(selected, function (c) {
                    return _.some($req.services, function (s) {
                        return s.serviceType === $scope.input.serviceType && s.transitAgencies[c]
                    });
                });
                if (dupes.length) {
                    ND.alert('Transit Agency Already Added', dupes.join(', ') + ' are already been added to Service ' + $scope.input.serviceType);
                } else {
                    $scope.$close(_.omit($scope.input, 'emptyAgency'));
                }
            }
        };
        $scope.selectType = function(){
            if($scope.input.serviceType){
                $scope.serviceType = _.find($scope.serviceTypes,function (c) {
                    return c.value === $scope.input.serviceType;
                });
                $scope.input.single = $scope.serviceType && $scope.serviceType.single;
            }
        };
        $scope.checkTransitAgency = function (t) {
            var checked = $scope.input.transitAgencies[t];
            if (checked) { //check duplicated transit
                var used = _.find($req.services, function (c) {
                    return c.serviceType === $scope.input.serviceType && c.transitAgencies[t];
                });
                if (used) {
                    ND.alert('Transit Agency Already Added', t + ' is already been added to Service ' + $scope.input.serviceType);
                    $scope.input.transitAgencies[t] = false;
                }
            }
        };
        $scope.serviceTypes = $req.serviceTypes;
        $scope.transitAgencies = $req.transitAgencies;
        $scope.input = {subsidy: '100%', transitAgencies: {}};
        //default to check all
        _.forEach($scope.transitAgencies, function (c) {
            $scope.input.transitAgencies[c.value] = true;
        })
    })
    .controller('ORCA.ContactCtrl', function ($scope, $req) {
        $scope.submit = function () {
            $scope.form.emptyRole.$setValidity('required', false);
            var checked = _.find($scope.input.roles, function (value, key) {
                return !!value;
            });
            if (checked) {
                $scope.form.emptyRole.$setValidity('required', true);
            }
            $scope.$broadcast('show-errors-check-validity');
            if ($scope.form.$valid) {
                $scope.$close($scope.input);
            }
        };
        $scope.copyAddress = function () {
            if ($scope.companyAddress) {
                _.merge($scope.input.con, $req.con);
            }
        };
        $scope.roles = $req.roles;
        $scope.states = $req.states;
        $scope.input = {roles: {}, con: {MailingState: 'WA'}};
        $scope.companyAddress = false;
    })
    .controller('ORCA.MatchCtrl', function ($scope, $req, ND) {
        $scope.select = function (r) {
            $req.input.con.Id = ND.id(r);
            $scope.$close();
        };
        $scope.dupes = $req.dupes;
    })
;

