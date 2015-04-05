z = {
    /**
     * clearForm
     * Set All Field to Blank
     */
    clearForm: function(str,numField) {
        for(var i=1; i<=numField; i++) {
            var tmpField = $("#field"+str+i+'cont');
            if (tmpField.is('select')) {
                tmpField.val(1);
            } else {
                tmpField.val('');
            }
        }
    },
    
    /**
     * numberFormat
     * Transform Number into comma separated number
     */
    numberFormat: function(str) {
        var nStr = str;
        x = nStr.split('.');
        x1 = x[0];
        x2 = x.length > 1 ? '.' + x[1] : '';
        var rgx = /(\d+)(\d{3})/;
        while (rgx.test(x1)) {
                x1 = x1.replace(rgx, '$1' + ',' + '$2');
        }
        return x1 + x2;
    }
};
