

var IDEX = (function(IDEX, $, undefined) 
{
	
//					IDEX.currentOpenOrders();
//					IDEX.refreshOrderbook();

	
	IDEX.placeOrder = function(params)
	{
		var balanceToCheck = (params['requestType'] == "placebid") ? params['relid'] : params['baseid'];
		
		console.log(params);
		
		if (IDEX.account.checkBalance(balanceToCheck, params['volume']))
		{
			IDEX.sendPost(params).done(function(data)
			{
				console.log(data);

				if ('error' in data && data['error'])
				{
					$.growl.error({'message':data['error'], 'location':"tl"});				
				}
				else
				{
					$.growl.notice({'message':"Order placed", 'location':"tl"});
				}
			})
		}
		else
		{
			$.growl.error({'message':"Not enough funds", 'location':"tl"});
		}

	}
	
	
	IDEX.updateOrderBox = function()
	{
		IDEX.resetOrderBoxForm();
		IDEX.updateOrderBoxBalance();
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

		$buy.find("span").first().text(IDEX.user.curRel.name);
		$sell.find("span").first().text(IDEX.user.curBase.name);
		
		IDEX.account.updateBalances().done(function()
		{
			baseBal = parseBalance(IDEX.account.getBalance(IDEX.user.curBase.assetID));
			relBal = parseBalance(IDEX.account.getBalance(IDEX.user.curRel.assetID));

			$buy.find(".bal-value span").first().text(relBal[0]).next().text(relBal[1]);
			$sell.find(".bal-value span").first().text(baseBal[0]).next().text(baseBal[1]);
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

