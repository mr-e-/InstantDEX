

var IDEX = (function(IDEX, $, undefined) 
{


	$(".cm-orderbox-config-popup-close").on("mouseup", function()
	{
		var $popup = $(this).closest(".cm-orderbox-config-popup")
		
		$popup.removeClass("active");
		
	})
	
	$(".cm-orderbox-config-trig").on("mouseup", function()
	{
		var $wrap = $(this).closest(".cm-orderbox-body");
		var $popup = $wrap.find(".cm-orderbox-config-popup");
		var isActive = $popup.hasClass("active");

		if (isActive)
			$popup.removeClass("active");
		else
			$popup.addClass("active");
		
		var $exchangePopup = $wrap.find(".cm-orderbox-exchange-popup");
		$exchangePopup.removeClass("active");
	})
	
	$(".cm-orderbox-config-popup-confirm-trig").on("click", function()
	{
		var $popup = $(this).closest(".cm-orderbox-config-popup")

		$popup.removeClass("active");
	})
	
	
	
	$(".cm-orderbox-exchange-trig").on("mouseup", function()
	{
		var $wrap = $(this).closest(".cm-orderbox-body");
		var $popup = $wrap.find(".cm-orderbox-exchange-popup");
		var isActive = $popup.hasClass("active");

		if (isActive)
			$popup.removeClass("active");
		else
			$popup.addClass("active");
		
	})
	
	$(".cm-orderbox-exchange-popup-row").on("click", function()
	{
		var $wrap = $(this).closest(".cm-orderbox-body");
		var $popup = $(this).closest(".cm-orderbox-exchange-popup")
		var text = $(this).find("span").text();
		var $exTrig = $wrap.find(".cm-orderbox-exchange-trig");
		var $config = $wrap.find(".cm-orderbox-exchange-config");
		
		if (text == "InstantDEX")
			$config.show()
		else
			$config.hide();
		
		$exTrig.text(text);
		$popup.removeClass("active");
		
	})
	
	

	$(".place-order-button").on("mousedown", function()
	{
		$(this).addClass("order-button-mousedown")
	})
	$(".place-order-button").on("mouseup", function()
	{
		$(this).removeClass("order-button-mousedown")
	})
	$(".place-order-button").on("mouseleave", function()
	{
		$(this).removeClass("order-button-mousedown")
	})
	

	$(".place-order-button").on("click", function()
	{
		var $wrap = $(this).closest(".cm-orderbox-body");
		var $form = $("#" + $(this).attr("data-form"));
		var params = getPostPayload($(this));
		var exchange = $wrap.find(".cm-orderbox-exchange-trig").text();
		
		params['exchange'] = exchange;
		params['baseid'] = IDEX.user.curBase.assetID;
		params['relid'] = IDEX.user.curRel.assetID;
		
		if (exchange == "InstantDEX")
		{
			var duration = $wrap.find(".cm-orderbox-config-popup-duration").val()
			var minperc = $wrap.find(".cm-orderbox-config-popup-minperc").val()
			params['duration'] = duration;
			params['minperc'] = minperc
		}
		
		params['timeout'] = 10000
		
		IDEX.placeOrder(params);
		
		$form.trigger("reset");
	})
	
	
	function getPostPayload($element, method)
	{
		method = typeof method === "undefined" ? $element.attr("data-method") : method;
		var $form = $("#" + $element.attr("data-form"));
		var params = IDEX.getFormData($form);
		params = IDEX.buildPostPayload(method, params);
		
		return params;
	}	
	
	
	IDEX.placeOrder = function(params)
	{
		var balanceToCheck = (params['requestType'] == "placebid") ? params['relid'] : params['baseid'];
		
		console.log(params);
		params['plugin'] = "InstantDEX"
		//if (IDEX.account.checkBalance(balanceToCheck, params['volume']))
		//{
			IDEX.sendPost(params).done(function(data)
			{
				IDEX.updateUserState();
				
				console.log(data);

				var log = {}
				log['type'] = "order"
				if ('error' in data && data['error'])
				{
					log['msg'] = data['error']
					$.growl.error({'message':data['error'], 'location':"tl"});				
				}
				else
				{
					log['msg'] = "order placed"
					$.growl.notice({'message':"Order placed", 'location':"tl"});
				}
			}).fail(function(data)
			{
				console.log(data);
				$.growl.error({'message':"Error calling SuperNET", 'location':"tl"});
			})
		//}
		//else
		//{
		//	$.growl.error({'message':"Not enough funds", 'location':"tl"});
		//}

	}
	
	
	IDEX.clearOrderBox = function()
	{
		IDEX.resetOrderBoxForm();
		IDEX.clearOrderBoxBalance();
		
		$(".refcur-base").text("Base");
		$(".refcur-rel").text("Quote");
	}
	
	
	IDEX.updateOrderBox = function()
	{
		IDEX.resetOrderBoxForm();
		IDEX.updateOrderBoxBalance();
		
		$(".refcur-base").text(IDEX.user.curBase.name);
		$(".refcur-rel").text(IDEX.user.curRel.name);
	}
	

	IDEX.resetOrderBoxForm = function()
	{
		$("#placeBidForm").trigger("reset");
		$("#placeAskForm").trigger("reset");
	}
	
	
	IDEX.updateOrderBoxBalance = function()
	{
		var $buy = $("#balance_buy");
		var $sell = $("#balance_sell");
		var baseBal = ["0", ".0"];
		var relBal = ["0", ".0"];

		$buy.find(".bal-cur").first().text(IDEX.user.curRel.name + ": ");
		$sell.find(".bal-cur").first().text(IDEX.user.curBase.name + ": ");
		
		IDEX.account.updateBalances().done(function()
		{
			baseBal = parseBalance(IDEX.account.getBalance(IDEX.user.curBase.assetID));
			relBal = parseBalance(IDEX.account.getBalance(IDEX.user.curRel.assetID));

			$buy.find(".bal-val").first().text(relBal[0] + relBal[1])
			$sell.find(".bal-val").first().text(baseBal[0] + baseBal[1]);
		})
	}
	
	IDEX.clearOrderBoxBalance = function()
	{
		var $buy = $("#balance_buy");
		var $sell = $("#balance_sell");
		var baseBal = ["0", ".0"];
		var relBal = ["0", ".0"];

		$buy.find(".bal-cur").first().text("Base: ");
		$sell.find(".bal-cur").first().text("Quote: ");

		$buy.find(".bal-val").first().text(relBal[0] + relBal[1])
		$sell.find(".bal-val").first().text(baseBal[0] + baseBal[1]);
	}

	
	function parseBalance(balance)
	{
		var whole = "0";
		var dec = ".0";
		
		if (!($.isEmptyObject(balance)))
		{
			var amount = String(balance.unconfirmedBalance);
			var both = amount.split(".");
			
			whole = both[0];
			if (both.length > 1)
				dec	= "." + both[1];
		}	
		
		return [whole, dec];
	}
	

	$("input[name='price'], input[name='volume']").on("keyup", function() 
	{
		var $form = $(this).closest("form");
		var price = $form.find("input[name='price']").val();
		var amount = $form.find("input[name='volume']").val();
		var total = Number(price)*Number(amount);
		
		$form.find("input[name='total']").val(String(total));
	});


	return IDEX;
	
}(IDEX || {}, jQuery));

