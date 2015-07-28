

var IDEX = (function(IDEX, $, undefined) 
{

	var $mainGrid = $("#main_grid");
	var $tileAdd = $("#tile_add");
	var $contentWrap = $("#content_wrap");

	
	$("#main_grid").on("mouseover", ".grid-arrow", function(e)
	{
		$tileAdd.removeClass("active");
		
		var arrowDirections = IDEX.getArrowDirections($(this))

		var $gridArrowWrap = $(this).closest(".grid-arrow-wrap");
		$gridArrowWrap.addClass(arrowDirections.direction)
		
		var $previewTile = $($("#preview_tile_template").html());
		var $grid = $(this).closest(".grid");
		
		
		var gridPos = IDEX.getPositions($grid, true);
		
		var absKey = arrowDirections.isHoriz ? "left" : "top";
		var sizeKey = arrowDirections.isHoriz ? "width" : "height";
		var newSize = arrowDirections.isHoriz ? gridPos.width/2 : gridPos.height/2;
		newSize = arrowDirections.isMiddle ? gridPos.height : newSize;

		var size = gridPos[sizeKey] - newSize
		size = arrowDirections.isMiddle ? gridPos[sizeKey] : size;

		if (arrowDirections.isHoriz)
			var abs = arrowDirections.isLeft ? gridPos.left + newSize : gridPos.left;
		else if (arrowDirections.isVert)
			var abs = arrowDirections.isTop ? gridPos.top + newSize : gridPos.top;
		else
			var abs = gridPos.top
		
		$grid.css(sizeKey, size)
		$grid.css(absKey, abs)
		
		
		
		$previewTile.css("left", gridPos.left);
		$previewTile.css("top", gridPos.top);
		$previewTile.css("height", gridPos.height);
		$previewTile.css("width", gridPos.width);
		
		if (arrowDirections.isHoriz)
			var abs = arrowDirections.isLeft ? gridPos.left : gridPos.left + newSize;
		else if (arrowDirections.isVert)
			var abs = arrowDirections.isTop ? gridPos.top : gridPos.top + newSize;
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
		
		var arrowDirections = IDEX.getArrowDirections($(this))

		var $gridArrowWrap = $(this).closest(".grid-arrow-wrap");
		$gridArrowWrap.removeClass(arrowDirections.direction)
		
		
		var $grid = $(this).closest(".grid");
		var gridPos = IDEX.getPositions($grid, true);
		
		var absKey = arrowDirections.isHoriz ? "left" : "top";
		var sizeKey = arrowDirections.isHoriz ? "width" : "height";
		var newSize = arrowDirections.isHoriz ? gridPos.width*2 : gridPos.height*2;


		var size = newSize
		size = arrowDirections.isMiddle ? gridPos[sizeKey] : size;

		if (arrowDirections.isHoriz)
			var abs = arrowDirections.isLeft ? gridPos.left - gridPos.width : gridPos.left;
		else if (arrowDirections.isVert)
			var abs = arrowDirections.isTop ? gridPos.top - gridPos.height : gridPos.top;
		else
			var abs = gridPos.top;
		
		$grid.css(sizeKey, size)
		$grid.css(absKey, abs)
		
		
		$mainGrid.find(".preview-tile").remove();
	})

	
	$("#main_grid").on("mouseup", ".grid-arrow", function(e)
	{
		$tileAdd.removeClass("active");
		
		IDEX.triggeredGrid.find(".tile-header-close").trigger("click")
		var $newGrid = IDEX.triggeredGrid
		IDEX.triggeredGrid = null;
		
		var arrowDirections = IDEX.getArrowDirections($(this))

		var $gridArrowWrap = $(this).closest(".grid-arrow-wrap");
		$gridArrowWrap.removeClass(arrowDirections.direction)
		
		
		var $grid = $(this).closest(".grid");
		var gridPos = IDEX.getPositions($grid, true);
		

		var $previewTile = $mainGrid.find(".preview-tile");
		var prevPos = IDEX.getPositions($previewTile, true);
		$newGrid.css("height", prevPos.height);
		$newGrid.css("width", prevPos.width);
		$newGrid.css("top", prevPos.top);
		$newGrid.css("left", prevPos.left);
		$newGrid.attr("data-arrow", arrowDirections.direction);
		
		
		if (arrowDirections.isMiddle)
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
			
			IDEX.makeGridType($newGrid);
			$tileHeaderTab.trigger("click");
		}
		else
		{
			$mainGrid.append($newGrid)			
			IDEX.makeGridType($newGrid);
		}
		
		$mainGrid.find(".preview-tile").remove();
	})
	
	


	
	return IDEX;
		

}(IDEX || {}, jQuery));
