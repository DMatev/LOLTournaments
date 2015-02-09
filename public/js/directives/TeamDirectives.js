'use strict';
angular.module('TeamDirectives',[])
	.directive('teamMemberList',function(){
		return {
			restrict:'E',
			templateUrl:'views/teamMemberList.html'
		};
	})
	.directive('teamRequestList',function(){
		return {
			restrict:'E',
			templateUrl:'views/teamRequestList.html'
		};
	})
	.directive('teamCreate',function(){
		return{
			restrict:'E',
			templateUrl:'views/teamCreate.html'
		};
	})
	.directive('teamTeamsList',function(){
		return {
			restrict:'E',
			templateUrl:'views/teamsList.html'
		};
	})
	.directive('teamTournamentJoin',function(){
		return{
			restrict:'E',
			templateUrl:'views/teamTournamentJoin.html'
		};
	});