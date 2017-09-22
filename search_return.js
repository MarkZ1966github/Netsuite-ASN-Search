/** 
 * This suitelet will create a form for ASN Item Receipt.
 * 
 * @param (nlobjRequest) request the request object
 * @param (nlobjResponse) response the response object
 * @author Mark Zschiegner
 * @version 1.0
 */

function formAsnSearch(request, response)
{
	// Global Variables
	var pon;
	var form;
	var asn;
	var qty;
	var list;
	var formResults;
	
	// GET Request
    if (request.getMethod() == 'GET')
    {
    
    	var s1 = request.getParameter("s1");
       	var s2 = request.getParameter("s2");
       	var s3 = request.getParameter("s3");
       	
    	var myform = createForm(s1,request.getParameter(s2));   	
    	var mysublist = createSublist(myform);
    	
    	var filters = new Array();
    	
    	if (s2 == '1'){
    		var filters = new Array();
    		filters[0] = new nlobjSearchFilter('custrecord_asn_number', null, 'is', s1);
    		filters[1] = new nlobjSearchFilter('custrecord_asn_vendor', null, 'is', s3);
    		filters[2] = new nlobjSearchFilter('custrecord_asn_item_received', null, 'is', 'F');
    	}else{
    		var filters = new Array();
    		filters[0] = new nlobjSearchFilter('custrecord_asn_po_number', null, 'is', s1);
    		filters[1] = new nlobjSearchFilter('custrecord_asn_vendor', null, 'is', s3);
    		filters[2] = new nlobjSearchFilter('custrecord_asn_item_received', null, 'is', 'F');
    	}
    	
		//select all and remove all 
	    	mysublist.addMarkAllButtons(); 

		//Define search columns
		var columns = new Array();
		columns[0] = new nlobjSearchColumn('custrecord_asn_number').setSort();
		columns[1] = new nlobjSearchColumn('custrecord_asn_po_number');
		columns[2] = new nlobjSearchColumn('custrecord_asn_sscc_id');
		columns[3] = new nlobjSearchColumn('custrecord_asn_vendor');
		columns[4] = new nlobjSearchColumn('custrecord_asn_item_mpn');
		columns[5] = new nlobjSearchColumn('custrecord_asn_item_name');
		columns[6] = new nlobjSearchColumn('custrecord_asn_receipt_qty');
		columns[7] = new nlobjSearchColumn('custrecord_asn_shipdate');
		columns[8] = new nlobjSearchColumn('custrecord_asn_line_number');
		columns[9] = new nlobjSearchColumn('id');
		columns[10] = new nlobjSearchColumn('custrecord_asn_lading_qty');
		
    	var searchresults = nlapiSearchRecord('customrecord_asn_receiving', null, filters, columns);
    	
		var p = 1;
		// array for box count 5/12/16
		var arr2 = [];
		//var numberSearchResults = 5;
		for (var i = 0; searchresults != null && i < searchresults.length; i++)

				{
					var searchresult = searchresults[i];

					mysublist.setLineItemValue('list_asn',p,searchresult.getValue('custrecord_asn_number'));					
					mysublist.setLineItemValue('listponumber',p,searchresult.getValue('custrecord_asn_po_number'));				
					mysublist.setLineItemValue('listssccid',p,searchresult.getValue('custrecord_asn_sscc_id')); 
					mysublist.setLineItemValue('listvendor',p,searchresult.getText('custrecord_asn_vendor'));
					mysublist.setLineItemValue('listmpn',p,searchresult.getValue('custrecord_asn_item_mpn'));
					mysublist.setLineItemValue('listitem',p,searchresult.getText('custrecord_asn_item_name'));
					mysublist.setLineItemValue('listqty',p,searchresult.getValue('custrecord_asn_receipt_qty'));
					mysublist.setLineItemValue('listshipdate',p,searchresult.getValue('custrecord_asn_shipdate')); 
					mysublist.setLineItemValue('listlinenumber',p,searchresult.getValue('custrecord_asn_line_number')); 
					mysublist.setLineItemValue('listasnline',p,searchresult.getValue('id')); 
					mysublist.setLineItemValue('listboxcount',p,searchresult.getValue('custrecord_asn_lading_qty')); 
					var count = ('boxcount',p,searchresult.getValue('custrecord_asn_lading_qty'));
					// array push for box count 5/12/16
					arr2.push(parseInt(count));					
					p++;
					
				 }
	//// START display carton count as well as page if PO is empty or not found 5/12/16
		
		if (arr2 == ''){
			var sum = "0.0";
		}else{
			var sum = arr2.reduce(function(a, b){return a+b;});
		}
    	var setWindow;
    	myform.addButton('bc1', 'TOTAL CARTON COUNT: ', setWindow);
    	myform.addButton('bc2', sum, setWindow);
    	if(sum == "0.0"){
    		response.writeLine("PO or ASN not found or no futher items need received on this PO or ASN");
    		response.writeLine('<br><br>');
    		response.writeLine('<a href = "https://system.netsuite.com/app/site/hosting/scriptlet.nl?script=237&deploy=1&compid=902676&script=237&deploy=1&whence="><strong><font size = 5>Start Another Item Receipt</font></strong></a>');

    	}else{
    		response.writePage(myform);	
    	}
    	
   //// END display carton count as well as page if PO is empty or not found 5/12/16
    	
    }

    // POST response
    else
    		{
	
		// Get returned selected items from Form
		var pon = new Array();
		var qty = new Array();
		var lin = new Array();
		var aid = new Array();
		var sel = 0;
		var i;
       	
	for (var i = 1; i <= request.getLineItemCount('custpage_asn_list'); i++) 

	{
    if (request.getLineItemValue('custpage_asn_list','custpage_checkbox', i) == 'T') 
    		{
    				aid[sel] = JSON.stringify(request.getLineItemValue('custpage_asn_list', 'listasnline', i));
			        pon = JSON.stringify(request.getLineItemValue('custpage_asn_list', 'listponumber', 1));
			        qty[sel] = JSON.stringify(request.getLineItemValue('custpage_asn_list', 'listqty', i));
			        lin[sel] = JSON.stringify(request.getLineItemValue('custpage_asn_list', 'listlinenumber', i));
			    	sel++;

    		}
    
	} 
	
			var parsed = "";
			for (var prop in qty) { 
				parsed += + prop + " START " + "{" + "aid=" + aid[prop] + "," + "&nbsp;" + "qty=" + qty[prop] + "," + "&nbsp;" + "lin=" + lin[prop] + "," + "&nbsp;" + "pon=" + pon[prop] +  " END " + "\n";
				var pon = new String(pon);
				var qty = new String(qty);
				var lin = new String(lin);
				var aid = new String(aid);
			}
			
			/// START old pass in URL data 5/16/16
			
			//srctext = parsed;
			//var re = /(.*START\s+)(.*)(\s+END.*)/g;
			//var newtext = srctext.replace(re, "$2");

			//var newtext = {'aid':aid, 'qty':qty, 'lin':lin, 'pon':pon};

			/// END old pass in URL data 5/16/16
			
			// START Save files to NetSuite into "ASN-to-Item-Receipt" folder 5/16/16
			
			var LINE = 'LINE';
			var QUANTITY = 'QUANTITY';
			var ASNLINE = 'ASNLINE';
			var PONUM = 'PONUM';
			
			// Native Javascript Date Object. 
			var d = new Date(); 
			// datetimetz will set the date and time to the date variable 
			var date = nlapiDateToString(d,'datetimetz'); 

	        //// START Data Creation Section 
			
			//create LIN file
			var filename = LINE + ".csv";
	        var fileCreated = nlapiCreateFile(filename,'CSV',lin);
	        fileCreated.setFolder('324336');
	        var fileIdl = nlapiSubmitFile(fileCreated);
	         
			//create QTY file
	        var filename = QUANTITY + ".csv";
	        var fileCreated = nlapiCreateFile(filename,'CSV',qty);
	        fileCreated.setFolder('324336');
	        var fileIdq = nlapiSubmitFile(fileCreated);

	        //create AID file
	        var filename = ASNLINE + ".csv";
	        var fileCreated = nlapiCreateFile(filename,'CSV',aid);
	        fileCreated.setFolder('324336');
	        var fileIda = nlapiSubmitFile(fileCreated);

	        //create PON file
	        var filename = PONUM + ".csv";
	        var fileCreated = nlapiCreateFile(filename,'CSV',pon);
	        fileCreated.setFolder('324336');
	        var fileIdp = nlapiSubmitFile(fileCreated);

	        //// END Data Creation Section 
	        
	     // END Save files to NetSuite into "ASN-to-Item-Receipt" folder 5/16/16
	        
	        //// START Archive Section 5/16/16
	        
	        //archive LIN file
	        var filenamearchive = "LINE-"+ date + ".csv";	       
	        var fileal = nlapiCreateFile(filenamearchive,'CSV',lin);
			fileal.setFolder('324337');
			var fileIdal = nlapiSubmitFile(fileal);
	        //archive QTY file
	        var filenamearchive = "QUANTITY-"+ date + ".csv";	       
	        var fileaq = nlapiCreateFile(filenamearchive,'CSV',qty);
	        fileaq.setFolder('324337');
			var fileIdaq = nlapiSubmitFile(fileaq);
	        //archive AID file
	        var filenamearchive = "ASNLINE-"+ date + ".csv";	       
	        var fileaa = nlapiCreateFile(filenamearchive,'CSV',aid);
	        fileaa.setFolder('324337');
			var fileIdaa = nlapiSubmitFile(fileaa);
	        //archive PON file
	        var filenamearchive = "PONUM-"+ date + ".csv";	       
	        var fileap = nlapiCreateFile(filenamearchive,'CSV',pon);
	        fileap.setFolder('324337');
			var fileIdap = nlapiSubmitFile(fileap);
			
	        //// END Archive Section 5/16/16			

			//response.sendRedirect("SUITELET", "customscriptcreateir", "customdeploy1", false, newtext);
	        response.sendRedirect("SUITELET", "customscriptcreateir", "customdeploy1", false);	
    }
    
}

	function createForm(s1,searchselectionoption)
	{

		form = nlapiCreateForm('Create Item Receipt', false);
		
		form.addFieldGroup('maingroup', 'Select').setShowBorder(false);
    	
		form.addSubmitButton("Submit Checked Item(s)");

		return form;		
	}
		
function createSublist(form)
{
	
	list = form.addSubList('custpage_asn_list', 'list', 'Open Item Receipt Results', null);
	
	
    list.addField('list_asn', 'text', 'ASN');
    list.addField('listponumber', 'text', 'PO #');
    list.addField('listlinenumber', 'text','PO Line#');
    list.addField('listvendor','text', 'Vendor');
    list.addField('listmpn', 'text','MPN');
    list.addField('listitem', 'text','SKU');
    list.addField('listqty', 'text','QTY');        
    list.addField('listshipdate', 'date','Ship Date'); 
    list.addField('listssccid', 'text','SSCC ID');
    list.addField('listasnline', 'text','ASN Line#');
    list.addField('listboxcount', 'text','Carton Count');
    list.addField('custpage_checkbox', 'checkbox','Confirmed Receipt'); 
    
    return list;   

}



