'use strict';
angular.module('app', ['angular-loading-bar', 'ui.router', 'ui.bootstrap', 'appRoutes',
	'AdminController', 'HallOfFameController', 'NewsController', 'TeamController', 'TournamentsController', 'UserController',
	'AdminDirectives', 'TeamDirectives', 'HallOfFameService', 'NewsService', 'TeamService','TournamentService', 'UserService']);