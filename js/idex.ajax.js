

var IDEX = (function(IDEX, $, undefined) 
{
	var snURL = "http://127.0.0.1:7777";
	var nxtURL = "http://127.0.0.1:7876/nxt?";


	IDEX.sendPost = function(params, isNXT) 
	{
		var dfd = new $.Deferred();
		var url = isNXT ? nxtURL : snURL;
		params = isNXT ? params : JSON.stringify(params);
		
		$.ajax(
		{
		  type: "POST",
		  url: url,
		  data: params,
		  
		}).done(function(data)
		{
			data = $.parseJSON(data);
			//console.log(params)
			//console.log(JSON.stringify(data))
			dfd.resolve(data);
			
		}).fail(function(data)
		{
			var name = isNXT ? "NXT" : "SuperNET";
			var message = "Could not connect to " + name;
			
			$.growl.error({'message':message, 'location':"tl"});

			console.log(params);
			console.log(data);
			
			dfd.reject(data);
		})

		return dfd.promise();
	}


	return IDEX;
	
	
}(IDEX || {}, jQuery));