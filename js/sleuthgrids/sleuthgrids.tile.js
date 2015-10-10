
// Created by CryptoSleuth <cryptosleuth@gmail.com>


Sleuthgrids = (function(Sleuthgrids) 
{
		
	
	var PreviewTile = Sleuthgrids.PreviewTile = function()
	{
		this.init.apply(this, arguments)
	}
	
	PreviewTile.prototype = 
	{	
		init: function(grid)
		{
			var previewTile = this;

			previewTile.grid = grid;
			
			previewTile.tileDOM = $($("#preview_tile_template").html());
			previewTile.positions = {};
			previewTile.winPositions = {};
			previewTile.isActive = false;
			
			grid.gridDOM.append(previewTile.tileDOM);
		},
		
		updateInternalTilePositions: function()
		{
			var previewTile = this;
			
			var tilePositions = Sleuthgrids.getPositions(previewTile.tileDOM, true);
			var winTilePositions = Sleuthgrids.getPositions(previewTile.tileDOM, false);

			previewTile.positions = tilePositions;
			previewTile.winPositions = winTilePositions;
		},
		
		showPreviewTile: function()
		{
			var previewTile = this;
			
			previewTile.tileDOM.addClass("active");
			previewTile.isActive = true;
			
		},
		
		hidePreviewTile: function()
		{
			var previewTile = this;
			
			previewTile.tileDOM.removeClass("active");
			previewTile.isActive = false;
		}
	}
	
	
	
	var Tile = Sleuthgrids.Tile = function()
	{
		this.init.apply(this, arguments)
	}
	
	Tile.prototype = 
	{	
	
		init: function(tileOverlord, index, tileCSS)
		{
			var tile = this;

			tile.tileOverlord = tileOverlord;
			
			tile.index = index;
			tile.positions = {};
			tile.winPositions = {};

			tile.minwidth = 300;
			tile.minheight = 300;

			tile.isTileHeaderTabbed = false;
			
			tile.initDOM(tileCSS);
			tile.initEventListeners();
			tile.cellOverlord = new Sleuthgrids.CellOverlord(tile);

			//tile.updateInternalTilePositions();
		},
		
		
		
		initDOM: function(tileCSS)
		{
			var tile = this;
			
			tile.tileDOM = $($("#tile_template").html());
			tile.tileArrowWrapDOM = tile.tileDOM.find(".tile-arrow-wrap");
			tile.tileHeaderDOM = tile.tileDOM.find(".tile-header");
			tile.tileOverlayDOM = tile.tileDOM.find(".tile-overlay");
			
			tile.tileDOM.css(tileCSS);
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
		
		
		
		updateInternalTilePositions: function()
		{
			var tile = this;
			
			var tilePositions = Sleuthgrids.getPositions(tile.tileDOM, true);
			var winTilePositions = Sleuthgrids.getPositions(tile.tileDOM, false);

			tile.positions = tilePositions;
			tile.winPositions = winTilePositions;
		},
		
		
		
		resizeTile: function(sizeKey, prevWin, diff)
		{
			var tile = this;
			var $tile = tile.tileDOM;
			var tilePositions = tile.positions;
			
			if (diff != 0)
			{
				var absKey = sizeKey == "width" ? "left" : "top";
				var ratio = tilePositions[sizeKey] / prevWin;
				var change = diff * ratio;

				var size = tilePositions[sizeKey] + change;
				
				var prevAbs = tilePositions[absKey]
				var adjustRatio = prevAbs/prevWin
				var adjustChange = diff * adjustRatio
				var abs = (prevAbs + adjustChange);
							
				$tile.css(sizeKey, size);
				$tile.css(absKey, abs);
			}
		},
		
		
		
		saveTile: function()
		{
			var tile = this;
			var saveObj = {};
			
			saveObj.positions = tile.positions;
			saveObj.winPositions = tile.winPositions;
			saveObj.index = tile.index;
			saveObj.isTileHeaderTabbed = tile.isTileHeaderTabbed;
			saveObj.cellSaves = tile.saveCells();
						
			return saveObj;
		},
		
		
		
		closeTile: function(tileNavCell)
		{
			var tile = this;
			var tileOverlord = tile.tileOverlord;
			var cellOverlord = tile.cellOverlord;
			var numCells = cellOverlord.cells.length;
			
			if (numCells > 1)
			{	
				cellOverlord.closeCell(tileNavCell);
			}
			else
			{
				tile.closeTileResizer();

				//tile.removeCell();
				grid.removeTile(tile);
			}
		},
		
		
		
		closeTileResizer: function(withPrev)
		{
			var tile = this;
			var grid = tile.grid;
			var $tile = tile.tileDOM;
			
			var allTiles = grid.tiles.slice();
			allTiles.splice(tile.index, 1);
			if (withPrev)
				allTiles.push(grid.previewTile);
			
			var tilePositions = tile.positions;
			var searchMap = Sleuthgrids.makeSearchMap(tilePositions);
			
			
			for (searchDirection in searchMap)
			{
				var searchPoints = searchMap[searchDirection];
				var searchResults = grid.searchForParallelTiles(allTiles, searchPoints, searchDirection)
				
				if (searchResults.length)
				{
					var isVert = (searchDirection == "left" || searchDirection == "right");

					var coordOne = isVert ? searchPoints[0][1] : searchPoints[0][0];
					var coordTwo = isVert ? searchPoints[1][1] : searchPoints[1][0];
					var min = Math.min(coordOne, coordTwo)
					var max = Math.max(coordOne, coordTwo)
					var size = max - min;
					var runningSize = 0;
					var sizeKey = isVert ? "height" : "width";
					
					for (var j = 0; j < searchResults.length; j++)
					{
						runningSize += searchResults[j][0].tile.positions[sizeKey];
					}
										
					if (runningSize == size || Math.abs(runningSize - size) <= 0.5)
					{
						break;
					}
					else
					{
						searchResults = [];
					}				
				}
			}
			
			if (!searchResults.length)
			{
				
			}
						
			var isLeftOrTop = (searchDirection == "left" || searchDirection == "top");
			var isHoriz = (searchDirection == "top" || searchDirection == "bottom"); //backwards
			var isVert = (searchDirection == "left" || searchDirection == "right");
			var absKey = isVert ? "left" : "top";
			var sizeKey = isVert ? "width" : "height";

			for (var i = 0; i < searchResults.length; i++)
			{
				var loopTile = searchResults[i][0].tile;
				var loopTilePositions = loopTile.positions;
				var $loopTile = loopTile.tileDOM;
				
				var size = loopTilePositions[sizeKey] + tilePositions[sizeKey];
				var abs = isLeftOrTop ? loopTilePositions[absKey] : loopTilePositions[absKey] - tilePositions[sizeKey];
				
				//$loopTile.css(absKey, abs);
				//$loopTile.css(sizeKey, size);
				//loopTile.updateInternalTilePositions();

				var obj = {}
				obj[absKey] = abs;
				obj[sizeKey] = size;
				$loopTile.animate(obj, 300, function()
				{
					loopTile.updateInternalTilePositions();
				})
				
				if ("cells" in loopTile)
				{
					for (var j = 0; j < loopTile.cells.length; j++)
					{
						var loopCell = loopTile.cells[j];
						loopCell.resizeCell();
					}
				}
			}
		},
		
		
		
		removeTile: function()
		{
			var tile = this;
			var $tile = tile.tileDOM;
			
			tile.removeCell();
			//$tile.unbind();
			tile.tileDOM.remove();
		},
		
		
		
		toggleTileOverlay: function(isVisible)
		{
			var tile = this;
			var $tileOverlay = tile.tileOverlayDOM;
			var toggleFunc = isVisible ? "addClass" : "removeClass";
			$tileOverlay[toggleFunc]("active");
		},
		
		
		
		showTileBorder: function()
		{
			var tile = this;
			var grid = tile.grid;
			var $tile = tile.tileDOM;
			
			
			grid.gridDOM.find(".tile-header-tab").removeClass("focus-border");
			grid.gridDOM.find(".tile-cells").removeClass("focus-border");
			
			
			var activeNavCell = false;
			
			for (var i = 0; i < tile.navCells.length; i++)
			{
				if (tile.navCells[i].isActive)
				{
					activeNavCell = tile.navCells[i];
					break;
				}
			}

			tile.tileCellsWrapDOM.addClass("focus-border");
			activeNavCell.tileNavCellDOM.addClass("focus-border");
		},
		
		
		
		showTileArrows: function()
		{
			var tile = this;
			var $tileArrowWrap = tile.tileArrowWrapDOM;

			if (Sleuthgrids.isGridTrig && (Sleuthgrids.triggeredCell == null || Sleuthgrids.triggeredCell.tile != tile))
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
		
		
		
		onTileMousemove: function(e)
		{
			var tile = this;
			var grid = tile.grid;
			var tileOverlord = tile.tileOverlord;
			var tilePositions = tile.winPositions;
			
			var mouseY = e.clientY;
			var mouseX = e.clientX;
			
			
			var isInsideBorder = Sleuthgrids.checkIfMouseIsInsideBorder(mouseY, mouseX, tilePositions);
			
			if (isInsideBorder.isInside && !Sleuthgrids.isResizing)
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
				var resizePos = Sleuthgrids.resizeTile.positions;
				var offsetX = grid.gridDOM.offset().left;
				var offsetY = grid.gridDOM.offset().top;
				var insideX = mouseX - offsetX;
				var insideY = mouseY - offsetY;
				
				grid.resizeTile(insideX, insideY);
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
			var tilePositions = tile.winPositions;
			var tileOverlord = tile.tileOverlord;
			
			var mouseY = e.clientY
			var mouseX = e.clientX
			
			var isInsideBorder = Sleuthgrids.checkIfMouseIsInsideBorder(mouseY, mouseX, tilePositions)

			if (isInsideBorder.isInside)
			{
				Sleuthgrids.resizeDir = isInsideBorder.direction;
				Sleuthgrids.isResizing = true;
				Sleuthgrids.resizeTile = tile;
				tileOverlord.toggleTileResizeOverlay(true);	
			}
		},
		
		
		
		onTileArrowMouseover: function($arrow)
		{
			var tile = this;
			var cellOverlord = tile.cellOverlord;
			var tileOverlord = tile.tileOverlord;
			var previewTile = tileOverlord.previewTile;
			var tilePositions = tile.positions;
			var $tile = tile.tileDOM;
			var arrowDirections = Sleuthgrids.getArrowDirections($arrow);
			var $previewTile = previewTile.tileDOM;
			
			$tileArrowWrap.addClass(arrowDirections.direction);
			
			Sleuthgrids.toggleTileAdd(false);
						
			
			var sizeKeys = getSizeKeys(arrowDirections, tilePositions, false, false)
			
			$tile.css(sizeKeys.sizeKey, sizeKeys.newSize);
			$tile.css(sizeKeys.absKey, sizeKeys.newAbs);
			tile.updateInternalTilePositions();
			
			
			var sizeKeys = getSizeKeys(arrowDirections, tilePositions, true, false)

			$previewTile.css("left", tilePositions.left);
			$previewTile.css("top", tilePositions.top);
			$previewTile.css("height", tilePositions.height);
			$previewTile.css("width", tilePositions.width);

			$previewTile.css(sizeKeys.absKey, sizeKeys.newAbs);
			$previewTile.css(sizeKeys.sizeKey, sizeKeys.newSize);
			
			previewTile.showPreviewTile();
			previewTile.updateInternalTilePositions();
			
			
			tile.resizeCells();
		},
		
		
		
		onTileArrowMouseout: function($arrow)
		{
			if (Sleuthgrids.isGridTrig)
			{	
				var tile = this;
				var cellOverlord = tile.cellOverlord;
				var tileOverlord = tile.tileOverlord;
				var previewTile = tileOverlord.previewTile;
				var tilePositions = tile.positions;
				var $tile = tile.tileDOM;
				var arrowDirections = Sleuthgrids.getArrowDirections($arrow);
				
				tile.tileArrowWrapDOM.removeClass(arrowDirections.direction);
				
				Sleuthgrids.toggleTileAdd(true);

				var sizeKeys = getSizeKeys(arrowDirections, tilePositions, false, true);
				$tile.css(sizeKeys.sizeKey, sizeKeys.newSize);
				$tile.css(sizeKeys.absKey, sizeKeys.newAbs);
				tile.updateInternalTilePositions();
				
				previewTile.hidePreviewTile();
				tile.resizeCells();
			}
		},
		
		
		
		onTileArrowMouseup: function($arrow)
		{
			var tile = this;
			var cellOverlord = tile.cellOverlord;
			var tileOverlord = tile.tileOverlord;
			var previewTile = tileOverlord.previewTile;
			var previewTilePositions = previewTile.positions;
			var triggeredType = Sleuthgrids.triggeredType;
			var isTriggeredNew = Sleuthgrids.isTriggeredNew;
			var arrowDirections = Sleuthgrids.getArrowDirections($arrow);
			
			tile.tileArrowWrapDOM.removeClass(arrowDirections.direction);
			
			Sleuthgrids.toggleTileAdd(false);
			

			if (arrowDirections.isMiddle && isTriggeredNew)
			{
				cellOverlord.addCell(triggeredType, -1, true, isTriggeredNew);
			}
			else
			{
				grid.makeTile(arrowDirections, previewTilePositions, tile);
			}
			

			previewTile.hidePreviewTile();
		},
		
		
		
		addResizeClass: function(resizeClassName)
		{
			var tile = this;
			
			Sleuthgrids.contentWrap.addClass(resizeClassName);
		},
		
		
		
		removeResizeClass: function()
		{
			var tile = this;
			
			Sleuthgrids.contentWrap.removeClass("tileResizeW tileResizeN tileResizeE tileResizeS");
		},
		
		
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

