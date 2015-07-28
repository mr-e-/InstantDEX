

var IDEX = (function(IDEX, $, undefined) 
{
	
	var $mainGrid = $("#main_grid");
	var $tileAdd = $("#tile_add");
	var $contentWrap = $("#content_wrap");
	

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
	
	
	
	

	
	
	
	return IDEX;
	
	
}(IDEX || {}, jQuery));


