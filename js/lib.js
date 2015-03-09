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
    }
};