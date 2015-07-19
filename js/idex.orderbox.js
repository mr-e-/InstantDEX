

var IDEX = (function(IDEX, $, undefined) 
{
	var $mainGrid = $("#main_grid");
	IDEX.allOrderboxes = [];
	
	
	IDEX.Orderbox = function(obj) 
	{	
		this.baseAsset;
		this.relAsset;
		
		this.orderboxDom;
		this.buyBox;
		this.sellBox;


		IDEX.constructFromObject(this, obj);
	};
	
	
	IDEX.OrderboxType = function(type, $orderboxWrap) 
	{	
		this.type = type;
		this.dom;
		this.balanceTitleDom;
		this.balanceValDom
		this.exchangeDom
		this.formDom;
		this.buttonDom;

		var __construct = function(that, type, $orderboxWrap)
		{
			that.dom = $orderboxWrap.find(".orderbox-" + type);
			that.balanceTitleDom = that.dom.find(".orderbox-balance-title span");
			that.balanceValDom = that.dom.find(".orderbox-balance-val span");
			that.exchangeDom = that.dom.find(".orderbox-exchange-title");
			that.formDom = that.dom.find("form");
			that.buttonDom = that.dom.find(".orderbox-order-button");
		}(this, type, $orderboxWrap)
	};
	
	
	
	
	IDEX.newOrderbox = function($el)
	{
		var orderbox = IDEX.getObjectByElement($el, IDEX.allOrderboxes, "orderboxDom");
				
		if (!orderbox)
		{
			orderbox = new IDEX.Orderbox();

			orderbox.orderboxDom = $el
			orderbox.buyBox = new IDEX.OrderboxType("buy", orderbox.orderboxDom)
			orderbox.sellBox = new IDEX.OrderboxType("sell", orderbox.orderboxDom)

			orderbox.orderboxDom.find(".orderbox-order-button").on("click", function() { orderbox.placeOrderButtonClick($(this)) })

			IDEX.allOrderboxes.push(orderbox)
		}
		
		return orderbox;
	};
	
	
	
	IDEX.Orderbox.prototype.changeMarket = function(base, rel)
	{
		var orderbox = this;
		orderbox.baseAsset = base;
		orderbox.relAsset = rel;
		
		this.resetOrderBoxForm();
		this.updateOrderBoxBalance();
	}
	
	
	IDEX.Orderbox.prototype.updateOrderBox = function()
	{
		this.resetOrderBoxForm();
		this.updateOrderBoxBalance();


		/*
		$wrap.find(".refcur-base").text(base.name);
		$wrap.find(".refcur-rel").text(rel.name);
		*/
	}

	
	IDEX.Orderbox.prototype.resetOrderBoxForm = function()
	{
		this.buyBox.formDom.trigger("reset")
		this.sellBox.formDom.trigger("reset")
	}
	
	
	IDEX.Orderbox.prototype.updateOrderBoxBalance = function()
	{
		var orderbox = this;
		var base = orderbox.baseAsset;
		var rel = orderbox.relAsset;

		
		IDEX.account.updateBalances().then(function()
		{
			var relBal = parseBalance(IDEX.account.getBalance(rel.assetID));
			var baseBal = parseBalance(IDEX.account.getBalance(base.assetID));

			orderbox.buyBox.balanceValDom.text(relBal.whole + relBal.dec);
			orderbox.sellBox.balanceValDom.text(baseBal.whole + baseBal.dec);
			
			orderbox.buyBox.balanceTitleDom.html(rel.name + ":&nbsp;");
			orderbox.sellBox.balanceTitleDom.html(base.name + ":&nbsp;");
		})
	}
	
	
	function parseBalance(balance)
	{
		var obj = {};
		obj.whole = "0";
		obj.dec = ".0";
		
		if (!($.isEmptyObject(balance)))
		{
			var amount = String(balance.unconfirmedBalance);
			var both = amount.split(".");
			
			obj.whole = both[0];
			if (both.length > 1)
				obj.dec	= "." + both[1];
		}	
		
		return obj;
	}
	
	
	IDEX.Orderbox.prototype.placeOrderButtonClick = function($button)
	{
		var orderbox = this;
		var isButtonDisabled = $button.hasClass("disabled");
		var base = orderbox.baseAsset;
		var rel = orderbox.relAsset;
		var method = $button.attr("data-method");
		var box = method == "placebid" ? orderbox.buyBox : orderbox.sellBox
		
		if (!isButtonDisabled)
		{
			var $form = box.formDom;
			var params = IDEX.getFormData($form);
			params = IDEX.buildPostPayload(method, params);
			
			var exchange = box.exchangeDom.text();
			
					
			if (checkOrderboxInputValues($form))
			{
				params.exchange = exchange;
				params.baseid = base.assetID;
				params.relid = rel.assetID;
				
				if (exchange == "InstantDEX")
				{
					//params['duration'] = "30";
					//params['minperc'] = minperc
				}
						
						
				$form.trigger("reset");
				$button.addClass("disabled");
				
				IDEX.placeOrder(params).then(function()
				{
					$button.removeClass("disabled")
				});
			}
			
		}
	}
	
	
	function checkOrderboxInputValues($form)
	{
		var retbool = false;
		
		//var balanceToCheck = (params['requestType'] == "placebid") ? params['relid'] : params['baseid'];
		//if (IDEX.account.checkBalance(balanceToCheck, params['volume']))
		//else
		//	$.growl.error({'message':"Not enough funds", 'location':"tl"});
	
		var formVals = IDEX.getFormData($form);
		
		if (formVals.price.length && formVals.volume.length && formVals.total.length)
			retbool = true;
		
		
		return retbool;
	}
	

	
	
	IDEX.placeOrder = function(params)
	{
		var dfd = new $.Deferred()
		
		console.log(params);

		IDEX.sendPost(params).done(function(data)
		{
			//IDEX.updateUserState(true);
			
			console.log(data);

			if ('error' in data && data['error'])
			{
				$.growl.error({'message':data['error'], 'location':"tl"});				
			}
			else
			{
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
	
	IDEX.clearOrderBoxBalance = function()
	{
		var $buy = $("#balance_buy");
		var $sell = $("#balance_sell");
		var baseBal = ["0", ".0"];
		var relBal = ["0", ".0"];

		$buy.find(".bal-cur").first().text("Base:&nbsp;");
		$sell.find(".bal-cur").first().text("Quote:&nbsp;");

		$buy.find(".bal-val").first().text(relBal[0] + relBal[1])
		$sell.find(".bal-val").first().text(baseBal[0] + baseBal[1]);
	}

	

	

	$mainGrid.on("keyup", "input[name='price'], input[name='volume']", function() 
	{
		var $form = $(this).closest("form");
		var price = $form.find("input[name='price']").val();
		var amount = $form.find("input[name='volume']").val();
		var total = Number(price)*Number(amount);
		
		$form.find("input[name='total']").val(String(total));
	});
	

	$mainGrid.on("keyup", "input[name='total']", function() 
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
	
	
	$mainGrid.on("click", ".orderbox-buy .orderbox-balance-val span", function() 
	{
		var $wrap = $(this).closest(".orderbox-body");
		var total = $(this).text();
		
		var $totalInput = $wrap.find("input[name='total']");
		
		$totalInput.val(total);
		$totalInput.trigger("keyup");
	})
	
	
	$mainGrid.on("click", ".orderbox-sell .orderbox-balance-val span", function() 
	{
		var $wrap = $(this).closest(".orderbox-body");
		var total = $(this).text();
		
		var $amountInput = $wrap.find("input[name='volume']");
		
		$amountInput.val(total);
		$amountInput.trigger("keyup");
	})
	
	
	$mainGrid.on("keydown", "input[name='price'], input[name='volume'], input[name='total']", function(e) 
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
	
	
	
	/*$(".cm-orderbox-config-popup-close").on("mouseup", function()
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
		
	*/


	return IDEX;
	
}(IDEX || {}, jQuery));

