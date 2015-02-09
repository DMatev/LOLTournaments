'use strict';
angular.module('TeamService',[])
	.factory('Team', function ($http){
        return {
            getAll : function (){
                return $http.get('/api/teams');
            },
            create: function (name){
                return $http.post('/api/myteam', { name: name });
            },
            leave: function (){
                return $http.delete('/api/myteam');
            },
            join: function (name){
                return $http.post('/api/teams/request', { name: name });
            },
            requests: function (){
                return $http.get('/api/myteam/requests');
            },
            handleTeamRequest: function (name, approved){
                return $http.put('/api/myteam/requests', { name: name, approved: approved });
            },
            kickMember: function (member){
                return $http.delete('/api/myteam/member/' + member);
            }
        };
    });