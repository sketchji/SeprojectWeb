angular.module('app')
	.controller('newsController',function($http){	
		//put code
		var controller = this;
		$http({method:'GET',url:'/news'}).success(function(data){
			controller.news = data;
		});
});
