

var IDEX = (function(IDEX, $, undefined)
{
    IDEX.isWindows = false;
	IDEX.account;
	IDEX.user;

	IDEX.snPostParams = 
	{
		'orderbook':["baseid","relid","allfields"],
		'allorderbooks':[],
		'placebid':["baseid","relid","price","volume"],
		'placeask':["baseid","relid","price","volume"],
		'openorders':[],
		'tradehistory':["timestamp"],
		'cancelorder':["quoteid"],
		'makeoffer3':["baseid","relid","quoteid","askoffer","price","volume","exchange","baseamount","relamount","baseiQ","reliQ","minperc","jumpasset","offerNXT"]
	};

	
	
	IDEX.Order = function(obj) 
	{
		IDEX.constructFromObject(this, obj);
	};
	

	

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
	
	
	IDEX.Balance = function(constructorObj) 
	{
		this.availableBalance = 0;
		this.unconfirmedBalance = 0;
		
		var __construct = function(that, constructorObj)
		{
			var asset = IDEX.user.getAssetInfo("assetID", constructorObj['assetID']);
			
			if (asset)
			{
				IDEX.constructFromObject(that, asset);
				var avail = that.name == "NXT" ? constructorObj['balanceNQT'] : constructorObj['quantityQNT'];
				var unconf = that.name == "NXT" ? constructorObj['unconfirmedBalanceNQT'] : constructorObj['unconfirmedQuantityQNT'];
				
				that.availableBalance = avail / Math.pow(10, asset.decimals);
				that.unconfirmedBalance = unconf / Math.pow(10, asset.decimals);				
			}
			
		}(this, constructorObj)
	};
	

	IDEX.Account = function(obj)
	{
		this.nxtRS = "";
		this.nxtID = "";
		this.balances = {};
		this.openOrders = [];
		this.timeoutDFD = false;
		this.openOrdersTimeout;
		this.openOrdersLastUpdated = 0;
		this.balancesLastUpdated = 0;

		IDEX.constructFromObject(this, obj);
	};
	
	
	IDEX.OpenOrder = function(obj)
	{
		IDEX.constructFromObject(this, obj);
	}
	
	

	IDEX.User = function(obj)
	{
		this.allAssets = [];
		this.labels = [];
		this.options = {};
		this.favorites = {};
		
		this.curBase = {};
		this.curRel = {};
		this.pendingOrder = {};
		
		IDEX.constructFromObject(this, obj);
	}
	

	IDEX.init = function()
	{
		IDEX.isWindows = window.jscd.os == "Windows";

		var initializedAssets = new $.Deferred();
		var timeoutFinished = new $.Deferred();
		var updatedNXT = new $.Deferred();

		IDEX.user = new IDEX.User();
		IDEX.account = new IDEX.Account();
		
		IDEX.initScrollbar();
		//IDEX.initDataTable();
		
		IDEX.user.initFavorites();
		IDEX.user.initLabels();

		
		IDEX.user.options = 
		{
			"duration":6000,
			"minperc":75
		}
	
		//var $node = $("#marketSearch_popup");
		
		//console.log(Sleuthcharts);
		//var s = IDEX.makeChart({"node":$node});
		//console.log(Sleuthcharts);

		//console.log($node.sleuthcharts())
		//console.log(Highcharts)
		//console.log(s)		
		
		IDEX.pingSupernet().done(function()
		{	
			IDEX.initTimer().done(function()
			{
				timeoutFinished.resolve();
			})
			
			
			IDEX.account.updateNXTRS().done(function(nxtRSID)
			{
				//console.log(nxtRSID)
				updatedNXT.resolve();
			});
			
			
			IDEX.user.initAllAssets().done(function()
			{
				IDEX.initAutocomplete();
				
				IDEX.getSkynet().done(function(data)
				{
					initializedAssets.resolve()
				})
			});
			
			
			$.when(timeoutFinished, initializedAssets, updatedNXT).done(function()
			{
				IDEX.hideLoading();
			})
			
					
			
		}).fail(function()
		{
			IDEX.editLoading("Could not connect to SuperNET. Start SuperNET and reload.")
		})
	}
	
	
	IDEX.initTimer = function()
	{
		var timeoutDFD = new $.Deferred();
		
		var timeout = setTimeout(function() 
		{
			timeoutDFD.resolve()
		}, 1000)
		
		return timeoutDFD.promise();
	}
	
	
	IDEX.pingSupernet = function()
	{
		var dfd = new $.Deferred();
		var params = {"requestType":"getState"};
		
		IDEX.sendPost(params, true).done(function()
		{
			dfd.resolve()
			
		}).fail(function()
		{
			dfd.reject()
		})
		
		return dfd.promise()
	}
	


	return IDEX;
		

}(IDEX || {}, jQuery));



/**
 * JavaScript Client Detection
 * (C) viazenetti GmbH (Christian Ludwig)
 */
(function (window) {
    {
        var unknown = '-';

        // screen
        var screenSize = '';
        if (screen.width) {
            width = (screen.width) ? screen.width : '';
            height = (screen.height) ? screen.height : '';
            screenSize += '' + width + " x " + height;
        }

        //browser
        var nVer = navigator.appVersion;
        var nAgt = navigator.userAgent;
        var browser = navigator.appName;
        var version = '' + parseFloat(navigator.appVersion);
        var majorVersion = parseInt(navigator.appVersion, 10);
        var nameOffset, verOffset, ix;

        // Opera
        if ((verOffset = nAgt.indexOf('Opera')) != -1) {
            browser = 'Opera';
            version = nAgt.substring(verOffset + 6);
            if ((verOffset = nAgt.indexOf('Version')) != -1) {
                version = nAgt.substring(verOffset + 8);
            }
        }
        // MSIE
        else if ((verOffset = nAgt.indexOf('MSIE')) != -1) {
            browser = 'Microsoft Internet Explorer';
            version = nAgt.substring(verOffset + 5);
        }
        // Chrome
        else if ((verOffset = nAgt.indexOf('Chrome')) != -1) {
            browser = 'Chrome';
            version = nAgt.substring(verOffset + 7);
        }
        // Safari
        else if ((verOffset = nAgt.indexOf('Safari')) != -1) {
            browser = 'Safari';
            version = nAgt.substring(verOffset + 7);
            if ((verOffset = nAgt.indexOf('Version')) != -1) {
                version = nAgt.substring(verOffset + 8);
            }
        }
        // Firefox
        else if ((verOffset = nAgt.indexOf('Firefox')) != -1) {
            browser = 'Firefox';
            version = nAgt.substring(verOffset + 8);
        }
        // MSIE 11+
        else if (nAgt.indexOf('Trident/') != -1) {
            browser = 'Microsoft Internet Explorer';
            version = nAgt.substring(nAgt.indexOf('rv:') + 3);
        }
        // Other browsers
        else if ((nameOffset = nAgt.lastIndexOf(' ') + 1) < (verOffset = nAgt.lastIndexOf('/'))) {
            browser = nAgt.substring(nameOffset, verOffset);
            version = nAgt.substring(verOffset + 1);
            if (browser.toLowerCase() == browser.toUpperCase()) {
                browser = navigator.appName;
            }
        }
        // trim the version string
        if ((ix = version.indexOf(';')) != -1) version = version.substring(0, ix);
        if ((ix = version.indexOf(' ')) != -1) version = version.substring(0, ix);
        if ((ix = version.indexOf(')')) != -1) version = version.substring(0, ix);

        majorVersion = parseInt('' + version, 10);
        if (isNaN(majorVersion)) {
            version = '' + parseFloat(navigator.appVersion);
            majorVersion = parseInt(navigator.appVersion, 10);
        }

        // mobile version
        var mobile = /Mobile|mini|Fennec|Android|iP(ad|od|hone)/.test(nVer);

        // cookie
        var cookieEnabled = (navigator.cookieEnabled) ? true : false;

        if (typeof navigator.cookieEnabled == 'undefined' && !cookieEnabled) {
            document.cookie = 'testcookie';
            cookieEnabled = (document.cookie.indexOf('testcookie') != -1) ? true : false;
        }

        // system
        var os = unknown;
        var clientStrings = [
            {s:'Windows 10', r:/(Windows 10.0|Windows NT 10.0)/},
            {s:'Windows 8.1', r:/(Windows 8.1|Windows NT 6.3)/},
            {s:'Windows 8', r:/(Windows 8|Windows NT 6.2)/},
            {s:'Windows 7', r:/(Windows 7|Windows NT 6.1)/},
            {s:'Windows Vista', r:/Windows NT 6.0/},
            {s:'Windows Server 2003', r:/Windows NT 5.2/},
            {s:'Windows XP', r:/(Windows NT 5.1|Windows XP)/},
            {s:'Windows 2000', r:/(Windows NT 5.0|Windows 2000)/},
            {s:'Windows ME', r:/(Win 9x 4.90|Windows ME)/},
            {s:'Windows 98', r:/(Windows 98|Win98)/},
            {s:'Windows 95', r:/(Windows 95|Win95|Windows_95)/},
            {s:'Windows NT 4.0', r:/(Windows NT 4.0|WinNT4.0|WinNT|Windows NT)/},
            {s:'Windows CE', r:/Windows CE/},
            {s:'Windows 3.11', r:/Win16/},
            {s:'Android', r:/Android/},
            {s:'Open BSD', r:/OpenBSD/},
            {s:'Sun OS', r:/SunOS/},
            {s:'Linux', r:/(Linux|X11)/},
            {s:'iOS', r:/(iPhone|iPad|iPod)/},
            {s:'Mac OS X', r:/Mac OS X/},
            {s:'Mac OS', r:/(MacPPC|MacIntel|Mac_PowerPC|Macintosh)/},
            {s:'QNX', r:/QNX/},
            {s:'UNIX', r:/UNIX/},
            {s:'BeOS', r:/BeOS/},
            {s:'OS/2', r:/OS\/2/},
            {s:'Search Bot', r:/(nuhk|Googlebot|Yammybot|Openbot|Slurp|MSNBot|Ask Jeeves\/Teoma|ia_archiver)/}
        ];
        for (var id in clientStrings) {
            var cs = clientStrings[id];
            if (cs.r.test(nAgt)) {
                os = cs.s;
                break;
            }
        }

        var osVersion = unknown;

        if (/Windows/.test(os)) {
            osVersion = /Windows (.*)/.exec(os)[1];
            os = 'Windows';
        }

        switch (os) {
            case 'Mac OS X':
                osVersion = /Mac OS X (10[\.\_\d]+)/.exec(nAgt)[1];
                break;

            case 'Android':
                osVersion = /Android ([\.\_\d]+)/.exec(nAgt)[1];
                break;

            case 'iOS':
                osVersion = /OS (\d+)_(\d+)_?(\d+)?/.exec(nVer);
                osVersion = osVersion[1] + '.' + osVersion[2] + '.' + (osVersion[3] | 0);
                break;
        }

        // flash (you'll need to include swfobject)
        /* script src="//ajax.googleapis.com/ajax/libs/swfobject/2.2/swfobject.js" */
        var flashVersion = 'no check';
        if (typeof swfobject != 'undefined') {
            var fv = swfobject.getFlashPlayerVersion();
            if (fv.major > 0) {
                flashVersion = fv.major + '.' + fv.minor + ' r' + fv.release;
            }
            else  {
                flashVersion = unknown;
            }
        }
    }

    window.jscd = {
        screen: screenSize,
        browser: browser,
        browserVersion: version,
        mobile: mobile,
        os: os,
        osVersion: osVersion,
        cookies: cookieEnabled,
        flashVersion: flashVersion
    };
}(this));


$(window).load(function()
{
	IDEX.init();
})