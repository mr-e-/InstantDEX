

var IDEX = (function(IDEX, $, undefined)
{
	IDEX.account;
	IDEX.user;

	IDEX.snPostParams = 
	{
		'orderbook':["baseid","relid","allfields"],
		'allorderbooks':[],
		'placebid':["baseid","relid","price","volume"],
		'placeask':["baseid","relid","price","volume"],
		'openorders':[],
		'tradehistory':["timestamp"],
		'cancelorder':["quoteid"],
		'makeoffer3':["baseid","relid","quoteid","askoffer","price","volume","exchange","baseamount","relamount","baseiQ","reliQ","minperc","jumpasset","offerNXT"]
	};

	
	
	IDEX.Order = function(obj) 
	{
		IDEX.constructFromObject(this, obj);
	};
	

	

	IDEX.Asset = function(obj) 
	{
		this.assetID = "";
		this.name = "";
		this.decimals = -1;
		this.quantityQNT = "";
		this.account = "";
		this.accountRS = "";
		this.description = "";
		this.numberOfTrades = 0;
		this.numberOfAccounts = 0;
		this.numberOfTransfers = 0;

		IDEX.constructFromObject(this, obj);
	};
	
	
	IDEX.Balance = function(constructorObj) 
	{
		this.availableBalance = 0;
		this.unconfirmedBalance = 0;
		
		var __construct = function(that, constructorObj)
		{
			var asset = IDEX.user.getAssetInfo("assetID", constructorObj['assetID']);
			
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
	
	
	IDEX.OpenOrder = function(obj)
	{
		IDEX.constructFromObject(this, obj);
	}
	
	

	IDEX.User = function(obj)
	{
		this.allAssets = [];
		this.labels = [];
		this.options = {};
		this.favorites = {};
		
		this.curBase = {};
		this.curRel = {};
		this.pendingOrder = {};
		
		IDEX.constructFromObject(this, obj);
	}
	

	IDEX.init = function()
	{
		var initializedAssets = new $.Deferred();
		var timeoutFinished = new $.Deferred();
		var updatedNXT = new $.Deferred();

		IDEX.user = new IDEX.User();
		IDEX.account = new IDEX.Account();
		
		IDEX.initScrollbar();
		//IDEX.initDataTable();
		
		IDEX.user.initFavorites();
		IDEX.user.initLabels();

		
		IDEX.user.options = 
		{
			"duration":6000,
			"minperc":75
		}
	
		var $node = $("#marketSearch_popup");
		
		//console.log(Sleuthcharts);
		//var s = IDEX.makeChart({"node":$node});
		//console.log(Sleuthcharts);

		//console.log($node.sleuthcharts())
		//console.log(Highcharts)
		//console.log(s)		
		
		IDEX.pingSupernet().done(function()
		{	
			IDEX.initTimer().done(function()
			{
				timeoutFinished.resolve();
			})
			
			
			IDEX.account.updateNXTRS().done(function(nxtRSID)
			{
				//console.log(nxtRSID)
				updatedNXT.resolve();
			});
			
			
			IDEX.user.initAllAssets().done(function()
			{
				IDEX.initAutocomplete();
				
				IDEX.getSkynet().done(function(data)
				{
					initializedAssets.resolve()
				})
			});
			
			
			$.when(timeoutFinished, initializedAssets, updatedNXT).done(function()
			{
				IDEX.hideLoading();
			})
			
					
			
		}).fail(function()
		{
			IDEX.editLoading("Could not connect to SuperNET. Start SuperNET and reload.")
		})
	}
	
	
	IDEX.initTimer = function()
	{
		var timeoutDFD = new $.Deferred();
		
		var timeout = setTimeout(function() 
		{
			timeoutDFD.resolve()
		}, 1000)
		
		return timeoutDFD.promise();
	}
	
	
	IDEX.pingSupernet = function()
	{
		var dfd = new $.Deferred();
		var params = {"requestType":"getState"};
		
		IDEX.sendPost(params, true).done(function()
		{
			dfd.resolve()
			
		}).fail(function()
		{
			dfd.reject()
		})
		
		return dfd.promise()
	}
	


	return IDEX;
		

}(IDEX || {}, jQuery));


$(window).load(function()
{
	IDEX.init();
})
