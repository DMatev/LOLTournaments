'use strict';
angular.module('AdminDirectives',[])
	.directive('tournamentManagement',function(){
		return {
			restrict:'E',
			templateUrl:'views/adminTournamentManagement.html'
		};
	})
	.directive('tournamentCreation',function(){
		return {
			restrict:'E',
			templateUrl:'views/adminTournamentCreation.html'
		};
	})
	.directive('newsManagement',function(){
		return{
			restrict:'E',
			templateUrl:'views/adminNewsManagement.html'
		};
	})
	.directive('hallOfFameManagement',function(){
		return{
			restrict:'E',
			templateUrl:'views/adminHallOfFameManagement.html'
		};
	});