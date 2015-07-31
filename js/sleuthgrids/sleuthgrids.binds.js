

Sleuthgrids = (function(Sleuthgrids) 
{
	
	var prevWindowHeight = 0;
	var prevWindowWidth = 0;
	
	

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
			var has = $tileAdd.hasClass("active")
			
			if (!has)
			{
				Sleuthgrids.updateTileAddPos(e)	
				$tileAdd.addClass("active");
				$(".main-grid-arrow").addClass("active");
				
				var hasGrids = $mainGrid.find(".tile").length;
				
				if (!hasGrids)
				{
					$(".main-grid-arrow-middle").addClass("active");
				}
			}
			
			Sleuthgrids.updateTileAddPos(e)
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
		$(".main-grid-arrow-middle").removeClass("active");

		if (Sleuthgrids.isGridTrig)
		{
			Sleuthgrids.isGridTrig = false;
			$tileAdd.removeClass("active");
			$(".main-grid-arrow").removeClass("active");
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
		
		if (!$tile.length && !$(e.target).hasClass("tile"))
		{
			$mainGrid.find(".tile-cells").removeClass("focus-border");
			$mainGrid.find(".tile-header").removeClass("focus-border");
		}
	})





	$(document).ready(function()
	{
		prevWindowHeight = $mainGrid.height();
		prevWindowWidth = $mainGrid.width();
	})


	$(window).resize(function(e)
	{
		var windowWidth = $mainGrid.width();
		var windowHeight = $mainGrid.height();
		
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
	


