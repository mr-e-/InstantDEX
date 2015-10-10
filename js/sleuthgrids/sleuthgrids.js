

// Created by CryptoSleuth <cryptosleuth@gmail.com>


var Sleuthgrids = {};


Sleuthgrids = (function(Sleuthgrids) 
{
	Sleuthgrids.tileAdd = $("#tile_add");
	Sleuthgrids.contentWrap = $("#content_wrap");
	
	Sleuthgrids.cellHandlers = {};
	
	Sleuthgrids.isGridTrig = false;
	Sleuthgrids.triggeredCell = null;
	Sleuthgrids.isTriggeredNew = false;
	Sleuthgrids.triggeredType = "";
	
	
	Sleuthgrids.isResizing = false;
	Sleuthgrids.resizeTile = null;
	Sleuthgrids.resizeDir = "";
	
	
	Sleuthgrids.prevWindowHeight = 0;
	Sleuthgrids.prevWindowWidth = 0;

	
	
	$.fn.sleuthgrids = function() 
	{
		var args = arguments;
		var ret = false;
		var allGrids = Sleuthgrids.allGrids;
		var len = allGrids.length;
		var $grid = $(this);
		
		if (this[0]) 
		{
			for (var i = 0; i < len; i++)
			{
				var grid = allGrids[i];
				
				if (grid.gridDOM.is($grid))
				{
					ret = grid;
					break;
				}
			}
		}
		
		return ret;
	};
	
	
	
	Sleuthgrids.toggleTileAdd = function(show)
	{
		var toggleFunc = show ? "addClass" : "removeClass";
		Sleuthgrids.tileAdd[toggleFunc]("active");
	};
	
	
	Sleuthgrids.updateTileAddPos = function(event)
	{
		var mouseX = event.clientX;
		var mouseY = event.clientY;
		
		Sleuthgrids.tileAdd.css("left", mouseX);
		Sleuthgrids.tileAdd.css("top", mouseY);
	};
	

	
	
	return Sleuthgrids;
	
	
}(Sleuthgrids || {}));
	



