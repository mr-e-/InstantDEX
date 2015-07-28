
var IDEX = (function(IDEX, $, undefined) 
{

	var $mainGrid = $("#main_grid");
	var $tileAdd = $("#tile_add");
	var $contentWrap = $("#content_wrap");

	IDEX.isGridTrig = false;
	IDEX.triggeredGrid = null;
	IDEX.isTriggeredNew = false;

	
	


	$(document).on("mousemove", function(e)
	{
		if (!IDEX.isGridTrig)
			return;
		
		IDEX.updateTileAddPos(e)
	})

	
	
	IDEX.updateTileAddPos = function(event)
	{
		var $wrap = $("#content_wrap");
		var mouseX = event.clientX;
		var mouseY = event.clientY;
		
		$tileAdd.css("left", mouseX);
		$tileAdd.css("top", mouseY);
	}
	
	
	
	
	
	IDEX.searchForAdjacentGrids = function(arr, points, direction)
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
	
	
	
	
	return IDEX;

}(IDEX || {}, jQuery));


