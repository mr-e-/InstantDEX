
var IDEX = (function(IDEX, $, undefined) 
{
	
	
	var $mainGrid = $("#main_grid");
	var $tileAdd = $("#tile_add");
	var $contentWrap = $("#content_wrap");
	
	
	$("#main_grid").on("mouseover", ".main-grid-arrow, .main-grid-arrow-middle", function(e)
	{
		$tileAdd.removeClass("active");
		var $previewTile = $($("#preview_tile_template").html());

		var arrowDirections = IDEX.getArrowDirections($(this))

		
		if (arrowDirections.isMiddle)
		{
			$previewTile.css("height", "100%");
			$previewTile.css("width", "100%");
			$previewTile.css("top", 0);
			$previewTile.css("left", 0);
			$mainGrid.append($previewTile)
			return
		}
		
		else
		{
			var els = findMain(arrowDirections.direction, false)
			
			if (els.length)
			{
				var $grid = getLowest(els, arrowDirections.direction);
				var gridPos = IDEX.getPositions($grid, true);
				
				var absKey = arrowDirections.isHoriz ? "left" : "top";
				var sizeKey = arrowDirections.isHoriz ? "width" : "height";
				var newSize = arrowDirections.isHoriz ? gridPos.width/2 : gridPos.height/2;
				
				
				for (var i = 0; i < els.length; i++)
				{
					var $el = els[i];
					var pos = IDEX.getPositions($el, true);
					
					var size = pos[sizeKey]
					
					if (arrowDirections.isHoriz)
						var abs = arrowDirections.isLeft ? pos.left + newSize : pos.left;
					else
						var abs = arrowDirections.isTop ? pos.top + newSize : pos.top;
					
					$el.css(sizeKey, size - newSize)
					$el.css(absKey, abs)
				}
				
				
				$previewTile.css("height", "100%");
				$previewTile.css("width", "100%");
				$previewTile.css("top", 0);
				$previewTile.css("left", 0);
				
				mainPos = IDEX.getPositions($mainGrid);
				
				var prevAbs = 0;
				
				if (arrowDirections.isBottom)
					prevAbs = mainPos.height - newSize
				else if (arrowDirections.isRight)
					prevAbs = mainPos.width - newSize
				
				$previewTile.css(sizeKey, newSize);
				$previewTile.css(absKey, prevAbs);

				$mainGrid.append($previewTile)
			}
		}
	})
	
	

	
	$("#main_grid").on("mouseout", ".main-grid-arrow, .main-grid-arrow-middle", function(e)
	{
		if (!IDEX.isGridTrig)
			return;
		
		$tileAdd.addClass("active");
		
		var arrowDirections = IDEX.getArrowDirections($(this))


		if (arrowDirections.isMiddle)
		{
			$mainGrid.find(".preview-tile").remove();
		}
		else
		{
			var els = findMain(arrowDirections.direction, true)

			if (els.length)
			{					
				var $grid = getLowest(els, arrowDirections.direction);
				var gridPos = IDEX.getPositions($grid, true);
				
				var absKey = arrowDirections.isHoriz ? "left" : "top";
				var sizeKey = arrowDirections.isHoriz ? "width" : "height";
				var newSize = arrowDirections.isHoriz ? gridPos.width : gridPos.height;
				
				
				for (var i = 0; i < els.length; i++)
				{
					var $el = els[i];
					var pos = IDEX.getPositions($el, true);
					
					var size = pos[sizeKey]
					
					if (arrowDirections.isHoriz)
						var abs = arrowDirections.isLeft ? pos.left - newSize : pos.left;
					else
						var abs = arrowDirections.isTop ? pos.top - newSize : pos.top;
					
					$el.css(sizeKey, size + newSize)
					$el.css(absKey, abs)
				}
				
				$mainGrid.find(".preview-tile").remove();
			}
		}
	})


	
	
	
	$("#main_grid").on("mouseup", ".main-grid-arrow, .main-grid-arrow-middle", function(e)
	{
		$tileAdd.removeClass("active");

		var $previewTile = $mainGrid.find(".preview-tile");
		var arrowDirections = IDEX.getArrowDirections($(this))

		IDEX.triggeredGrid.find(".tile-header-close").trigger("click")
		var $newGrid = IDEX.triggeredGrid
		IDEX.triggeredGrid = null;

		
		var prevPos = IDEX.getPositions($previewTile, true);
		$newGrid.css("height", prevPos.height);
		$newGrid.css("width", prevPos.width);
		$newGrid.css("top", prevPos.top);
		$newGrid.css("left", prevPos.left);
		$newGrid.attr("data-arrow", arrowDirections.direction);

		$mainGrid.find(".preview-tile").remove();
		
		$mainGrid.append($newGrid)
		IDEX.makeGridType($newGrid);		
	})
	
	
	
	
	
	
	function findMain(direction, withPreview)
	{
		var mainPositions = IDEX.getPositions($mainGrid)
		var pos = mainPositions[direction]
		var els = []

		$mainGrid.find(".grid").each(function()
		{
			var thisPositions = IDEX.getPositions($(this))

			if (withPreview)
			{
				var $prev = $mainGrid.find(".preview-tile");
				var prevPositions = IDEX.getPositions($prev);
				
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

	
	
	
	
	return IDEX;
		

}(IDEX || {}, jQuery));
