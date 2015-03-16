var buttonTheme =  
{
	height:10,
	style:
	{
		color:"silver",
	},
	fill:"black",
    'stroke-width': 1,
    'stroke-opacity': 0.7,
    stroke: 'silver',
    r: 0,
    states: 
	{
        hover: 
		{
    		'stroke-width': 1,
    		stroke: 'silver',
            fill: '#424242'
        },
        select: 
		{
    		'stroke-width': 1,
    		stroke: 'silver',
            fill: '#424242'
        }
    }
}

Highcharts.theme = {
            
            
      
            
			global: 
			{
				useUTC: false
			},
			
            chart:
            {
                backgroundColor: '#000',
                borderColor: '#424242',
                borderWidth: 1,
                //plotBorderWidth: 1,
            },

            navigator:
            {
				height:30,
				handles: 
				{
					backgroundColor: '#666',
					borderColor: '#AAA'
				},
            },
	
		    exporting: 
			{
				enabled:true,
		        buttons: 
				{
				//enabled:true,
		            contextButton: 
					{
						enabled:false,
					},
		            a: 
					{
						y:-2,
						x:-105,
						align:"right",
				        theme:buttonTheme,
						symbol:null,
						menuItems:null,
						enabled:true,
						text:"15m",
		            },
		            b: 
					{
						align:"right",
						y:-2,
						x:-70,
				        theme:buttonTheme,
						symbol:null,
						menuItems:null,
						enabled:true,
						text:"5m",
		            },
		            c: 
					{
						align:"right",
						y:-2,
						x:-35,
				        theme:buttonTheme,
						symbol:null,
						menuItems:null,
						enabled:true,
						text:"3m",
		            },
		            d: 
					{
						align:"right",
						y:-2,
						x:0,
				        theme:buttonTheme,
						symbol:null,
						menuItems:null,
						enabled:true,
						text:"1m",
		            },
		        }
		    },

            yAxis: 
            {
                lineWidth: 0,
                gridLineWidth:0,
                tickWidth:0.4,
            }, 
            
            xAxis:
            {
                lineWidth:0,
                gridLineWidth:0,
                tickWidth:1,
            },
            
            plotOptions: 
            {
                candlestick:
                {
                    color: '#a80808',
                    lineColor:'#d00',
                    upLineColor: '#0c0', 
                    upColor: '#0c0',
					fillColor:"black",
                    //pointRange: 10,
                }, 
                column:
                {
					//borderRadius:1,
                },
                series:
                {
					//events:{mouseOut:destroyChartRenders, mouseOver:buildChartRenders},
					//grouping:false,
					///oxymoronic:false,
                    //stickyTracking:false,
                	//enableMouseTracking: false,
                    //groupPadding: 0.1,
                	minPointLength:0.1,
                    pointPadding: 0.1,
                    //pointRange: 60*1000,
                    		//			borderRadius:0,
					lineWidth: 1,
					animation:false,
                }
            },   
        }
