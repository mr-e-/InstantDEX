

var IDEX = (function(IDEX, $, undefined) {
	

$("#buyBook, #sellBook").on("click", ".order-row.own-order", function()
{
	var order = IDEX.getRowData($(this), $(this).index());
	console.log(order);
})

$("#buyBook, #sellBook").on("click", ".order-row:not(.own-order):not(.expiredRow)", function(e)
{
	var bookID = $(this).closest(".bookname").attr("id")
	var rowIndex = $(this).index("#"+bookID+" .order-row")
	var order = IDEX.getRowData($(this), rowIndex);
	var isAsk = order.askoffer ? "Bid" : "Ask";
	var tab = order.askoffer ? "1" : "2";
	IDEX.pendingOrder = order;
	console.log(order);

	confirmPopup($("#"+$("#tempBuyClick").data("modal")), order);
	$("#tempBuyClick").trigger("click");

	$("#place"+isAsk+"Price").val(order.price);
	$("#place"+isAsk+"Amount").val(order.volume).trigger("keyup");
	$(".order-tabs li[data-tab='"+tab+"'] span").trigger("mousedown").trigger("mouseup")
})

$(".conf-input").css("width","80%")
function confirmPopup($modal, order)
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

$(".conf-confirm").on("click", function(){ triggerMakeoffer($(this)); })

function triggerMakeoffer($button)
{
	var params = {"requestType":"makeoffer3","perc":$(".conf-perc").val()};
	$button.prop('disabled', true);
	
	for (var i = 0; i < IDEX.snPostParams.makeoffer3.length; ++i)
	{
		params[IDEX.snPostParams.makeoffer3[i]] = IDEX.pendingOrder[IDEX.snPostParams.makeoffer3[i]];
	}
	//params['askoffer'] = 1;
	console.log(params);
	console.log(JSON.stringify(params, null, 4))
	IDEX.sendPost(params).done(function(data)
	{
		console.log(data);
		console.log(JSON.stringify(data, null, 4))
		$button.prop('disabled', false);
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

/*
$("input.conf-amount").on("keyup", function() 
{
	var amount = $(this).val();
	var price = pendingOrder['price'];
	var perc = (Number(amount)/Number(price))*100
	var total = Number(price)*Number(amount);
	var check = checkPerc(String(perc), pendingOrder['minperc'])
	
	$(".conf-perc").val(perc);
	$(".conf-total").val(total.toFixed(8))
});
*/

$("input.conf-perc").on("keyup", function() 
{
	var perc = $(this).val();
	var amount = (perc/100) * IDEX.pendingOrder['volume'];
	var total = Number(IDEX.pendingOrder['price'])*Number(amount);
	
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


	return IDEX;
	
}(IDEX || {}, jQuery));

