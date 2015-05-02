

var IDEX = (function(IDEX, $, undefined) 
{
	var snURL = "http://127.0.0.1:7777";
	var nxtURL = "http://127.0.0.1:7876/nxt?";

	IDEX.sendPost = function(params, isNXT, callback) 
	{
		var dfd = new $.Deferred();
		var url = isNXT ? nxtURL : snURL;
		params = isNXT ? params : JSON.stringify(params);
		var ajaxSettings = {
			type: "POST",
			url: url,
			data: params,
		};
		
		var xhr = $.ajax(ajaxSettings);
		
		xhr.done(function(data)
		{
			data = $.parseJSON(data);
			//console.log(params)
			//console.log(JSON.stringify(data))
			dfd.resolve(data);
			if (callback)
				callback(data);
		})
		
		xhr.fail(function(data)
		{
			if (data.statusText == "abort")
			{
				data = "abort";
			}
			else
			{
				var name = isNXT ? "NXT" : "SuperNET";
				var message = "Could not connect to " + name;
				$.growl.error({'message':message, 'location':"tl"});
			}


			//console.log(params);
			//console.log(data);
			
			dfd.reject(data);
			if (callback)
				callback("fail");
		})
		
		
		if (callback)
			return xhr;
		else
			return dfd.promise();
	}


	return IDEX;
	
	
}(IDEX || {}, jQuery));