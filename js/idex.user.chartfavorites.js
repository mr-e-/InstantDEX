

var IDEX = (function(IDEX, $, undefined)
{


	var defaultFavs = [
		{'name':"InstantDEX",'assetID':"15344649963748848799"},
		{'name':"SuperNET",'assetID':"12071612744977229797"},
		{'name':"jl777hodl",'assetID':"6932037131189568014"},
		{'name':"SkyNET",'assetID':"6854596569382794790"},
		{'name':"mgwBTC",'assetID':"17554243582654188572"},
		{'name':"LIQUID",'assetID':"4630752101777892988"}
	];

	

	IDEX.User.prototype.initChartFavorites = function()
	{
		var chartFavs = {};
		

		
		this.favorites = chartFavs;
	}
	

	
	IDEX.User.prototype.saveChartFavorites = function()
	{
		var parsed = {};

		
		localStorage.setItem('chartFavorites', JSON.stringify(parsed));
	}
	
	
	IDEX.User.prototype.displayChartFavorites = function()
	{
		var parsed = this.favorites;
		

	}
	
	
	
	return IDEX;
	
	
}(IDEX || {}, jQuery));