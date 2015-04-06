/**
 * modalEffects.js v1.0.0
 * http://www.codrops.com
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 * 
 * Copyright 2013, Codrops
 * http://www.codrops.com
 */
var ModalEffects = (function() {
	
	function init() {

		var overlay = document.querySelector( '.md-overlay' ),
			overlayFull = document.querySelector( '.md-overlayfull' );

		[].slice.call( document.querySelectorAll( '.md-trigger' ) ).forEach( function( el, i ) {

			var modal = document.querySelector( '#' + el.getAttribute( 'data-modal' ) ),
				close = modal.querySelector( '.md-close' ),
				head = $('.md-head');
			
			function removeModal( hasPerspective ) {
				classie.remove( modal, 'md-show' );
				setTimeout(function(){$(modal).trigger("idexHide")}, 300)
				if( hasPerspective ) {
					classie.remove( document.documentElement, 'md-perspective' );
				}
				
				$(".cd-3d-nav li").removeClass('cd-selected');
				$(".cd-3d-nav li:first").addClass('cd-selected');
				$(".cd-marker").css('left',0);
                
                $(".chart-number").removeClass("show");
			}

			function removeModalHandler() {
				removeModal( classie.has( el, 'md-setperspective' ) ); 
			}

			el.addEventListener( 'click', function( ev ) {
				classie.add( modal, 'md-show' );
				$(modal).trigger("idexShow")
				overlay.removeEventListener( 'click', removeModalHandler );
				overlay.addEventListener( 'click', removeModalHandler );
				
				//var windowHeight = $(window).innerHeight();
				//$('.md-content').css('height', (windowHeight - 140)+'px');

				if( classie.has( el, 'md-setperspective' ) ) {
					setTimeout( function() {
						classie.add( document.documentElement, 'md-perspective' );
					}, 25 );
				}
                
                if( classie.has( modal, 'md-chart' ) ) {
                    $(".chart-number").addClass("show");
                }
			});
			
			if (close) {
				close.addEventListener( 'click', function( ev ) {
					ev.stopPropagation();
					removeModalHandler();
				});
			}

		} );

	}

	init();

})();
