
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
			
			
			tileNavCell.tileNavCellDOM;
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
			
			tileNavCell.initEventListeners();
		},
		
		
		initEventListeners: function()
		{
			var tileNavCell = this;
			var tile = tileNavCell.tile;
			
			
			
			tileNavCell.tileNavCellDOM.on("click", function(e)
			{
				tileNavCell.changeCellTabs(e);

			})
			
	
			tileNavCell.tileNavCellDOM.find(".tile-header-close").on("click", function()
			{
				tile.closeTile(tileNavCell);
			})
			
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
		},
		
		
		removeTileNavCell: function()
		{
			var tileNavCell = this;
			var $tileNavCell = tileNavCell.tileNavCellDOM;

			$tileNavCell.remove();
		},
		
	}
	
	
	
	var Tile = Sleuthgrids.Tile = function()
	{
		this.init.apply(this, arguments)
	}
	
	Tile.prototype = 
	{	
		init: function(grid, $tile)
		{
			
			var tile = this;

			tile.grid = grid;
			tile.cells = [];
			tile.navCells = [];
			
			tile.tileDOM = $tile;
			tile.tileArrowWrapDOM = tile.tileDOM.find(".tile-arrow-wrap");
			tile.tileHeaderDOM = tile.tileDOM.find(".tile-header");
			tile.tileOverlayDOM = tile.tileDOM.find(".tile-overlay");
			tile.index = -1;
			
			
			tile.isTileHeaderTabbed = false;
			
			
			tile.initEventListeners();
			//tile.grid.gridDOM.append($tile);		

		},
		
		
		initEventListeners: function()
		{
			var tile = this;
			
			
			tile.tileDOM.on("mousedown", function()
			{
				tile.showTileBorder();
			})
			
			
			
			// start resize
			tile.tileDOM.on("mousedown", function(e)
			{
				tile.onTileMouseDown(e);
			})
			
			//resize cursor + resize
			tile.tileDOM.on("mousemove", function(e)
			{
				tile.onTileMousemove(e);
			})
			
			//hide resize cursor
			tile.tileDOM.on("mouseleave", function(e)
			{
				tile.onTileMouseleave();
			})
			
			
			//start move tile
			//Sleuthgrid.addEventListener("mousedown", ".tile-header", function());
			
	
	
			tile.tileDOM.on("mouseover", function()
			{
				tile.showTileArrows();
			})
			
			tile.tileDOM.on("mouseleave", function()
			{
				tile.hideTileArrows();
			})
			
			
			
			
			tile.tileDOM.find(".tile-arrow").on("mouseover", function()
			{
				tile.onTileArrowMouseover($(this));
			})
			
			tile.tileDOM.find(".tile-arrow").on("mouseout", function()
			{
				tile.onTileArrowMouseout($(this));
			})

			
			tile.tileDOM.find(".tile-arrow").on("mouseup", function()
			{
				tile.onTileArrowMouseup($(this));
			})
			

		},
		
		
		
		addCell: function(cellType, arrowDirections)
		{
			var tile = this;
			var $tile = tile.tileDOM;
			
			
			var cell = new Sleuthgrids.Cell(tile, tile.cells.length);
			tile.cells.push(cell);
			cell.makeCellDOM(cellType, arrowDirections);
			$tile.find(".tile-cells").append(cell.cellDOM);
			cell.loadCell();
			
			
			var tileNavCell = new Sleuthgrids.TileNavCell(tile, tile.navCells.length);
			tile.navCells.push(tileNavCell);
			tileNavCell.initDOM();
			tile.tileHeaderDOM.append(tileNavCell.tileNavCellDOM);
						
			
			if (arrowDirections.isMiddle)
			{
				if (!tile.isTileHeaderTabbed && tile.cells.length > 1)
				{
					tile.toggleHeaderTabbed(true);
				}
			}
			
			tileNavCell.changeCellTabs();
		},
		
		
		toggleHeaderTabbed: function(isTabbed)
		{
			var tile = this;
			var $tileHeader = tile.tileHeaderDOM;
			
			if (isTabbed)
			{
				$tileHeader.addClass("tile-header-tabs");					
				tile.isTileHeaderTabbed = true;
			}
			else
			{
				$tileHeader.removeClass("tile-header-tabs");					
				tile.isTileHeaderTabbed = false;
			}

		},
		
		
		
		removeCell: function(cell)
		{
			var tile = this;
			
			var removeAll = (typeof cell === "undefined");
			
			if (removeAll)
			{
				for (var i = 0; i < tile.cells.length; i++)
				{
					var loopCell = tile.cells[i];
					loopCell.removeCell();
				}
				
				tile.cells = [];
			}
			else
			{				
				var cellIndex = cell.index;
				var tileNavCell = tile.navCells[cellIndex];
				
				tileNavCell.removeTileNavCell();
				cell.removeCell();
				
				tile.navCells.splice(cellIndex, 1);
				Sleuthgrids.updateArrayIndex(tile.navCells);
				
				tile.cells.splice(cellIndex, 1);
				Sleuthgrids.updateArrayIndex(tile.cells);
			}
		},
		
		
		removeTile: function()
		{
			var tile = this;
			var $tile = tile.tileDOM;
			
			tile.removeCell();
			//$tile.unbind();
			$tile.remove();
		},
		
		
		
		onTileMousemove: function(e)
		{
			var tile = this;
			var grid = tile.grid;
			
			var mouseY = e.clientY;
			var mouseX = e.clientX;
			
			var tilePositions = Sleuthgrids.getPositions(tile.tileDOM);
			
			var isInsideBorder = Sleuthgrids.checkIfMouseIsInsideBorder(mouseY, mouseX, tilePositions);
			
			if (isInsideBorder.isInside)
			{
				var borderMap = ["top", "bottom", "left", "right"]
				var dirMap = ["N", "S", "W", "E"]
				
				for (var i = 0; i < borderMap.length; i++)
				{
					var borderKey = borderMap[i];
					
					if (isInsideBorder[borderKey])
					{
						var resizeClassName = "tileResize" + dirMap[i];
						
						tile.removeResizeClass();
						tile.addResizeClass(resizeClassName);
						
						break;
					}
				}
			}
			else
			{
				if (!Sleuthgrids.isResizing)
				{
					tile.removeResizeClass();
				}
			}
			
				
			if (Sleuthgrids.isResizing)
			{
				var resizePos = Sleuthgrids.getPositions(Sleuthgrids.resizeTile.tileDOM);
				var offsetX = $mainGrid.offset().left;
				var offsetY = $mainGrid.offset().top;
				var insideX = mouseX - offsetX
				var insideY = mouseY - offsetY
				
				grid.resizeTile(insideX, insideY)
			}
		},
		
		
		
		onTileMouseleave: function()
		{
			var tile = this;

			if (!Sleuthgrids.isResizing)
			{
				tile.removeResizeClass();
			}
		},
		
		

		onTileMouseDown: function(e)
		{
			var tile = this;
			var $tileDOM = tile.tileDOM;
			var grid = tile.grid;
			
			var mouseY = e.clientY
			var mouseX = e.clientX
			
			var tilePositions = Sleuthgrids.getPositions($tileDOM);
			
			var isInsideBorder = Sleuthgrids.checkIfMouseIsInsideBorder(mouseY, mouseX, tilePositions)

					
			if (isInsideBorder.isInside)
			{
				//$mainGrid.find(".tile").removeClass("active");
				//$tileDOM.find(".tile").addClass("active");
				
				Sleuthgrids.resizeDir = isInsideBorder.direction;
				Sleuthgrids.isResizing = true;
				Sleuthgrids.resizeTile = tile;
				grid.toggleTileResizeOverlay(true);	
			}
		},
		
		
		toggleTileOverlay: function(isVisible)
		{
			var tile = this;
			var $tileOverlay = tile.tileOverlayDOM;
			
			if (isVisible)
			{
				$tileOverlay.addClass("active");
			}
			else
			{
				$tileOverlay.removeClass("active");
			}
		},
		
		
		resizeCells: function()
		{
			var tile = this;
			var cells = tile.cells;
			
			for (var i = 0; i < cells.length; i++)
			{
				var cell = cells[i];
				
				cell.resizeCell();
			}
			
		},
		
		
		
		showTileBorder: function()
		{
			var tile = this;
			var $tile = tile.tileDOM;
			
			//var $check = $tile.find(".tile-nav-cell");
			
			$mainGrid.find(".tile-header").removeClass("focus-border");
			$mainGrid.find(".tile-cells").removeClass("focus-border");
			
			
			/*if ($check.length)
			{
				var $tileNavCell = $(this).find(".tile-nav-cell.active");
				$tileNavCell.addClass("focus-border");
				var cellIndex = $tileNavCell.attr("data-tab");
				var $cell = $(this).find(".cell[data-tab='" + cellIndex + "']")
				$cell.addClass("focus-border");
			}*/
			//else
			//{
				$tile.find(".tile-cells").addClass("focus-border");
				$tile.find(".tile-header").addClass("focus-border");
			//}
		},
		
		
		
		changeCellTab: function($tileNavCell)
		{
			var tile = this;
			
			//var $tileNavCell = $(this);
			var cellIndex = $tileNavCell.attr("data-cellIndex");
			var $tile = $tileNavCell.closest(".tile");
			var $cell = $tile.find(".cell[data-cellIndex='" + cellIndex + "']")
			
			$tile.find(".tile-nav-cell").removeClass("active");
			$tile.find(".cell").addClass("tab-hidden");
			
			$tileNavCell.addClass("active");
			$cell.removeClass("tab-hidden");
		},
		
		
		
		moveTile: function()
		{
			var tile = this;
			
			var hasCloseClass = $(e.target).hasClass("tile-header-close");
			
			if (!hasCloseClass)
			{
				//var tabIndex = $(this).attr("data-tab");
				//var $tileContent = $(this).closest(".tile").find(".tile-content[data-tab='"+tabIndex+"']");
					
					
				var $el = $(this).closest(".grid")
				var mouseY = e.clientY
				var mouseX = e.clientX
				var pos = Sleuthgrids.getPositions($el);
				
				var isInsideBorder = Sleuthgrids.checkIfMouseIsInsideBorder(mouseY, mouseX, pos)
				
				if (!isInsideBorder.top)
				{
					
					$tileAdd.addClass("active");
					$(".main-grid-arrow").addClass("active");

					Sleuthgrids.updateTileAddPos(e)
					
					Sleuthgrids.isGridTrig = true;
					Sleuthgrids.triggeredGrid = tile;
					Sleuthgrids.isTriggeredNew = false;
				}
			}
		},
		
		
		
		closeTile: function(tileNavCell)
		{
			var tile = this;
			var grid = tile.grid;
			var $tile = tile.tileDOM;
			
			var numCells = tile.cells.length;

			if (numCells > 1)
			{	
				var cellIndex = tileNavCell.index;
				var cell = tile.cells[cellIndex];

				if (numCells == 2)
				{
					tile.toggleHeaderTabbed(false);
				}
				
				tile.removeCell(cell);
				
				
				var activeNavCell = false;
				for (var i = 0; i < tile.navCells.length; i++)
				{
					if (tile.navCells[i].isActive)
					{
						activeNavCell = tile.navCells[i];
						break;
					}
				}
				
				if (!activeNavCell)
				{
					var newIndex = cellIndex - 1;
					newIndex = newIndex < 0 ? 0 : newIndex;
					activeNavCell = tile.navCells[newIndex];
				}

				activeNavCell.changeCellTabs();

				return;
			}

			var tilePositions = Sleuthgrids.getPositions($tile, true);
			var allTilesPositions = [];
			var allTiles = grid.tiles;
			
			
			for (var i = 0; i < allTiles.length; i++)
			{
				var loopTile = allTiles[i];
				var $loopTileDOM = loopTile.tileDOM;
				
				if (!$loopTileDOM.is($tile))
				{
					var obj = {};
					obj.node = $loopTileDOM;
					obj.pos = Sleuthgrids.getPositions($loopTileDOM, true);
					allTilesPositions.push(obj);
				}
			}
			

			
			var searchMap = {};
			searchMap.left = [[tilePositions.left, tilePositions.bottom], [tilePositions.left, tilePositions.top]];
			searchMap.top = [[tilePositions.left, tilePositions.top], [tilePositions.right, tilePositions.top]];
			searchMap.right = [[tilePositions.right, tilePositions.top], [tilePositions.right, tilePositions.bottom]];
			searchMap.bottom = [[tilePositions.right, tilePositions.bottom], [tilePositions.left, tilePositions.bottom]];
			
			for (searchDirection in searchMap)
			{
				var searchPoints = searchMap[searchDirection];
				var searchResults = grid.searchForAdjacentTiles(allTilesPositions, searchPoints, searchDirection)
				
				if (searchResults.length)
				{
					break;
				}
			}
			
			var isLeftOrTop = (searchDirection == "left" || searchDirection == "top");
			var isHoriz = (searchDirection == "top" || searchDirection == "bottom"); //backwards
			var isVert = (searchDirection == "left" || searchDirection == "right");
			var absKey = isVert ? "left" : "top";
			var sizeKey = isVert ? "width" : "height";

			for (var i = 0; i < searchResults.length; i++)
			{
				var loopTilePositions = searchResults[i][0].el.pos;
				var $loopTile = searchResults[i][0].el.node;
				
				var size = loopTilePositions[sizeKey] + tilePositions[sizeKey];
				var abs = isLeftOrTop ? loopTilePositions[absKey] : loopTilePositions[absKey] - tilePositions[sizeKey];
				
				
				$loopTile.css(absKey, abs)
				$loopTile.css(sizeKey, size)
			}

			
			//tile.removeCell();
			grid.removeTile(tile);
		},
		
		
		
		addResizeClass: function(resizeClassName)
		{
			var tile = this;
			
			$contentWrap.addClass(resizeClassName)
		},
		
		
		
		removeResizeClass: function()
		{
			var tile = this;
			
			$contentWrap.removeClass("tileResizeW tileResizeN tileResizeE tileResizeS")
		},
		
		
		
		showTileArrows: function()
		{
			var tile = this;
			var $tileArrowWrap = tile.tileArrowWrapDOM;

			
			if (Sleuthgrids.isGridTrig && (Sleuthgrids.triggeredGrid == null )) //|| !$(this).is(Sleuthgrids.triggeredGrid)
			{
				$tileArrowWrap.addClass("active");
			}
		},
		
		
		
		hideTileArrows: function()
		{
			var tile = this;
			var $tileArrowWrap = tile.tileArrowWrapDOM;

			
			if (Sleuthgrids.isGridTrig)
			{
				$tileArrowWrap.removeClass("active");
			}
		},
		
		
		
		onTileArrowMouseover: function($arrow)
		{
			var tile = this;
			var $tile = tile.tileDOM;
			var $tileArrowWrap = tile.tileArrowWrapDOM;
			var $previewTile = $($("#preview_tile_template").html());
			
			var arrowDirections = Sleuthgrids.getArrowDirections($arrow);

			
			$tileArrowWrap.addClass(arrowDirections.direction);
			Sleuthgrids.toggleTileAdd(false);
			
			
			var tilePositions = Sleuthgrids.getPositions($tile, true);
			
			
			var sizeKeys = getSizeKeys(arrowDirections, tilePositions, false, false)
			
			$tile.css(sizeKeys.sizeKey, sizeKeys.newSize);
			$tile.css(sizeKeys.absKey, sizeKeys.newAbs);
			
			
			var sizeKeys = getSizeKeys(arrowDirections, tilePositions, true, false)

			$previewTile.css("left", tilePositions.left);
			$previewTile.css("top", tilePositions.top);
			$previewTile.css("height", tilePositions.height);
			$previewTile.css("width", tilePositions.width);

			$previewTile.css(sizeKeys.absKey, sizeKeys.newAbs);
			$previewTile.css(sizeKeys.sizeKey, sizeKeys.newSize)

			$mainGrid.append($previewTile)
		},
		
		
		onTileArrowMouseout: function($arrow)
		{
			if (Sleuthgrids.isGridTrig)
			{	
				var tile = this;
				var $tile = tile.tileDOM;
				var $tileArrowWrap = tile.tileArrowWrapDOM;
			
				
				var arrowDirections = Sleuthgrids.getArrowDirections($arrow);

				$tileArrowWrap.removeClass(arrowDirections.direction);
				Sleuthgrids.toggleTileAdd(true);

				
				var tilePositions = Sleuthgrids.getPositions($tile, true);
				
				var sizeKeys = getSizeKeys(arrowDirections, tilePositions, false, true)
				
				$tile.css(sizeKeys.sizeKey, sizeKeys.newSize)
				$tile.css(sizeKeys.absKey, sizeKeys.newAbs)
				
				
				$mainGrid.find(".preview-tile").remove();
			}
		},
		
		
		
		onTileArrowMouseup: function($arrow)
		{
			var tile = this;
			var grid = tile.grid;
			var $tileArrowWrap = tile.tileArrowWrapDOM;
			var arrowDirections = Sleuthgrids.getArrowDirections($arrow);

	
			Sleuthgrids.toggleTileAdd(false);
			$tileArrowWrap.removeClass(arrowDirections.direction)
			
			
			var $previewTile = $mainGrid.find(".preview-tile");
			var previewTilePositions = Sleuthgrids.getPositions($previewTile, true);
			
			/*var newGridDirections = 
			{
				height: prevPos.height,
				width: prevPos.width,
				top: prevPos.top,
				left: prevPos.left,
			}*/
			
			
			if (arrowDirections.isMiddle)
			{
				arrowDirections.isTab = true;
				tile.addCell(Sleuthgrids.triggeredType, arrowDirections);
			}
			else
			{
				grid.makeTile(arrowDirections, previewTilePositions, tile);
			}

			

			$mainGrid.find(".preview-tile").remove();
		}
		
			
		
	}
	
	
	
	function getSizeKeys(arrowDirections, gridPositions, isInverted, isSignInverted)
	{
		var obj = {};
		
		var isHoriz = arrowDirections.isHoriz;
		var isMiddle = arrowDirections.isMiddle;
		var isLeftOrTop = arrowDirections.isLeft || arrowDirections.isTop;
			
		var absKey = isHoriz ? "left" : "top";
		var sizeKey = isHoriz ? "width" : "height";
		
		
		var size = gridPositions[sizeKey];
		var abs = gridPositions[absKey];


		
		if (isMiddle)
		{
			var newSize = size;
			var newAbs = abs;
			
		}
		else
		{
			var newSize = isSignInverted ? (size * 2) : (size / 2);
		
			var otherAbs = isSignInverted ? (abs - size) : (abs + newSize);
			
			//var newAbs = isInverted ? abs : otherAbs;

			
			if (isInverted)
			{
				var newAbs = isLeftOrTop ? abs : otherAbs;
			}
			else
			{
				var newAbs = isLeftOrTop ? otherAbs : abs;

			}
		}
		
		
		obj.absKey = absKey;
		obj.sizeKey = sizeKey;
		obj.newAbs = newAbs;
		obj.newSize = newSize;
		
		
		return obj;
	}
	
	

	
	
	
	
	return Sleuthgrids;
	
	
}(Sleuthgrids || {}));

