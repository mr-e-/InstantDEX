

var IDEX = (function(IDEX, $, undefined)
{



	IDEX.Account = function(obj)
	{
		this.nxtRS = "";
		this.nxtID = "";
		this.balances = {};
		this.openOrders = [];
		this.timeoutDFD = false;
		this.openOrdersTimeout;
		this.openOrdersLastUpdated = 0;
		this.balancesLastUpdated = 0;

		IDEX.constructFromObject(this, obj);
	};
	
	

	
	
	IDEX.Balance = function(constructorObj) 
	{
		this.availableBalance = 0;
		this.unconfirmedBalance = 0;
		
		var __construct = function(that, constructorObj)
		{
			var asset = IDEX.nxtae.assets.getAsset("assetID", constructorObj['assetID']);
			if (constructorObj['assetID'] == "5527630")
				asset = IDEX.snAssets.nxt;
			if (asset)
			{
				IDEX.constructFromObject(that, asset);
				var avail = that.name == "NXT" ? constructorObj['balanceNQT'] : constructorObj['quantityQNT'];
				var unconf = that.name == "NXT" ? constructorObj['unconfirmedBalanceNQT'] : constructorObj['unconfirmedQuantityQNT'];
				
				that.availableBalance = avail / Math.pow(10, asset.decimals);
				that.unconfirmedBalance = unconf / Math.pow(10, asset.decimals);				
			}
			
		}(this, constructorObj)
	};
	
	
	
	
	return IDEX;
	
	
}(IDEX || {}, jQuery));