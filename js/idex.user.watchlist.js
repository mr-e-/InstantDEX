

var IDEX = (function(IDEX, $, undefined)
{
	var $contentWrap = $("#content_wrap");
	var $popup = $("#marketSearch_popup");


	IDEX.allWatchlists = [];

	
	IDEX.User.prototype.initFavorites = function()
	{
		var user = this;
		var chartFavs = [];
				
		if (localStorage.watchlist)
		{
			chartFavs = JSON.parse(localStorage.getItem('watchlist'));
		}
		
		for (var i = 0; i < chartFavs.length; i++)
		{
			var fav = chartFavs[i];
		}

		user.favorites = chartFavs;
	}
	
	
	
	IDEX.Watchlist = function(obj) 
	{	

	};
	
	
	
	IDEX.newWatchlist = function($el)
	{
		var watchlist = IDEX.getObjectByElement($el, IDEX.allWatchlists, "watchlistDom");

		if (!watchlist)
		{
			watchlist = new IDEX.Watchlist();
			watchlist.watchlistDom = $el;
			watchlist.watchlistAddDom = $el.find(".watchlist-add");
			watchlist.watchlistTableDom = $el.find(".nTable");
			watchlist.watchlistAddDom.on("click", function() { watchlist.toggleAddPopup(); } );
			watchlist.watchlistTableDom.on("click", "tbody tr", function(e) { watchlist.onRowClick(e, $(this)); } );
			//watchlist.watchlistTableDom.on("mouseover", "tbody tr", function(e) { watchlist.onRowMouseover(e, $(this)); } );

			
			IDEX.allWatchlists.push(watchlist)
			
			watchlist.initWatchlist();
		}

						
		return watchlist;
	};
	
	
	
	IDEX.Watchlist.prototype.toggleAddPopup = function()
	{		
		IDEX.togglePopup($popup, true, true);
	}
	
	
	
	IDEX.Watchlist.prototype.initWatchlist = function($wrap)
	{
		var watchlist = this;
		var chartFavs = IDEX.user.favorites;

		for (var i = 0; i < chartFavs.length; i++)
		{
			var fav = chartFavs[i];
			watchlist.addRow(fav)
		}
	}
	
	

	IDEX.Watchlist.prototype.addRow = function(fav)
	{
		var watchlist = this;
		var $table = watchlist.watchlistTableDom;

		var keys = ["market", "baseName", "relName"]
		var obj = {}
		obj.market = fav.base.name + "_" + fav.rel.name;
		obj.baseName = fav.base.name;
		obj.relName = fav.rel.name;
		
		row = IDEX.buildTableRows(IDEX.objToList([obj], keys), "table");
		row = $(row).get()[0]

		//$row.find("td:last").after("<td class='deleteMarketFavorite'>DELETE</td>");
		//row = IDEX.addElDataAttr(row, [obj], ["baseID", "relID"]);

		var $row = $(row);
		$row.data("market", fav);
		
		$table.find("tbody").append($row)
	}
	
	
	
	IDEX.updateWatchlistTable = function()
	{
		var allWatchlists = IDEX.allWatchlists;
		
		for (var i = 0; i < allWatchlists.length; i++)
		{
			var watchlist = allWatchlists[i];
			watchlist.watchlistTableDom.find("tbody").empty();
			watchlist.initWatchlist();
		}
	}
	
	
	
	IDEX.Watchlist.prototype.onRowClick = function(e, $row)
	{
		var watchlist = this;
		var market = $row.data("market");

		var $grid = watchlist.watchlistDom.closest(".grid");
		var grid = $grid.sleuthgrids();		
		var $cell = watchlist.watchlistDom.closest(".cell");
		var cell = grid.getCell($cell);
		
		console.log(cell);
		
		cell.setLinkedCells(market);
	}
	
	
	
	IDEX.Watchlist.prototype.onRowMouseover = function(e, $row)
	{
		var watchlist = this;
		var $target = $(e.target)
		var has = $target.hasClass("deleteMarketFavorite")

 		if (!has)
		{
			$row.addClass("allFavs-hover")
			//e.stopPropagation()
		}
		else
		{
			$row.removeClass("allFavs-hover")
		}
	}
	
	
	
	IDEX.Watchlist.prototype.onRowMouseleave = function(e, $row)
	{
		$row.removeClass("allFavs-hover")
	}

	
	
	
	
	$(".marketSearch-add-trig").on("click", function()
	{
		var $wrap = $(this).closest(".popup");
		
		var $activeTab = $wrap.find(".tab-wrap.active");
		var searchType = $activeTab.attr("data-searchtype");
		
		var $form = $(".marketSearch-popup-form");
;
		
		var $banner = $wrap.find(".banner");
		$banner.removeClass("error")
		$banner.removeClass("success")
		$banner.addClass("active");
		

		
		if (searchType == "market")
		{
			var $market = $form.find("input[name=market]");
			var market = $market.data("market");
			console.log(market);
			$banner.removeClass("active");

			if (market != "-1")
			{
				var retbool = IDEX.user.addFavorite(market);

				if (retbool)
				{
					IDEX.updateWatchlistTable();
					$banner.addClass("success")
					$banner.find("span").text("Success: " + market.marketName + " added to watchlist.")
					clearAssetInput($wrap);
				}
				else
				{
					$banner.addClass("error")
					$banner.find("span").text("Error: This market is already in your watchlist.")
				}
			}
			else
			{
				$banner.addClass("error")
				$banner.find("span").text("Error: You must choose a valid market")
			}
		}

	})
	
	
	
	function clearAssetInput($wrap)
	{		
		$wrap.find("input").each(function()
		{
			$(this).val("")
			$(this).data("market", "-1")
		})
	}
	
	
	
	IDEX.User.prototype.addFavorite = function(market)
	{
		var user = this;
		var retbool = false;
		var base = market.base;
		var rel = market.rel;

		var index = user.getFavoriteIndex(base, rel);
		
		if (index == -1)
		{
			user.favorites.push(market);
			localStorage.setItem('watchlist', JSON.stringify(user.favorites));
			retbool = true;
		}

		return retbool
	}
	
	
	
	IDEX.User.prototype.getFavoriteIndex = function(base, rel)
	{
		var index = -1;

		for (var i = 0; i < this.favorites.length; i++)
		{
			var fav = this.favorites[i];
			
			if (fav.base.name == base.name && fav.rel.name == rel.name)
			{
				index = i;
				break;
			}
		}
		
		return index;
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
	
	

	
	
	
	
	
	return IDEX;
	
	
}(IDEX || {}, jQuery));