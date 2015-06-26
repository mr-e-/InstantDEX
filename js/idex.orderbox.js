

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
	
	
	function getPostPayload($element, method)
	{
		method = typeof method === "undefined" ? $element.attr("data-method") : method;
		var $form = $("#" + $element.attr("data-form"));
		var params = IDEX.getFormData($form);
		params = IDEX.buildPostPayload(method, params);
		
		return params;
	}	
	

	$(".place-order-button").on("click", function()
	{
		if ($(this).hasClass("disabled"))
			return;
		
		var $button = $(this);
		var $wrap = $(this).closest(".cm-orderbox-body");
		var $form = $("#" + $(this).attr("data-form"));
		var params = getPostPayload($(this));
		var exchange = $wrap.find(".cm-orderbox-exchange-trig").text();
		
		if (params['method'] == "placeask")
			var str = "Ask";
		else
			var str = "Bid";
				
		if (checkOrderboxInputValues(str))
		{
		
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
					
					
			$form.trigger("reset");
			$button.addClass("disabled");
			
			IDEX.placeOrder(params).then(function()
			{
				$button.removeClass("disabled")
			});
		}
		
	})
	
	
	function checkOrderboxInputValues(typeOrder)
	{
		var retbool = false;
		var formName = "place" + typeOrder + "Form";
		var $form = $("#"+formName);
		
		//var balanceToCheck = (params['requestType'] == "placebid") ? params['relid'] : params['baseid'];
		//if (IDEX.account.checkBalance(balanceToCheck, params['volume']))
		//else
		//	$.growl.error({'message':"Not enough funds", 'location':"tl"});
	
		var formVals = IDEX.getFormData($form);
		console.log(formVals);

		if (formVals.price.length && formVals.volume.length && formVals.total.length)
			retbool = true;
		
		
		return retbool;
	}
	

	
	
	IDEX.placeOrder = function(params)
	{
		var dfd = new $.Deferred()
		
		console.log(params);
		params['plugin'] = "InstantDEX"

		IDEX.sendPost(params).done(function(data)
		{
			IDEX.updateUserState(true);
			
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
			
			dfd.resolve();
			
		}).fail(function(data)
		{
			console.log(data);
			$.growl.error({'message':"Error calling SuperNET", 'location':"tl"});
			
			dfd.resolve();
		})

		return dfd.promise()
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
	
	
	IDEX.updateOrderBoxBalance = function(force)
	{
		var $buy = $("#balance_buy");
		var $sell = $("#balance_sell");
		var baseBal = ["0", ".0"];
		var relBal = ["0", ".0"];

		$buy.find(".bal-cur").first().text(IDEX.user.curRel.name + ": ");
		$sell.find(".bal-cur").first().text(IDEX.user.curBase.name + ": ");
		
		IDEX.account.updateBalances(force).done(function()
		{
			baseBal = parseBalance(IDEX.account.getBalance(IDEX.user.curBase.assetID));
			relBal = parseBalance(IDEX.account.getBalance(IDEX.user.curRel.assetID));

			$buy.find(".bal-val").first().text(relBal[0] + relBal[1]);
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
	

	$("input[name='total']").on("keyup", function() 
	{
		var $form = $(this).closest("form");
		var price = $form.find("input[name='price']").val();
		var total = $form.find("input[name='total']").val();
		
		if (price.length)
		{
			var amount = Number(total) / Number(price);
			$form.find("input[name='volume']").val(String(amount));
		}
	});
	
	
	$("#balance_buy .bal-val").on("click", function()
	{
		var $wrap = $(this).closest(".cm-orderbox-body");
		var total = $(this).text();
		
		var $totalInput = $wrap.find("input[name='total']");
		
		$totalInput.val(total);
		$totalInput.trigger("keyup");
	})
	
	
	$("#balance_sell .bal-val").on("click", function()
	{
		var $wrap = $(this).closest(".cm-orderbox-body");
		var total = $(this).text();
		
		var $amountInput = $wrap.find("input[name='volume']");
		
		$amountInput.val(total);
		$amountInput.trigger("keyup");
	})
	
	
	$("input[name='price'], input[name='volume'], input[name='total']").on("keydown", function(e) 
	{
		var $input = $(this);
		
		orderboxInputValidator($input, e);
	});
	
	
	function orderboxInputValidator($input, e)
	{	
        // Allow: backspace, delete, tab, escape, enter and .
        if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 110, 190]) !== -1 ||
             // Allow: Ctrl+A
            (e.keyCode == 65 && e.ctrlKey === true) ||
             // Allow: Ctrl+C
            (e.keyCode == 67 && e.ctrlKey === true) ||
             // Allow: Ctrl+X
            (e.keyCode == 88 && e.ctrlKey === true) ||
             // Allow: home, end, left, right
            (e.keyCode >= 35 && e.keyCode <= 39))
		{
			if (e.keyCode == 190)
			{
				var hasDecimal = $input.val().search("\\.");
				
				if (hasDecimal != -1)
				{
					e.preventDefault();
				}
				else
				{
					return
				}
			}
			else
			{
				return;
			}
        }

        if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105))
		{
            e.preventDefault();
        }
    };
	


	return IDEX;
	
}(IDEX || {}, jQuery));

