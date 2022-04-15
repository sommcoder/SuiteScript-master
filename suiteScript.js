// As part of a User Event script I want you to on page load, if in View mode, generate a button titled “Admin List” (the functionality will be developed later) and generate a custom field (through the script) that is hidden from the page.

// The field will be an inline HTML field that will run an alert warning the user if this is an existing record.

// Furthermore, I want you to create a custom field (not through the script - standard NS functionality, find out how to do this), for the employee record that will show up under the access subtab. Let’s name it “Employee Important” and set it as a free-form text field.

// On Edit mode, if you are on your own employee record, make the field accessible and mandatory (record can’t be saved without entry). If you are not on your own employee record make the field not mandatory and disabled (greyed out). This script should all be done under User Event Before Load and

// deploy the script to the employee record.--

/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */

define(["N/record", "N/log", "N/runtime", "N/ui"], function (
  record,
  log,
  runtime,
  message
) {
  function beforeLoad(context) {
    try {
      // guard clause:
      if (context.type !== "view" && context.type !== "edit") return;

      // variables:
      let newField;
      const currUser = runtime.getCurrentUser().id;
      const currRecord = context.newRecord;
      const newForm = context.form;
      const modeState = context.type;
      const impField = newForm.getField({
        id: "custentity15", // user: 'Camilo Test'
      });

      log.debug({ details: currRecord });
      log.debug({ details: impField });
      log.debug({ details: newForm });
      log.debug({ details: modeState });

      // view mode:
      if (modeState === "view") {
        newForm.addButton({
          id: "custpage_tbd",
          label: "Admin List",
        });
        newField = newForm.addField({
          id: "custpage_tbd",
          label: "New Custom Field",
          type: "inlinehtml",
        });
        // newField.updateDisplayType({
        //   displayType: "hidden",
        // });
        impField.updateDisplayType({
          displayType: "disabled",
        });
        const uiMessage = "This is a custom field error message";
        const fieldHTML = `<script language="JavaScript" type="text/javascript">alert('test');</script>`;
        newField.defaultValue = fieldHTML;
      }

      // edit mode + curr user is viewing own record
      if (modeState === "edit" && currRecord.id === currUser) {
        impField.updateDisplayType({
          displayType: "normal",
        });
        impField.isMandatory = true;
      } else return;
    } catch (err) {
      log.error("my error:", err);
    }
  }
  return {
    beforeLoad: beforeLoad,
  };
});
