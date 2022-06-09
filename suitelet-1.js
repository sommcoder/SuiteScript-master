/* 

make a suitelet accessible through a button on the sales order that when clicked will list all of the items on the sales order as a sublist including additional information NOT found in the sales order such as a list of last sold prices for the item and the customer who bought them.

button called: 'Price History'

on the header of the popup:

header:
Order # : curr custome

sublist:
# : customer : price


N/uiServerWidget

// client Script: 
    pageInit: render the button

// User Event Script:
  

// Suitelet:
    click button, calls onrequest:



    Regular Suitelet:
     use UI objects to create custom pages that look like NetSuite pages. SuiteScript UI objects encapsulate the elements for building NetSuite-looking portlets, forms, fields, sublists, tabs, lists, and columns.

    N/ui/serverWidget Module:
     You can use Suitelets to build custom pages and wizards that have a NetSuite look-and-feel. You can also create various components of the NetSuite UI (for example, forms, fields, sublists, tabs).


     Form.clientScriptModulePath
        vvv
     the relative path to he client script file to be used in this form




     user event (beforeload entry point) script adds a button that calls the client script, client script triggers the Suitelet

*/

/**
 *@NApiVersion 2.1
 *@NScriptType Suitelet
 */
define(["N/http", "N/ui/serverWidget"], function (http, serverWidget) {
  function onRequest(context) {
    try {
      log.debug({
        title: "onRequest Work?",
        details: "yes, yes it did",
      });
      //   objForm.clientScriptModulePath = "SuiteScript/clientScript-3.js";
      //   console.log(objForm);
    } catch (err) {
      console.log(err);
    }
  }

  return {
    onRequest: onRequest,
  };
});
