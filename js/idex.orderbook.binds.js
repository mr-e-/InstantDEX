

var IDEX = (function(IDEX, $, undefined)
{
	
	var $contentWrap = $("#content_wrap");

	

	$contentWrap.on("click", ".order-row.own-order", function()
	{
		var order = IDEX.getRowData($(this), $(this).index());
		console.log(order);
	})
	
	
	
//	$("#buyBook, #sellBook").on("click", ".order-row:not(.own-order):not(.expiredRow)", function(e)
	$contentWrap.on("click", ".order-row:not(.expiredRow):not(.own-order)", function(e)
	{
		var $target = $(e.target)
		var has = $target.hasClass("vert-align")
		
		if (!has)
		{
			var bookID = $(this).closest(".bookname").attr("data-book").toLowerCase();
			var rowIndex = $(this).index(".bookname-"+bookID+" .order-row")
			var order = IDEX.getRowData($(this), rowIndex);
			
			var $orderbook = $(this).closest(".orderbook-wrap");
			var orderbook = IDEX.getObjectByElement($orderbook, IDEX.allOrderbooks, "orderbookDom");
			
			var $orderbox = $orderbook.find(".orderbox-all");
			var orderbox = IDEX.getObjectByElement($orderbox, IDEX.allOrderboxes, "orderboxDom");
			
			
			IDEX.user.pendingOrder = order;

			
			IDEX.buildMakeofferModal(order, orderbook);

			
			//var isAsk = order.askoffer ? "Bid" : "Ask";
			//$("#place"+isAsk+"Price").val(order.price);
			//$("#place"+isAsk+"Amount").val(order.volume).trigger("keyup");
		}
	})
	
	
	
	$contentWrap.on("mouseover", ".order-row", function(e)
	{
		var $inspect = $(this).find(".order-row-inspect-trig")
		$inspect.addClass("active");

		var $target = $(e.target)
		var has = $target.hasClass("vert-align")

		if (!has)
		{
			$inspect.removeClass("inspectOrderHover")
		}
		else
		{
			$inspect.addClass("inspectOrderHover");
		}
	})
	
	
	
	$contentWrap.on("mouseleave", ".bookname .order-row", function(e)
	{
		var $inspect = $(this).find(".order-row-inspect-trig")
		$inspect.removeClass("active");
		$inspect.removeClass("inspectOrderHover");
	})
	
	
	$contentWrap.on("click", ".bookname .order-row-inspect-trig", function(e)
	{
		e.preventDefault();
		var $orderRow = $(this).parent();
		var bookID = $(this).closest(".bookname").attr("data-book").toLowerCase();
		var rowIndex = $orderRow.index(".bookname-"+bookID+" .order-row")
		var order = IDEX.getRowData($orderRow, rowIndex);
		
		console.log(order)
	})
	
	
	
	
	
	
	var $popup = $("#orderbookSearch_popup");
	
	
	$contentWrap.on("click", ".orderbook-search-popup-trig", function()
	{
		var $orderbook = $(this).closest(".orderbook-wrap")
		var $banner = $popup.find(".banner");
		$banner.removeClass("active");

		var isActive = $popup.hasClass("active");
		
		if (!isActive)
		{
			$popup.addClass("active")
			$popup.data("orderbook", $orderbook);
			//clearAssetInput();
		}
		else
		{
			$popup.removeClass("active")
		}
	})
	
	
	$(".orderbookSearch-search-trig").on("click", function()
	{
		var $wrap = $(this).closest(".popup");
		var $orderbook = $wrap.data("orderbook")
		
		
		var $form = $(".orderbookSearch-popup-form");
		var $base = $form.find("input[name=baseid]");
		var $rel = $form.find("input[name=relid]");
		var baseid = $base.attr("data-asset");
		var relid = $rel.attr("data-asset");
		
		var $banner = $wrap.find(".banner");
		$banner.removeClass("error")
		$banner.removeClass("success")
		$banner.addClass("active");
		

		if (baseid != "-1" && relid != "-1")
		{
			var base = IDEX.nxtae.assets.getAsset("assetID", baseid);	
			var rel = IDEX.nxtae.assets.getAsset("assetID", relid);

			var orderbook = IDEX.getObjectByElement($orderbook, IDEX.allOrderbooks, "orderbookDom");
			orderbook.changeMarket(base, rel);

			clearAssetInput($wrap);
			$popup.find(".popup-header-close").trigger("click");
		}
		else
		{
			$banner.addClass("error")
			$banner.find("span").text("Error: You must choose two valid assets")
		}
	})
	

	function clearAssetInput($wrap)
	{		
		$wrap.find("input").each(function()
		{
			$(this).val("")
			$(this).attr("data-asset", "-1")
		})
	}
	

	
	
	
	return IDEX;
	
	
}(IDEX || {}, jQuery));