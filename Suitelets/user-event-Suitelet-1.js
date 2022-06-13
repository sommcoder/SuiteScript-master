/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
define(["N/runtime", "N/url"], function (runtime, url) {
  function beforeLoad(context) {
    try {
      const currRecord = context.newRecord;
      const currForm = context.form;
      const userEventType = context.type;

      // Guard Clauses:
      if (currRecord.type !== "salesorder") return;
      if (userEventType !== "view") return;

      // 404: https://tstdrv2338496.app.netsuite.com/app/accounting/transactions/null

      const suiteletURL = url.resolveScript({
        deploymentId: "customdeploy1",
        scriptId: "customscript2116",
      });

      log.debug({
        title: "suiteletURL:",
        details: suiteletURL,
      });

      const windowFeatures =
        "popup=1,screenY=-50%,screenX=50%,width=400,height=600,resizable=yes,scrollbars=yes";

      currForm.addButton({
        id: "custpage_sublistSuiteletButton",
        label: "Price History",
        functionName: `window.open('${suiteletURL}', ${windowFeatures}')`,
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
