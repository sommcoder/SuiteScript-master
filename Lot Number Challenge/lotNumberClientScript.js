/* 
on save of a SALES ORDER, create Purchase Order for the items and quantities listed on that order

The items on the order must be Lot Numbered items (look into this, check if the account has any)

Link the PO to the Sales Order through a field and VICE VERSA (two-way link)

On receipt of the Purchase Order I want you to ADD the LOTs received onto the Inventory Detail of the Sales order

onSave, sales order creates a purchase order that is two-way linked (ie, either one changing changes the other)
on receipt of the PO, add the LOT NUMBERS received onto the received onto the Inventory detail of the SO

Create the sales order for the buyer, onSave creates a PO for a seller for the items/quantityies on the Sales Order
Think Amazon for products they don't MAKE themselves. They purchase it from the manufacturer and sell it to the consumer.


--------- Summary: ----------
1) On save, create new Purchase order
2) auto-populate the items and quantities from sales order into the PO
3) have the PO and SO linked through a field (two way link)
4) On receipt of the PO, add the LOTs received onto the INVENTORY DETAIL of the SALES ORDERs

*/

/**
 *@NApiVersion 2.0
 *@NScriptType ClientScript
 */
define(["N/record"], function (record) {
  function pageInit(context) {}

  function saveRecord(context) {
    const currRecord = context.currentRecord;
    const currRecordType = currRecord.type;
    const currRecordId = currRecord.id;

    if (currRecordType !== "salesorder") return;
    log.debug({
      title: "passed gaurd clause?:",
      details: "success!",
    });
    const poRecord = record.create({
      type: "purchaseorder",
      defaultValues: {
        entity: "",
      },
    });

    const poNumber = poRecord.setValue({
      fieldId: "tranid",
    });

    log.debug({
      title: "po number:",
      details: poNumber,
    });
  }

  function validateField(context) {}

  function fieldChanged(context) {}

  function postSourcing(context) {}

  function lineInit(context) {}

  function validateDelete(context) {}

  function validateInsert(context) {}

  function validateLine(context) {}

  function sublistChanged(context) {}

  return {
    pageInit: pageInit,
    saveRecord: saveRecord,
    validateField: validateField,
    fieldChanged: fieldChanged,
    postSourcing: postSourcing,
    lineInit: lineInit,
    validateDelete: validateDelete,
    validateInsert: validateInsert,
    validateLine: validateLine,
    sublistChanged: sublistChanged,
  };
});
