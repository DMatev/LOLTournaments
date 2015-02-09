'use strict';
angular.module('NewsService', [])
	.factory('News', function ($http){
        return {
            getAllVisible: function (){
                return $http.get('/news');
            },
            getAll: function (){
                return $http.get('/api/news');
            },
            create: function (title, content){
                return $http.post('/api/news', { title: title, content: content });
            },
            delete: function (id){
                return $http.delete('/api/news/' + id);
            },
            edit: function (id, title, content){
                return $http.put('/api/news/' + id, { title: title, content: content });
            },
            createComment: function (id, content){
                return $http.post('/api/news/' + id + '/comment', { content: content });
            },
            deleteComment: function (nid, cid){
                return $http.delete('/api/news/' + nid + '/comment/' + cid);
            }
        };
    });