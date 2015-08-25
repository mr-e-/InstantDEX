

var IDEX = (function(IDEX, $, undefined) 
{
	
	
	IDEX.allCBalances = [];
	
	
	IDEX.CBalance = function(obj) 
	{	
		this.baseAsset;
		this.relAsset;
		this.hasMarket = false;
		
		this.cBalanceDom;
		this.searchInputDom;
		this.baseSec;
		this.relSec;


		IDEX.constructFromObject(this, obj);
	};
	
	
	IDEX.CBalanceType = function(type, $cBalanceDom, cBalance) 
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
	};
		
		
	
	
	IDEX.newCBalance = function($el)
	{
		var cBalance = IDEX.getObjectByElement($el, IDEX.allCBalances, "cBalanceDom");

		if (!cBalance)
		{
			cBalance = new IDEX.CBalance();

			cBalance.cBalanceDom = $el;
			cBalance.searchInputDom = $el.find(".cm-balances-search-wrap input");

			cBalance.baseSec = new IDEX.CBalanceType("base", cBalance.cBalanceDom, cBalance);
			cBalance.relSec = new IDEX.CBalanceType("rel", cBalance.cBalanceDom, cBalance);
			
			
			//orderbook.buyBookDom.perfectScrollbar();
			//orderbook.sellBookDom.perfectScrollbar();
			
			IDEX.allCBalances.push(cBalance)

		}
		

				
		return cBalance;
	};
	
	
	return IDEX;
	
	
}(IDEX || {}, jQuery));
