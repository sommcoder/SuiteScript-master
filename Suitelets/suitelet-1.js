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

// figure out how to pass information into a new window... just JS

/**
 *@NApiVersion 2.1
 *@NScriptType Suitelet
 */
define(["N/ui/serverWidget", "N/search", "N/url"], function (
  serverWidget,
  search,
  url
) {
  function onRequest(context) {
    try {
      if (context.request.method !== "GET") return;

      // list of customers who bought the particular items on the sales order youre viewing

      // also a list of last sold price for the item and the customer who bought it

      // pass in the items and currentOrder dynamically:

      log.debug({
        title: "request parameters:",
        details: context.request.parameters,
      });

      // const salesOrderResults = search.create({
      //   type: "salesorder",
      //   filters: [
      //     ["type", "anyof", "SalesOrd"],
      //     "AND",
      //     ["item", "anyof", "678"],
      //     "AND",
      //     ["mainline", "is", "F"],
      //   ],
      //   columns: [
      //     search.createColumn({ name: "rate", label: "Item Rate" }),
      //     search.createColumn({ name: "entity", label: "Name" }),
      //     search.createColumn({ name: "tranid", label: "Document Number" }),
      //   ],
      // });
      // var searchResultCount = salesorderSearchObj.runPaged().count;
      // log.debug("salesorderSearchObj result count", searchResultCount);
      // salesorderSearchObj.run().each(function (result) {
      //   return true;
      // });

      // custom sublist
      const priceHistoryForm = serverWidget.createForm({
        title: "Price History",
        hideNavBar: true,
      });

      const suiteletSublist = priceHistoryForm.addSublist({
        id: "itemhistoryid",
        label: "item history",
        tab: "items",
        type: "staticlist",
      });

      // write Suitelet Page:
      context.response.writePage({
        pageObject: priceHistoryForm,
      });
    } catch (err) {
      console.log(err);
    }
  }

  return {
    onRequest: onRequest,
  };
});
