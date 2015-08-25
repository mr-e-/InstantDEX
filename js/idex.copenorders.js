

var IDEX = (function(IDEX, $, undefined) 
{
	
	
	IDEX.allCOpenOrders = [];
	
	
	IDEX.COpenOrder = function(obj) 
	{	
		this.baseAsset;
		this.relAsset;
		this.hasMarket = false;
		
		this.cOpenOrderDom;
		this.searchInputDom;
		this.baseSec;
		this.relSec;


		IDEX.constructFromObject(this, obj);
	};
	
	
	/*IDEX.CBalanceType = function(type, $cBalanceDom, cBalance) 
	{	
		this.cBalance = cBalance;
		this.dom;
		this.type = type;
		this.balanceTitleDom;
		//this.balanceValDom
		this.tableDom;


		var __construct = function(that, type, $cBalanceDom)
		{
			that.dom = $cBalanceDom.find(".cm-balances-" + type);
			that.balanceTitleDom = that.dom.find(".cm-balances-sing-title span");
			//that.balanceValDom = that.dom.find(".orderbox-balance-val span");
			that.tableDom = that.dom.find(".cm-balances-sing-table");

		}(this, type, $cBalanceDom)
	};*/
		
		
	
	
	IDEX.newCOpenOrder = function($el)
	{
		var cOpenOrder = IDEX.getObjectByElement($el, IDEX.allCOpenOrders, "cOpenOrderDom");

		if (!cOpenOrder)
		{
			cOpenOrder = new IDEX.COpenOrder();

			cOpenOrder.cOpenOrderDom = $el;
			cOpenOrder.searchInputDom = $el.find(".cm-openorders-search-wrap input");

			//orderbook.buyBookDom.perfectScrollbar();
			//orderbook.sellBookDom.perfectScrollbar();
			
			IDEX.allCOpenOrders.push(cOpenOrder);
		}
		

				
		return cOpenOrder;
	};
	
	
	return IDEX;
	
	
}(IDEX || {}, jQuery));
