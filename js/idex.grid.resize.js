

var IDEX = (function(IDEX, $, undefined) 
{

	var $mainGrid = $("#main_grid");
	var $tileAdd = $("#tile_add");
	var $contentWrap = $("#content_wrap");
	
	IDEX.isResizing = false;
	IDEX.resizeGrid = null;
	IDEX.resizeDir = "";
	
	var prevWindowHeight = 0;
	var prevWindowWidth = 0;
		
		
		
		
	
	function removeResizeClass()
	{
		$contentWrap.removeClass("tileResizeW tileResizeN tileResizeE tileResizeS")
	}
	
	
	$("#main_grid").on("mousemove", ".grid", function(e)
	{
		var $el = $(this)
		var mouseY = e.clientY
		var mouseX = e.clientX
		
		var pos = IDEX.getPositions($el);
		
		var isInsideBorder = IDEX.checkIfMouseIsInsideBorder(mouseY, mouseX, pos)
		
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
					removeResizeClass()
					$contentWrap.addClass(resizeClassName)
					break;
				}
			}
		}
		else
		{
			if (!IDEX.isResizing)
				removeResizeClass()
		}
		
			
		if (IDEX.isResizing)
		{
			var resizePos = IDEX.getPositions(IDEX.resizeGrid);
			var offsetX = $mainGrid.offset().left;
			var offsetY = $mainGrid.offset().top;
			var insideX = mouseX - offsetX
			var insideY = mouseY - offsetY
			
			resize(insideX, insideY)
		}
	})
	
	
	$("#main_grid").on("mouseleave", ".grid", function(e)
	{
		if (!IDEX.isResizing)
			removeResizeClass();
	})
	
	
	$("#main_grid").on("mousedown", ".grid", function(e)
	{	
		var $el = $(this)
		var mouseY = e.clientY
		var mouseX = e.clientX
		
		var pos = IDEX.getPositions($el);
		
		var isInsideBorder = IDEX.checkIfMouseIsInsideBorder(mouseY, mouseX, pos)

				
		if (isInsideBorder.isInside)
		{
			$mainGrid.find(".tile").removeClass("active");
			$el.find(".tile").addClass("active");
			
			IDEX.resizeDir = isInsideBorder.direction;
			IDEX.isResizing = true;
			IDEX.resizeGrid = $el;
		}
	})
	
	
	
	
	
	
	
	function resize(mouseX, mouseY)
	{
		var $grid = IDEX.resizeGrid
		var gridPos = IDEX.getPositions($grid, true);
		var arr = [];
		var resizeDir = IDEX.resizeDir
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
				obj.pos = IDEX.getPositions($el, true);
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
			var results = IDEX.searchForAdjacentGrids(arr, point, resizeDir);
			
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
			var pos = IDEX.getPositions($el, true);
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
