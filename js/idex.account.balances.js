

var IDEX = (function(IDEX, $, undefined)
{
	

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
	

	IDEX.Account.prototype.updateBalances = function(forceUpdate)
	{
		//this.balances = {};
		
		var balances = [];
		var dfd = new $.Deferred();
		var account = this;
		var time = new Date().getTime()

		if (!forceUpdate && time - this.balancesLastUpdated < 1000)
		{
			dfd.resolve()
		}
		else
		{
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
					account.balances = {};
					account.setBalances(balances);
					dfd.resolve();
				})
			})
		}
		
		this.balancesLastUpdated = time;
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


	