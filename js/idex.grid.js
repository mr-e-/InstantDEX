
var IDEX = (function(IDEX, $, undefined) 
{

	var $mainGrid = $("#main_grid");
	var $tileAdd = $("#tile_add");
	var $contentWrap = $("#content_wrap");

	IDEX.isGridTrig = false;
	
	var $triggeredGrid = null;
	var isTriggeredNew = false;
	
	var isResizing = false;
	var $resizeGrid = null;
	var resizeDir = "";

	var counter = 0;

	
	
	$(".grid-trig").each(function()
	{
		var gridType = $(this).attr("data-grid");
		$(this).tooltipster({
			content:gridType,
			arrow:false,
			offsetY:-15
		})
	})
	
	
	$("#main_grid").on("click", ".tile-header-tab", function()
	{
		var $tabHeader = $(this)
		var tab = $tabHeader.attr("data-tab");
		var $wrap = $tabHeader.closest(".tile");
		var $tabContent = $wrap.find(".tile-content[data-tab='"+tab+"']")
		
		$wrap.find(".tile-header-tab").removeClass("active");
		$wrap.find(".tile-content").addClass("tab-hidden");
		
		$tabHeader.addClass("active");
		$tabContent.removeClass("tab-hidden");
	})
	
	
	
	function removeResizeClass()
	{
		$contentWrap.removeClass("tileResizeW tileResizeN tileResizeE tileResizeS")
	}
	
	$("#main_grid").on("mousemove", ".grid", function(e)
	{
		var $el = $(this)
		var mouseY = e.clientY
		var mouseX = e.clientX
		
		var pos = getPositions($el);
		
		var isInsideBorder = getInside(mouseY, mouseX, pos)
				
		if (isInsideBorder.top)
		{
			removeResizeClass()
			$("#content_wrap").addClass("tileResizeN")
		}
		else if (isInsideBorder.bottom)
		{
			removeResizeClass()
			$("#content_wrap").addClass("tileResizeS")
		}
		else if (isInsideBorder.left)
		{
			removeResizeClass()
			$("#content_wrap").addClass("tileResizeW")
		}
		else if (isInsideBorder.right)
		{
			removeResizeClass()
			$("#content_wrap").addClass("tileResizeE")
		}
		else
		{
			if (!isResizing)
				removeResizeClass()
		}
		if (isResizing)
		{
			var resizePos = getPositions($resizeGrid);
			var offsetX = $mainGrid.offset().left;
			var offsetY = $mainGrid.offset().top;
			var insideX = mouseX - offsetX
			var insideY = mouseY - offsetY
			
			resize(insideX, insideY)
		}
	})
	
	
	$("#main_grid").on("mouseleave", ".grid", function(e)
	{
		if (!isResizing)
			removeResizeClass();
	})
	
	
	
	$("#main_grid").on("mousedown", ".grid", function(e)
	{	
		var $el = $(this)
		var mouseY = e.clientY
		var mouseX = e.clientX
		
		var pos = getPositions($el);
		
		var isInsideBorder = getInside(mouseY, mouseX, pos)

				
		if (isInsideBorder.top || isInsideBorder.bottom || isInsideBorder.left || isInsideBorder.right)
		{
			$mainGrid.find(".tile").removeClass("active");
			$el.find(".tile").addClass("active");
			
			for (key in isInsideBorder)
				if (isInsideBorder[key])
					resizeDir = key;
			isResizing = true;
			$resizeGrid = $el;
		}
	})
	
	
	
	
	function resize(mouseX, mouseY)
	{
		var $grid = $resizeGrid
		var gridPos = getPositions($grid, true);
		var arr = [];
		
		var isHoriz = (resizeDir == "top" || resizeDir == "bottom"); //backwards
		var isVert = (resizeDir == "left" || resizeDir == "right");
		var absKey = isVert ? "left" : "top";
		var sizeKey = isVert ? "width" : "height";
		
		var mouseDir = mouseX > gridPos[resizeDir];
		mouseDir = mouseDir ? "right" : "left";
		
		$mainGrid.find(".grid").each(function(i, e)
		{
			var $el = $(e);
			
			if (!$el.is($grid))
			{
				var obj = {};
				obj.node = $el;
				obj.pos = getPositions($el, true);
				arr.push(obj);
			}
		})

		var obj = {};
		obj.node = $grid;
		obj.pos = gridPos;
		
		var loop = []
		loop.push(obj)
		
		var clone = IDEX.cloneListOfObjects(arr);
		var flip = isVert ? ["top", "bottom"] : ["left", "right"];

		var all = {};
		all[flip[0]] = [];
		all[flip[1]] = [];
		
		for (var i = 0; i < clone.length; i++)
		{
			var one = clone[i];
						
			for (var v = 0; v < loop.length; v++)
			{
				var oneLoop = loop[v]
			
				if (one.pos[resizeDir] == oneLoop.pos[resizeDir])
				{			
					var check = false;
					
					for (var k = 0; k < flip.length; k++)
					{
						var key = flip[k]

						for (var j = 0; j < flip.length; j++)
						{
							var flipKey = flip[j];

							if (one.pos[key] == oneLoop.pos[flipKey])
							{
								check = true;
								break
							}
						}
						if (check)
							break
					}
					
					if (check)
					{
						all[flipKey].push(one)
						loop.push(one)
						clone.splice(i, 1)
						i = -1;
						break;
					}
				}
			}
			//console.log(counter++)
		}
		

		var poss = [];
		
		poss.push([gridPos[flip[0]], gridPos[flip[1]]])
		
		var first = all[flip[0]]
		var second = all[flip[1]];
		
		var constant = gridPos[resizeDir]
		
		for (var i = 0; i < first.length; i++)
		{
			var minor = first[i].pos[flip[0]]
			var major = gridPos[flip[1]]
			poss.push([minor, major])
		}
		
		for (var i = 0; i < second.length; i++)
		{
			var minor = gridPos[flip[0]]
			var major = second[i].pos[flip[1]]
			poss.push([minor, major])
		}
		
		for (var i = 0; i < first.length; i++)
		{
			var minor = first[i].pos[flip[0]]
			
			for (var j = 0; j < second.length; j++)
			{
				var major = second[j].pos[flip[1]]
				poss.push([minor, major])
			}
		}
		
		var points = [];
		
		for (var i = 0; i < poss.length; i++)
		{
			var pos = poss[i]
			if (isVert)
			{
				var one = [[constant, pos[0]],[constant, pos[1]]]
			}
			else
			{
				var one = [[pos[0], constant],[pos[1],constant]]
			}

			points.push(one)
		}
		
		/*var allPoints = {};
		allPoints.left = [[gridPos.left, gridPos.bottom], [gridPos.left, gridPos.top]]
		allPoints.top = [[gridPos.left, gridPos.top], [gridPos.right, gridPos.top]]
		allPoints.right = [[gridPos.right, gridPos.top], [gridPos.right, gridPos.bottom]]
		allPoints.bottom = [[gridPos.right, gridPos.bottom], [gridPos.left, gridPos.bottom]]*/
		
		for (var i = 0; i < points.length; i++)
		{
			var point = points[i];
			var results = searchResize(arr, point, resizeDir);
			
			if (results.length)
			{
				var coordOne = isVert ? point[0][1] : point[0][0];
				var coordTwo = isVert ? point[1][1] : point[1][0];
				var min = Math.min(coordOne, coordTwo)
				var max = Math.max(coordOne, coordTwo)
				var size = max-min;
				var runningSize = 0;
				var sizeKey = isVert ? "height" : "width";
				
				//console.log(points)
				//console.log(results)
				for (var j = 0; j < results.length; j++)
				{
					runningSize += results[j][0].el.pos[sizeKey];
				}
				
				//console.log([runningSize, size])
				
				if (runningSize == size)
				{
					break;
				}
				else
				{
					results = [];
				}
			}
		}

		if (!results.length)
			return;
		
		
		var tes = [];
		
		for (var i = 0; i < loop.length; i++)
		{
			var coordOne = isVert ? point[0][1] : point[0][0];
			var coordTwo = isVert ? point[1][1] : point[1][0];
			
			var $el = loop[i].node;
			var pos = loop[i].pos;
				
			var min = Math.min(coordOne, coordTwo)
			var max = Math.max(coordOne, coordTwo)
			
			var firstBetween = pos[flip[0]] >= min && pos[flip[0]] <= max
			var secondBetween = pos[flip[1]] >= min && pos[flip[1]] <= max
			
			if (firstBetween && secondBetween)
				tes.push(loop[i])
		}
		
		//console.log([min, max])
		//console.log(tes)

		
		for (var i = 0; i < tes.length; i++)
		{
			var $el = tes[i].node;
			var pos = tes[i].pos;
			
			if (resizeDir == "left")
			{
				var diff = mouseX - gridPos.left;
				$el.css("width", pos.width - diff)
				$el.css("left", pos.left + diff)
			}

			else if (resizeDir == "right")
			{
				var diff = mouseX - gridPos.right;
				$el.css("width", pos.width + diff)
			}
			else if (resizeDir == "top")
			{
				var diff = mouseY - gridPos.top;
				$el.css("height", pos.height - diff)
				$el.css("top", pos.top + diff)
			}
			else if (resizeDir == "bottom")
			{
				var diff = mouseY - gridPos.bottom;
				$el.css("height", pos.height + diff)
			}
		
		}
		for (var i = 0; i < results.length; i++)
		{
			var pos = results[i][0].el.pos;
			var $el = results[i][0].el.node;
			
			
			if (resizeDir == "left")
			{
				$el.css("width", pos.width + diff)
			}
			else if (resizeDir == "right")
			{
				$el.css("width", pos.width - diff)
				$el.css("left", pos.left + diff)
			}
			else if (resizeDir == "top")
			{
				$el.css("height", pos.height + diff)
			}
			else if (resizeDir == "bottom")
			{
				$el.css("height", pos.height - diff)
				$el.css("top", pos.top + diff)
			}
		}

	}
	
	
	function searchResize(arr, points, direction)
	{
		var hKeys = ["left", "right"];
		var vKeys = ["top", "bottom"];
		var results = [];
		
		for (var i = 0; i < arr.length; i++)
		{
			var one = arr[i];
			var oneRes = [];
			
			for (var j = 0; j < hKeys.length; j++)
			{
				var hKey = hKeys[j];
				
				for (var k = 0; k < vKeys.length; k++)
				{
					var vKey = vKeys[k];
					
					if (vKey == direction || hKey == direction)
						continue;
					var coord = [one.pos[hKey], one.pos[vKey]]
					
					var obj = {};
					obj.h = hKey;
					obj.v = vKey;
					obj.el = one;
					
					if (compareCoord(points, coord, direction))
						oneRes.push(obj)
				}
			}
			
			if (oneRes.length > 1)
				results.push(oneRes)
		}
		
		return results;
	}
	
	
	function compareCoord(mainPoints, compPoint, direction)
	{
		var isVert = (direction == "left" || direction == "right")
		var indexOfSame = isVert ? 0 : 1;
		var indexOfBetween = isVert ? 1 : 0;
		
		var min = Math.min(mainPoints[0][indexOfBetween], mainPoints[1][indexOfBetween])
		var max = Math.max(mainPoints[0][indexOfBetween], mainPoints[1][indexOfBetween])

		var isSame = (mainPoints[0][indexOfSame] == compPoint[indexOfSame])
		var isBetween = (compPoint[indexOfBetween] >= min && compPoint[indexOfBetween] <= max)

		//console.log([isSame, isBetween, compPoint[indexOfSame], min, max])
		//console.log(mainPoints)
		return isSame && isBetween
	}


	
	function getPositions($el, isAbs)
	{
		var positions = {};

		var offset = $el.offset()
		if (isAbs)
			offset = $el.position();
		
		var width = $el[0].getBoundingClientRect().width
		var height = $el[0].getBoundingClientRect().height
		
		positions.height = height;
		positions.width = width;
		positions.top = offset.top;
		positions.bottom = positions.top + height;
		positions.left = offset.left;
		positions.right = positions.left + width;
		
		return positions
	}
	
	
	function getInside(mouseY, mouseX, pos)
	{
		var isInsideBorder = {};
		var borderWidth = 4;

		isInsideBorder.top = mouseY > pos.top && mouseY < (pos.top + borderWidth);
		isInsideBorder.bottom = mouseY < pos.bottom && mouseY > (pos.bottom - borderWidth);

		isInsideBorder.left = mouseX > pos.left && mouseX < (pos.left + borderWidth);
		isInsideBorder.right = mouseX < pos.right && mouseX > (pos.right - borderWidth);
		
		return isInsideBorder;
	}
	
	
	function updateTileAddPos(event)
	{
		var $wrap = $("#content_wrap");
		var mouseX = event.clientX;
		var mouseY = event.clientY;
		
		$tileAdd.css("left", mouseX);
		$tileAdd.css("top", mouseY);
	}
	
	$(document).on("mousemove", function(e)
	{
		if (!IDEX.isGridTrig)
			return;
		
		updateTileAddPos(e)
	})
	
	
	
	$("#main_grid").on("mousedown", ".tile-header", function(e)
	{
		if ($(e.target).hasClass("tile-header-close"))
			return;
		
		var $el = $(this).closest(".grid")
		var mouseY = e.clientY
		var mouseX = e.clientX
		var pos = getPositions($el);
		var isInsideBorder = getInside(mouseY, mouseX, pos)
		if (isInsideBorder.top)
			return;

		
		IDEX.isGridTrig = true;
		
		$tileAdd.addClass("active");
		$(".main-grid-arrow").addClass("active");

		updateTileAddPos(e)
		$triggeredGrid = $(this).closest(".grid");
		isTriggeredNew = false;
	})
	
	
	$("#main_grid").on("mouseleave", ".tile-header", function(e)
	{
		if (!IDEX.isGridTrig)
			return;
	})

	
	$(".grid-trig").on("mousedown", function(e)
	{
		IDEX.isGridTrig = true;

		var gridType = $(this).attr("data-grid");
		
		var $template = $(".grid-trig-template[data-grid='"+gridType+"']").html();
		var $grid = $($("#grid_template").html())
		var $tile = $($("#tile_template").html())
		$tile.find(".tile-header-title").text(gridType)
		$tile.find(".tile-content").append($template);
		$grid.append($tile);
		$grid.attr("data-grid", gridType);
		$triggeredGrid = $grid;
		isTriggeredNew = true;
	})
	
	$(".grid-trig").on("mouseleave", function(e)
	{
		if (!IDEX.isGridTrig)
			return;
		
		var has = $tileAdd.hasClass("active")
		if (!has)
		{
			updateTileAddPos(e)	
			$tileAdd.addClass("active");
			$(".main-grid-arrow").addClass("active");
			
			var hasGrids = $mainGrid.find(".grid").length;
			if (!hasGrids)
				$(".main-grid-arrow-middle").addClass("active");
		}
		
		updateTileAddPos(e)
	})
	
	
	$(document).on("mouseup", function(e)
	{
		$(".main-grid-arrow-middle").removeClass("active");

		if (IDEX.isGridTrig)
		{
			IDEX.isGridTrig = false;
			$tileAdd.removeClass("active");
			$(".main-grid-arrow").removeClass("active");
			$(".grid-arrow-wrap").removeClass("active");
		}
		
		isResizing = false;
		$resizeGrid = null;
		resizeDir = "";
	})

	

	$("#main_grid").on("mouseover", ".grid", function(e)
	{
		if (IDEX.isGridTrig && ($triggeredGrid == null || !$(this).is($triggeredGrid)))
			$(this).find(".grid-arrow-wrap").addClass("active");
	})
	
	$("#main_grid").on("mouseleave", ".grid", function(e)
	{
		if (IDEX.isGridTrig)
			$(this).find(".grid-arrow-wrap").removeClass("active");
	})
	

	
	/**************	SUB GRID ARROWS	***************/
	
	
	$("#main_grid").on("mouseover", ".grid-arrow", function(e)
	{
		$tileAdd.removeClass("active");
		var direction = $(this).attr("data-arrow");
		var isHoriz = (direction == "left" || direction == "right");
		var isVert = (direction == "top" || direction == "bottom");
		var isMiddle = (direction == "middle")
		
		var $gridArrowWrap = $(this).closest(".grid-arrow-wrap");
		$gridArrowWrap.addClass(direction)
		
		var $previewTile = $($("#preview_tile_template").html());
		var $grid = $(this).closest(".grid");
		
		
		var gridPos = getPositions($grid, true);
		
		var absKey = isHoriz ? "left" : "top";
		var sizeKey = isHoriz ? "width" : "height";
		var newSize = isHoriz ? gridPos.width/2 : gridPos.height/2;
		newSize = isMiddle ? gridPos.height : newSize;

		var size = gridPos[sizeKey] - newSize
		size = isMiddle ? gridPos[sizeKey] : size;

		if (isHoriz)
			var abs = direction == "left" ? gridPos.left + newSize : gridPos.left;
		else if (isVert)
			var abs = direction == "top" ? gridPos.top + newSize : gridPos.top;
		else
			var abs = gridPos.top
		
		$grid.css(sizeKey, size)
		$grid.css(absKey, abs)
		
		
		
		$previewTile.css("left", gridPos.left);
		$previewTile.css("top", gridPos.top);
		$previewTile.css("height", gridPos.height);
		$previewTile.css("width", gridPos.width);
		
		if (isHoriz)
			var abs = direction == "left" ? gridPos.left : gridPos.left + newSize;
		else if (isVert)
			var abs = direction == "top" ? gridPos.top : gridPos.top + newSize;
		else
			var abs = gridPos.top

		$previewTile.css(absKey, abs);
		$previewTile.css(sizeKey, size)

		$mainGrid.append($previewTile)
	})
	
	
	$("#main_grid").on("mouseout", ".grid-arrow", function(e)
	{
		if (!IDEX.isGridTrig)
			return;
		$tileAdd.addClass("active");
		var direction = $(this).attr("data-arrow");
		var isHoriz = (direction == "left" || direction == "right");
		var isVert = (direction == "top" || direction == "bottom");
		var isMiddle = (direction == "middle")
		
		var $gridArrowWrap = $(this).closest(".grid-arrow-wrap");
		$gridArrowWrap.removeClass(direction)
		
		
		var $grid = $(this).closest(".grid");
		var gridPos = getPositions($grid, true);
		
		var absKey = isHoriz ? "left" : "top";
		var sizeKey = isHoriz ? "width" : "height";
		var newSize = isHoriz ? gridPos.width*2 : gridPos.height*2;


		var size = newSize
		size = isMiddle ? gridPos[sizeKey] : size;

		if (isHoriz)
			var abs = direction == "left" ? gridPos.left - gridPos.width : gridPos.left;
		else if (isVert)
			var abs = direction == "top" ? gridPos.top - gridPos.height : gridPos.top;
		else
			var abs = gridPos.top;
		
		$grid.css(sizeKey, size)
		$grid.css(absKey, abs)
		
		
		$mainGrid.find(".preview-tile").remove();
	})

	
	$("#main_grid").on("mouseup", ".grid-arrow", function(e)
	{
		$tileAdd.removeClass("active");
		$triggeredGrid.find(".tile-header-close").trigger("click")
		var $newGrid = $triggeredGrid
		$triggeredGrid = null;
		
		var direction = $(this).attr("data-arrow");
		var isHoriz = (direction == "left" || direction == "right");  // backwards naming?
		var isVert = (direction == "top" || direction == "bottom");
		var isMiddle = (direction == "middle");
		
		var $gridArrowWrap = $(this).closest(".grid-arrow-wrap");
		$gridArrowWrap.removeClass(direction)
		
		var $grid = $(this).closest(".grid");
		var gridPos = getPositions($grid, true);
		

		var $previewTile = $mainGrid.find(".preview-tile");
		var prevPos = getPositions($previewTile, true);
		$newGrid.css("height", prevPos.height);
		$newGrid.css("width", prevPos.width);
		$newGrid.css("top", prevPos.top);
		$newGrid.css("left", prevPos.left);
		$newGrid.attr("data-arrow", direction);
		
		
		if (isMiddle)
		{
			
			var $tileHeader = $grid.find(".tile-header")
			var newTitle = $newGrid.find(".tile-header-title").text();
			var has = $tileHeader.hasClass("tile-header-tabs");
						
			var $tileHeaderTab = $($("#tile_header_template").html());
			var tabIndex = 2;
			
			if (has)
			{
				var $lastTab = $tileHeader.find(".tile-header-tab").last();
				var lastTabIndex = Number($lastTab.attr("data-tab"))
				tabIndex = lastTabIndex + 1;
				
				$tileHeaderTab.attr("data-tab", tabIndex);
			}
			else
			{
				var firstTitle = $tileHeader.find(".tile-header-title").text();
				var $firstTab = $($("#tile_header_template").html());
				$firstTab.find(".tile-header-title").text(firstTitle);
				$firstTab.attr("data-tab", "1");
				$grid.find(".tile-content").attr("data-tab", "1");
				$grid.find(".tile-content").addClass("tab-hidden")
				
				$tileHeader.empty().addClass("tile-header-tabs");
				$tileHeader.append($firstTab);
			}
			
			$tileHeaderTab.attr("data-tab", tabIndex);
			$tileHeaderTab.find(".tile-header-title").text(newTitle);
			//$tileHeaderTab.addClass("active");
			$tileHeader.append($tileHeaderTab)
			
			var newGridType = $newGrid.attr("data-grid");
			$newGrid = $($newGrid.find(".tile-content")[0].outerHTML)
			$newGrid.attr("data-tab", tabIndex);
			$newGrid.attr("data-grid", newGridType);
			
			$grid.find(".tile").append($newGrid);
			
			makeGridType($newGrid);
			$tileHeaderTab.trigger("click");
		}
		else
		{
			$mainGrid.append($newGrid)			
			makeGridType($newGrid);
		}
		
		$mainGrid.find(".preview-tile").remove();
	})
	
	
	var gridCount = 0;
	
	function makeGridType($grid)
	{
		//if (!isTriggeredNew)
		//	return;
		
		var gridType = $grid.attr("data-grid")
		
		if (gridType == "chart")
		{
			if (!isTriggeredNew)
			{
				var id = $grid.find(".chart-header").attr("data-chart");
				IDEX.makeChartDefault(id);
				return
			}
			
			var svg = IDEX.makeSVG()
			var $svgEl = $(svg.node())
			var id = "chart_" + String(gridCount)
			$svgEl.attr("id", id)
			$grid.find(".chart-wrap").append($svgEl)
			$grid.find(".chart-header").attr("data-chart", id);
			
			var $dropdownTable = $($("#chartTableTemplate").html())
			$grid.find(".dropdown-wrap").append($dropdownTable)
			
			IDEX.makeChartDefault(id);
			
	
			var $search = $grid.find('.skynet-search');
			IDEX.initSkyNETAuto($search)
		}
		else if (gridType == "orderbook")
		{

		}
		else if (gridType == "watchlist")
		{
			IDEX.initFavorites($grid);
		}
		
		if (isTriggeredNew)
			gridCount++;
		
	}
	
	/**************		MAIN GRID ARROWS	***************/
	
	
	function findMain(direction, withPreview)
	{
		var mainPositions = getPositions($mainGrid)
		var pos = mainPositions[direction]
		var els = []

		$mainGrid.find(".grid").each(function()
		{
			var thisPositions = getPositions($(this))

			if (withPreview)
			{
				var $prev = $mainGrid.find(".preview-tile");
				var prevPositions = getPositions($prev);
				
				var prevDir = "left"
				if (direction == "left")
					prevDir = "right"
				if (direction == "top")
					prevDir = "bottom"
				if (direction == "bottom")
					prevDir = "top"

				var isDirection = thisPositions[direction] == prevPositions[prevDir]
				//console.log([thisPositions[direction], prevPositions[prevDir]])
			}
			else
			{
				var isDirection = thisPositions[direction] == pos
			}

			if (isDirection)
				els.push($(this))
		})

		return els
	}
	
	function getLowest(els, direction)
	{
		var $lowEl = null;
		var lowest = -1;
		var sizeKey = (direction == "left" || direction == "right") ? "width" : "height";

		for (var i = 0; i < els.length; i++)
		{
			var $el = els[i];
			var size = $el[0].getBoundingClientRect()[sizeKey]

			if (size < lowest || lowest == -1)
			{
				$lowEl = $el;
				lowest = size;
			}
		}

		return $lowEl
	}

	
	
	$("#main_grid").on("mouseover", ".main-grid-arrow, .main-grid-arrow-middle", function(e)
	{
		$tileAdd.removeClass("active");
		var $previewTile = $($("#preview_tile_template").html());

		var direction = $(this).attr("data-arrow");
		var isHoriz = (direction == "left" || direction == "right");
		var isVert = (direction == "top" || direction == "bottom");
		var isMiddle = (direction == "middle")
		
		if (isMiddle)
		{
			$previewTile.css("height", "100%");
			$previewTile.css("width", "100%");
			$previewTile.css("top", 0);
			$previewTile.css("left", 0);
			$mainGrid.append($previewTile)
			return
		}

		var els = findMain(direction, false)
		if (!els.length)
			return
		
		
		var $grid = getLowest(els, direction);
		var gridPos = getPositions($grid, true);
		
		var absKey = isHoriz ? "left" : "top";
		var sizeKey = isHoriz ? "width" : "height";
		var newSize = isHoriz ? gridPos.width/2 : gridPos.height/2;
		
		
		for (var i = 0; i < els.length; i++)
		{
			var $el = els[i];
			var pos = getPositions($el, true);
			
			var size = pos[sizeKey]
			
			if (isHoriz)
				var abs = direction == "left" ? pos.left + newSize : pos.left;
			else
				var abs = direction == "top" ? pos.top + newSize : pos.top;
			
			$el.css(sizeKey, size - newSize)
			$el.css(absKey, abs)
		}
		
		
		$previewTile.css("height", "100%");
		$previewTile.css("width", "100%");
		$previewTile.css("top", 0);
		$previewTile.css("left", 0);
		
		mainPos = getPositions($mainGrid);
		
		var prevAbs = 0;
		if (direction == "bottom")
			prevAbs = mainPos.height - newSize
		if (direction == "right")
			prevAbs = mainPos.width - newSize
		
		$previewTile.css(sizeKey, newSize);
		$previewTile.css(absKey, prevAbs);

		$mainGrid.append($previewTile)
	})
	
	
	$("#main_grid").on("mouseout", ".main-grid-arrow, .main-grid-arrow-middle", function(e)
	{
		if (!IDEX.isGridTrig)
			return;
		
		$tileAdd.addClass("active");
		
		var direction = $(this).attr("data-arrow");
		var isHoriz = (direction == "left" || direction == "right");
		var isVert = (direction == "top" || direction == "bottom");
		var isMiddle = (direction == "middle")

		if (isMiddle)
		{
			$mainGrid.find(".preview-tile").remove();
			return;
		}
		var els = findMain(direction, true)

		if (!els.length)
			return
				
		var $grid = getLowest(els, direction);
		var gridPos = getPositions($grid, true);
		
		var absKey = isHoriz ? "left" : "top";
		var sizeKey = isHoriz ? "width" : "height";
		var newSize = isHoriz ? gridPos.width : gridPos.height;
		
		
		for (var i = 0; i < els.length; i++)
		{
			var $el = els[i];
			var pos = getPositions($el, true);
			
			var size = pos[sizeKey]
			
			if (isHoriz)
				var abs = direction == "left" ? pos.left - newSize : pos.left;
			else
				var abs = direction == "top" ? pos.top - newSize : pos.top;
			
			$el.css(sizeKey, size + newSize)
			$el.css(absKey, abs)
		}
		
		$mainGrid.find(".preview-tile").remove();
	})

	
	$("#main_grid").on("mouseup", ".main-grid-arrow, .main-grid-arrow-middle", function(e)
	{
		$tileAdd.removeClass("active");

		$triggeredGrid.find(".tile-header-close").trigger("click")
		var $newGrid = $triggeredGrid
		$triggeredGrid = null;
		
		var direction = $(this).attr("data-arrow");
		var isHoriz = (direction == "left" || direction == "right");
		var isVert = (direction == "top" || direction == "bottom");
		var isMiddle = (direction == "middle")

		
		var $previewTile = $mainGrid.find(".preview-tile");
		var prevPos = getPositions($previewTile, true);
		$newGrid.css("height", prevPos.height);
		$newGrid.css("width", prevPos.width);
		$newGrid.css("top", prevPos.top);
		$newGrid.css("left", prevPos.left);
		$newGrid.attr("data-arrow", direction);

		$mainGrid.find(".preview-tile").remove();
		
		makeGridType($newGrid);
		$mainGrid.append($newGrid)			
	})
	
	
	/**************	CLOSE GRID	***************/
		
	
	$("#main_grid").on("click", ".tile-header-close", function()
	{
		var $grid = $(this).closest(".grid");

		if ($(this).hasClass("tile-header-tab-close"))
		{
			var len = $grid.find(".tile-content").length;
			
			if (len > 1)
			{
				var $header = $(this).closest(".tile-header-tab");
				closeTab($header)
				return
			}
		}
		
		var gridPos = getPositions($grid, true);
		var arr = [];
		
		$mainGrid.find(".grid").each(function(i, e)
		{
			var $el = $(e);
			
			if (!$el.is($grid))
			{
				var obj = {};
				obj.node = $el;
				obj.pos = getPositions($el, true);
				arr.push(obj);
			}
			
		})

		
		var allPoints = {};
		allPoints.left = [[gridPos.left, gridPos.bottom], [gridPos.left, gridPos.top]]
		allPoints.top = [[gridPos.left, gridPos.top], [gridPos.right, gridPos.top]]
		allPoints.right = [[gridPos.right, gridPos.top], [gridPos.right, gridPos.bottom]]
		allPoints.bottom = [[gridPos.right, gridPos.bottom], [gridPos.left, gridPos.bottom]]
		
		for (key in allPoints)
		{
			var points = allPoints[key];
			var results = searchX(arr, points, key)
			
			if (results.length)
				break;
		}
		
		var isHoriz = (key == "top" || key == "bottom"); //backwards
		var isVert = (key == "left" || key == "right");
		var absKey = isVert ? "left" : "top";
		var sizeKey = isVert ? "width" : "height";

		for (var i = 0; i < results.length; i++)
		{
			var pos = results[i][0].el.pos;
			var $el = results[i][0].el.node;
			
			var size = isVert ? pos.width + gridPos.width : pos.height + gridPos.height
			
			if (isVert)
				var abs = key == "left" ? pos.left : pos.left - gridPos.width;
			else
				var abs = key == "top" ? pos.top : pos.top - gridPos.height;
			
			$el.css(absKey, abs)
			$el.css(sizeKey, size)
		}

		closeGridType($grid);
		$grid.remove();
	})
	
	function closeGridType($grid)
	{
		var gridType = $grid.attr("data-grid")
		
		if (gridType == "chart")
		{
			
		}
		else if (gridType == "orderbook")
		{
			//console.log(IDEX.allOrderbooks);
			var $orderbook = $grid.find(".orderbook-wrap");
			IDEX.removeOrderbook($orderbook)
		}
		else if (gridType == "watchlist")
		{

		}
	}
	
	function closeTab($tabHeader)
	{
		var $wrap = $tabHeader.closest(".grid");
		var len = $wrap.find(".tile-content").length;

		var tab = $tabHeader.attr("data-tab");
		var $tabContent = $wrap.find(".tile-content[data-tab='"+tab+"']")
				
		var $nextTabHeader = $tabHeader.next();
		if (!$nextTabHeader.length)
			$nextTabHeader = $tabHeader.prev();
		
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
		
	}
	
	
	function searchX(arr, points, direction)
	{
		var hKeys = ["left", "right"];
		var vKeys = ["top", "bottom"];
		var results = [];
		
		for (var i = 0; i < arr.length; i++)
		{
			var one = arr[i];
			var oneRes = [];
			
			for (var j = 0; j < hKeys.length; j++)
			{
				var hKey = hKeys[j];
				
				for (var k = 0; k < vKeys.length; k++)
				{
					var vKey = vKeys[k];
					
					var coord = [one.pos[hKey], one.pos[vKey]]
					
					var obj = {};
					obj.h = hKey;
					obj.v = vKey;
					obj.el = one;
					
					if (compareCoord(points, coord, direction))
						oneRes.push(obj)
				}
			}
			
			if (oneRes.length > 1)
				results.push(oneRes)
		}
		
		return results;
	}
	
	/*function compareCoord(mainPoints, compPoint, direction)
	{
		var isVert = (direction == "left" || direction == "right")
		var indexOfSame = isVert ? 0 : 1;
		var indexOfBetween = isVert ? 1 : 0;
		
		var min = Math.min(mainPoints[0][indexOfBetween], mainPoints[1][indexOfBetween])
		var max = Math.max(mainPoints[0][indexOfBetween], mainPoints[1][indexOfBetween])

		var isSame = (mainPoints[0][indexOfSame] == compPoint[indexOfSame])
		var isBetween = (compPoint[indexOfBetween] >= min && compPoint[indexOfBetween] <= max)


		return isSame && isBetween
	}*/
	
	
	function getLowest(els, direction)
	{
		var $lowEl = null;
		var lowest = -1;
		
		var sizeKey = (direction == "left" || direction == "right") ? "width" : "height";

		for (var i = 0; i < els.length; i++)
		{
			var $el = els[i];
			var size = $el[0].getBoundingClientRect()[sizeKey]
			
			if (size < lowest || lowest == -1)
			{
				$lowEl = $el;
				lowest = size;
			}
		}
		
		return $lowEl
	}
	
	
	
	
	$(window).click(function(e)
	{
		var $grid = $(e.target).closest(".grid")
		
		if (!$grid.length && !$(e.target).hasClass("grid"))
		{
			$mainGrid.find(".tile").removeClass("active");
			$mainGrid.find(".tile-header-tab").removeClass("focus-border");
			$mainGrid.find(".tile-content").removeClass("focus-border");
		}
	})
	
	$("#main_grid").on("click", ".grid", function()
	{
		var $check = $(this).find(".tile-header-tab");
		$mainGrid.find(".tile").removeClass("active");
		$mainGrid.find(".tile-header-tab").removeClass("focus-border");
		$mainGrid.find(".tile-content").removeClass("focus-border");
		
		if ($check.length)
		{
			var $tab = $(this).find(".tile-header-tab.active");
			$tab.addClass("focus-border");
			var tabIndex = $tab.attr("data-tab");
			var $tabContent = $(this).find(".tile-content[data-tab='"+tabIndex+"']")
			$tabContent.addClass("focus-border");
		}
		else
		{
			$(this).find(".tile").addClass("active");
		}
	})
	
	
	
	
	var prevWindowHeight = 0;
	var prevWindowWidth = 0;
	
	
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
		
		//console.log([prevWindowHeight, windowHeight, heightDiff]);
		//console.log([prevWindowWidth, windowWidth, widthDiff]);
		
		var $grids = $mainGrid.find(".grid");
		
		$grids.each(function(i, e)
		{
			var $el = $(e)
			var change = changeHW("width", widthDiff, $el);
			change = changeHW("height", heightDiff, $el);
		})
				
		prevWindowHeight = windowHeight;
		prevWindowWidth = windowWidth;
	})
	
	function changeHW(sizeKey, diff, $el)
	{
		var change = null;
		
		if (diff != 0)
		{
			var prevWin = sizeKey == "width" ? prevWindowWidth : prevWindowHeight;
			var pos = getPositions($el, true);
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
	

	
	return IDEX;

}(IDEX || {}, jQuery));


