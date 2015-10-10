

// Created by CryptoSleuth <cryptosleuth@gmail.com>


Sleuthgrids = (function(Sleuthgrids) 
{


	var GridOverlord = Sleuthgrids.GridOverlord = function()
	{
		this.init.apply(this, arguments)
	}
	
	GridOverlord.prototype = 
	{	
		init: function(tile)
		{
			var gridOverlord = this;
			
			gridOverlord.grids = [];
			gridOverlord.gridTabsWrap = $(".util-grid-tabs");
		},
		
		
		makeGridsFromSave: function(gridSaves)
		{
			var gridOverlord = this;
			
			for (var i = 0; i < gridSaves.length; i++)
			{
				var gridSave = gridSaves[i];
				var isActive = gridSave.isActive;
				var grid = gridOverlord.makeGrid();
						
				grid.tileOverlord.initTilesFromSave(gridSave.tileSaves);
			}
			
			return gridOverlord.grids;
		},
		
		
		makeGrid: function(isActive)
		{
			var gridOverlord = this;
			var index = gridOverlord.grids.length;
			
			var grid = new Sleuthgrids.Grid(gridOverlord, index);
			
			$(".grids").append(grid.gridDOM);
			gridOverlord.grids.push(grid);
			
			if (isActive)
			{
				grid.gridTab.gridTabDOM.trigger("click")
				grid.isActive = gridSave.isActive;
				//grid.showGrid();
			}
			
			return grid;
		},
		
		
		removeGrid: function(grid)
		{
			var gridOverlord = this;
			var gridIndex = grid.index;
			var showGridIndex = gridIndex - 1;

			grid.removeGrid();
			
			gridOverlord.grids.splice(gridIndex, 1);
			Sleuthgrids.updateArrayIndex(gridOverlord.grids);
			gridOverlord.updateGridTabs();
							
			var showGrid = gridOverlord.grids[showGridIndex];
			showGrid.gridTab.gridTabDOM.trigger("click");
		},
		
		
		
		resizeAllGrids: function()
		{
			var gridOverlord = this;
			var grids = gridOverlord.grids;
			
			for (var i = 0; i < grids.length; i++)
			{
				var grid = grids[i];
				
				if (grid.isActive)
				{
					grid.resizeGrid();
				}
			}
		},
		
		
		
		saveAllGrids: function()
		{
			var gridOverlord = this;
			var grids = gridOverlord.grids;
			var numGrids = grids.length;
			var saveObj = {};
			var gridSaves = [];

			saveObj.windowHeight = Sleuthgrids.contentWrap.height();
			saveObj.windowWidth = Sleuthgrids.contentWrap.width();
			
			for (var i = 0; i < numGrids; i++)
			{
				var grid = grids[i];
				var gridSave = grid.saveGrid();
				gridSaves.push(gridSave);
			}
			
			saveObj.gridSaves = gridSaves;
			
			return saveObj;
		},
		
		
		hideAllGrids: function()
		{
			var gridOverlord = this;
			var grids = gridOverlord.grids;
			var numGrids = grids.length;
			
			for (var i = 0; i < numGrids; i++)
			{
				var grid = grids[i];
				grid.hideGrid();
			}
		},
			

		updateGridTabs: function()
		{
			var gridOverlord = this;
			var grids = gridOverlord.grids;
			var numGrids = grids.length;
			
			for (var i = 0; i < numGrids; i++)
			{
				var grid = grids[i];
				var gridTab = grid.gridTab;
				gridTab.updateIndex();
			}
		},
	
	
	}
		
		
		


	return Sleuthgrids;
	
	
}(Sleuthgrids || {}));



	