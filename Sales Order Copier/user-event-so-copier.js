/* 

sales order:
have a button on sales order record called 'create copy', wehn pressed its going to display a popup (suitelet) where in the header it will default the current sales order infomration thats going to be copied which includes:
- customer
- subsidiary
- location
- department class

but it will allow the user to change the location, department and class (customer/subsidiary are not!)
futhermore it will show a sublist which includes the current items on the order, the information shown on the sublist will include item name, rate, quantity, expected shipdate. (all of these fields should be editable except for item name).

in front of each line a checkbox field will be generated to allow users to select which item will be copied over. onLoad of the popup, this checkbox field will be defaulted to checked for all lines. 

onSubmit of the popup, the sales order will be created with the information entered, and the webpage will be automatically REDIRECTED to the NEW ORDER. 

*/

/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
define(["N/url", "N/ui/serverWidget"], function (url) {
  function beforeLoad(context) {
    try {
      const currRecord = context.newRecord;
      const currRecordId = currRecord.id;
      const currForm = context.form;
      const contextType = context.type;
      const currRecordType = currRecord.type;

      if (currRecordType !== "salesorder") return; // guard clause
      if (contextType !== "view" && contextType !== "create") return; // guard clause

      const suiteletUrl = url.resolveScript({
        deploymentId: "customdeploysuitelet_so_copier",
        scriptId: "customscriptsuitelet_so_copier",
      });

      const recordTranId = currRecord.getValue({
        fieldId: "tranid",
      });

      const lnCount = currRecord.getLineCount({
        sublistId: "item",
      });

      // populates an array of all of the items on the current record!
      const sublistValuesArr = [];

      for (let i = 0; i < lnCount; i++) {
        sublistValuesArr.push(
          currRecord.getSublistValue({
            sublistId: "item",
            fieldId: "item",
            line: i,
          })
        );
      }

      const suiteletUrlParam = url.format({
        domain: suiteletUrl,
        params: {
          sublistValuesArr: JSON.stringify(sublistValuesArr),
          recordTranId: recordTranId,
          currRecordId: currRecordId,
          currRecordType: currRecordType,
        },
      });

      const windowFeatures =
        "popup=1,screenY=-50%,screenX=50%,width=750,height=600,resizable=yes,scrollbars=yes";

      currForm.addButton({
        id: "custpage_copy_order",
        label: "Copy Order",
        functionName: `window.open('${suiteletUrlParam}', '_blank', '${windowFeatures}')`,
      });
    } catch (err) {
      log.debug({
        title: "Error:",
        details: err,
      });
    }
  }
  return {
    beforeLoad: beforeLoad,
  };
});
