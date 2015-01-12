'use strict';
angular.module('TeamDirectives',[])
	.directive('teamMemberList',function(){
		return {
			restrict:'E',
			templateUrl:'views/account-info-partials-teamMemberList.html'
		};
	}).directive('teamRequestList',function(){
		return {
			restrict:'E',
			templateUrl:'views/account-info-partials-teamRequestList.html'
		};
	}).directive('teamTeamCreate',function(){
		return{
			restrict:'E',
			templateUrl:'views/account-info-partials-teamTeamCreate.html'
		};
	}).directive('teamTeamsList',function(){
		return {
			restrict:'E',
			templateUrl:'views/account-info-partials-teamTeamsList.html'
		};
	}).directive('teamTournamentJoin',function(){
		return{
			restrict:'E',
			templateUrl:'views/account-info-partials-teamTournamentJoin.html'
		};
	});