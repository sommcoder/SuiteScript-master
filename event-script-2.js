// on save of the employee record if the employees supervisor field is blank search for the companies CEO and set the CEO as the supervisor of the employee.

// on save, if no supervisor, set CEO as supervisor

// Determine who the CEO is through the job title field. (using the search module..?)

/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
define(["N/record", "N/search"], function (record, search) {
  function beforeSubmit(context) {
    try {
      const recordType = context.newRecord.type;
      const newRecord = context.newRecord;
      if (recordType !== "employee") return;

      const supervisorValue = context.newRecord.getValue({
        fieldId: "supervisor",
      });
      if (supervisorValue === true) return; // if employee has supervisor, return.
      // search for CEO:
      let ceoSearch = search.create({
        type: "employee",
        filters: [
          ["title", "is", "Chief Executive Officer"], // id: 192
        ],
        columns: ["subsidiarynohierarchy", "comments", "entityid"],
      });

      let ceoSearchResults = ceoSearch.run().each((result) => {
        log.debug({
          title: "",
          details: result,
        });

        newRecord.setValue({
          fieldId: "supervisor",
          value: result.id,
        });

        let subsidiary = result.getText({ name: "subsidiarynohierarchy" });
        let entityid = result.getValue({ name: "entityid" });

        log.debug({
          title: "",
          details: subsidiary,
        });
        log.debug({
          title: "",
          details: entityid,
        });

        newRecord.setValue({
          fieldId: "comments",
          value: subsidiary + "-" + entityid,
        });
        return false;
      });
    } catch (err) {
      log.debug({
        title: "",
        details: err,
      });
    }
  }
  // name, subsidiary, comments
  // update the search:  look up the CEO's subsidiary, in the memo (Notes/comments) of the employee when we're also setting the supervisor set the subsidiary-ceo name in the memo field.

  return {
    beforeSubmit: beforeSubmit,
  };
});
