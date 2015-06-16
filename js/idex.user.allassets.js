	

var IDEX = (function(IDEX, $, undefined) 
{
	
	IDEX.snAssets = 
	{
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
			var firstIndex = 1;
			var lastIndex = 99;
			

			getAssetsLoop([], 0, 99, function(assets)
			{

				assets = parseAllAssets(assets);
				localStorage.setItem('allAssets', JSON.stringify(assets));
				console.log(assets.length)
				dfd.resolve(assets);
			})
		}
		
		
		dfd.done(function(assets)
		{
			assets.sort(IDEX.compareProp('name'));
			user.allAssets = assets;
			retdfd.resolve(assets);
		})
		
		return retdfd.promise();
	}
	
	
	function getAssetsLoop(assets, firstIndex, lastIndex, callback)
	{
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
					getAssetsLoop(addedAssets, firstIndex+100, lastIndex+100, callback)
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