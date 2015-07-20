


var IDEX = (function(IDEX, $, undefined) 
{

	var $mainGrid = $("#main_grid");
	var $tileAdd = $("#tile_add");
	var $contentWrap = $("#content_wrap");


	$("#main_grid").on("mousedown", ".tile-header", function(e)
	{
		if ($(e.target).hasClass("tile-header-close"))
			return;
		
		var $el = $(this).closest(".grid")
		var mouseY = e.clientY
		var mouseX = e.clientX
		var pos = IDEX.getPositions($el);
		
		var isInsideBorder = IDEX.checkIfMouseIsInsideBorder(mouseY, mouseX, pos)
		
		if (!isInsideBorder.top)
		{
			IDEX.isGridTrig = true;
			
			$tileAdd.addClass("active");
			$(".main-grid-arrow").addClass("active");

			IDEX.updateTileAddPos(e)
			IDEX.triggeredGrid = $(this).closest(".grid");
			IDEX.isTriggeredNew = false;
		}
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
		$tile.find(".tile-header-title").text(IDEX.capitalizeFirstLetter(gridType))
		$tile.find(".tile-content").append($template);
		$grid.append($tile);
		$grid.attr("data-grid", gridType);
		IDEX.triggeredGrid = $grid;
		IDEX.isTriggeredNew = true;
		$(this).addClass("mousedown");
	})
	
	
	$(".grid-trig").on("mouseleave", function(e)
	{
		if (!IDEX.isGridTrig)
			return;
		
		var has = $tileAdd.hasClass("active")
		if (!has)
		{
			IDEX.updateTileAddPos(e)	
			$tileAdd.addClass("active");
			$(".main-grid-arrow").addClass("active");
			
			var hasGrids = $mainGrid.find(".grid").length;
			if (!hasGrids)
				$(".main-grid-arrow-middle").addClass("active");
		}
		
		IDEX.updateTileAddPos(e)
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
			$(".grid-trig").removeClass("mousedown");
		}
		
		IDEX.isResizing = false;
		IDEX.resizeGrid = null;
		IDEX.resizeDir = "";
	})

	
	
	
	
	$("#main_grid").on("mouseover", ".grid", function(e)
	{
		if (IDEX.isGridTrig && (IDEX.triggeredGrid == null || !$(this).is(IDEX.triggeredGrid)))
			$(this).find(".grid-arrow-wrap").addClass("active");
	})
	
	$("#main_grid").on("mouseleave", ".grid", function(e)
	{
		if (IDEX.isGridTrig)
			$(this).find(".grid-arrow-wrap").removeClass("active");
	})
	
	
		
	
	return IDEX;
		

}(IDEX || {}, jQuery));
