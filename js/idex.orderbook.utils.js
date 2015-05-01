

var IDEX = (function(IDEX, $, undefined)
{
	
	IDEX.getRowData = function($row, index)
	{
		var isAsk = ($row.closest(".bookname").attr('id') == "buyBook") ? "bids" : "asks";
		var rowData = index >= IDEX.orderbook[isAsk].length ? null : IDEX.orderbook[isAsk][index];

		return rowData;
	}
	
	
	IDEX.Orderbook.prototype.emptyOrderbook = function(currPair, price)
	{
		price = (typeof price === "undefined") ? '0.0' : price;
		$("#currPair .order-text").text(currPair);
		$("#buyBook .twrap").empty();
		$("#sellBook .twrap").empty();
		$("#currLast .order-text").empty().text(price);
	}
	
	
	function updateLastPrice(orderbookData)
	{
		var lastPrice = orderbookData.bids.length ? orderbookData.bids[0].price : 0;
		
		$("#currLast .order-text").text(Number(lastPrice).toFixed(8));	
	}
	

	function animateOrderbook()
	{
		$(".twrap").find(".order-row.expiredRow").remove();
		IDEX.updateScrollbar(false)
		$(".newrow").removeClass("newrow");
	}
	
	
	return IDEX;
	
	
}(IDEX || {}, jQuery));