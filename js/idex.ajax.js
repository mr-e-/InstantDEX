
var IDEX = (function(IDEX, $, undefined) {
	
var snURL = "http://127.0.0.1:7777";
var nxtURL = "http://127.0.0.1:7876/nxt?";

IDEX.snPostParams = {
	'orderbook':["baseid","relid","allfields"],
	'allorderbooks':[],
	'placebid':["baseid","relid","price","volume"],
	'placeask':["baseid","relid","price","volume"],
	'openorders':[],
	'tradehistory':["timestamp"],
	'cancelorder':["quoteid"],
	'makeoffer3':["baseid","relid","quoteid","askoffer","price","volume","exchange","baseamount","relamount","baseiQ","reliQ","minperc","jumpasset"]
};


IDEX.sendPost = function(params, isNXT) 
{
	var dfd = new $.Deferred();
	var url = isNXT ? nxtURL : snURL;
	params = isNXT ? params : JSON.stringify(params);
	$.ajax
	({
	  type: "POST",
	  url: url,
	  data: params,
	  //contentType: 'application/json'
	}).done(function(data)
	{
		data = $.parseJSON(data);
		//console.log(params)
		//console.log(JSON.stringify(data))
		//$.parseJSON(params)['requestType'].toUpperCase() + ":   " + 
		dfd.resolve(data);
		
	}).fail(function(data)
	{
		if (isNXT)
			var message = "Could not connect to NXT"
		else
			var message = "Could not connect to SuperNET"
		$.growl.error({'message':message, 'location':"tl"});

		dfd.reject(data);
	})

	return dfd.promise();
}



	return IDEX;
	
}(IDEX || {}, jQuery));