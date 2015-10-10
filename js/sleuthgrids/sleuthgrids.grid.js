

// Created by CryptoSleuth <cryptosleuth@gmail.com>


var Sleuthgrids = {};


Sleuthgrids = (function(Sleuthgrids) 
{

	
	var GridTab = Sleuthgrids.GridTab = function()
	{
		this.init.apply(this, arguments)
	}
	
	
	GridTab.prototype = 
	{
		init: function(grid, index)
		{
			var gridTab = this;
			gridTab.grid = grid;
			gridTab.gridOverlord = grid.gridOverlord;
			
			gridTab.index = index;
			gridTab.isActive = false;
			gridTab.name = "";
			gridTab.isDefault = index == 0;
			
			gridTab.gridTabDOM;
			gridTab.gridTabCloseDOM;
			gridTab.gridTabTitleDOM;
			

			gridTab.initDOM();
			gridTab.initEventListeners();
		},
		
		
		initDOM: function()
		{
			var gridTab = this;
			var index = gridTab.index;
			var isDefault = gridTab.isDefault;
			
			gridTab.gridTabDOM = $($("#util_grid_tab_template").html());
			gridTab.gridTabTitleDOM = gridTab.gridTabDOM.find(".util-grid-tab-title span");
			gridTab.gridTabCloseDOM = gridTab.gridTabDOM.find(".util-grid-tab-close");

			gridTab.gridTabDOM.attr("data-gridindex", index);
			
			var defaultClass = isDefault ? "util-grid-tab-default" : "";
			gridTab.gridTabDOM.addClass(defaultClass);

			var name = isDefault ? "Default" : "Grid-" + String(index);
			gridTab.name = name;
			gridTab.gridTabTitleDOM.text(name);
			
			Sleuthgrids.gridTabsWrap.append(gridTab.gridTabDOM);
		},
		
		
		initEventListeners: function()
		{
			var gridTab = this;
			
			gridTab.gridTabDOM.on("click", function(e)
			{
				gridTab.showTab(e);
			})
			
			gridTab.gridTabCloseDOM.on("click", function(e)
			{
				gridTab.onGridTabCloseClick();
			})
			
		},
		
		
		onGridTabCloseClick: function()
		{
			var gridTab = this;
			var grid = gridTab.grid;
			var gridOverlord = gridTab.gridOverlord;
			
			gridOverlord.removeGrid(grid);
		},
		
		
		showTab: function(e)
		{
			var gridTab = this;
			var grid = gridTab.grid;
			var gridOverlord = gridTab.gridOverlord;
			var isClose = $(e.target).hasClass("util-grid-tab-close");
			
			if (!isClose)
			{
				gridOverlord.gridTabsWrap.find(".util-grid-tab").removeClass("active");
				gridTab.gridTabDOM.addClass("active");
								
				gridOverlord.hideAllGrids();
				grid.showGrid(true);
			}
		},
		
		
		updateIndex: function()
		{
			var gridTab = this;
			var grid = gridTab.grid;
			var index = grid.index;
			var isDefault = index == 0;
			
			gridTab.index = index;
			gridTab.isDefault = isDefault;
			
			gridTab.gridTabDOM.attr("data-gridindex", index);
			var name = isDefault ? "Default" : "Grid-" + String(index);
			gridTab.name = name;
			gridTab.gridTabTitleDOM.text(name);
		},
		

		
		
		removeGridTab: function()
		{
			var gridTab = this;

			gridTab.gridTabDOM.remove();
		}
	}

	
	
	var Grid = Sleuthgrids.Grid = function()
	{
		this.init.apply(this, arguments)
	}
	
	
	Grid.prototype = 
	{
		
		init: function(gridOverlord, index)
		{	
			var grid = this;
			
			grid.gridOverlord = gridOverlord;
			grid.index = index;
			
			grid.currentGridPositions = {};
			grid.prevGridPositions = {};

			grid.isActive = false;
			grid.needsResize = false;
			grid.saveObj = {};

			grid.gridTab = new Sleuthgrids.GridTab(grid, grid.index);
			grid.tileOverlord = new Sleuthgrids.tileOverlord(grid);
			grid.initEventListeners();
			grid.initDOM();
			
		},
		
		
		initDOM: function()
		{
			var grid = this;
			
			grid.gridDOM = $($("#grid_template").html());
			grid.gridDOM.attr("data-gridindex", grid.index);
		},
		
		
		initEventListeners: function()
		{
			var grid = this;
			
			grid.gridDOM.find(".grid-arrow, .grid-arrow-middle").on("mouseover", function(e)
			{
				grid.onGridArrowMouseover($(this));
			})

			grid.gridDOM.find(".grid-arrow, .grid-arrow-middle").on("mouseout", function(e)
			{
				grid.onGridArrowMouseout($(this));
			})
			
			grid.gridDOM.find(".grid-arrow, .grid-arrow-middle").on("mouseup", function(e)
			{
				grid.onGridArrowMouseup($(this));
			})
		},
		
		
		
		showGrid: function(resize)
		{
			var grid = this;
			
			grid.gridDOM.addClass("active");
			grid.isActive = true;
			
			if (resize)
			{
				grid.resizeGrid();
			}
		},
		
		
		
		hideGrid: function()
		{
			var grid = this;
			
			grid.gridDOM.removeClass("active");
			grid.isActive = false;
		},
	
		
		
		saveGrid: function()
		{
			var grid = this;
			var tileOverlord = grid.tileOverlord;
			var saveObj = {};			

			saveObj.tileSaves = tileOverlord.saveTiles();
			
			saveObj.index = grid.index;
			saveObj.isActive = grid.isActive;
			
			return saveObj;
		},
			
			
			
		removeGrid: function()
		{
			var grid = this;
			var gridTab = grid.gridTab;
			var tileOverlord = grid.tileOverlord;
			
			tileOverlord.removeAllTiles();
			
			grid.gridDOM.remove();
			gridTab.removeGridTab();
		},
		
		
		
		resizeGrid: function()
		{
			var grid = this;
			var tileOverlord = grid.tileOverlord;
			var isVisible = grid.gridDOM.is(":visible");

			if (isVisible)
			{
				grid.prevGridPositions = grid.currentGridPositions;
				grid.currentGridPositions = Sleuthgrids.getPositions(grid.gridDOM, true);
				
				tileOverlord.scaleTiles();

				grid.needsResize = false;
			}
			else
			{
				grid.needsResize = true;
			}
		},
		
		
	
		onGridArrowMouseover: function($arrow)
		{
			var grid = this;
			var previewTile = grid.previewTile;
			var $previewTile = previewTile.tileDOM;
			var arrowDirections = Sleuthgrids.getArrowDirections($arrow);

			Sleuthgrids.toggleTileAdd(false);			

			$previewTile.css("height", "100%");
			$previewTile.css("width", "100%");
			$previewTile.css("top", 0);
			$previewTile.css("left", 0);

			
			if (arrowDirections.isMiddle)
			{
				previewTile.showPreviewTile();
				previewTile.updateInternalTilePositions();
			}
			else
			{
				var foundTiles = grid.findMain(arrowDirections.direction, false);
				
				if (foundTiles.length)
				{
					var smallestTile = grid.getLowest(foundTiles, arrowDirections.direction);
					var smallestTilePositions = smallestTile.positions;
					
					var absKey = arrowDirections.isHoriz ? "left" : "top";
					var sizeKey = arrowDirections.isHoriz ? "width" : "height";
					var newSize = smallestTilePositions[sizeKey]/2;
					
					grid.resizeMain(foundTiles, arrowDirections, newSize, absKey, sizeKey, true);

					var gridPositions = Sleuthgrids.getPositions(grid.gridDOM, true);

					var prevAbs = (arrowDirections.isBottom || arrowDirections.isRight) ? (gridPositions[sizeKey] - newSize) : 0;
					
					$previewTile.css(sizeKey, newSize);
					$previewTile.css(absKey, prevAbs);

					previewTile.showPreviewTile();
					previewTile.updateInternalTilePositions();

				}
			}
		},
	
		
		
		onGridArrowMouseout: function($arrow)
		{
			var grid = this;
			var previewTile = grid.previewTile;
			
			if (Sleuthgrids.isGridTrig)
			{
				Sleuthgrids.toggleTileAdd(true);
				
				var arrowDirections = Sleuthgrids.getArrowDirections($arrow);


				if (arrowDirections.isMiddle)
				{
					previewTile.hidePreviewTile();
				}
				else
				{
					var foundTiles = grid.findMain(arrowDirections.direction, true);

					if (foundTiles.length)
					{					
						var smallestTile = grid.getLowest(foundTiles, arrowDirections.direction);
						var smallestTilePositions = smallestTile.positions;
						
						var absKey = arrowDirections.isHoriz ? "left" : "top";
						var sizeKey = arrowDirections.isHoriz ? "width" : "height";
						var newSize = smallestTilePositions[sizeKey];
						
						grid.resizeMain(foundTiles, arrowDirections, newSize, absKey, sizeKey, false);
						
						previewTile.hidePreviewTile();
					}
				}
			}
		},

		
		
		onGridArrowMouseup: function($arrow)
		{
			Sleuthgrids.toggleTileAdd(false);

			var grid = this;
			var previewTile = grid.previewTile;
			var previewTilePositions = previewTile.positions;
			
			var arrowDirections = Sleuthgrids.getArrowDirections($arrow);
			
			grid.makeTile(arrowDirections, previewTilePositions);
			
			previewTile.hidePreviewTile();
		},
		
		

	}
	
	


	return Sleuthgrids;
	
	
}(Sleuthgrids || {}));
	



