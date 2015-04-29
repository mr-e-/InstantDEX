

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
		
	
	
	$(".idex-submit").on("click", function()
	{
		var $form = $("#" + $(this).attr("data-form"));
		var method = $(this).attr("data-method");
		var params = IDEX.extractPostPayload($(this));
		params = IDEX.buildPostPayload(method, params);

		if (method == "orderbook")
		{
			IDEX.loadOrderbook(params.baseid, params.relid);
		}
		else if (method == "placebid" || method == "placeask")
		{
			params['baseid'] = IDEX.user.curBase.assetID;
			params['relid'] = IDEX.user.curRel.assetID;
			params['duration'] = IDEX.user.options['duration'];
			params['minperc'] = Number(IDEX.user.options['minperc']);
			IDEX.placeOrder(params);
		}
		else
		{
			IDEX.sendPost(params);
		}

		if ($form)
			$form.trigger("reset");
		
		$(".md-overlay").trigger("click");
	})
	
	
	$("#expand_orderbook_button").on("click", function()
	{
		var display = IDEX.isOrderbookExpanded ? "inline-block" : "none";
		var width = IDEX.isOrderbookExpanded ? "250px" : "100%";
		var classFunc = IDEX.isOrderbookExpanded ? "addClass" : "removeClass";
		
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
	

	//$(".info-tabs li").on("click", IDEX.currentOpenOrders)		
	$(".conf-confirm").on("click", function()
	{
		IDEX.makeOffer() 
	})
		
		
	return IDEX;
	
	
}(IDEX || {}, jQuery));




