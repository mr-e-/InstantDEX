
Sleuthgrids = (function(Sleuthgrids) 
{
	
	
	var TileNavCell = Sleuthgrids.TileNavCell = function()
	{
		this.init.apply(this, arguments)
	}
	
	
	TileNavCell.prototype = 
	{	
		init: function(tile, index)
		{
			var tileNavCell = this;
			
			tileNavCell.tile = tile;
			
			tileNavCell.index = index;
			tileNavCell.linkIndex = -1;

			
			
			tileNavCell.tileNavCellDOM;
			tileNavCell.navLinkDOM;
			tileNavCell.isActive = false;
		},
		
		
		
		initDOM: function()
		{
			var tileNavCell = this;
			var tile = tileNavCell.tile;
			var index = tileNavCell.index;
			var cell = tile.cells[index];
			var cellType = cell.cellType;
			
			var $tileHeaderTab = $($("#tile_header_solo_template").html());
			var $tabWrap = $("<div/>", {'class':"tile-header-tab", 'data-tab':index} );
			$tileHeaderTab = $($tileHeaderTab.wrapAll($tabWrap).parent()[0].outerHTML);
			
			var title = Sleuthgrids.capitalizeFirstLetter(cellType);
			$tileHeaderTab.find(".tile-header-title").text(title);
			
			tileNavCell.tileNavCellDOM = $tileHeaderTab;
			tileNavCell.navLinkDOM = $tileHeaderTab.find(".tile-header-link");
			
			tileNavCell.initEventListeners();
		},
		
		
		
		updateToNewTile: function()
		{
			
		},
		
		
		
		initEventListeners: function()
		{
			var tileNavCell = this;
			var tile = tileNavCell.tile;
			
			
			tileNavCell.tileNavCellDOM.on("mousedown", function(e)
			{
				//console.log(tile.index);
				tile.moveTile(e, tileNavCell);
			})
			
			tileNavCell.tileNavCellDOM.on("mousedown", function(e)
			{
				tileNavCell.changeCellTabs(e);
			})
			
	
			tileNavCell.tileNavCellDOM.find(".tile-header-close").on("click", function()
			{
				tile.closeTile(tileNavCell);
			})
			
			tileNavCell.navLinkDOM.find(".dropdown-list li").on("click", function(e)
			{
				tileNavCell.cellLinkClick($(this))
			})
			
		},
		
		
		
		unbindEventListeners: function()
		{
			var tileNavCell = this;
			tileNavCell.tileNavCellDOM.off();
			tileNavCell.tileNavCellDOM.find("*").off();
		},
		
		
		
		cellLinkClick: function($li)
		{
			var tileNavCell = this;
			var cellIndex = tileNavCell.index;
			var tile = tileNavCell.tile;
			var cell = tile.cells[cellIndex];
			var grid = tile.grid;
			
			var $wrap = $li.closest(".dropdown-list-wrap");
			var $ul = $li.closest("ul");

			var linkIndex = $li.attr("data-val");	
			var title = $li.text();

			$ul.find("li").removeClass("active");
			$li.addClass("active");
			
			$wrap.find(".dropdown-title span").text(title);
			$wrap.trigger("mouseleave");
			
			tileNavCell.linkIndex = linkIndex;
			cell.linkIndex = linkIndex;
			
			
			//tileNavCell.getLinkedCells();
			
		},
		
		
		
		changeCellLinkDOM: function()
		{
			var tileNavCell = this;
			var cellIndex = tileNavCell.index;
			var linkIndex = tileNavCell.linkIndex;
			var tile = tileNavCell.tile;
			var cell = tile.cells[cellIndex];
			var grid = tile.grid;

			
			var $navLinkWrap = tileNavCell.navLinkDOM;
			var $title = $navLinkWrap.find(".tile-header-link-title span");
			var $activeLink = $navLinkWrap.find("li[data-val='"+String(linkIndex)+"']");
			var title = $activeLink.text();
			
			$navLinkWrap.find("li").removeClass("active");
			$activeLink.addClass("active");
			$title.text(title);
			
		},
		
		

		
		
		
		changeCellTabs: function(e)
		{
			if (e && $(e.target).hasClass("tile-header-close"))
			{
				return;
			}
			
			var tileNavCell = this;
			var tile = tileNavCell.tile;
			var index = tileNavCell.index;
			var cell = tile.cells[index];
			
			
			for (var i = 0; i < tile.cells.length; i++)
			{
				var loopCell = tile.cells[i];
				var $loopCell = loopCell.cellDOM;
				$loopCell.addClass("tab-hidden");
				loopCell.isActive = false;

				
				var loopTileNavCell = tile.navCells[i];
				var $loopTileNavCell = loopTileNavCell.tileNavCellDOM;
				$loopTileNavCell.removeClass("active");
				loopTileNavCell.isActive = false;
				
			}
			
			tileNavCell.tileNavCellDOM.addClass("active");
			tileNavCell.isActive = true;
			cell.cellDOM.removeClass("tab-hidden");
			cell.isActive = true;
			
			cell.triggerVisible();
			
			tile.showTileBorder();
		},
		
		
		
		removeTileNavCell: function()
		{
			var tileNavCell = this;
			var $tileNavCell = tileNavCell.tileNavCellDOM;

			$tileNavCell.remove();
		},
		
	}
	
	
	
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
			cell.linkIndex = -1;
			cell.isActive = false;
			cell.cellType = "";
			
			cell.cellDOM;
		},
		
		
		
		makeCellDOM: function(cellType)
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
			var tile = cell.tile;
			var grid = tile.grid;
			var $cell = cell.cellDOM;
			var cellType = cell.cellType;

			var cellHandlers = Sleuthgrids.cellHandlers;
			var handler = cellHandlers[cellType];
			

			
			if (handler)
			{
				if (handler && "new" in handler)
				{
					handler.new(cell);
				}
			}
		},
		
		
		
		getLinkedCells: function()
		{
			var cell = this
			var tile = cell.tile;
			var grid = cell.grid;
			
			var cellIndex = cell.index;
			var linkIndex = cell.linkIndex;
			
			
			var obj = {};
			var allGridTiles = grid.tiles;
			
			
			for (var i = 0; i < allGridTiles.length; i++)
			{
				var loopTile = allGridTiles[i];
				var allLoopTileCells = loopTile.cells;
				
				for (var j = 0; j < allLoopTileCells.length; j++)
				{
					var loopCell = allLoopTileCells[j];
					var loopCellLinkIndex = loopCell.linkIndex;
					
					if (!(String(loopCellLinkIndex) in obj))
					{
						obj[String(loopCellLinkIndex)] = [];
					}
					
					obj[String(loopCellLinkIndex)].push(loopCell);
				}
			}
			
			var linkedCells = obj[linkIndex];
			
			return linkedCells;
			
		},
		
		
		
		updateCellLink: function()
		{
			var tileNavCell = this;
			var cellIndex = tileNavCell.index;
			var tile = tileNavCell.tile;
			var cell = tile.cells[cellIndex];
			var grid = tile.grid;
			
			var linkIndex = cell.linkIndex;
		},
		
		
				
		setLinkedCells: function(market)
		{
			var cell = this;
			var tile = cell.tile;
			var grid = tile.grid;			
			var linkIndex = cell.linkIndex;
			var cellIndex = cell.index;
			
			var isLinked = linkIndex != -1;
			
			
			var linkedCells = cell.getLinkedCells();
			
			
			
			console.log(linkedCells);
			
			for (var i = 0; i < linkedCells.length; i++)
			{
				var linkedCell = linkedCells[i];
				linkedCell.changeCellMarket(market);
			}
		},
		
		
		
		loadCellFromSettings: function(settings)
		{
			var cell = this;
			var tile = cell.tile;
			var grid = tile.grid;
			var $cell = cell.cellDOM;
			var cellType = cell.cellType;

			var cellHandlers = Sleuthgrids.cellHandlers;
			var handler = cellHandlers[cellType];
			
			
			if (handler)
			{
				if (handler && "loadCustom" in handler)
				{
					handler.loadCustom(cell, settings);
				}
			}
		},
		
		
		
		changeCellMarket: function(market)
		{
			var cell = this;
			var tile = cell.tile;
			var grid = tile.grid;
			var $cell = cell.cellDOM;
			var cellType = cell.cellType;

			var cellHandlers = Sleuthgrids.cellHandlers;
			var handler = cellHandlers[cellType];
			
			
			if (handler)
			{
				if (handler && "changeMarket" in handler)
				{
					handler.changeMarket(cell, market);
				}
			}
		},
		
		
		
		triggerVisible: function()
		{
			var cell = this;
			var tile = cell.tile;
			var grid = tile.grid;
			var $cell = cell.cellDOM;
			var cellType = cell.cellType;

			var cellHandlers = Sleuthgrids.cellHandlers;
			var handler = cellHandlers[cellType];
			

			
			if (handler)
			{
				if (handler && "update" in handler)
				{
					handler.update(cell);
				}
			}
		},
		
		
		
		resizeCell: function()
		{
			var cell = this;
			var cellType = cell.cellType;

			var cellHandlers = Sleuthgrids.cellHandlers;
			var handler = cellHandlers[cellType];
			
			if (handler)
			{
				if ("resize" in handler)
				{
					handler.resize(cell);
				}
			}
			
		},
		
		
		
		saveCell: function()
		{
			var cell = this;
			var cellType = cell.cellType;

			var cellHandlers = Sleuthgrids.cellHandlers;
			var handler = cellHandlers[cellType];
			
			var cellTypeSettings = {};
			
			if (handler)
			{
				if ("save" in handler)
				{
					cellTypeSettings = handler.save(cell);
				}
			}
			
			saveObj = {};
			saveObj.isActive = cell.isActive;
			saveObj.linkIndex = cell.linkIndex;
			saveObj.cellType = cell.cellType;
			saveObj.cellTypeSettings = cellTypeSettings;
			cell.saveObj = saveObj;
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
		},
		
		
		
		removeCell: function()
		{
			var cell = this;
			var $cell = cell.cellDOM;
			var cellType = cell.cellType;

			var cellHandlers = Sleuthgrids.cellHandlers;
			var handler = cellHandlers[cellType];
			
			if (handler)
			{
				if ("remove" in handler)
				{
					handler.remove(cell);
				}
			}
			
			$cell.remove();
		},
		
	}
		
		
	
	return Sleuthgrids;
	
	
}(Sleuthgrids || {}));

