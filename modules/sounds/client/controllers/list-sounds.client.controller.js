(function() {
  'use strict';

  angular
    .module('sounds')
    .controller('SoundsListController', SoundsListController);

  SoundsListController.$inject = ['SoundsService', '$log'];

  function SoundsListController(SoundsService, $log) {
    var vm = this;

    init();

    function init() {
      vm.geoFindMe = geoFindMe;
      //Get geolocation
      geoFindMe();
    }

    function geoFindMe() {
      var output = document.getElementById("out");
      $log.debug('lng, lat');

      navigator.geolocation.getCurrentPosition(success, error);

      function success(position) {
        vm.myGeo = {};
        vm.myGeo.lat = position.coords.latitude;
        vm.myGeo.lng = position.coords.longitude;
        $log.debug('lng:' + vm.myGeo.lat + ', lat:' + vm.myGeo.lng);
        vm.keywords = '1900';
        vm.sounds = SoundsService.query({ lng: vm.myGeo.lng, lat: vm.myGeo.lat, keywords: vm.keywords });
        $log.debug(vm.sounds);
      }

      function error() {
        $log.debug('Failed to get geolocation');
      }
    }
  }
}());
