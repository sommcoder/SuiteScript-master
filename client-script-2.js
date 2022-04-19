// when new employee records are being created users must first enter department, then class, then location, when user selects a department, if engineering or sales selected then the class must be 'consulting & project mgmt'. When consulting and project mgmt is selected, location must be Century City.

// If any of the fields change make sure to validate the logic of the above and if it doesnt apply RESET the fields and alert the user for reentry. If department is NOT engineering or sales, class must be Personnel and location can be anything BUT Century City

// do not allow new employee records from being saved if either department location or class fields are empty.

/**
 *@NApiVersion 2.x
 *@NScriptType ClientScript
 */
define(["N/ui/dialog"], function (ui) {
  // record and currentrecord modules are auto loaded with a Client Script declared in the JS Docs apparently???

  // variable list
  var currEmpRecord;
  var departmentField;
  var locationField;
  var classField;
  var departmentValue;
  var locationValue;
  var classValue;

  function pageInit(context) {
    if (context.mode !== "edit") return;
    try {
      currEmpRecord = context.currentRecord;
      // department field
      departmentField = currEmpRecord.getField({
        fieldId: "department",
      });
      departmentField.isDisabled = false;

      // class field
      classField = currEmpRecord.getField({
        fieldId: "class",
      });
      classField.isDisabled = true;

      // location field
      locationField = currEmpRecord.getField({
        fieldId: "location",
      });
      console.log(location);
      locationField.isDisabled = true;
    } catch (err) {
      console.log(err);
    }
  }

  function fieldChanged(context) {
    console.log(context.fieldId);
    if (
      context.fieldId !== "department" &&
      context.fieldId !== "class" &&
      context.fieldId !== "location"
    )
      return;

    try {
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

      console.log(departmentValue);
      console.log(classValue);
      console.log(locationValue);

      departmentValue ? (classField.isDisabled = false) : "";
      classValue ? (locationField.isDisabled = false) : "";

      // ...and location can be anything BUT Century City
    } catch (err) {
      console.log(err);
    }
  }

  function saveRecord(context) {
    if (context.currentRecord !== "employee") return;
    try {
      currEmpRecord = context.currentRecord;
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

      if (
        departmentValue !== true &&
        classValue !== true &&
        locationValue !== true
      )
        alert(
          "you need to fill out the department, class & location fields before submitting!"
        );
    } catch (err) {
      console.log(err);
    }
  }

  function validateField(context) {
    try {
      currEmpRecord = context.currentRecord;
      var field = context.fieldId;
      if (field === "department") console.log(field);
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
