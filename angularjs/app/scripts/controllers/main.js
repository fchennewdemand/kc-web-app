'use strict';

angular.module('app')
  .controller('HomeCtrl', function ($scope,ND) {
    $scope.logout = function(){
      ND.go('/secur/logout.jsp');
    };
    //ND.go('/customers/cs_home');
    // ND.go('http://metro.kingcounty.gov/cs/index.html#comment');
    ND.go('https://kingcounty.gov/depts/transportation/metro/contact-us.aspx');
  })
;
