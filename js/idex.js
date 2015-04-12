

var IDEX = (function(IDEX, $, undefined) {


IDEX.allAssets = [];
IDEX.curBase = {};
IDEX.curRel = {};
IDEX.pendingOrder = {};

IDEX.snAssets = {
	'nxt':{'name':"NXT", 'asset':"5527630", 'assetid':"5527630", 'decimals':8}
}


IDEX.Orderbook = function(obj) 
{	
	this.nxtRs = "";
	this.pair = "";
	this.orderbookID = "";
	this.baseAsset = "";
	this.relAsset = "";
	this.asks = [];
	this.bids = [];
	
	IDEX.constructFromObject(this, obj);
};


function User(obj)
{
	this.isSNRunning = false;

	this.chart;
	this.orderbook;
	this.account;
	this.currentBase;
	this.currentRel;
	this.pendingOrder = {};
	
	this.options = {};
	this.favorites = {};
	
	IDEX.constructFromObject(this, obj);
}

function chartFavorites(obj)
{
	
}

User.prototype.setChartFavorites = function(favorites)
{
	
}


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

function OpenOrder(obj)
{
	constructFromObject(this, obj);
}

IDEX.Balance = function(constructorObj) 
{
	this.availableBalance = 0;
	this.unconfirmedBalance = 0;
	
	var __construct = function(that, constructorObj)
	{
		var asset = IDEX.getAssetInfo("asset", constructorObj['asset'])
		if (asset)
		{
			IDEX.constructFromObject(that, asset)
			if (that.name == "NXT")
			{
				that.availableBalance = Number(constructorObj['balanceNQT']) / Math.pow(10, asset.decimals);
				that.unconfirmedBalance = Number(constructorObj['unconfirmedBalanceNQT']) / Math.pow(10, asset.decimals);
			}
			else
			{
				that.availableBalance = constructorObj['quantityQNT'] / Math.pow(10, asset.decimals);
				that.unconfirmedBalance = constructorObj['unconfirmedQuantityQNT'] / Math.pow(10, asset.decimals);
			}

		}
	}(this, constructorObj)
	//IDEX.constructFromObject(this, obj);
	//IDEX.constructFromObject(this, new IDEX.Asset());
};


function Account(obj)
{
	this.nxtRS = "";
	this.nxtID = "";
	this.balances = {};
	this.openOrders = [];
	
	IDEX.constructFromObject(this, obj);
};


Account.prototype.getBalance = function(assetID)
{
	var balance = {}

	if (assetID in this.balances)
		balance = this.balances[assetID]
		
	return balance
}

Account.prototype.setBalances = function(balances)
{
	
}


Account.prototype.updateBalances = function()
{
	var dfd = new $.Deferred();
	//var postObj = {'requestType':"getAccount",'account':IDEX.account.nxtID, 'includeAssets':true};
	var postObj = {'requestType':"getAccountAssets",'account':IDEX.account.nxtID};
	this.balances = {};
	thisScope = this;
	IDEX.sendPost(postObj, 1).done(function(data)
	{
		var balances = data['accountAssets'];

		if (!("errorCode" in data))
		{	
			IDEX.sendPost({'requestType':"getBalance", 'account':IDEX.account.nxtID}, 1).done(function(nxtBal)
			{
				if (!("errorCode" in nxtBal))
				{
					nxtBal['asset'] = IDEX.snAssets['nxt']['asset']
					balances.push(nxtBal)
				}
				
				for (var i = 0; i < balances.length; i++)
				{
					var balance = new IDEX.Balance(balances[i])
					thisScope.balances[balance.asset] = balance
				}

				dfd.resolve();
				
			}).fail(function(data)
			{
				dfd.resolve();
			})
		}
		else
		{
			dfd.resolve();
		}
		
	}).fail(function(data)
	{
		dfd.resolve();
	})
	
	return dfd.promise();
}

	
IDEX.init = function()
{
	IDEX.user = new User();
	IDEX.account = new Account();
	IDEX.currentOrderbook = new IDEX.Orderbook();
	
	initAllAssets();
	initChartFavorites();
	initOptions();
	getRS();
}

function getRS()
{
	IDEX.sendPost({'requestType':"getpeers"}).done(function(data)
	{
		if ('peers' in data && data['peers'].length)
		{
			var index = data['peers'].length == 1 ? 0 : 1;
			IDEX.account.nxtRS = data['peers'][index]['RS'];
			IDEX.account.nxtID = data['peers'][index]['srvNXT'];
		}
	})
}


function initAllAssets()
{
	var dfd = new $.Deferred();
	
	if (localStorage.allAssets)
	{
		var assets = JSON.parse(localStorage.getItem('allAssets'));
		dfd.resolve(assets);
	}
	else
	{
		IDEX.sendPost({'requestType':"getAllAssets"}, 1).done(function(data)
		{
			var parsed = [];
			
			for (var i = 0; i < data.assets.length; ++i)
			{
				var obj = {};
				
				for (var key in data.assets[i])
				{
					if (key == "asset")
						obj['assetid'] = data.assets[i][key];
					
					if (key == "description")
						continue;
					
					obj[key] = data.assets[i][key];
				}

				parsed.push(obj);
			}
			parsed.push(IDEX.snAssets['nxt']);
			localStorage.setItem('allAssets', JSON.stringify(parsed));
			dfd.resolve(parsed);
			
		}).fail(function(data)
		{
			localStorage.removeItem("allAssets");
			dfd.resolve([]);
		})
	}
	
	dfd.done(function(assets)
	{
		assets.sort(IDEX.compareProp('name'));
		IDEX.allAssets = assets;
		
		for (var i = 0; i < assets.length; ++i)
		{
			IDEX.auto.push({"label":assets[i].name+" <span>("+assets[i].assetid+")</span>","value":assets[i].name});
			IDEX.auto2.push({"label":assets[i].name+" <span>("+assets[i].assetid+")</span>","value":assets[i].asset});
		}
	})
}

function initChartFavorites()
{
	var chartFavs = {};
	
	if (localStorage.chartFavorites)
	{
		chartFavs = JSON.parse(localStorage.getItem("chartFavorites"));

		for (var i = 0; i < chartFavs.length; ++i)
		{
			if (!("asset" in chartFavs[i]) || typeof chartFavs[i]['asset'] === "undefined")
				chartFavs[i]['asset'] = "-1";
		}
	}
	else
	{
		var defaultFavs = [
			{'name':"InstantDEX",'asset':"15344649963748848799"},
			{'name':"SuperNET",'asset':"12071612744977229797"},
			{'name':"jl777hodl",'asset':"6932037131189568014"},
			{'name':"SkyNET",'asset':"6854596569382794790"},
			{'name':"mgwBTC",'asset':"17554243582654188572"},
			{'name':"LIQUID",'asset':"4630752101777892988"}
		];
		var ids = ["11","12","21","22","31","32","41","42","51","52","61","62","71","72","81","82","91","92","101","102","111","112","121","122"];
		var lastAsset = "";
		var tempFavs = [];

		for (var i = 0; i < ids.length; ++i)
		{
			var randIndex = Math.floor(Math.random() * defaultFavs.length);
			var randFav = {} 
			randFav ['name'] = defaultFavs[randIndex]['name'];
			randFav['asset'] = defaultFavs[randIndex]['asset'];
			randFav['id'] = ids[i];
			
			if (randFav['asset'] == lastAsset)
			{
				--i;
				continue;
			}
			
			lastAsset = randFav['asset'];
			chartFavs[ids[i]] = randFav;
		}
	}
	
	localStorage.setItem('chartFavorites', JSON.stringify(chartFavs));
	IDEX.user.favorites = chartFavs;

	for (var id in chartFavs)
	{	
		$(".chart-control[chart-id='"+id+"']").val(chartFavs[id]['name']).attr("data-asset", chartFavs[id]['asset']);
		$("#chart-curr-"+id).html(chartFavs[id]['name']).attr("data-asset", chartFavs[id]['asset']);
	}
	
	IDEX.loadMiniCharts()
}

IDEX.loadMiniCharts = function()
{
	$('.mini-chart').each(function()
	{
		var baseID = $(this).find(".mini-chart-area-1 span").first().attr("data-asset")
		var relID = $(this).find(".mini-chart-area-1 span").first().next().attr("data-asset");
		var divid = $(this).find(".mini-chart-area-4").attr('id');
		
		if (baseID != "-1" && relID != "-1")
			IDEX.makeMiniChart(baseID, relID, divid);
	})
}


function initOptions()
{	
	var options = {};
	
	if (localStorage.options)
	{
		options = JSON.parse(localStorage.getItem("options"));
	}
	else
	{
		options['duration'] = 6000;
		options['minperc'] = 75;
		localStorage.setItem('options', JSON.stringify(options));
	}
	
	$(".option-minperc").val(options['minperc']);
	$(".option-duration").val(options['duration']);
	IDEX.user.options = options;
}


$("#miniChartsC .mini-chart .mini-chart-area-1").on("click", function()
{
	hotkeyHandler($(this));
})
$("#miniChartsTop .chart-box, #miniChartsTop2 .chart-box-2 .chart-sub-box-2").on("click", function()
{
	hotkeyHandler($(this).find("span").first());
})
function hotkeyHandler($div)
{
	var baseid = $div.find("span").eq(0).attr("data-asset");
	var relid = $div.find("span").eq(1).attr("data-asset");
	
	if (baseid && relid && baseid.length && relid.length)
		IDEX.loadOrderbook(baseid, relid);
}


$(".idex-submit").on("click", function()
{
	var $form = $("#" + $(this).attr("data-form"));
	var method = $(this).attr("data-method");
	var params = IDEX.extractPostPayload($(this));

	params = IDEX.buildPostPayload(method, params);

	if (method == "orderbook")
	{
		IDEX.loadOrderbook(params.baseid, params.relid);
	}
	else if (method == "placebid" || method == "placeask")
	{
		params['baseid'] = IDEX.curBase.asset;
		params['relid'] = IDEX.curRel.asset;
		params['duration'] = IDEX.user.options['duration'];

		IDEX.sendPost(params).done(function(data)
		{
			console.log(data);
			$.growl.notice({'message':"Order placed"});
			if ('result' in data && data['result'])
			{
			}
			else
			{
			}
		})
	}
	else
	{
		IDEX.sendPost(params);
	}

	if ($form)
		$form.trigger("reset");
	
	$(".md-overlay").trigger("click");
})




$("#icoLog").on("click", function()
{
	$.growl.error({'message':"Order placed", 'location':"bl"});
	$.growl.warning({'message':"Order placed", 'location':"bl"});
	$.growl.notice({'message':"Order placed", 'location':"bl"});

})






	return IDEX;
	
}(IDEX || {}, jQuery));



$(window).load(function()
{
	IDEX.init();
})