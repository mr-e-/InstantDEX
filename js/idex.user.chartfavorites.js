

var IDEX = (function(IDEX, $, undefined)
{
	var ids = ["91","92","101","102","111","112","121","122"];

	var defaultFavs = [
		{'name':"InstantDEX",'assetID':"15344649963748848799"},
		{'name':"SuperNET",'assetID':"12071612744977229797"},
		{'name':"jl777hodl",'assetID':"6932037131189568014"},
		{'name':"SkyNET",'assetID':"6854596569382794790"},
		//{'name':"mgwBTC",'assetID':"17554243582654188572"},
		{'name':"LIQUID",'assetID':"4630752101777892988"}
	];


	IDEX.User.prototype.initChartFavorites = function()
	{
		var chartFavs = {};
		
		if (localStorage.chartFavorites)
		{
			chartFavs = JSON.parse(localStorage.getItem("chartFavorites"));
		}
		else
		{
			var lastIndex = -1;

			for (var i = 0; i < ids.length; ++i)
			{
				var randFav = {}
				var randIndex = ""
				while (true)
				{
					var ret = true;
					randIndex = Math.floor(Math.random() * defaultFavs.length)
					
					if (randIndex == lastIndex)
						continue;
					var tempfav = defaultFavs[randIndex]
					for (fav in chartFavs)
					{
						fav = chartFavs[fav]
						if (fav.name == tempfav.name && Number(fav.divID) % 2 != 0)
						{
							console.log(fav.name)
							ret = false
							break
						}
					}
					if (ret)
						break;
				}
				console.log("done: " + String(randIndex))
				
				randFav['name'] = defaultFavs[randIndex]['name'];
				randFav['assetID'] = defaultFavs[randIndex]['assetID'];
				randFav['divID'] = ids[i];
				chartFavs[ids[i]] = randFav;
				lastIndex = randIndex;
			}
			
			localStorage.setItem('chartFavorites', JSON.stringify(chartFavs));
		}
		
		this.favorites = chartFavs;
	}
	

	IDEX.User.prototype.updateFavoritesDom = function()
	{
		var chartFavs = this.favorites;
		
		for (var id in chartFavs)
		{
			$(".chart-control[chart-id='"+id+"']").val(chartFavs[id]['name']).attr("data-asset", chartFavs[id]['assetID']);
			if (Number(id) % 2 == 0)
			{
				$("#chart-curr-"+id).html("NXT").attr("data-asset", chartFavs[id]['assetID']);
				continue
			}
			$("#chart-curr-"+id).html(chartFavs[id]['name']).attr("data-asset", chartFavs[id]['assetID']);
		}	
	}
	
	
	IDEX.User.prototype.saveChartFavorites = function()
	{
		var parsed = {};
		
		$(".chart-control").each(function() 
		{
			var name = $(this).val();
			var id = $(this).attr('chart-id');
			var asset = $(this).attr('data-asset');
			
			if (asset == "-1")
			{
				name = IDEX.user.favorites[id].name
				asset = IDEX.user.favorites[id].asset
				$(this).val(name)
				$(this).attr('data-asset', asset)
			}

			$("#chart-curr-"+id).attr("data-asset", asset);
			$("#chart-curr-"+id).text(name);
			parsed[id] = {"name":name,"id":id,"assetID":asset}
		});
		
		localStorage.setItem('chartFavorites', JSON.stringify(parsed));
	}
	
	
	IDEX.User.prototype.displayChartFavorites = function()
	{
		var parsed = this.favorites;
		
		for (var id in parsed)
		{
			if ((Number(id) > 90) && (Number(id) % 2 != 0))
			{
				var baseID = parsed[id].asset;
				var relID = parsed[String(Number(id)+1)].asset;
				
				if (baseID != IDEX.user.favorites[id].asset)
				{
					var divid = $("#chart-curr-"+id).closest(".fav-market-chart-cell").find(".fav-pair").attr('id');
					
					if (baseID != "-1" && relID != "-1")
						IDEX.makeMiniChart(baseID, relID, divid);
				}
			}
		}
	}
	
	
		/*
			var sibIndex = (Number(id) % 2) != 0 ? 1 : -1;
		
			if(parsed[id].asset == parsed[id+sibIndex].asset)
			{
				
			}
		*/
		
	//	IDEX.user.favorites = parsed
	//}


	$(".fav-pair").on("click", function()
	{
		var baseid = $(this).find("span").eq(0).attr("data-asset");
		var relid = $(this).find("span").eq(1).attr("data-asset");

		if (baseid && relid && baseid.length && relid.length)
			IDEX.changeMarket(baseid, relid);
	})
	
	
	return IDEX;
	
	
}(IDEX || {}, jQuery));