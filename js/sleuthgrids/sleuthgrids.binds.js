

Sleuthgrids = (function(Sleuthgrids) 
{
	
	var prevWindowHeight = 0;
	var prevWindowWidth = 0;
	var $contentWrap = $("#content_wrap");
	
	
	$(".util-grid-newTab").on("click", function()
	{
		var $newGridTab = $($("#util_grid_tab_template").html());
		var $gridTabsWrap = $(".util-grid-tabs");
		var $gridTabs = $gridTabsWrap.find(".util-grid-tab");
		
		var len = $gridTabs.length;
		
		var name = "Grid-" + String(len + 1);
		$newGridTab.find("span").text(name);
		$newGridTab.attr("data-gridindex", len);
		$gridTabsWrap.append($newGridTab);
		
		var grid = new Sleuthgrids.Grid();
		//grid.showGrid();
	})
	
	
	
	$("body").on("click", ".util-grid-tab", function()
	{
		var $gridTab = $(this);
		var gridIndex = $(this).attr("data-gridindex");
		
		var grid = Sleuthgrids.getGrid(gridIndex);
		
		Sleuthgrids.hideAllGrids();
		grid.showGrid();
		
	})
	
	
	
	
	$(".grid-trig").on("mousedown", function(e)
	{
		$(this).addClass("mousedown");

		var cellType = $(this).attr("data-grid");
		
		
		Sleuthgrids.isGridTrig = true;
		Sleuthgrids.isTriggeredNew = true;
		Sleuthgrids.triggeredType = cellType;
	})



	$(".grid-trig").on("mouseleave", function(e)
	{
		if (Sleuthgrids.isGridTrig)
		{
			var $grid = $contentWrap.find(".grid.active");
			
			if ($grid.length)
			{
				var has = $tileAdd.hasClass("active")
				
				if (!has)
				{
					Sleuthgrids.updateTileAddPos(e)	
					$tileAdd.addClass("active");
					$grid.find(".grid-arrow").addClass("active");
					
					var hasGrids = $grid.find(".tile").length;
					
					if (!hasGrids)
					{
						$grid.find(".grid-arrow-middle").addClass("active");
					}
				}
				
				Sleuthgrids.updateTileAddPos(e)
			}
		}
	})


	
	$(document).on("mousemove", function(e)
	{
		if (Sleuthgrids.isGridTrig)
		{
			Sleuthgrids.updateTileAddPos(e)
		}
	})



	$(document).on("mouseup", function(e)
	{
		$(".grid-arrow-middle").removeClass("active");

		if (Sleuthgrids.isGridTrig)
		{
			Sleuthgrids.isGridTrig = false;
			Sleuthgrids.triggeredCell = null;
			$tileAdd.removeClass("active");
			$(".grid-arrow").removeClass("active");
			$(".tile-arrow-wrap").removeClass("active");
			$(".grid-trig").removeClass("mousedown");
		}
		
		if (Sleuthgrids.isResizing)
		{
			var allGrids = Sleuthgrids.allGrids;
			
			for (var i = 0; i < allGrids.length; i++)
			{
				var grid = allGrids[i];
				grid.toggleTileResizeOverlay(false);
				grid.resizeTileCells();
				//grid.resizeTiles();
			}
		}
		
		Sleuthgrids.isResizing = false;
		Sleuthgrids.resizeTile = null;
		Sleuthgrids.resizeDir = "";
		

	})




	$(document).on("mousedown", function(e)
	{	
		var $tile = $(e.target).closest(".tile")
		var $grid = $contentWrap.find(".grid.active");

		if ($grid.length)
		{
			if (!$tile.length && !$(e.target).hasClass("tile"))
			{

				$grid.find(".tile-cells").removeClass("focus-border");
				$grid.find(".tile-header-tab").removeClass("focus-border");
			}
		}
	})





	$(document).ready(function()
	{
		prevWindowHeight = $contentWrap.height();
		prevWindowWidth = $contentWrap.width();
	})


	$(window).resize(function(e)
	{
		var windowWidth = $contentWrap.width();
		var windowHeight = $contentWrap.height();
		
		var heightDiff = windowHeight - prevWindowHeight;
		var widthDiff = windowWidth - prevWindowWidth;
		
		var grids = Sleuthgrids.allGrids;
		
		for (var i = 0; i < grids.length; i++)
		{
			var grid = grids[i];
			var tiles = grid.tiles;
			
			for (var j = 0; j < tiles.length; j++)
			{
				var tile = tiles[j];
				var $tile = tile.tileDOM;
				changeHW("width", widthDiff, $tile);
				changeHW("height", heightDiff, $tile);
			}
		}

				
		prevWindowHeight = windowHeight;
		prevWindowWidth = windowWidth;
	})



	function changeHW(sizeKey, diff, $el)
	{
		var change = null;
		
		if (diff != 0)
		{
			var prevWin = sizeKey == "width" ? prevWindowWidth : prevWindowHeight;
			var pos = Sleuthgrids.getPositions($el, true);
			var absKey = sizeKey == "width" ? "left" : "top";

			var ratio = pos[sizeKey] / prevWin;
			var change = diff * ratio;

			var size = pos[sizeKey] + change;
			
			
			var prevAbs = pos[absKey]
			var adjustRatio = prevAbs/prevWin
			var adjustChange = diff * adjustRatio
			var abs = (prevAbs + adjustChange);
						
			$el.css(sizeKey, size)
			$el.css(absKey, abs)
		}
		
		return change;
	}



	


	
	


	return Sleuthgrids;
	
	
}(Sleuthgrids || {}));
	


