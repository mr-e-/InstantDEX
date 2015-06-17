

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

	

	IDEX.User.prototype.initFavorites = function()
	{
		var chartFavs = [];
				
		if (localStorage.marketFavorites)
		{
			chartFavs = JSON.parse(localStorage.getItem('marketFavorites'));
		}
		
		for (var i = 0; i < chartFavs.length; i++)
		{
			var fav = chartFavs[i];
			addFavoriteRow(fav)
		}

		this.favorites = chartFavs;
	}
	
	
	
	$("#cm_favs_trig img").on("click", function()
	{		
		var $popup = $(".cm-favs-popup");
		var isActive = $popup.hasClass("active");
		
		if (!isActive)
		{
			$popup.addClass("active")
			clearAddFavInput();
		}
		else
		{
			$popup.removeClass("active")
		}
	})
	
	
	
	$(".cm-favs-popup-close").on("click", function()
	{
		var $popup = $(".cm-favs-popup");
		$popup.removeClass("active");
	})
	
	
	$(".cm-favs-popup-nav-row").on("mouseup", function()
	{
		if (!($(this).hasClass("active")))
		{
			$(this).parent().find(".cm-favs-popup-nav-row").removeClass("active");
			$(this).addClass("active");

			var tab = $(this).attr('data-tab');
			var $parent = $(".cm-favs-popup-body")
			var $banner = $parent.find(".cm-favs-popup-banner");
			$banner.removeClass("active");

			$parent.find(".cm-favs-popup-tabWrap").removeClass("active");
			$parent.find(".cm-favs-popup-tabWrap[data-tab='"+tab+"']").addClass("active");
		}
	})
	
	
	$(".cm-favs-popup-add-button span").on("click", function()
	{
		var $wrap = $(this).closest(".cm-favs-popup-add");
		var $banner = $wrap.find(".cm-favs-popup-banner");
		var $base = $wrap.find("input[name=baseid]");
		var $rel = $wrap.find("input[name=relid]");
		var baseid = $base.attr("data-asset");
		var relid = $rel.attr("data-asset");
		
		$banner.removeClass("error")
		$banner.removeClass("success")
		$banner.addClass("active");

		if (baseid != "-1" && relid != "-1")
		{
			var base = IDEX.user.getAssetInfo("assetID", baseid);	
			var rel = IDEX.user.getAssetInfo("assetID", relid);
			
			var retbool = IDEX.user.addFavorite(baseid, relid);

			if (retbool)
			{
				$banner.addClass("success")
				$banner.find("span").text("Success: " + base.name + "_" + rel.name + " added to favorite markets.")
				clearAddFavInput();
			}
			else
			{
				$banner.addClass("error")
				$banner.find("span").text("Error: This market is already one of your favorites.")
			}

		}
		else
		{
			$banner.addClass("error")
			$banner.find("span").text("Error: You must choose two valid assets")
		}
	})
	
	function clearAddFavInput()
	{
		var $wrap = $(".cm-favs-popup-add-inputArea");
		
		$wrap.find("input").each(function()
		{
			$(this).val("")
			$(this).attr("data-asset", "-1")
		})
	}
	
	
	IDEX.User.prototype.getFavoriteIndex = function(baseID, relID)
	{
		var index = -1;

		for (var i = 0; i < this.favorites.length; i++)
		{
			var fav = this.favorites[i];
			
			if (fav.baseID == baseID && fav.relID == relID)
			{
				index = i;
				break;
			}
		}
		
		return index;
	}
	
	
	IDEX.User.prototype.addFavorite = function(baseID, relID)
	{
		var retbool = false;
		var base = this.getAssetInfo("assetID", baseID);	
		var rel = this.getAssetInfo("assetID", relID);
		
		if (!($.isEmptyObject(base)) && !($.isEmptyObject(rel)))
		{
			var index = this.getFavoriteIndex(baseID, relID)
			
			if (index == -1)
			{
				var fav = {"baseID":baseID, "relID":relID, "baseName":base.name, "relName":rel.name}
				this.favorites.push(fav)
				addFavoriteRow(fav)
				localStorage.setItem('marketFavorites', JSON.stringify(this.favorites));
				retbool = true;
			}
		}	

		return retbool
	}
	
	
	IDEX.User.prototype.removeFavorite = function(baseID, relID)
	{
		var index = this.getFavoriteIndex(baseID, relID)
		
		if (index != -1)
		{
			this.favorites.splice(index, 1)
			localStorage.setItem('marketFavorites', JSON.stringify(this.favorites));
		}
	}
	
	
	function addFavoriteRow(fav)
	{
		var $table = $("#marketFavorites");

		var keys = ["market", "baseID", "relID"]
		var obj = {}
		obj.market = fav.baseName + "_" + fav.relName;
		obj.baseID = fav.baseID;
		obj.relID = fav.relID;
		
		row = IDEX.buildTableRows(IDEX.objToList([obj], keys), "table");
		var $row = $(row)
		$row.find("td:last").after("<td class='deleteMarketFavorite'>DELETE</td>");
		row = $row.get()[0]

		row = IDEX.addElDataAttr(row, [obj], ["baseID", "relID"]);

		$table.find("tbody").append($(row))
	}
	
	
	$("#marketFavorites").on("mouseover", "tbody tr", function(e)
	{
		var $target = $(e.target)
		var has = $target.hasClass("deleteMarketFavorite")

		if (!has)
		{
			$(this).addClass("allFavs-hover")
			//e.stopPropagation()
		}
		else
		{
			$(this).removeClass("allFavs-hover")
		}
	})
	
	
	$("#marketFavorites").on("mouseleave", "tbody tr", function(e)
	{
		$(this).removeClass("allFavs-hover")
	})
	
	
	$("#marketFavorites").on("click", "tbody tr", function(e)
	{
		var $target = $(e.target)
		var has = $target.hasClass("deleteMarketFavorite")
		
		var baseID = $(this).attr("data-baseID")
		var relID = $(this).attr("data-relID")

			
		if (!has)
		{
			IDEX.changeMarket(baseID, relID);
			$("#cm_favs_trig img").trigger("click");
		}
		else
		{
			IDEX.user.removeFavorite(baseID, relID);
			$(this).remove();
		}
	})
	
	
	
	
	return IDEX;
	
	
}(IDEX || {}, jQuery));