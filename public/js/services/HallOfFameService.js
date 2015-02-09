'use strict';
angular.module('HallOfFameService',[])
	.factory('HallOfFame', function ($http){
        return {
            get : function (){
                return $http.get('/halloffame');
            },
            createRecord: function (team, tournament){
            	return $http.post('/api/halloffame', { team: team, tournament: tournament });
            },
            deleteRecord: function (id){
            	return $http.delete('/api/halloffame/' + id);
            },
            edit: function (id, team, tournament){
            	return $http.put('/api/halloffame/' + id, { team: team, tournament: tournament });
            }
        };
    });