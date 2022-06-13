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
  var currEmpRecord;
  var fieldRecordChanged;
  var validationInput;
  var FIELD_IDS;
  var RECORD_IDS;

  function pageInit(context) {
    try {
      if (context.mode !== "edit") return;
      // sets fields, they will not change
      setFieldObj(context);
      // refreshes record ids, changes depending on event
      refreshRecordObj(context);
      // always enable department field..
      FIELD_IDS.departmentFieldId.isDisabled = false;

      // if sales/engineering AND class is consulting AND location is Century City, disable all but department
      if (
        (RECORD_IDS.departmentRecordId === "2" ||
          RECORD_IDS.departmentRecordId === "1") &&
        RECORD_IDS.classRecordId === "2" &&
        RECORD_IDS.locationRecordId === "14"
      ) {
        FIELD_IDS.locationFieldId.isDisabled = true;
        FIELD_IDS.classFieldId.isDisabled = true;
      }
      // if NOT sales/engineering AND class is Personnel AND location is ANYTHING BUT Century City, disable just class
      if (
        RECORD_IDS.departmentRecordId !== "2" &&
        RECORD_IDS.departmentRecordId !== "1" &&
        RECORD_IDS.classRecordId === "1" &&
        RECORD_IDS.locationRecordId !== "14"
      ) {
        FIELD_IDS.classFieldId.isDisabled = true;
        // if neither conditions, enable class and location
      } else {
        FIELD_IDS.classFieldId.isDisabled = false;
        FIELD_IDS.locationFieldId.isDisabled = false;
      }
    } catch (err) {
      console.log("pageinit error:", err);
    }
  }
  function setFieldObj(context) {
    try {
      currEmpRecord = context.currentRecord;
      console.log(currEmpRecord);
      FIELD_IDS = {
        departmentFieldId: currEmpRecord.getField({
          fieldId: "department",
        }),
        classFieldId: currEmpRecord.getField({
          fieldId: "class",
        }),
        locationFieldId: currEmpRecord.getField({
          fieldId: "location",
        }),
      };
    } catch (err) {
      console.log("setFieldObj error:", err);
    }
  }

  function refreshRecordObj(context) {
    try {
      currEmpRecord = context.currentRecord;
      console.log(currEmpRecord);
      RECORD_IDS = {
        departmentRecordId: currEmpRecord.getValue({
          fieldId: "department",
        }),
        classRecordId: currEmpRecord.getValue({
          fieldId: "class",
        }),
        locationRecordId: currEmpRecord.getValue({
          fieldId: "location",
        }),
      };
      console.log("field entity id object:", RECORD_IDS);
    } catch (err) {
      console.log(err);
    }
  }
  function validateField(context) {
    try {
      validationInput = context.fieldId;
      console.log(validationInput);

      refreshRecordObj(context);

      // only department/class/location inputs will run
      if (
        validationInput === "department" ||
        validationInput === "class" ||
        validationInput === "location"
      ) {
        // if sales/engineering AND not consulting and not Century City
        if (
          (RECORD_IDS.departmentRecordId === "2" ||
            RECORD_IDS.departmentRecordId === "1") &&
          RECORD_IDS.classRecordId !== "2" &&
          RECORD_IDS.locationRecordId !== "14"
        ) {
          // if engineering/sales & if location is century city..
          dialog.alert({
            title: "location limitation",
            message:
              "If department is Sales or Engineering,\n class must be Consulting & project MGMT \n and location MUST be Century City",
          });
          return true;
          // if it is not sales/engineering and IS century city
        } else if (
          RECORD_IDS.departmentRecordId !== "2" &&
          RECORD_IDS.departmentRecordId !== "1" &&
          RECORD_IDS.locationRecordId === "14"
        ) {
          dialog.alert({
            title: "class limitation",
            message:
              "If department is NOT Sales or Engineering,\n class MUST be Personnel,\n and location can be anything BUT Century City",
          });
          return true;
        }
        // if it is not sales/engineering and IS not century city
        else return true;
        // if not validationInput is not department/sales/location, simply return
      } else return true;
    } catch (err) {
      console.log("validateField error:", err);
    }
  }
  function fieldChanged(context) {
    try {
      // which field was changed:
      fieldRecordChanged = context.fieldId;
      console.log(fieldRecordChanged);

      // only department/location changes will run
      if (
        fieldRecordChanged !== "department" &&
        fieldRecordChanged !== "location"
      )
        return;

      refreshRecordObj(context);

      ///////// DEPARTMENT CHANGE //////////
      // if department change..
      if (fieldRecordChanged === "department") {
        // if has value..
        if (RECORD_IDS.departmentRecordId) {
          // if sales/engineering, set consulting, set century city
          if (
            RECORD_IDS.departmentRecordId === "1" ||
            RECORD_IDS.departmentRecordId === "2"
          ) {
            currEmpRecord.setValue({
              fieldId: "class",
              value: "2",
            });
            currEmpRecord.setValue({
              fieldId: "location",
              value: "14",
            });
            FIELD_IDS.locationFieldId.isDisabled = true;
            // if NOT sales/engineering
          }
          if (
            RECORD_IDS.departmentRecordId !== "1" &&
            RECORD_IDS.departmentRecordId !== "2"
          ) {
            // if NOT sales/engineering, set Personnel, enable location
            currEmpRecord.setValue({
              fieldId: "class",
              value: "1",
            });
            currEmpRecord.setValue({
              fieldId: "location",
              value: "",
            });
            FIELD_IDS.locationFieldId.isDisabled = false;
          }
          if (RECORD_IDS.locationRecordId !== "14") {
            currEmpRecord.setValue({
              fieldId: "location",
              value: "",
            });
            FIELD_IDS.locationFieldId.isDisabled = false;
          }
          // if no value, location disabled, reset class and location
        } else {
          FIELD_IDS.locationFieldId.isDisabled = true;
          currEmpRecord.setValue({
            fieldId: "class",
            value: "",
          });
          currEmpRecord.setValue({
            fieldId: "location",
            value: "",
          });
        }
      } else {
        ////// LOCATION CHANGE ///////
        // if no value..
        if (!RECORD_IDS.departmentRecordId) return;
        // if NOT sales/engineering & Century City, reset and prompt
        if (
          RECORD_IDS.departmentRecordId !== "1" &&
          RECORD_IDS.departmentRecordId !== "2" &&
          RECORD_IDS.locationRecordId === "14"
        ) {
          currEmpRecord.setValue({
            fieldId: "location",
            value: "",
          });
        }
      }
    } catch (err) {
      console.log("fieldChanged error:", err);
    }
  }

  function saveRecord(context) {
    try {
      console.log(context);
      // assign a reference of current record
      currEmpRecord = context.currentRecord;
      if (currEmpRecord.type !== "employee") return false;
      refreshRecordObj(context);
      if (
        !RECORD_IDS.departmentRecordId ||
        !RECORD_IDS.classRecordId ||
        !RECORD_IDS.locationRecordId
      ) {
        dialog.alert({
          title: "Fields Missing",
          message:
            "Ensure you've entered the department, class and location fields and in the correct sequence!",
        });
        return false;
      } else return true;
    } catch (err) {
      console.log("savedRecord error:", err);
    }
  }
  return {
    pageInit: pageInit,
    saveRecord: saveRecord,
    validateField: validateField,
    fieldChanged: fieldChanged,
  };
});
