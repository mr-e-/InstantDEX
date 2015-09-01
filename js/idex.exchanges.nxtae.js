	
	
var IDEX = (function(IDEX, $, undefined) 
{
	

	var GENESIS_TIMESTAMP = 1385294400000;

	
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
	
	
	
	function convertToNxtTime(timestamp)
	{
		return Math.floor((timestamp - GENESIS_TIMESTAMP) / 1000);
	}
	
	
	var NxtAE = IDEX.exchangeClasses.nxtae = function()
	{
		this.init.apply(this, arguments)
	}
	
	NxtAE.prototype = 
	{	
		init: function()
		{
			var exchange = this;
			
			exchange.nxtRS = "";
			exchange.nxtID = "";
			
			exchange.markets = [];
			
			exchange.assets = new IDEX.exchangeClasses.nxtae.Assets(exchange);
			
			exchange.balances = new IDEX.exchangeClasses.nxtae.Balances(exchange);

			exchange.accountTrades = new IDEX.exchangeClasses.nxtae.AccountTrades(exchange);
			exchange.accountOpenOrders = new IDEX.exchangeClasses.nxtae.AccountOpenOrders(exchange);
			
			exchange.marketTrades = new IDEX.exchangeClasses.nxtae.MarketTrades(exchange);

		},
		
		
		initState: function()
		{
			var nxtAE = this;
			var dfd = new $.Deferred();
			
			var initializedAssets = new $.Deferred();
			var updatedNXT = new $.Deferred();
			
			
			nxtAE.assets.initAllAssets().done(function()
			{
				initializedAssets.resolve();
			})
			
			nxtAE.updateNXTRS().done(function()
			{
				updatedNXT.resolve();
			});
			
			$.when(initializedAssets, updatedNXT).done(function()
			{
				dfd.resolve();
			})
			
			
			
			return dfd.promise();
		},
		
		
		
		setNXTRS: function(nxtIDAndRS)
		{
			var nxtAE = this;

			nxtAE.nxtID = "";
			nxtAE.nxtRS = "";
			
			if (nxtIDAndRS.length == 1)
			{
				
			}
			else if (nxtIDAndRS.length == 2)
			{
				nxtAE.nxtID = nxtIDAndRS[0];
				nxtAE.nxtRS = nxtIDAndRS[1];
			}
		},
		
		
		
		updateNXTRS: function()
		{
			var dfd = new $.Deferred();
			var nxtIDAndRS = [];
			var account = this;
			var params = {"method":"orderbook"};
			params.baseid = "12071612744977229797";
			params.relid = "5527630";
			params.maxdepth = "1";
			
			
			IDEX.sendPost(params, false, function(data)
			{
				if ('NXT' in data && data['NXT'].length)
				{
					var id = data['NXT']
					var rs = IDEX.toRS(id);
					nxtIDAndRS.push(id);
					nxtIDAndRS.push(rs);
				}

				account.setNXTRS(nxtIDAndRS);
				
				dfd.resolve([account.nxtID, account.nxtRS])
			});
			
			
			return dfd.promise()
		}
	}
	
	
	
	var Updater = IDEX.Updater = function()
	{
		this.init.apply(this, arguments)
	}
	
	Updater.prototype = 
	{
		
		init: function(nxtAE)
		{
			var updater = this;
			
			this.nxtAE = nxtAE;
			this.lastBlock = 0;
		},

	}
	
	
	
	var Assets = NxtAE.Assets = function()
	{
		this.init.apply(this, arguments)
	}
	
	Assets.prototype = 
	{
		
		init: function(nxtAE)
		{
			var assetsHandler = this;
			assetsHandler.nxtAE = nxtAE;
			
			assetsHandler.updater = new IDEX.Updater();
			assetsHandler.allAssets = [];
		},
		
		
		
		initAllAssets: function()
		{
			var retdfd = new $.Deferred();
			var dfd = new $.Deferred();
			var assetsHandler = this;
			
			if (localStorage.allAssets)
			{
				var assets = JSON.parse(localStorage.getItem('allAssets'));
				dfd.resolve(assets);
			}
			else
			{
				var firstIndex = 1;
				var lastIndex = 99;
				
				assetsHandler.getAssetsLoop([], 0, 99, function(assets)
				{

					assets = assetsHandler.parseAllAssets(assets);
					localStorage.setItem('allAssets', JSON.stringify(assets));
					//console.log(assets.length)
					dfd.resolve(assets);
				})
			}
			
			
			dfd.done(function(assets)
			{
				assets.sort(IDEX.compareProp('name'));
				assetsHandler.allAssets = assets;
				retdfd.resolve(assets);
			})
			
			return retdfd.promise();
		},
		
		
		
		getAssetsLoop: function(assets, firstIndex, lastIndex, callback)
		{
			var assetsHandler = this;
			var params = {}
			params['requestType'] = "getAllAssets";
			params['firstIndex'] = firstIndex;
			params['lastIndex'] = lastIndex;
			
			IDEX.sendPost(params, true).then(function(data)
			{
				if ("assets" in data)
				{
					if (data.assets.length)
					{
						var addedAssets = assets.concat(data.assets)
						assetsHandler.getAssetsLoop(addedAssets, firstIndex+100, lastIndex+100, callback)
					}
					else
					{
						callback(assets)
					}
				}
				else
				{
					callback(assets)
				}
			})
		},
		
		
		
		parseAllAssets: function(assets)
		{
			var parsed = [];
			var assetsLength = assets.length
			
			for (var i = 0; i < assetsLength; i++)
			{
				var obj = {};
				
				for (var key in assets[i])
				{
					if (key == "description")
						continue;
					
					if (key == "asset")
						obj['assetID'] = assets[i][key];
					
					obj[key] = assets[i][key];
				}

				parsed.push(obj);
			}
			
			//parsed.push(IDEX.snAssets['nxt']);
			
			return parsed
		},
		
		
		
		getAsset: function(key, val)
		{
			var assetsHandler = this;
			var arr = [];
			var assetInfo = {};
			var len = assetsHandler.allAssets.length;
			
			for (var i = 0; i < len; i++)
			{
				if (assetsHandler.allAssets[i][key] == val)
				{
					arr.push(assetsHandler.allAssets[i]);
				}
			}
			
			if (arr.length)
			{
				var numTrades = -1;
				var index = 0;
				
				for (var i = 0; i < arr.length; ++i)
				{
					if (arr[i].numberOfTrades > numTrades)
					{
						numTrades = arr[i].numberOfTrades;
						index = i;
					}
				}
				
				assetInfo = arr[index];
			}
			
			return assetInfo;
		},
			
	}
	
	
	
	var Balances = NxtAE.Balances = function()
	{
		this.init.apply(this, arguments)
	}
	
	Balances.prototype = 
	{
		
		init: function(nxtAE)
		{
			var balancesHandler = this;
			balancesHandler.nxtAE = nxtAE;
			
			balancesHandler.updater = new IDEX.Updater();
			balancesHandler.balancesLastUpdated = new Date().getTime();
			
			balancesHandler.balances = {};
			balancesHandler.oneTime = false;
			
			balancesHandler.asyncDFD = false;
		},
		
		
		
		getBalance: function(assetID, isNxt)
		{
			var balancesHandler = this;
			var nxtAE = balancesHandler.nxtAE;
			
			var balance = {};
			
			if (isNxt)
				assetID = "5527630";

			if (assetID in balancesHandler.balances)
				balance = balancesHandler.balances[assetID];

			else
			{
				balance.availableBalance = 0;
				balance.unconfirmedBalance = 0;
			}

			return balance;
		},
		
		
		
		setBalances: function(balances)
		{
			var balancesHandler = this;

			for (var i = 0; i < balances.length; i++)
			{
				var balance = new IDEX.Balance(balances[i]);
				balancesHandler.balances[balance.assetID] = balance;
			}
		},
		
		
		
		checkBalance: function(assetID, amount)
		{
			var balancesHandler = this;
			var retBool = false;

			if (assetID in balancesHandler.balances && Number(balancesHandler.balances[assetID].unconfirmedBalance) >= amount)
				retBool = true;
				
			return retBool;
		},
	
		
		
		updateBalances: function(forceUpdate)
		{
			var balancesHandler = this;
			var nxtAE = balancesHandler.nxtAE;
			
			var dfd = new $.Deferred();

			var balances = [];
			var time = new Date().getTime()
			
			//console.log(time - this.balancesLastUpdated);

			if ( (!forceUpdate && time - this.balancesLastUpdated < 1000) && this.oneTime)
			{
				this.oneTime = true;
				//console.log('pass');
				dfd.resolve()
			}
			else
			{
				//var postObj = {'requestType':"getAccount",'account':IDEX.account.nxtID, 'includeAssets':true};
				var postObj = {'requestType':"getAccountAssets",'account':nxtAE.nxtID};
				
				IDEX.sendPost(postObj, 1).then(function(data)
				{
					if (!("errorCode" in data) && ("accountAssets" in data))
						balances = data['accountAssets'];
						
					IDEX.sendPost({'requestType':"getBalance", 'account':nxtAE.nxtID}, 1).then(function(nxtBal)
					{
						//console.log(nxtBal);
						if (!("errorCode" in nxtBal))
						{
							nxtBal['assetID'] = IDEX.snAssets['nxt']['assetID'];
							balances.push(nxtBal);
						}
						
						//console.log(balances);
						
						balances = addAssetID(balances);
						balancesHandler.balances = {};
						balancesHandler.setBalances(balances);
						dfd.resolve();
					})
				})
			}
			
			balancesHandler.balancesLastUpdated = time;
			return dfd.promise();
		}
			
	}
	
	
	
	var AccountOpenOrders = NxtAE.AccountOpenOrders = function()
	{
		this.init.apply(this, arguments)
	}
	
	AccountOpenOrders.prototype = 
	{
		
		init: function(nxtAE)
		{
			var openOrdersHandler = this;
			
			openOrdersHandler.openOrders = {};
			openOrdersHandler.openOrdersLastUpdated = new Date().getTime();
			
			
			openOrdersHandler.nxtAE = nxtAE;
		},
		
		
		
		updateOpenOrders: function(market, forceUpdate)
		{
			var openOrdersHandler = this;
			var dfd = new $.Deferred();
			var time = new Date().getTime()
					
			if (!forceUpdate && time - this.openOrdersLastUpdated < 1000)
			{
				dfd.resolve([])
			}
			else
			{
				var assetInfo = IDEX.nxtae.assets.getAsset("assetID", market.base.assetID);
				var decimals = assetInfo.decimals;
				var params = {}
				params.requestType = "getAccountCurrentBidOrders";
				params.account = openOrdersHandler.nxtAE.nxtRS;
				params.asset = market.base.assetID;
				
				IDEX.sendPost(params, true).then(function(bidOrders)
				{
					bidOrders = bidOrders.bidOrders;
					
					params = {}
					params.requestType = "getAccountCurrentAskOrders";
					params.account = openOrdersHandler.nxtAE.nxtRS;
					params.asset = market.base.assetID;

				
					IDEX.sendPost(params, true).done(function(askOrders)
					{
						askOrders = askOrders.askOrders;
						
						var allOpenOrders = bidOrders.concat(askOrders);
						var temp = [];
						var formattedOpenOrders = [];
						
						for (var i = 0; i < allOpenOrders.length; i++)
						{
							var openOrder = allOpenOrders[i];
							
							var formattedOpenOrder = {};
							
							//var timestamp = IDEX.convertNXTTime(openOrder.timestamp);
							var price = openOrder.priceNQT / Math.pow(10, 8);
							var amount = openOrder.quantityQNT / Math.pow(10, decimals);
							var exchange = "nxtae";
							
							//formattedOpenOrder.timestamp = timestamp;
							formattedOpenOrder.price = price;
							formattedOpenOrder.amount = amount;
							formattedOpenOrder.exchange = exchange;
							formattedOpenOrder.tradeType = openOrder.type;
							formattedOpenOrder.total = IDEX.toSatoshi(Number(price) * Number(amount));
							formattedOpenOrder.status = "Open";
							formattedOpenOrders.push(formattedOpenOrder);
							
						}

						/*if ("openorders" in data)
						{
							data = data.openorders;
							
							for (var i = 0; i < data.length; i++)
								if (data[i].baseid == IDEX.user.curBase.assetID && data[i].relid == IDEX.user.curRel.assetID)
									temp.push(data[i]);
						}
						else
						{
							data = [];
						}*/
						openOrdersHandler.openOrders[market.marketName] = formattedOpenOrders;
						dfd.resolve(formattedOpenOrders);
					})
				})
			}
			
			
			openOrdersHandler.openOrdersLastUpdated = time;
			
			return dfd.promise();
		}

	}
	
	
	
	var AccountTrades = NxtAE.AccountTrades = function()
	{
		this.init.apply(this, arguments)
	}
	
	AccountTrades.prototype = 
	{
		
		init: function(nxtAE)
		{
			var tradesHandler = this;
			
			tradesHandler.tradeHistoryLastUpdated = new Date().getTime();

			tradesHandler.nxtAE = nxtAE;
			tradesHandler.trades = {};
		},
		
		updateTrades: function(market, forceUpdate)
		{
			var tradesHandler = this;
			var dfd = new $.Deferred();
			var time = new Date().getTime()

			var params = {}
			params.requestType = "getTrades";
			params.account = tradesHandler.nxtAE.nxtRS;

			if (market)
				params.asset = market.base.assetID;

			params.lastIndex = 50;
			console.log(params);
			
			if (!forceUpdate && time - this.tradeHistoryLastUpdated < 1000)
			{
				dfd.resolve()
			}
			else
			{
				IDEX.sendPost(params, true).then(function(data)
				{
					var trades = data.trades;
					
					var formattedTrades = [];
					
					for (var i = 0; i < trades.length; i++)
					{
						var trade = trades[i];
						var formattedTrade = {};
						
						var timestamp = IDEX.convertNXTTime(trade.timestamp);
						var price = trade.priceNQT / Math.pow(10, 8);
						var amount = trade.quantityQNT / Math.pow(10, trade.decimals);
						var exchange = "nxtae";
						
						formattedTrade.timestamp = timestamp;
						formattedTrade.price = price;
						formattedTrade.amount = amount;
						formattedTrade.exchange = exchange;
						formattedTrade.tradeType = trade.tradeType;
						formattedTrade.total = IDEX.toSatoshi(Number(price) * Number(amount));

						formattedTrades.push(formattedTrade);
					}
					
					tradesHandler.trades[market.marketName] = formattedTrades;
					
					dfd.resolve(formattedTrades);
				})
			}
			
			
			tradesHandler.tradeHistoryLastUpdated = time;
			
			return dfd.promise();
		},
	}
	
	
	
	var MarketTrades = NxtAE.MarketTrades = function()
	{
		this.init.apply(this, arguments)
	}
	
	
	MarketTrades.prototype = 
	{
		
		init: function(nxtAE)
		{
			var tradesHandler = this;
			
			tradesHandler.nxtAE = nxtAE;
			tradesHandler.trades = {};
			tradesHandler.marketHistoryLastUpdated = new Date().getTime();

		},
		

		
		getMarketTrades: function(market, forceUpdate)
		{
			var tradesHandler = this;
			var dfd = new $.Deferred();
			var time = new Date().getTime()

			var params = {}
			params.requestType = "getTrades";
			params.asset = market.base.assetID;
			var assetInfo = IDEX.nxtae.assets.getAsset("assetID", market.base.assetID);
			var totalNumTrades = assetInfo.numberOfTrades;
			
			var firstIndex = totalNumTrades - 50 || 0
			params.lastIndex = 50;
			console.log(params);
			
			if (!forceUpdate && time - this.marketHistoryLastUpdated < 1000)
			{
				dfd.resolve()
			}
			else
			{
				IDEX.sendPost(params, true).then(function(data)
				{
					var trades = data.trades;
					
					var formattedTrades = [];
					
					for (var i = 0; i < trades.length; i++)
					{
						var trade = trades[i];
						var formattedTrade = {};
						
						var timestamp = IDEX.convertNXTTime(trade.timestamp);
						var price = trade.priceNQT / Math.pow(10, 8);
						var amount = trade.quantityQNT / Math.pow(10, trade.decimals);
						var exchange = "nxtae";
						
						formattedTrade.timestamp = timestamp;
						formattedTrade.price = price;
						formattedTrade.amount = amount;
						formattedTrade.exchange = exchange;
						formattedTrade.tradeType = trade.tradeType;
						
						formattedTrades.push(formattedTrade);
					}
					
					tradesHandler.trades[market.marketName] = formattedTrades;
					
					dfd.resolve(formattedTrades);
				})
			}
			
			
			tradesHandler.marketHistoryLastUpdated = time;
			
			return dfd.promise();
		},
		
		
		getTrades: function()
		{
			var dfd = new $.Deferred();
			var allAssets = IDEX.user.allAssets;
			var oneWeek = 604800;

			
			var currentTime = Date.now();
			var nxtCurrentTime = convertToNxtTime(currentTime);
			var pastTime = nxtCurrentTime - oneWeek;
			
			//console.log(currentTime) currentTime - GENESIS_TIMESTAMP

			var params = {}
			params.requestType = "getAllTrades";
			params.timestamp = pastTime;
			
			
			var assetsWithVol = {};
			
			IDEX.sendPost(params, true).then(function(data)
			{
				var allTrades = data.trades;
				
				for (var i = 0; i < allTrades.length; i++)
				{
					var trade = allTrades[i];
					var tradeAssetID = trade.asset;
					
					var tradeAsset = IDEX.nxtae.assets.getAsset("assetID", tradeAssetID);
					
					var obj = {};
					obj.assetID = tradeAssetID;
					obj.price = trade.priceNQT;
					obj.quantityAsset = trade.quantityQNT;
					obj.quantityNXT = obj.price * obj.quantityAsset
					
					if (!(tradeAssetID in assetsWithVol))
					{
						assetsWithVol[tradeAssetID] = obj;
					}
					else
					{
						assetsWithVol[tradeAssetID].quantityNXT += obj.quantityNXT;
					}
					
				}
				
				var list = [];
				for (assetID in assetsWithVol)
				{
					list.push(assetsWithVol[assetID])
				}
				//console.log(data);
				console.log(list);
				dfd.resolve(list);
			
			})
			
			return dfd.promise();
		},

	}

	
	
	
	function addAssetID(assets)
	{
		for (var i = 0; i < assets.length; i++)
			for (key in assets[i])
				if (key == "asset")
					assets[i]['assetID'] = assets[i][key];
				
		return assets;
	}
	
	
	
	
	/*
	IDEX.Account.prototype.stopPollingOpenOrders = function()
	{
		
	}
	
	
	IDEX.Account.prototype.refreshOpenOrdersPoll = function()
	{
		
	}
	
	
	IDEX.Account.prototype.setTimeout = function(timeout)
	{
		this.timeoutDFD = new $.Deferred();
		var account = this;

		this.openOrdersTimeout = setTimeout(function() 
		{
			account.timeoutDFD.resolve(false);
			account.timeoutDFD = false;
			
		}, timeout)
		
		return this.timeoutDFD.promise();
	}
	
	
	IDEX.Account.prototype.clearTimeout = function()
	{
		if (this.timeoutDFD)
		{
			clearTimeout(this.openOrdersTimeout);
			this.timeoutDFD.resolve(true);
			this.timeoutDFD = false;
		}
	}
	*/
	

	



	return IDEX;
	
	
}(IDEX || {}, jQuery));

	