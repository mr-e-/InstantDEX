

var IDEX = (function(IDEX, $, undefined) {

$(".order-button").on("mouseover", function()
{
	var text = $(this).find("button").attr("data-method") == "placebid" ? "B<br>U<br>Y" : "S<br>E<br>L<br>L";
	$(this).find("button").html(text);
})
$(".order-button").on("mouseout", function()
{
	$(this).find("button").html("P<br>L<br>A<br>C<br>E");
})

IDEX.updateBalanceBox = function()
{
	var $buy = $("#balance_buy")
	var $sell = $("#balance_sell")
	var baseBal = ["0", ".0"]
	var relBal = ["0", ".0"]

	$buy.find("span").first().text(IDEX.curRel.name);
	$sell.find("span").first().text(IDEX.curBase.name);
	
	IDEX.account.updateBalances().done(function()
	{
		baseBal = parseBalance(IDEX.account.getBalance(IDEX.curBase.assetid));
		relBal = parseBalance(IDEX.account.getBalance(IDEX.curRel.assetid));

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

