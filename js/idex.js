

var IDEX = (function(IDEX, $, undefined)
{
	IDEX.orderbook;
	IDEX.account;
	IDEX.user;
	IDEX.chart;

	IDEX.isSNRunning = false;
	IDEX.chartInit = false;
	IDEX.isOrderbookExpanded = false;

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


	IDEX.OrderbookVar = function(obj) 
	{	
		this.nxtRS = "";
		this.pair = "";
		this.orderbookID = "";
		this.baseAsset = "";
		this.relAsset = "";
		
		this.asks = [];
		this.bids = [];

		IDEX.constructFromObject(this, obj);
	};
	
	
	IDEX.Orderbook = function(obj) 
	{	
		this.isStoppingOrderbook = false;
		this.isWaitingForOrderbook = false;
		this.orderbookTimeout;
		this.orderbookInit;
		this.timeoutDFD = false;
		this.xhr = false;
		
		this.currentOrderbook;
		this.newOrderbook;

		this.groupedBids = {};
		this.groupedAsks = {};

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
		
		IDEX.constructFromObject(this, obj);
	};
	
	
	IDEX.OpenOrder = function(obj)
	{
		IDEX.constructFromObject(this, obj);
	}
	
	

	IDEX.User = function(obj)
	{
		this.allAssets = [];
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
		var loadedChart = new $.Deferred();
		var timeoutFinished = new $.Deferred();

		IDEX.user = new IDEX.User();
		IDEX.account = new IDEX.Account();
		IDEX.orderbook = new IDEX.Orderbook();
		IDEX.chart = new IDEX.Chart();
		
		IDEX.initScrollbar();
		IDEX.initDataTable();
		
		IDEX.buildTilesDom();
		IDEX.buildMainChartDom();
		
		IDEX.user.initFavorites();
		
		
		IDEX.pingSupernet().done(function()
		{
			
			IDEX.initTimer().done(function()
			{
				timeoutFinished.resolve();
			})
			
			
			IDEX.account.updateNXTRS().done(function(nxtRSID)
			{
				//console.log(nxtRSID)
			});
			
			
			IDEX.user.initAllAssets().done(function()
			{
				IDEX.initAutocomplete();
				
				IDEX.getSkynet().done(function(data)
				{
					initializedAssets.resolve()
				})
			});
			
			
			IDEX.updateChart("main_menu_chart").then(function()
			{
				loadedChart.resolve();
				
			})
			
			
			
			$.when(timeoutFinished, initializedAssets, loadedChart).done(function()
			{
				var lastMarket = IDEX.user.getLastMarket()
				var baseID = lastMarket.baseID;
				var relID = lastMarket.relID;
				console.log(lastMarket)
				IDEX.changeMarket(baseID, relID);
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
