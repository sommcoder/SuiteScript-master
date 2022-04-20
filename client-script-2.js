// when new employee records are being created users must first enter department, then class, then location, when user selects a department, if engineering or sales selected then the class must be 'consulting & project mgmt'. When consulting and project mgmt is selected, location must be Century City.

// If any of the fields change make sure to validate the logic of the above and if it doesnt apply RESET the fields and alert the user for reentry. If department is NOT engineering or sales, class must be Personnel and location can be anything BUT Century City

// do not allow new employee records from being saved if either department location or class fields are empty.

/**
 *@NApiVersion 2.x
 *@NScriptType ClientScript
 */
define(["N/ui/dialog"], function (dialog) {
  // record and currentrecord modules are auto loaded with a Client Script declared in the JS Docs apparently???

  // global function variable list
  // var trigger = true;
  var currEmpRecord;
  var fieldIdChanged;
  var validationInput;

  var departmentField;
  var classField;
  var locationField;

  var departmentValue;
  var classValue;
  var locationValue;

  function pageInit(context) {
    try {
      if (context.mode !== "edit") return;
      // assign a reference of current record
      currEmpRecord = context.currentRecord;

      // field initial settings:
      departmentField = currEmpRecord.getField({
        fieldId: "department",
      });
      departmentField.isDisabled = false;
      classField = currEmpRecord.getField({
        fieldId: "class",
      });
      classField.isDisabled = true;
      locationField = currEmpRecord.getField({
        fieldId: "location",
      });
      locationField.isDisabled = true;
    } catch (err) {
      console.log("error:", err);
    }
  }
  function validateField(context) {
    try {
      currEmpRecord = context.currentRecord;
      validationInput = context.fieldId;

      departmentValue = currEmpRecord.getValue({
        fieldId: "department",
      });
      locationValue = currEmpRecord.getValue({
        fieldId: "location",
      });

      // record fields:
      departmentField = currEmpRecord.getField({
        fieldId: "department",
      });
      classField = currEmpRecord.getField({
        fieldId: "class",
      });
      locationField = currEmpRecord.getField({
        fieldId: "location",
      });

      if (
        validationInput === "department" ||
        validationInput === "class" ||
        validationInput === "location"
      ) {
        if (
          departmentValue !== "2" &&
          departmentValue !== "1" &&
          locationValue === "14"
        ) {
          dialog.alert({
            title: "location option limitation",
            message:
              "If NOT Sales or Engineering, location CANNOT be Century City",
          });
          currEmpRecord.setValue({
            fieldId: "location",
            value: "",
          });
          return true; // cannot validate!
        } else return true;
      } else return true;
    } catch (err) {
      console.log(err);
    }
  }
  function fieldChanged(context) {
    try {
      // assign a reference of current record
      fieldIdChanged = context.fieldId;

      currEmpRecord = context.currentRecord;
      // record fields:
      departmentField = currEmpRecord.getField({
        fieldId: "department",
      });
      classField = currEmpRecord.getField({
        fieldId: "class",
      });
      locationField = currEmpRecord.getField({
        fieldId: "location",
      });

      // record values:
      departmentValue = currEmpRecord.getValue({
        fieldId: "department",
      });
      classValue = currEmpRecord.getValue({
        fieldId: "class",
      });
      locationValue = currEmpRecord.getValue({
        fieldId: "location",
      });

      // DEPARTMENT CONDITIONS
      if (fieldIdChanged === "department" && departmentValue) {
        // enable/disable class field:
        classField.isDisabled = false;

        // department engineering OR department sales set class to consulting & project mgmt and location to Century City.
        //Disable class and location as they MUST be set this way
        if (departmentValue === "2" || departmentValue === "1") {
          currEmpRecord.setValue({
            fieldId: "class",
            value: 2,
          });
          classField.isDisabled = true;
          currEmpRecord.setValue({
            fieldId: "location",
            value: 14,
          });
          locationField.isDisabled = true;
        }
      }
      // CLASS CONDITIONS
      if (
        fieldIdChanged === "class" &&
        classValue &&
        departmentValue !== "2" &&
        departmentValue !== "1"
      )
        locationField.isDisabled = false;
    } catch (err) {
      console.log(err);
    }
  }

  function saveRecord(context) {
    try {
      // assign a reference of current record
      currEmpRecord = context.currentRecord;
      if (currEmpRecord !== "employee") return true;
      // record values:
      departmentValue = currEmpRecord.getValue({
        fieldId: "department",
      });
      classValue = currEmpRecord.getValue({
        fieldId: "class",
      });
      locationValue = currEmpRecord.getValue({
        fieldId: "location",
      });

      if (!departmentValue || !classValue || !locationValue) {
        dialog.alert({
          title: "Fields Missing",
          message:
            "Ensure you've completed the department, class and location fields and in the correct sequence!",
        });
        return false;
      } else return true;
    } catch (err) {
      console.log(err);
    }
  }
  return {
    pageInit: pageInit,
    saveRecord: saveRecord,
    validateField: validateField,
    fieldChanged: fieldChanged,
  };
});
