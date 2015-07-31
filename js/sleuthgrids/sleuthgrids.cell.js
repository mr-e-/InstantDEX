
Sleuthgrids = (function(Sleuthgrids) 
{
	
	
	
	var Cell = Sleuthgrids.Cell = function()
	{
		this.init.apply(this, arguments)
	}
	
	Cell.prototype = 
	{	
	
		init: function(tile, index)
		{
			
			var cell = this;
			
			cell.tile = tile;
			cell.grid = tile.grid;
			
			cell.index = index;
			cell.cellDOM;
		},
		
		
		makeCellDOM: function(cellType, arrowDirections)
		{
			var cell = this;
			cell.cellType = cellType;
			
			var $cellTypeTemplate = $(".grid-trig-template[data-grid='"+cellType+"']").html();
			var $cell = $($("#cell_template").html());
			$cell.append($cellTypeTemplate);
			$cell.attr("data-celltype", cellType);
			$cell.attr("data-cellindex", cell.index);
			
			cell.cellDOM = $cell;
		},
		
		
		
		loadCell: function()
		{
			var cell = this;
			var $cell = cell.cellDOM;
			var cellType = cell.cellType;

			var cellHandlers = Sleuthgrids.cellHandlers;
			var handler = cellHandlers[cellType];
			
			
			if (Sleuthgrids.isTriggeredNew)
			{
				handler.new(cell);
			}
		},
		
		
		
		removeCell: function()
		{
			var cell = this;
			var $cell = cell.cellDOM;
			var cellType = cell.cellType;

			var cellHandlers = Sleuthgrids.cellHandlers;
			var handler = cellHandlers[cellType];
			
			if ("remove" in handler)
			{
				handler.remove(cell);
			}
		},
		
		

		
		
		
		closeCell: function($tabHeader)
		{
			var cell = this;
			var tile = cell.tile;
			var grid = cell.grid;
			
			
			var $wrap = $tabHeader.closest(".grid");
			var len = $wrap.find(".tile-content").length;

			var tab = $tabHeader.attr("data-tab");
			var $tabContent = $wrap.find(".tile-content[data-tab='"+tab+"']")
					
			var $nextTabHeader = $tabHeader.next();
			if (!$nextTabHeader.length)
				$nextTabHeader = $tabHeader.prev();
			
			Sleuthgrids.closeGridType($tabContent);
			$tabHeader.remove()
			$tabContent.remove()
			$nextTabHeader.trigger("click");
			
			if (len == 2)
			{
				/*var firstTitle = $nextTabHeader.find(".tile-header-title").text();
				var $firstTab = $($("#tile_template").find(".tile-header").html());
				$firstTab.find(".tile-header-title").text(firstTitle);
				//$firstTab.attr("data-tab", "1");
				
				$tileHeader.empty().addClass("tile-header-tabs");
				$tileHeader.append($firstTab);*/
			}
		
		},
		
	}
		
		
	
	return Sleuthgrids;
	
	
}(Sleuthgrids || {}));

