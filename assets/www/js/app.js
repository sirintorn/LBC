// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'ionic-img-lazy-load', 'chart.js', 'ngScrollbars','ngCordova'])

        .run(function ($ionicPlatform) {
            $ionicPlatform.ready(function () {
                // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
                // for form inputs)
                if (window.cordova && window.cordova.plugins.Keyboard) {
                    cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                    cordova.plugins.Keyboard.disableScroll(true);

                }
                if (window.StatusBar) {
                    // org.apache.cordova.statusbar required
                    StatusBar.styleDefault();
                }
            });
        })

        .config(function ($ionicConfigProvider, $stateProvider, $urlRouterProvider, ScrollBarsProvider) {
            ScrollBarsProvider.defaults = {
                scrollButtons: {
                    scrollAmount: 'auto', // scroll amount when button pressed
                    enable: true // enable scrolling buttons by default
                },
                axis: 'y', // enable 2 axis scrollbars by default
                autoHideScrollbar: true,
                theme: 'dark',
                advanced: {
                    updateOnContentResize: true
                }
            };



            $ionicConfigProvider.tabs.position('bottom');
            $ionicConfigProvider.navBar.alignTitle('center');
            // note that you can also chain configs
            $stateProvider

                    .state('app', {
                        url: '/app',
                        abstract: true,
                        templateUrl: 'templates/menu.html',
                        controller: 'AppCtrl'
                    })
                    .state('login', {
                        url: '/login',
                        templateUrl: 'templates/login.html',
                        controller: 'LoginCtrl'
                    })
                    .state('app.new_install', {
                        url: '/new_install',
                        views: {
                            'menuContent': {
                                templateUrl: 'templates/new_install.html',
                                controller: 'NewInstall'
                            }
                        }
                    })
                    .state('app.kaizen', {
                        url: '/kaizen',
                        views: {
                            'menuContent': {
                                templateUrl: 'templates/kaizen.html',
                                controller: 'Kaizen'
                            }
                        }
                    })
                    .state('app.gsd_analysis', {
                        url: '/gsd_analysis',
                        views: {
                            'menuContent': {
                                templateUrl: 'templates/gsd_analysis.html',
                                controller: 'GsdAnalysis'
                            }
                        }
                    })
            // if none of the above states are matched, use this as the fallback
             $urlRouterProvider.otherwise('/login');
//             $urlRouterProvider.otherwise('/app/new_install');

//  $urlRouterProvider.otherwise('/app/cardview');
        });
