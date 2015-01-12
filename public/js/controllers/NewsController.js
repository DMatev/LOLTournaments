'use strict';
angular.module('NewsController',[])
	.controller('NewsCtrl',['$scope','$http',function($scope,$http){
		$scope.news=[];
		$scope.oneAtATime=false;
		$scope.collapsed=true;
		$scope.commentsForm={};

		function getNews(){
			$http.get('/news')
				.success(function(data){
					$scope.news=data;
				})
				.error(function(data){
					console.log(data);
				});
		}

		$scope.createComment=function(id){
			$http
			.post('/api/news/'+id+'/comment', {content: $scope.commentsForm.title})
		     	.success(function (data, status, headers, config) {
		     		getNews();
		     		$scope.commentsForm.title=null;
		      	})
		      	.error(function (data, status, headers, config) {
		        	console.log(data);
		      	});
		}
		
		getNews();
		
	}]);