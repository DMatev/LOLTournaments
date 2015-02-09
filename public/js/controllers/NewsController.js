'use strict';
angular.module('NewsController', ['ngSanitize'])
	.controller('NewsCtrl', function ($scope, $http, News){
		$scope.oneAtATime = false;
		$scope.collapsed = true;
		$scope.news = [];
		$scope.commentsForm = {};

		function getNews(){
			News.getAllVisible()
	            .success(function (data){
	            	$scope.news = data;
	            });
		}

		$scope.createComment = function (id){
			News.createComment(id, $scope.commentsForm.content)
				.success(function (){
					$scope.commentsForm.content = null;
					getNews();
				});
		};
		
		getNews();
	})
	.filter('myDate', function (date){
		var newDateString = '';
		newDateString = date.getDay();
	  	return newDateString;
	});