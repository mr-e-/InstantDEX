

var IDEX = (function(IDEX, $, undefined) 
{
	var $contentWrap = $("#content_wrap");
	IDEX.allOrderboxes = [];
	
	
	
	IDEX.Orderbox = function() 
	{	
		var orderbox = this;
		
		orderbox.hasMarket = false;
		orderbox.isBasic = false;
		orderbox.orderboxDom;
		orderbox.buyBox;
		orderbox.sellBox;
	};
	
	
	IDEX.OrderboxType = function(type, orderbox) 
	{	
		var orderboxType = this;
		
		orderboxType.orderbox = orderbox;
		orderboxType.type = type;
		orderboxType.exchange = "nxtae";

		orderboxType.initDOM();
		orderboxType.initEventListeners();
	};
	
	IDEX.OrderboxType.prototype.initDOM = function() 
	{
		var orderboxType = this;
		var orderbox = orderboxType.orderbox;
		var isBasic = orderbox.isBasic;
		var type = orderboxType.type;
		
		orderboxType.dom = !isBasic ? orderbox.orderboxDom.find(".orderbox-" + type) : orderbox.orderboxDom.find(".idex-basic-orderbox-" + type);
		orderboxType.balanceTitleDom = orderboxType.dom.find(".orderbox-balance-title span");
		orderboxType.balanceValDom = orderboxType.dom.find(".orderbox-balance-val span");
		orderboxType.exchangeDom = orderboxType.dom.find(".orderbox-exchange-title");
		orderboxType.formDom = orderboxType.dom.find("form");
		orderboxType.buttonDom = orderboxType.dom.find(".orderbox-order-button");
	}
	
	IDEX.OrderboxType.prototype.initEventListeners = function() 
	{
		var orderboxType = this;
		
		orderboxType.dom.find(".orderbox-exchange-dropdown .dropdown-list").on("click", "li", function() { orderboxType.changeExchange($(this)) } );
		orderboxType.dom.find(".orderbox-order-button").on("click", function() { orderboxType.placeOrderButtonClick($(this)) });
	};
	
	
	
	IDEX.newOrderbox = function($el, cell)
	{
		var orderbox = IDEX.getObjectByElement($el, IDEX.allOrderboxes, "orderboxDom");
				
		if (!orderbox)
		{
			orderbox = new IDEX.Orderbox();
			
			orderbox.cell = cell;
			orderbox.orderboxDom = $el
			
			orderbox.buyBox = new IDEX.OrderboxType("buy", orderbox)
			orderbox.sellBox = new IDEX.OrderboxType("sell", orderbox)
			

			IDEX.allOrderboxes.push(orderbox)
		}
		
		return orderbox;
	};
	
	IDEX.newBasicOrderbox = function($el)
	{

		orderbox = new IDEX.Orderbox();
		orderbox.isBasic = true;
		orderbox.orderboxDom = $el;
		
		orderbox.buyBox = new IDEX.OrderboxType("buy", orderbox)
		orderbox.sellBox = new IDEX.OrderboxType("sell", orderbox)

		
		return orderbox;
	};
	
	
	IDEX.Orderbox.prototype.updateExchangesDom = function()
	{
		var orderbox = this;
		var market = orderbox.market;
		var marketExchanges = market.exchanges;
		var activeMarketExchanges = IDEX.parseActiveExchanges(marketExchanges);
		
		var $exchangeDropdownDOM = orderbox.orderboxDom.find(".orderbox-exchange-dropdown");
		var $exchangeDropdownListDOM = $exchangeDropdownDOM.find("ul");
		var $exchangeDropdownTitleDOM = $exchangeDropdownDOM.find(".orderbox-exchange-title");
		$exchangeDropdownListDOM.empty();
		
		var listItems = [];
		
		if (market.isNxtAE)
		{
			listItems.push($("<li class='' data-val='InstantDEX'>"+"InstantDEX"+"</li>"))
		}
		
		for (var i = 0; i < activeMarketExchanges.length; i++)
		{
			var exchangeName = activeMarketExchanges[i];
			
			var $li = $("<li data-val='"+exchangeName+"'>"+exchangeName+"</li>");
			if (i == 0)
				$li.addClass("active");
			listItems.push($li);
		}
		
		
		for (var i = 0; i < listItems.length; i++)
		{
			var $li = listItems[i];
			$exchangeDropdownListDOM.append($li);
		}
		
		var title = activeMarketExchanges[0];
		$exchangeDropdownTitleDOM.text(title);
		orderbox.buyBox.changeExchange(listItems[0]);
		orderbox.sellBox.changeExchange(listItems[0]);
	}

	
	
	IDEX.OrderboxType.prototype.changeExchange = function($li)
	{
		var orderboxType = this;
		var orderbox = orderboxType.orderbox;
		var isBuyBox = orderboxType.type == "buy";
		var exchange = $li.attr("data-val");
				
		orderboxType.exchange = exchange;

		if (orderbox.hasMarket)
		{
			orderboxType.balanceValDom.text("Loading...");
			orderboxType.updateOrderBoxBalance();
		}
	}
	
	
	
	IDEX.Orderbox.prototype.changeMarket = function(market)
	{
		var orderbox = this;
		
		orderbox.market = market;
		orderbox.hasMarket = true;
		
		if (!orderbox.isBasic)
			orderbox.updateExchangesDom();

		orderbox.buyBox.balanceValDom.text("Loading...");
		orderbox.sellBox.balanceValDom.text("Loading...");
		orderbox.orderboxDom.find(".refcur-base").text(market.base.name);
		orderbox.orderboxDom.find(".refcur-rel").text(market.rel.name);

		orderbox.resetOrderBoxForm();
		orderbox.updateOrderBoxBalance();
	}
	
	
	
	IDEX.Orderbox.prototype.updateOrderBox = function()
	{
		var orderbox = this;
		
		orderbox.resetOrderBoxForm();
		orderbox.updateOrderBoxBalance();
	}

	
	
	IDEX.Orderbox.prototype.resetOrderBoxForm = function()
	{
		var orderbox = this;

		orderbox.buyBox.formDom.trigger("reset");
		orderbox.sellBox.formDom.trigger("reset");
	}
	
	
	
	IDEX.Orderbox.prototype.updateOrderBoxBalance = function()
	{
		var orderbox = this;
		
		if (orderbox.hasMarket)
		{
			orderbox.buyBox.updateOrderBoxBalance();
			orderbox.sellBox.updateOrderBoxBalance();
		}
	}
	
	
	
	IDEX.OrderboxType.prototype.updateOrderBoxBalance = function(forceUpdate)
	{
		var orderboxType = this;
		var isBuyBox = orderboxType.type == "buy";
		var orderbox = orderboxType.orderbox;
		
		var exchange = orderboxType.exchange;
		var baseOrRel = isBuyBox ? orderbox.market.rel : orderbox.market.base;
		
		orderboxType.balanceTitleDom.html(baseOrRel.name + ":&nbsp;");

		exchange = exchange == "InstantDEX" ? "nxtae" : exchange; 
		forceUpdate = typeof forceUpdate == "undefined" ? false : forceUpdate;
		
		baseOrRel.balanceHandler.update(forceUpdate, [exchange]).done(function()
		{
			var balances = baseOrRel.balanceHandler.balance;
			for (var i = 0; i < balances.length; i++)
			{
				var balance = balances[i];
				if (balance.exchange == exchange)
					orderboxType.balanceValDom.text(String(balance.available));
			}
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
	
	
	
	IDEX.OrderboxType.prototype.placeOrderButtonClick = function($button)
	{
		
		var orderboxType = this;
		var isBuyBox = orderboxType.type == "buy";
		var orderbox = orderboxType.orderbox;
		var isButtonDisabled = $button.hasClass("disabled");
		
		var method = $button.attr("data-method");
		var exchange = orderboxType.exchange;
		var market = orderbox.market;
		var base = orderbox.market.base;
		var rel = orderbox.market.rel;
		
		
		if (!isButtonDisabled)
		{
			var $form = orderboxType.formDom;
			var params = {};
			var formData = IDEX.getFormData($form);
			//params = IDEX.buildPostPayload(method, formData);
						
					
			if (checkOrderboxInputValues($form))
			{
				params.method = method
				params.exchange = exchange;
				if (market.isNxtAE)
				{
					params.baseid = base.assetID;
					params.relid = rel.name == "NXT" ? "5527630" : rel.assetID;
				}
				else
				{
					params.base = base.name;
					params.rel = rel.name;
				}
				params.price = formData.price;
				params.volume = formData.volume;
				params.gui = "sleuth";
				
				if (exchange == "InstantDEX")
				{
					//params['duration'] = "30";
					//params['minperc'] = minperc
				}
						
						
				$form.trigger("reset");
				$button.addClass("disabled");
				
				IDEX.placeOrder(params).then(function()
				{
					$button.removeClass("disabled");
					orderboxType.updateOrderBoxBalance(true);
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

		IDEX.sendPost(params, false).done(function(data)
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

	

	

	$contentWrap.on("keyup", "input[name='price'], input[name='volume']", function() 
	{
		var $form = $(this).closest("form");
		var price = $form.find("input[name='price']").val();
		var amount = $form.find("input[name='volume']").val();
		var total = IDEX.toSatoshi(Number(price)*Number(amount));
		
		$form.find("input[name='total']").val(String(total));
	});
	

	$contentWrap.on("keyup", "input[name='total']", function() 
	{
		var $form = $(this).closest("form");
		var price = $form.find("input[name='price']").val();
		var total = $form.find("input[name='total']").val();
		
		if (price.length)
		{
			var amount = IDEX.toSatoshi(Number(total) / Number(price));
			$form.find("input[name='volume']").val(String(amount));
		}
	});
	
	
	$contentWrap.on("click", ".orderbox-buy .orderbox-balance-val span", function() 
	{
		var $wrap = $(this).closest(".orderbox-body");
		var total = $(this).text();
		
		var $totalInput = $wrap.find("input[name='total']");
		
		$totalInput.val(total);
		$totalInput.trigger("keyup");
	})
	
	
	$contentWrap.on("click", ".orderbox-sell .orderbox-balance-val span", function() 
	{
		var $wrap = $(this).closest(".orderbox-body");
		var total = $(this).text();
		
		var $amountInput = $wrap.find("input[name='volume']");
		
		$amountInput.val(total);
		$amountInput.trigger("keyup");
	})
	
	
	$contentWrap.on("keydown", "input[name='price'], input[name='volume'], input[name='total']", function(e) 
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
	
	
	
	var $contentWrap = $("#content_wrap");
	
	
	
	$contentWrap.on("mousedown", ".orderbox-order-button", function()
	{
		$(this).addClass("order-button-mousedown")
	})
	$contentWrap.on("mouseup", ".orderbox-order-button", function()
	{
		$(this).removeClass("order-button-mousedown")
	})
	$contentWrap.on("mouseleave", ".orderbox-order-button", function()
	{
		$(this).removeClass("order-button-mousedown")
	})
	
	
	
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

