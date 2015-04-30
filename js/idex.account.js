

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
		
		$(".option-nxtrs").val(this.nxtRS);
	}

	
	IDEX.Account.prototype.updateNXTRS = function()
	{
		var dfd = new $.Deferred();
		var nxtIDAndRS = [];
		var account = this;
		
		IDEX.sendPost({'requestType':"getpeers"}).then(function(data)
		{
			if ('peers' in data && data['peers'].length)
			{
				var index = data['peers'].length == 1 ? 0 : 1;
				nxtIDAndRS.push(data['peers'][index]['srvNXT']);
				nxtIDAndRS.push(data['peers'][index]['RS']);
			}
			
			account.setNXTRS(nxtIDAndRS)
		})
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