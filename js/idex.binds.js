

var IDEX = (function(IDEX, $, undefined) 
{	

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
	

	$(".grid-trig").each(function()
	{
		var gridType = $(this).attr("data-grid");
		$(this).tooltipster({
			content:gridType,
			arrow:false,
			offsetY:-15
		})
	})

	
	$("#main_grid").on("mouseover", ".chart-style", function()
	{
		$(this).find(".dropdown-wrap").addClass("active");
		$(this).find(".dropdown-title").addClass("active");
	})
	
	$("#main_grid").on("mouseleave", ".chart-style", function()
	{
		$(this).find(".dropdown-wrap").removeClass("active");
		$(this).find(".dropdown-title").removeClass("active");
	})
	
	
	$("#main_grid").on("mouseover", ".chart-time-button-outer", function()
	{
		var $wrap = $(this).closest(".chart-time-wrap");
		$wrap.find(".chart-time-dropdown-wrap").addClass("active");
		//$wrap.find(".chart-time-dropdown").addClass("active");
	})
	
	$("#main_grid").on("mouseleave", ".chart-time-button-outer", function()
	{
		var $wrap = $(this).closest(".chart-time-wrap");
		$wrap.find(".chart-time-dropdown-wrap").removeClass("active");
		//$wrap.find(".chart-time-dropdown").addClass("active");
	})
	
	$("#main_grid").on("click", ".chart-time-dropdown-wrap li", function()
	{
		var $wrap = $(this).closest(".chart-time-wrap");
		var isSwitch = $(this).hasClass("time-change");		
		var val = $(this).attr("data-val");	
	
		if (isSwitch)
		{
			$wrap.find("ul").removeClass("active");
			var $otherList = $wrap.find("ul[data-inttype='"+val+"']")
			var $otherCell = $otherList.find("li.active")
			val = $otherCell.attr("data-val");
			var title = $otherCell.text();
			$otherList.addClass("active");
		}
		else
		{
			var $list = $(this).closest("ul");
			var title = $(this).text();

			$list.find("li").removeClass("active");
			$(this).addClass("active");
		}
		
		$wrap.find(".chart-time-button-title span").text(title);

		console.log(val)
	})
	
	
	
	
	$(".popup-header-close").on("click", function()
	{
		var $popup = $(this).closest(".popup");
		$popup.removeClass("active");
	})
	
	
	
	
	
	$("#topLogoWrap").on("click", function()
	{
		window.location.reload()
	})

	
	
	
	
	
	return IDEX;
	
	
}(IDEX || {}, jQuery));




