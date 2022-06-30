/* 

make a suitelet accessible through a button on the sales order that when clicked will list all of the items on the sales order as a sublist including additional information NOT found in the sales order such as a 

// list of last sold prices for the item and the customer who bought them.


// ITEM   SO   PRICE    CUSTOMER
rolex   d112a   $123       

button called: 'Price History'

on the header of the popup:

header:
Order # : curr customer

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
define(["N/ui/serverWidget", "N/search"], function (serverWidget, search) {
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

      const reqParams = context.request.parameters;

      const sublistItems = JSON.parse(reqParams.sublistItems);
      const currRecordId = reqParams.currRecordId;
      const currRecordType = reqParams.currRecordType;
      const tranId = reqParams.tranId;

      log.debug({
        title: "currRecordId:",
        details: currRecordId,
      });

      log.debug({
        title: "tranId:",
        details: tranId,
      });

      log.debug({
        title: "sublists items:",
        details: sublistItems,
      });

      // create the form on a page:
      const itemHistoryForm = serverWidget.createForm({
        title: "Item History",
        hideNavBar: true,
      });

      // add sublist to the form
      const suiteletSublist = itemHistoryForm.addSublist({
        id: "custpage_item_history_sublist",
        label: "item history sublist",
        tab: "items",
        type: "list",
      });

      // add fields to sublist:
      suiteletSublist.addField({
        id: "custpage_sublist_field_id_item", // item #
        label: "Item",
        type: "text",
      });
      suiteletSublist.addField({
        id: "custpage_sublist_field_id_tranid", // SO #
        label: "SO",
        type: "text",
      });
      suiteletSublist.addField({
        id: "custpage_sublist_field_id_rate", //price
        label: "Price",
        type: "text",
      });
      suiteletSublist.addField({
        id: "custpage_sublist_field_id_date", // customer
        label: "Date Created",
        type: "text",
      });
      suiteletSublist.addField({
        id: "custpage_sublist_field_id_entity", // customer
        label: "Customer",
        type: "text",
      });

      const salesOrderSearch = search.create({
        type: currRecordType, // sales order
        filters: [
          ["item", "anyof", sublistItems], // item(s);
          "AND",
          ["mainline", "is", "F"],
        ],
        columns: [
          search.createColumn({ name: "rate", label: "Item Rate" }),
          search.createColumn({ name: "entity", label: "Name" }),
          search.createColumn({ name: "tranId", label: "Document Number" }),
          search.createColumn({ name: "item", label: "Item" }),
          search.createColumn({ name: "datecreated", label: "Date Created" }),
        ],
      });

      log.debug({
        title: "search results:",
        details: salesOrderSearch,
      });

      let i = 0;

      const salesOrderResults = salesOrderSearch.run().each((result) => {
        log.debug({
          title: "results:",
          details: result,
        });

        suiteletSublist.setSublistValue({
          id: "custpage_sublist_field_id_item",
          line: i,
          value: result.getText({
            name: "item",
          }),
        });
        suiteletSublist.setSublistValue({
          id: "custpage_sublist_field_id_tranid",
          line: i,
          value: result.getValue({
            name: "tranid",
          }),
        });
        suiteletSublist.setSublistValue({
          id: "custpage_sublist_field_id_rate",
          line: i,
          value: result.getValue({
            name: "rate",
          }),
        });
        suiteletSublist.setSublistValue({
          id: "custpage_sublist_field_id_date",
          line: i,
          value: result.getValue({
            name: "datecreated",
          }),
        });
        suiteletSublist.setSublistValue({
          id: "custpage_sublist_field_id_entity",
          line: i,
          value: result.getText({
            name: "entity",
          }),
        });

        i++; // iterate the global counter

        return true;
      });

      // salesOrderResults.run().each(function (result) {
      //   return true;
      // });

      // WRITE Suitelet Page:
      context.response.writePage({
        pageObject: itemHistoryForm,
      });
    } catch (err) {
      log.error({
        title: "Suitelet_error:",
        details: err.message,
      });
    }
  }

  return {
    onRequest: onRequest,
  };
});
