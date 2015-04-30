

var IDEX = (function(IDEX, $, undefined)
{

	//$button.prop('disabled', true);
	//"perc":$(".conf-perc").val();
	//$button.prop('disabled', false);

	IDEX.makeOffer = function()
	{
		var params = {"requestType":"makeoffer3"};
		
		params = IDEX.buildPostPayload(IDEX.user.pendingOrder, "makeoffer3")
		
		console.log(params);
		//console.log(JSON.stringify(params, null, 4))
		
		IDEX.sendPost(params).done(function(data)
		{
			console.log(data);
			//console.log(JSON.stringify(data, null, 4))
			
			if ("error" in data && data.error.length)
			{
				console.log("error");
				$(".conf-jumbotron").show().find("div").text(data['error']);
			}
			else
			{
				console.log("success");
				$(".md-overlay").trigger("click");
			}
		})
	}
	

	IDEX.buildMakeofferModal = function($modal, order)
	{
		$modal.find(".conf-title").text("Confirm " + (order.askoffer ? "Buy" : "Sell") + " Order");
		$modal.find(".conf-pair").text(IDEX.currentOrderbook.pair);
		$modal.find(".conf-exchange").text(order.exchange);
		$modal.find(".conf-amount").val(order.volume);
		$modal.find(".conf-price").val(order.price);
		$modal.find(".conf-total").val((order.price*order.volume).toFixed(8));
		$modal.find(".conf-base").text(order.base);
		$modal.find(".conf-rel").text(order.rel);
		$modal.find(".conf-minperc").val(order.minperc);
		$modal.find(".conf-perc").val("100");
		$modal.find(".conf-fee").val(((order.exchange == "nxtae_nxtae") ? "5" : "2.5"));
		$(".conf-confirm").prop('disabled', false);
		$(".conf-jumbotron").hide().find("div").empty();
	}

	
	function checkPerc(perc, minperc)
	{
		var text = "";
		var isnum = !isNaN(perc);
		
		if (isnum && perc.length)
		{
			if (perc.search("\\.") != -1)
			{
				text = "Perc must be a whole number.";
			}
			else
			{
				if (perc < minperc)
				{
					text = "Perc must be greater than the order's min perc.";
				}
				else if (perc > 100)
				{
					text = "Perc must be less than 100.";
				}
				else
				{
					
				}
			}
		}
		else
		{
			text = "Invalid perc.";
		}
		
		return text;
	}

	
	$("input.conf-perc").on("keyup", function() 
	{
		var perc = $(this).val();
		var amount = (perc/100) * IDEX.pendingOrder['volume'];
		//var total = Number(IDEX.pendingOrder['price'])*Number(amount);
		
		$(".conf-amount").val(amount);
		$(".conf-total").val(total.toFixed(8));
		
		var check = checkPerc(perc, IDEX.pendingOrder['minperc']);
		
		if (!check.length)
		{
			$("button.conf-confirm").prop('disabled', false);
			$(".conf-jumbotron").hide().find("div").empty();
		}
		else
		{
			$("button.conf-confirm").prop('disabled', true);
			$(".conf-jumbotron").show().find("div").text(check);
		}
	});

	
	return IDEX;
	
	
}(IDEX || {}, jQuery));

