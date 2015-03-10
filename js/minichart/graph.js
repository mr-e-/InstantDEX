;( function( d3 ) {
    var data = [
        {
          date  : 'September 15',
          value : 515,
          type  : 'Music'
        },
        {
          date  : 'September 16',
          value : 618,
          type  : 'Music'
        },
        {
          date  : 'September 17',
          value : 498,
          type  : 'Music'
        },
        {
          date  : 'September 18',
          value : 1243,
          type  : 'Music'
        },
        {
          date  : 'September 19',
          value : 1033,
          type  : 'Music'
        },
        {
          date  : 'September 15',
          value : 135,
          type  : 'Photos'
        },
        {
          date  : 'September 16',
          value : 218,
          type  : 'Photos'
        },
        {
          date  : 'September 17',
          value : 798,
          type  : 'Photos'
        },
        {
          date  : 'September 18',
          value : 643,
          type  : 'Photos'
        },
        {
          date  : 'September 19',
          value : 533,
          type  : 'Photos'
        },
        {
          date  : 'September 15',
          value : 846,
          type  : 'Files'
        },
        {
          date  : 'September 16',
          value : 218,
          type  : 'Files'
        },
        {
          date  : 'September 17',
          value : 428,
          type  : 'Files'
        },
        {
          date  : 'September 18',
          value : 843,
          type  : 'Files'
        },
        {
          date  : 'September 19',
          value : 333,
          type  : 'Files'
        }
    ];
    
    /**
     * Function to kick off drawing
     * the timeline graphic
     */
    function visualizeDownloadTimeline( selector, data ) {
        var d3container = d3.select( selector ),
            width       = d3container.attr( 'width' ),
            height      = d3container.attr( 'height' ),
            margin      = { top : 5, right : 0, bottom : 30, left : 0 },
            svg         = d3container.append( 'svg' )
                                      .attr( 'height', height )
                                      .attr( 'width', width ),
        
            x     = d3.scale.ordinal()
                            .rangeRoundBands( [ 0, width ] )
                            .domain(
                              data.map( function( d ) { return d.date; } )
                            ),
            xAxis = d3.svg.axis().scale( x ).orient( 'bottom' ),
            
            y     = d3.scale.linear()
                            .range( [ height - margin.bottom * 1.5, margin.top ] )
                            .domain(
                              [ 0, d3.max( data, function( d ) { return d.value; } ) ]
                            ),
            yAxis = d3.svg.axis().scale( y ).orient( 'left' ),
            
            xAxisGroup,
            yAxisGroup,
            
            // animation stuff,
            duration = 3000;
        
        xAxisGroup = svg.append( 'g' )
                        .attr( 'class', 'x axis' )
                        .attr( 'transform', 'translate( 0,' + ( height - margin.bottom ) + ')' )
                        .transition()
                        .call( xAxis );
        
        // filter stuff
        /* For the drop shadow filter... */
        var defs = svg.append( 'defs' );
    
        var filter = defs.append( 'filter' )
                          .attr( 'id', 'dropshadowArea' )
    
        filter.append( 'feGaussianBlur' )
              .attr( 'in', 'SourceAlpha' )
              .attr( 'stdDeviation', 3 )
              .attr( 'result', 'blur' );
        filter.append( 'feOffset' )
              .attr( 'in', 'blur' )
              .attr( 'dx', 2 )
              .attr( 'dy', 2 )
              .attr( 'result', 'offsetBlur' );
    
        var feMerge = filter.append( 'feMerge' );
    
        feMerge.append( 'feMergeNode' )
                .attr( 'in", "offsetBlur' )
        feMerge.append( 'feMergeNode' )
                .attr( 'in', 'SourceGraphic' );
        // end filter stuff
        
        drawArea(
          svg,
          data.filter(
            function( datum ) { return datum.type === 'Music'; }
          ),
          'red',
          1
        );
        
        drawArea(
          svg,
          data.filter(
            function( datum ) { return datum.type === 'Photos'; }
          ),
          'purple',
          2
        );
        
        drawArea(
          svg,
          data.filter(
            function( datum ) { return datum.type === 'Files'; }
          ),
          'cyan',
          3
        );
        
        function drawArea( svg, data, className, index ) {
          var area = d3.svg.area()
                            .x( function( d ) { return x( d.date ) + x.rangeBand() / 2 ; } )
                            .y0( height - margin.bottom * 1.5 )
                            .y1( function( d ) { return y( d.value ); } )
                            .interpolate( 'cardinal' ),
              startData = [];
          
          // if you know a better way please tell me. ;)
          // js deep "copy"
          data.forEach( function( datum ) {
            startData.push( { date : datum.date, value : 0 } );
          } );
          
          svg.append( 'path' )
              .datum( startData )
              .attr( 'class', 'ui__timeline__area ' + className )
              .attr( 'd', area )
              .attr( 'filter', 'url(#dropshadowArea)' )
              .transition()
              .delay( 1000 * index )   
              .duration( duration )
              .attrTween( 'd', tweenArea( data ) );
          
          
          // Helper functions!!!
          function tweenArea( b ) {
            return function( a ) {
              var i = d3.interpolateArray( a, b );          
              a.forEach( function( datum, index ) {
                a[ index ] = b[ index ]
              } );
    
              return function( t ) {
                return area( i ( t ) );
              };
            };
          }
        }
    }
  
    function ಠ_ಠ() {
      visualizeDownloadTimeline( '.ui__timeline', data );
    }
    
    // yeah, let's kick things off!!!
    //ಠ_ಠ();
} )( d3 );
