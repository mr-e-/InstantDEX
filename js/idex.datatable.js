
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
		})
	}
	

	function adjustDataTableHeight($table) 
	{
		if (!($table.closest(".md-modal").hasClass("md-show")) || !($table.closest(".modal-tab-content").hasClass("active")))
			return;
		
		var oTable = $table.dataTable();
		var oSettings = oTable.fnSettings();
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

		if (numRows == 1)
		{
			$scrollBody.css('border','none');
			$table.css("margin", "0px")
		}
		else
		{
			$scrollBody.css('height', String(newScrollBodyHeight)+"px");
		}
	};
	
	

	return IDEX;
	
	
}(IDEX || {}, jQuery));
