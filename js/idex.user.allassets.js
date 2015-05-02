	

var IDEX = (function(IDEX, $, undefined) 
{
	
	IDEX.snAssets = {
		'nxt':{'name':"NXT",'assetID':"5527630", 'decimals':8}
	};
	
	
	IDEX.User.prototype.initAllAssets = function()
	{
		var retdfd = new $.Deferred();
		var dfd = new $.Deferred();
		var user = this;
		
		if (localStorage.allAssets)
		{
			var assets = JSON.parse(localStorage.getItem('allAssets'));
			dfd.resolve(assets);
		}
		else
		{
			IDEX.sendPost({'requestType':"getAllAssets"}, 1).then(function(data)
			{
				var assets = [];
				if ("assets" in data)
				{
					assets = parseAllAssets(data.assets);
					localStorage.setItem('allAssets', JSON.stringify(assets));
				}
				
				dfd.resolve(assets);
			})
		}
		
		
		dfd.done(function(assets)
		{
			assets.sort(IDEX.compareProp('name'));
			user.allAssets = assets;
			retdfd.resolve();
		})
		
		return retdfd.promise();
	}

	
	IDEX.User.prototype.getAssetInfo = function(key, val)
	{
		var arr = [];
		var assetInfo = {};
		var len = this.allAssets.length;
		for (var i = 0; i < len; i++)
		{
			if (this.allAssets[i][key] == val)
			{
				arr.push(this.allAssets[i]);
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
	}
	
	
	function parseAllAssets(assets)
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
		
		parsed.push(IDEX.snAssets['nxt']);
		
		return parsed
	}
	
	
	return IDEX;
	
	
}(IDEX || {}, jQuery));