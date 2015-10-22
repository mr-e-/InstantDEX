

var IDEX = (function(IDEX, $, undefined) 
{
	var $contentWrap = $("#content_wrap");
	
	
	
	$("#topLogoWrap").on("click", function()
	{
		window.location.reload()
	})
	
	
	$(".temp-exit").on("click", function()
	{
		IDEX.hideLoading();
	})
	
	
	$contentWrap.on("click", ".tab-nav-cell span", function()
	{
		var $fullWrap = $(this).closest(".tab-trig-wrap");
		var $tabNav = $(this).parent();
		var tab = $tabNav.attr("data-tab");
		var $tabWrap = $fullWrap.find(".tab-wrap[data-tab='"+tab+"']");

		$fullWrap.find(".tab-nav-cell").removeClass("active");
		$fullWrap.find(".tab-wrap").removeClass("active");
		
		$tabNav.addClass("active");
		$tabWrap.addClass("active");
	})
	
	
	
	
	IDEX.togglePopup = function($popup, show, withOverlay)
	{
		var $overlay = $(".popup-overlay");
		var func = show ? "addClass" : "removeClass";
		
		$popup[func]("active");
		
		if (withOverlay)
			$overlay[func]("active");
	}
	
	
	$(".fullPopup-trig").on("click", function()
	{
		var popupID = $(this).attr("data-popup");
		
		var $targetPopup = $("#"+popupID);
		
		//IDEX.togglePopup($targetPopup, true, true);
	})
	
	$(".popup-header-close").on("click", function()
	{
		var $overlay = $(".popup-overlay");
		var $popup = $(this).closest(".popup, .fullPopup");
		$popup.removeClass("active");
		$overlay.removeClass("active");
	})
	
	


	
	$(".popup-trig").on("mousedown", function(e)
	{
		$(this).addClass("mousedown");
	})
	
	$(".popup-trig").on("mouseover", function(e)
	{
		$(this).addClass("mouseover");
	})
	
	$(".popup-trig").on("mouseleave", function(e)
	{
		$(this).removeClass("mouseover");
	})
	
	$(document).on("mouseup", function(e)
	{
		$(".popup-trig").removeClass("mousedown");
	})
	


	
	
	return IDEX;
	
	
}(IDEX || {}, jQuery));




