/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
define(["N/runtime", "N/url"], function (runtime, url) {
  function beforeLoad(context) {
    try {
      const currForm = context.form;
      const userEventType = context.type;

      const currRecord = context.newRecord;
      const currRecordId = currRecord.id;
      const currRecordType = currRecord.type;

      // guard clause
      if (currRecord.type !== "salesorder") return;
      if (userEventType !== "view") return;

      const tranId = currRecord.getValue({
        fieldId: "tranid",
      });

      const lnCount = currRecord.getLineCount({
        sublistId: "item",
      });

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

      const suiteletUrl = url.resolveScript({
        deploymentId: "customdeploy1",
        scriptId: "customscript2116",
      });

      const windowFeatures =
        "popup=1,screenY=-50%,screenX=50%,width=400,height=600,resizable=yes,scrollbars=yes";

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
        title: "Suitelet Url Params:",
        details: suiteletUrlParam,
      });

      // add button to UI with Server-Side rendering
      currForm.addButton({
        id: "custpage_sublistSuiteletButton",
        label: "Price History",
        functionName: `window.open('${suiteletUrlParam}', '_blank', '${windowFeatures}')`,
      });
    } catch (err) {
      log.error({
        title: "beforeLoad_addButton",
        details: err.message,
      });
    }
  }
  return {
    beforeLoad: beforeLoad,
  };
});
