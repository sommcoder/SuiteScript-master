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

      const lnCount = currRecord.getLineCount({
        sublistId: "item",
      });

      log.debug({
        title: "line count:",
        details: lnCount,
      });

      const sublistValues = [];

      for (let i = 0; i < lnCount; i++) {
        sublistValues.push(
          currRecord.getSublistValue({
            sublistId: "item",
            fieldId: "item",
            line: i,
          })
        );
      }

      log.debug({
        title: "sublist Values:",
        details: sublistValues,
      });

      if (currRecord.type !== "salesorder") return;
      if (userEventType !== "view") return;

      const suiteletUrl = url.resolveScript({
        deploymentId: "customdeploy1",
        scriptId: "customscript2116",
      });

      log.debug({
        title: "currRecord:",
        details: currRecord,
      });

      log.debug({
        title: "currRecordType:",
        details: currRecordType,
      });

      log.debug({
        title: "currRecordId:",
        details: currRecordId,
      });

      log.debug({
        title: "suiteletUrl:",
        details: suiteletUrl,
      });

      const windowFeatures =
        "popup=1,screenY=-50%,screenX=50%,width=400,height=600,resizable=yes,scrollbars=yes";

      const suiteletUrlParam = url.format({
        domain: suiteletUrl,
        params: sublistValues,
      });

      log.debug({
        title: "Suitelet Url Params:",
        details: suiteletUrlParam,
      });

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
