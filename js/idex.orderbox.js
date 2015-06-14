

var IDEX = (function(IDEX, $, undefined) 
{
	
//	IDEX.currentOpenOrders();
//	IDEX.refreshOrderbook();

	

	/*******************ORDER BUTTON*******************/

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
		var $form = $("#" + $(this).attr("data-form"));
		var params = getPostPayload($(this));
		//var both = ["6932037131189568014", "5527630"]

		params['baseid'] = IDEX.user.curBase.assetID;
		params['relid'] = IDEX.user.curRel.assetID;
		params['duration'] = IDEX.user.options['duration'];
		params['duration'] = "60"
		params['minperc'] = Number(IDEX.user.options['minperc']);
		//params['exchange'] = "nxtae"
		
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
				/*IDEX.makeTable("marketOpenOrdersTable", function()
				{
					
				});*/
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
			})
		//}
		//else
		//{
		//	$.growl.error({'message':"Not enough funds", 'location':"tl"});
		//}

	}
	
	
	IDEX.updateOrderBox = function()
	{
		IDEX.resetOrderBoxForm();
		//IDEX.updateOrderBoxBalance();
		
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

			$buy.find(".bal-val").first().text(relBal[0]).next().text(relBal[1]);
			$sell.find(".bal-val").first().text(baseBal[0]).next().text(baseBal[1]);
		})
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

