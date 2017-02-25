(function() {
  'use strict';

  angular
    .module('sounds')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('sounds', {
        abstract: true,
        url: '/sounds',
        template: '<ui-view/>'
      })
    .state('sounds.play', {
      url: '/play:soundId',
      templateUrl: 'modules/sounds/client/views/sound.client.view.html',
      controller: 'SoundsController',
      controllerAs: 'vm',
      resolve: {
        soundResolve: newSound
      },
      data: {
        roles: ['user', 'admin'],
        pageTitle: 'Sounds Create'
      }
    })
    .state('sounds.list', {
      url: '/list',
      templateUrl: 'modules/sounds/client/views/list-sounds.client.view.html',
      controller: 'SoundsListController',
      controllerAs: 'vm',
      resolve: {
        soundResolve: newSound
      },
      data: {
        roles: ['user', 'admin'],
        pageTitle: 'List Events'
      }
    });
  }

  getSound.$inject = ['$stateParams', 'SoundsService'];

  function getSound($stateParams, SoundsService) {
    return SoundsService.get({
      soundId: $stateParams.soundId
    }).$promise;
  }

  newSound.$inject = ['SoundsService'];

  function newSound(SoundsService) {
    return new SoundsService();
  }
}());
