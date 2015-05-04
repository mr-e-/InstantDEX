

var IDEX = (function(IDEX, $, undefined) 
{	
	
	$(".idex-tabs li").on("mouseup", function()
	{
		if (!($(this).hasClass("active")))
		{
			$(this).parent().find("li").removeClass("active");
			$(this).removeClass("idex-mousedown");
			$(this).addClass("active");

			var tab = $(this).attr('data-tab');
			var $parent = $(this).closest(".idex-tabs-wrapper").next();
			$parent.find(".tab-content-wrap").hide();
			$parent.find(".tab-content-wrap[data-tab='"+tab+"']").show();
		}
	})


	$(".md-modal").on("idexHide", function()
	{
		$(this).find(".tabs-container div").removeClass("active").first().addClass("active");
		$(this).find(".tabs-nav .nav").removeClass("active").first().addClass("active");
	})


	$(".idex-tabs li:not(.active)").on("mousedown", function()
	{
		$(this).addClass("idex-mousedown");
	})
	$(".idex-tabs li:not(.active)").on("mouseleave", function()
	{
		$(this).removeClass("idex-mousedown");
	})


	$(".tab-order-button button").on("mousedown", function()
	{
		$(this).addClass("order-button-mousedown")
	})
	$(".tab-order-button button").on("mouseup", function()
	{
		$(this).removeClass("order-button-mousedown")
	})
	$(".tab-order-button button").on("mouseleave", function()
	{
		$(this).removeClass("order-button-mousedown")
	})

	
	$("#open_orderbook_button").on("click", function()
	{
		var $form = $("#" + $(this).attr("data-form"));
		var params = getPostPayload($(this), "orderbook");

		if (IDEX.changeMarket(params.baseid, params.relid))
		{
			$form.trigger("reset");
			$(".md-overlay").trigger("click");
		}
		else
		{

		}
		
	})
	
	$(".place-order-button").on("click", function()
	{
		var $form = $("#" + $(this).attr("data-form"));
		var params = getPostPayload($(this));
		
		params['baseid'] = IDEX.user.curBase.assetID;
		params['relid'] = IDEX.user.curRel.assetID;
		params['duration'] = IDEX.user.options['duration'];
		params['minperc'] = Number(IDEX.user.options['minperc']);
		
		IDEX.placeOrder(params);
		
		$form.trigger("reset");
	})
	
	
	function getPostPayload($element, method)
	{
		method = typeof method === "undefined" ? $element.attr("data-method") : method;
		var params = IDEX.extractPostPayload($element);
		params = IDEX.buildPostPayload(method, params);
		
		return params;
	}	

	
	$("#expand_orderbook_button").on("click", function()
	{
		var display = IDEX.isOrderbookExpanded ? "inline-block" : "none";
		var width = IDEX.isOrderbookExpanded ? "250px" : "100%";
		var classFunc = IDEX.isOrderbookExpanded ? "removeClass" : "addClass";
		
		$("#orderBook").css("width", width)
		$("#miniChartsC").css("display", display)
		
		$(".labels-col")[classFunc]("labels-col-expand")
		$(".labels-col-extra")[classFunc]("extra-show");
		
		$(".order-row")[classFunc]("order-row-expand")
		$(".order-col-extra")[classFunc]("extra-show");
		
		IDEX.isOrderbookExpanded = !IDEX.isOrderbookExpanded
	})

	
	/*
		//$.growl.error({'message':"Order placed", 'location':"bl"});
		//$.growl.warning({'message':"Order placed", 'location':"bl"});
		//$.growl.notice({'message':"Order placed", 'location':"bl"});
	*/
	
	

		
		
	return IDEX;
	
	
}(IDEX || {}, jQuery));




