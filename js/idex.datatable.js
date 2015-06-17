
var IDEX = (function(IDEX, $, undefined)
{
	var dataTableSettings = {
		"scrollX":true,
		"scrollY":0,
		"pagingType":"simple_numbers",
		"pageLength":20,
		"lengthChange":false,
		"info":false
	};
	
	IDEX.initDataTable = function()
	{
		$(".idextable").each(function()
		{
			$(this).DataTable(dataTableSettings)
			/*.on("page.dt draw.dt column-sizing.dt", function() 
			{ 
				adjustDataTableHeight($(this)) 
			})*/
		})
	}
	

	function adjustDataTableHeight($table) 
	{
		if (!($table.closest(".md-modal").hasClass("md-show")) || !($table.closest(".modal-tab-content").hasClass("active")))
			return;
		
		var oTable = $table.dataTable();
		var oSettings = oTable.fnSettings();
		//console.log(oSettings);
		var $wrapper = $table.closest(".modal-table-body");
		var maxRows = oSettings.oInit.pageLength;
		var $scrollBody = $wrapper.find('.dataTables_scrollBody');
		var $scrollHead = $wrapper.find('.dataTables_scrollHead');
		var wrapperHeight = $wrapper.height();
		var scrollHeadHeight = $scrollHead.height();
		var allowedHeight = (wrapperHeight - scrollHeadHeight) - (30 + 20) ;
		var numRows = $table.find("tbody tr").length;
		var rowHeight = allowedHeight / maxRows;
		var newScrollBodyHeight = (rowHeight * numRows);
		var scrollBodyMarginBottom = allowedHeight - newScrollBodyHeight;
		
		$scrollBody.css('margin-bottom', String(scrollBodyMarginBottom + 15)+"px");
		// && $table.find("tr td").eq(0).hasClass("dataTables_empty")
		if (numRows == 1)
		{
			$scrollBody.css('border','none');
			$table.css("margin", "0px")
		}
		else
		{
			$scrollBody.css('height', String(newScrollBodyHeight)+"px");
		}

		/*console.log(String(rowHeight) + " " + String(maxRows) + " " + String(allowedHeight))
		console.log(String(wrapperHeight) + "  " + scrollHeadHeight + "  "  + String($(document).height()));
		console.log(String(newScrollBodyHeight) + " " + String(numRows))
		console.log(oSettings);*/
	};
	
	
	$(window).resize(function()
	{	
		var $modal = $(".md-modal.md-show")
		
		if ($modal && $modal.length)
		{
			var $tab = $modal.find(".tab-tables .nav.active")
			var $table = $("#"+$tab.attr('tab-index')).find("table.dataTable");
			if ($table && $table.length)
			{
				var dt = $($table[1]).dataTable()
				dt.fnAdjustColumnSizing(false);
				adjustDataTableHeight($($table[1]))
			}
		}
	})


	return IDEX;
	
	
}(IDEX || {}, jQuery));
