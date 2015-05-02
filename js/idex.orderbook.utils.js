

var IDEX = (function(IDEX, $, undefined)
{
	
	IDEX.getRowData = function($row, index)
	{
		var isAsk = ($row.closest(".bookname").attr('id') == "buyBook") ? "bids" : "asks";
		var rowData = index >= IDEX.orderbook.currentOrderbook[isAsk].length ? null : IDEX.orderbook.currentOrderbook[isAsk][index];

		return rowData;
	}
	
	
	IDEX.Orderbook.prototype.emptyOrderbook = function(price)
	{
		price = (typeof price === "undefined") ? '0.0' : price;
		
		$("#buyBook .twrap").empty();
		$("#sellBook .twrap").empty();
		$("#currPair .order-text").text(this.baseAsset.name+"/"+this.relAsset.name);
		$("#currLast .order-text").empty().text(price);
	}
	

	
	IDEX.Orderbook.prototype.updateLastPrice = function(orderbookData)
	{
		var lastPrice = orderbookData.bids.length ? orderbookData.bids[0].price : 0;
		
		$("#currLast .order-text").text(Number(lastPrice).toFixed(8));	
	}
	

	IDEX.Orderbook.prototype.animateOrderbook = function()
	{
		$(".twrap").find(".order-row.expiredRow").remove();
		IDEX.updateScrollbar(false)
		$(".newrow").removeClass("newrow");
	}
	
	
	return IDEX;
	
	
}(IDEX || {}, jQuery));