

var IDEX = (function(IDEX, $, undefined) 
{
	var windowsServerUsername = "user";
	var windowsServerPassword = "pass";
	var windowsServerAuth = btoa (windowsServerUsername + ":" + windowsServerPassword);
	
	var nxtURL = "http://127.0.0.1:7777/nxt?";
	var snURL = "http://127.0.0.1:7777/InstantDEX?";
	
	var lastTime = new Date().getTime()
	var q = []

    
    var windowsURL = "http://127.0.0.1:12345";
    var idCounter = 1;
	
	
	IDEX.sendPost = function(params, isNXT, callback) 
	{
		var dfd = new $.Deferred();
		var url = isNXT ? nxtURL : snURL;

		var time = new Date().getTime()
		lastTime = time
		var waitTime = 0;

		if (time - lastTime < 300)
			waitTime = 300 + (q.length * 300)
						
		
		//params = isNXT ? params : JSON.
		
		if (!isNXT)
			params['plugin'] = "InstantDEX";
        else
            params['plugin'] = "nxt";
            
		
		
        if (IDEX.isWindows)
        {
            url = windowsURL;
            var a = {};
            a.method = "sendPost"
            a.id = idCounter++;
            a.params = params
            a = JSON.stringify(a);
            //console.log(params)
            var ajaxSettings = 
            {
                type: "POST",
                url: url,
                data: a,
                contentType: 'application/json-rpc',
				beforeSend: function (xhr) {
					xhr.setRequestHeader("Authorization", "Basic " + windowsServerAuth);
				},
                //dataType: 'application/json-rpc'
            };
        }
        else
        {
            var ajaxSettings = 
            {
                type: "POST",
                url: url,
                data: params,
                contentType: 'application/x-www-form-urlencoded',
                xhrFields: {
                    withCredentials: true
                },
            };
        }
		
		
		var obj = {}
		obj.ajaxSettings = ajaxSettings;
		obj.callback = callback;
		obj.dfd = dfd;
		obj.params = params;
		q.push(obj)
		
		//var index = q.length - 1;
		//console.log(params)
		
		setTimeout(function()
		{
			var xhr = $.ajax(ajaxSettings);
			
			xhr.done(function(data)
			{
					//console.log(data)

				
                if (IDEX.isWindows)
                {
                    var data = data['result']['retval'];
                    //console.log(typeof data)
                    if (typeof data == "string")
                        data = $.parseJSON(data)
                        
                    //console.log(data)
                    //data = $.parseJSON(retObj);
                }
                else
                {
                    data = $.parseJSON(data);
                }
				
				dfd.resolve(data);
				
				if (callback)
					callback(data);
				q.pop()
				//q.splice(index, 1);
			})
			
			xhr.fail(function(data)
			{
				//console.log(data)
				//$.growl.error({'message':message, 'location':"tl"});

				if (data.statusText == "abort")
				{
					//data = "abort";
				}
				
				dfd.reject(data);
				
				if (callback)
					callback(data);
				
				q.pop()
			})
			
			
		}, waitTime)
		
		return dfd.promise()
	}

	

	
	
	

	return IDEX;
	
	
}(IDEX || {}, jQuery));