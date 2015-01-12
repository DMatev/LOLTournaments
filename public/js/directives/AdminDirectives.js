'use strict';
angular.module('AdminDirectives',[])
	.directive('tournamentManagement',function(){
		return {
			restrict:'E',
			templateUrl:'views/account-info-partials-adminTournamentManagement.html'
		};
	})
	.directive('tournamentCreation',function(){
		return {
			restrict:'E',
			templateUrl:'views/account-info-partials-adminTournamentCreation.html'
		};
	})
	.directive('newsManagement',function(){
		return{
			restrict:'E',
			templateUrl:'views/account-info-partials-adminNewsManagement.html'
		};
	})
	.directive('hallOfFameManagement',function(){
		return{
			restrict:'E',
			templateUrl:'views/account-info-partials-adminHallOfFameManagement.html'
		};
	});