

var IDEX = (function(IDEX, $, undefined)
{

	IDEX.Account.prototype.setNXTRS = function(nxtIDAndRS)
	{
		this.nxtID = "";
		this.nxtRS = "";
		
		if (nxtIDAndRS.length == 1)
		{
			
		}
		else if (nxtIDAndRS.length == 2)
		{
			this.nxtID = nxtIDAndRS[0];
			this.nxtRS = nxtIDAndRS[1];
		}
	}

	
	IDEX.Account.prototype.updateNXTRS = function()
	{
		var dfd = new $.Deferred();
		var nxtIDAndRS = [];
		var account = this;
		var params = {"requestType":"openorders"};
		
		IDEX.sendPost(params).then(function(data)
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
		})
		
		return dfd.promise()
	}


	IDEX.Account.prototype.getBalance = function(assetID)
	{
		var balance = {};

		if (assetID in this.balances)
			balance = this.balances[assetID];
			
		return balance;
	}

	
	IDEX.Account.prototype.setBalances = function(balances)
	{
		for (var i = 0; i < balances.length; i++)
		{
			var balance = new IDEX.Balance(balances[i]);
			this.balances[balance.assetID] = balance;
		}
	}
	

	IDEX.Account.prototype.checkBalance = function(assetID, amount)
	{
		var retBool = false;

		if (assetID in this.balances && Number(this.balances[assetID].unconfirmedBalance) >= amount)
			retBool = true;
			
		return retBool;
	}
	

	IDEX.Account.prototype.updateBalances = function()
	{
		this.balances = {};
		
		var balances = [];
		var dfd = new $.Deferred();
		var account = this;
		//var postObj = {'requestType':"getAccount",'account':IDEX.account.nxtID, 'includeAssets':true};
		var postObj = {'requestType':"getAccountAssets",'account':account.nxtID};
		
		IDEX.sendPost(postObj, 1).then(function(data)
		{
			if (!("errorCode" in data) && ("accountAssets" in data))
				balances = data['accountAssets'];
				
			IDEX.sendPost({'requestType':"getBalance", 'account':account.nxtID}, 1).then(function(nxtBal)
			{
				if (!("errorCode" in nxtBal))
				{
					nxtBal['assetID'] = IDEX.snAssets['nxt']['assetID'];
					balances.push(nxtBal);
				}
				
				balances = addAssetID(balances);
				account.setBalances(balances);
				dfd.resolve();
			})
		})
		
		return dfd.promise();
	}
	
	
	IDEX.Account.prototype.updateOpenOrders = function()
	{
		var dfd = new $.Deferred();
		var params = {"requestType":"openorders"};
		var account = this;
		
		IDEX.sendPost(params).then(function(data)
		{
			var temp = [];

			if ("openorders" in data)
			{
				data = data.openorders;
				
				for (var i = 0; i < data.length; i++)
					if (data[i].baseid == IDEX.user.curBase.assetID && data[i].relid == IDEX.user.curRel.assetID)
						temp.push(data[i]);
			}
			else
			{
				data = [];
			}
			
			account.openOrders = data;
			account.marketOpenOrders = temp;
			dfd.resolve();
		})
		
		return dfd.promise();
	}
	
	
	IDEX.Account.prototype.pollOpenOrders = function(timeout)
	{
		var account = this;
		timeout = typeof timeout === "undefined" ? 1 : timeout;

		this.setTimeout(timeout).done(function(a)
		{
			IDEX.makeTable("marketOpenOrdersTable", function()
			{
				timeout = 4000;
				account.pollOpenOrders(timeout);
			});
		})
	}
	
	
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
	
	
	function addAssetID(assets)
	{
		for (var i = 0; i < assets.length; i++)
			for (key in assets[i])
				if (key == "asset")
					assets[i]['assetID'] = assets[i][key];
				
		return assets;
	}
	
	
	
	return IDEX;
	
	
}(IDEX || {}, jQuery));