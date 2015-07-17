

var IDEX = (function(IDEX, $, undefined) 
{
	
	
	$(".popup-header-close").on("click", function()
	{
		var $popup = $(this).closest(".popup");
		$popup.removeClass("active");
	})
	
	
	$("#topLogoWrap").on("click", function()
	{
		window.location.reload()
	})

	
	$(".popup-trig").on("click", function(e)
	{

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
	})
	
	$("#main_grid").on("mouseleave", ".chart-time-button-outer", function()
	{
		var $wrap = $(this).closest(".chart-time-wrap");
		$wrap.find(".chart-time-dropdown-wrap").removeClass("active");
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

	})
	

	
	
	return IDEX;
	
	
}(IDEX || {}, jQuery));




