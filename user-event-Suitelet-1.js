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

      const suiteletURL = url.resolveScript({
        deploymentId: "customdeploy1",
        scriptId: "customscript2116",
        params: Object,
      });

      log.debug({
        title: "suiteletURL:",
        details: suiteURL,
      });

      // options.params({ ???? })

      //   const suiteletLinkParam = runtime.getCurrentScript().getParameter({
      //     name: "custscript_suiteletLink",
      //   });

      //   const suiteURL = `\"${suiteletLinkParam}\"`;

      log.debug({
        title: "suiteURL:",
        details: suiteURL,
      });

      currForm.addButton({
        id: "custpage_sublistSuiteletButton",
        label: "Price History",
        functionName: "window.open(suiteletURL)",
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
