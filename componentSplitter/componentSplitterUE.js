/*


items with QTY DISTIBUTION RATIO filled out:
    id   name                       displayName
- 1702	27012	Fzn Cod Pacific, Flt Skls 16-32 oz, IQF Tote PPSF Wild MSC
- 1703	27034	Fzn Cod Pacific, Flt Skls 32-Up oz, IQF Tote PPSF Wild MSC
- 1707	27231	Fzn Cod Pacific, Prtn Skls 1-3 oz, IQF 1/10 lb Pln Wild MSC
 
we're gunna create a mock component splitter..

1) on an ITEM RECORD we will CREATE a field called QTY DISTRIBUTOR RATIO. This will be a number a user can enter from 0 to 1.

2) Next we will add a button to a sales order, so that when pressed it will display all items on the order with their distribution ratios DISPLAYED. An entry field will be displayed with the popup to show the desired total quantity on the order. 

3) You will take the ratios and divvy up the total quantity based on each item's ratio.

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

4) set an override checkbox on the header that allows the user to OVERRIDE the specific line qty distributions on the popup. However the line totals still NEED to equal to the overall total.

5) Finally.. on submit you will simply override the item quantities based on the new ratios provided on the popup.

DETAILS:
In the popup, Camilo wants to see ITEM, RATIO NUMBER, CURRENT QTY, and NEW QTY where ONLY NEW QTY is EDITABLE (through override ONLY).


MY NOTES:
scripts:
- UE (IR section / SO section)
- Suitelet


User Event:
1) add a custom field to the item record called QTY DISTRIBUTOR RATIO
2) The validation on the field will only accept values between 0 and 1
3) on View, beforeLoad on the SO, we will add a button to the UI that will popup the suitelet scripts
4) When the button is clicked it will activate a function window.open() and display the Suitelet 

Suitelet:
5) on the Suitelet, we will populate the sublist from the SO's item sublist via a scripted search that will filter by transaction type and currRecordId, the columns will be item name, distribution ratio, and a entry field displayed the desired total quantity on the SO.

6) have an override checkbox at the top which will enable the individual user entry of the quantity of each line item, however the script will still require validation that each line up equals the TOTAL quantity at the top.

7) onSubmit the adjusted quantities will override

 
*/

/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
define(["N/url"], function (url) {
  function beforeLoad(context) {
    try {
      log.debug({
        title: "script init?",
        details: "yes!",
      });
      let currForm = context.form;
      let currRecord = context.newRecord;
      let currRecordType = currRecord.type;

      let contextType = context.type;
      let currRecordId = currRecord.id;

      // guard clause:
      if (currRecordType !== "salesorder" && contextType !== "view") return;

      log.debug({
        title: "passed gaurd",
        details: "yes!",
      });

      const tranId = currRecord.getValue({
        fieldId: "tranid",
      });

      const suiteletUrl = url.resolveScript({
        deploymentId: "customdeploy1",
        scriptId: "customscript2123",
      });

      log.debug({
        title: "suiteletUrl",
        details: suiteletUrl,
      });

      const windowFeatures =
        "popup=1,screenY=-50%,screenX=50%,width=1000,height=600,resizable=yes,scrollbars=yes";

      const lnCount = currRecord.getLineCount({
        sublistId: "item",
      });

      // obj design:
      // object = [
      //   { lineKey: itemId },
      //   { lineKey: itemId },
      //   { lineKey: itemId },
      // ];

      const sublistValuesArr = [];

      for (let i = 0; i < lnCount; i++) {
        let lineKey = currRecord.getSublistValue({
          sublistId: "item",
          fieldId: "lineuniquekey",
          line: i,
        });
        let itemId = currRecord.getSublistValue({
          sublistId: "item",
          fieldId: "item",
          line: i,
        });
        // push the itemId value to the lineKey, this will allow for like-items on separate lines
        sublistValuesArr.push({
          [lineKey]: itemId,
        });
      }

      log.debug({
        title: "sublistValuesArr",
        details: sublistValuesArr,
      });

      const suiteletUrlParam = url.format({
        domain: suiteletUrl,
        params: {
          sublistItems: JSON.stringify(sublistValuesArr),
          currRecordId: currRecordId,
          tranId: tranId,
          currRecordType: currRecordType,
        },
      });

      log.debug({
        title: "suiteletUrlParam",
        details: suiteletUrlParam,
      });

      let soBtn = currForm.addButton({
        id: "custpage_item_distribution_ratio_suitelet",
        label: "Item Distribution",
        functionName: `window.open('${suiteletUrlParam}', '_blank', '${windowFeatures}')`,
      });

      log.debug({
        title: "soBtn",
        details: soBtn,
      });
    } catch (err) {
      log.debug({
        title: "try/catch error:",
        details: err,
      });
    }
  }

  return {
    beforeLoad: beforeLoad,
  };
});
