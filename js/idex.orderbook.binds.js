

var IDEX = (function(IDEX, $, undefined)
{

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

		IDEX.buildMakeofferModal($("#"+$("#tempBuyClick").data("modal")), order);
		$("#tempBuyClick").trigger("click");

		$("#place"+isAsk+"Price").val(order.price);
		$("#place"+isAsk+"Amount").val(order.volume).trigger("keyup");
		$(".order-tabs li[data-tab='"+tab+"'] span").trigger("mousedown").trigger("mouseup")
	})
	
	
	
	
	return IDEX;
	
	
}(IDEX || {}, jQuery));