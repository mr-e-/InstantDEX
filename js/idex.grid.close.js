

var IDEX = (function(IDEX, $, undefined) 
{
	
	var $mainGrid = $("#main_grid");
	var $tileAdd = $("#tile_add");
	var $contentWrap = $("#content_wrap");
	
	
	
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
		
		var gridPos = IDEX.getPositions($grid, true);
		var arr = [];
		
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

		
		var allPoints = {};
		allPoints.left = [[gridPos.left, gridPos.bottom], [gridPos.left, gridPos.top]]
		allPoints.top = [[gridPos.left, gridPos.top], [gridPos.right, gridPos.top]]
		allPoints.right = [[gridPos.right, gridPos.top], [gridPos.right, gridPos.bottom]]
		allPoints.bottom = [[gridPos.right, gridPos.bottom], [gridPos.left, gridPos.bottom]]
		
		for (key in allPoints)
		{
			var points = allPoints[key];
			var results = IDEX.searchForAdjacentGrids(arr, points, key)
			
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

		IDEX.closeGridType($grid);
		$grid.remove();
	})
	
	
	function closeTab($tabHeader)
	{
		var $wrap = $tabHeader.closest(".grid");
		var len = $wrap.find(".tile-content").length;

		var tab = $tabHeader.attr("data-tab");
		var $tabContent = $wrap.find(".tile-content[data-tab='"+tab+"']")
				
		var $nextTabHeader = $tabHeader.next();
		if (!$nextTabHeader.length)
			$nextTabHeader = $tabHeader.prev();
		
		IDEX.closeGridType($tabContent);
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
	
	
	
	
	return IDEX;
		

}(IDEX || {}, jQuery));


	