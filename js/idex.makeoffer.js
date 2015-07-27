

var IDEX = (function(IDEX, $, undefined)
{

	//$button.prop('disabled', true);
	//"perc":$(".conf-perc").val();
	//$button.prop('disabled', false);
	
	var $makeofferPopup = $(".makeofferPopup");
	var $makeofferPopupOverlay = $(".makeofferPopup-overlay")
	var $makeofferPopupConfirm = $(".makeofferPopup-confirm");
	
	
	function showMakeofferPopup()
	{
		$makeofferPopup.addClass("active");
		$makeofferPopupOverlay.addClass("active");
	}
	
	function hideMakeofferPopup()
	{
		$makeofferPopup.removeClass("active");
		$makeofferPopupOverlay.removeClass("active");
	}
	
	
	$(".makeofferPopup-confirm").on("click", function()
	{
		var isDisabled = $(this).hasClass("disabled")
		
		if (!isDisabled)
			IDEX.makeOffer()
	})
	
	
	IDEX.makeOffer = function()
	{	
		params = IDEX.buildPostPayload("makeoffer3", IDEX.user.pendingOrder)
		params['perc'] = $(".conf-perc").val();
		
		console.log(params);
		
		$makeofferPopupConfirm.addClass('disabled');
		
		IDEX.sendPost(params).done(function(data)
		{
			console.log(data);
			
			if ("error" in data && data.error.length)
			{
				console.log("error");
				$(".conf-jumbotron").show().find("div").text(data['error']);
			}
			else
			{
				var message = "makeoffer placed!"
				$.growl.notice({'message':message, 'location':"tl"});
				
				hideMakeofferPopup();
			}
			
			$makeofferPopupConfirm.removeClass('disabled');

		}).fail(function()
		{
			$makeofferPopupConfirm.removeClass('disabled');
		})
	}
	
	
	$(".makeofferPopup-close").on("click", function()
	{
		//var $popup = $(this).closest(".makeofferPopup");
		hideMakeofferPopup();
	})
	

	IDEX.buildMakeofferModal = function($modal, order)
	{
		//$makeofferPopupConfirm.removeClass('disabled');

		$modal.find(".conf-title").text("Confirm " + (order.askoffer ? "Buy" : "Sell") + " Order");
		console.log(order)
		$modal.find(".conf-pair").text(IDEX.user.curBase.name+"/"+IDEX.user.curRel.name);
		$modal.find(".conf-exchange").text(order.exchange);
		$modal.find(".conf-amount").val(order.volume);
		$modal.find(".conf-price").val(order.price);
		$modal.find(".conf-total").val((order.price*order.volume).toFixed(8));
		$modal.find(".conf-minperc").val(order.minperc);
		$modal.find(".conf-perc").val("100");
		$modal.find(".conf-fee").val(((order.exchange == "nxtae_nxtae") ? "5" : "2.5"));
		$(".conf-jumbotron").hide().find("div").empty();
		
		showMakeofferPopup();
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
		var amount = (perc/100) * IDEX.user.pendingOrder['volume'];
		var total = Number(IDEX.user.pendingOrder['price'])*Number(amount);
		
		$(".conf-amount").val(amount);
		$(".conf-total").val(total.toFixed(8));
		
		var check = checkPerc(perc, IDEX.user.pendingOrder['minperc']);
		
		if (!check.length)
		{
			$makeofferPopupConfirm.removeClass('disabled');
			$(".conf-jumbotron").hide().find("div").empty();
		}
		else
		{
			$makeofferPopupConfirm.addClass('disabled');
			$(".conf-jumbotron").show().find("div").text(check);
		}
	});
	
	

	
	return IDEX;
	
	
}(IDEX || {}, jQuery));

