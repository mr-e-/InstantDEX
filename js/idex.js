

var IDEX = (function(IDEX, $, undefined)
{

	IDEX.orderbook;
	IDEX.account;
	IDEX.user;
	IDEX.chart;

	IDEX.isSNRunning = false;
	IDEX.chartInit = false;
	IDEX.isOrderbookExpanded = false;

	/*IDEX.HTMLElements = {
		'buyBook':
		'sellBook':
	}*/

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


	IDEX.Orderbook = function(obj) 
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
			var asset = IDEX.getAssetInfo("asset", constructorObj['asset'])
			
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
	
	
	IDEX.Chart = function(obj) 
	{
		this.baseid = "6854596569382794790"
		this.relid = "6932037131189568014"
		this.basename = "SkyNET"
		this.relname = "jl777hodl"
		this.numticks = "5"
		this.numbars = "100"
		this.isvirtual = false
		this.flip = false
		this.isNew = false
		
		IDEX.constructFromObject(this, obj);
	}
	

	IDEX.init = function()
	{
		IDEX.initScrollbar();
		IDEX.initDataTable();
		
		IDEX.user = new IDEX.User();
		IDEX.account = new IDEX.Account();
		IDEX.orderbook = new IDEX.Orderbook();
		IDEX.chart = new IDEX.Chart();
		
		IDEX.user.initAllAssets();
		IDEX.user.initChartFavorites();
		IDEX.user.initOptions();
		IDEX.user.updateFavoritesDom();
		
		IDEX.loadMiniCharts();
	}


	return IDEX;
		

}(IDEX || {}, jQuery));


$(window).load(function()
{
	IDEX.init();
})

