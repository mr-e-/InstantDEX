

var IDEX = (function(IDEX, $, undefined) 
{	
	
	/*******************TABS*******************/
	
    $(".tabs-nav .nav").click(function() 
	{
        var el = $(this);
        var parent = el.closest(".md-content");
		
        parent.find(".tabs-nav .nav").removeClass("active");
        parent.find(".tabs-container > div").removeClass("active");
        el.addClass("active");
        $("#"+el.attr("tab-index")).addClass("active");
    });
	
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
	
	$(".idex-tabs li:not(.active)").on("mousedown", function()
	{
		$(this).addClass("idex-mousedown");
	})
	$(".idex-tabs li:not(.active)").on("mouseleave", function()
	{
		$(this).removeClass("idex-mousedown");
	})
	

	/*******************MODALS*******************/
	
	$(".md-modal").on("idexHide", function()
	{
		$(this).find(".tabs-container div").removeClass("active").first().addClass("active");
		$(this).find(".tabs-nav .nav").removeClass("active").first().addClass("active");
	})


	/*******************ORDER BUTTON*******************/

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
	
	
	/*******************SEARCH ORDERBOOK BUTTON*******************/
	
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
	
	
	/*******************EXPAND ORDERBOOK BUTTON*******************/
	
	$("#expand_orderbook_button").on("click", function()
	{
		var display = IDEX.isOrderbookExpanded ? "inline-block" : "none";
		var width = IDEX.isOrderbookExpanded ? "250px" : "100%";
		var classFunc = IDEX.isOrderbookExpanded ? "removeClass" : "addClass";
		
		$("#orderBook").css("width", width)
		$("#fav-market-chart-area").css("display", display)
		
		$(".labels-col")[classFunc]("labels-col-expand")
		$(".labels-col-extra")[classFunc]("extra-show");
		
		$(".order-row")[classFunc]("order-row-expand")
		$(".order-col-extra")[classFunc]("extra-show");
		
		IDEX.isOrderbookExpanded = !IDEX.isOrderbookExpanded
	})

	
	function getPostPayload($element, method)
	{
		method = typeof method === "undefined" ? $element.attr("data-method") : method;
		var params = IDEX.extractPostPayload($element);
		params = IDEX.buildPostPayload(method, params);
		
		return params;
	}	
	
	
	/*******************CHART CONTROL*******************/
    
    function chartControl(obj) 
	{
        var chartId = obj.attr("chart-id");
		
        $("#chart-curr-"+chartId).html(obj.val());
    }
    
    $(".chart-control").on('input',function() { chartControl($(this)); });
    
	
    $(".chart-panel-pair").mouseover(function()
	{
        var num = $(this).attr('chart-number');
		
        $(".chart-panel-number[chart-number='"+num+"']").css("color","#FF9B00");
        $(".chart-number[chart-number='"+num+"']").css("color","#FF9B00");
    });
    
    $(".chart-panel-pair").mouseout(function()
	{
        var num = $(this).attr('chart-number');
		
        $(".chart-panel-number[chart-number='"+num+"']").css("color","white");
        $(".chart-number[chart-number='"+num+"']").css("color","white");
    });
	

    /** Number Format (comma separated) */
    $(".bal-num").each(function()
	{
        var val = $(this).html();
		
        //$(this).html(z.numberFormat(val));
    });
	
	/*
		//$.growl.error({'message':"Order placed", 'location':"bl"});
		//$.growl.warning({'message':"Order placed", 'location':"bl"});
		//$.growl.notice({'message':"Order placed", 'location':"bl"});
	*/
		
	$(document).ready(function()
	{
		$('.tooltip').tooltipster({
			delay: 1200,
			position: 'bottom'
		});
	});
	
	return IDEX;
	
	
}(IDEX || {}, jQuery));




