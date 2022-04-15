// when new employee records are being created users must first enter department, then class, then location, when user selects a department, if engineering or sales selected then the class must be 'consulting & project mgmt'. When consulting and project mgmt is selected, location must be Century City.

// If any of the fields change make sure to validate the logic of the above and if it doesnt apply RESET the fields and alert the user for reentry. If department is NOT engineering or sales, class must be Personnel and location can be anything BUT Century City

// do not allow new employee records from being saved if either department location or class fields are empty.

/**
 *@NApiVersion 2.x
 *@NScriptType ClientScript
 */
define(["N/ui/dialog"], function (dialog) {
  // record and currentrecord modules are auto loaded with a Client Script declared in the JS Docs apparently???

  function fieldChanged(context) {
    if (context.mode !== "edit") return;

    var currEmpRecord = context.currentRecord;
    console.log(currEmpRecord);
    var department = currEmpRecord.getValue({
      fieldId: "department",
    });
    var _class = currEmpRecord.getValue({
      fieldId: "class",
    });
    var location = currEmpRecord.getValue({
      fieldId: "location",
    });

    console.log(department, _class, location);
  }

  function validateField(context) {
    var contextType = context.type;
    var contextName = context.name;
    var contextLinenum = context.linenum;
    console.log(contextType, contextName, contextLinenum);

    // if (context.mode !== "edit") return;
    // validateField requires a boolean return
    // if (department !== entered) return alert("You must enter a department first");
    // if (engineering || sales)
    //     classes = 'consulting and project management'
    //     else {classes = 'Personnel';
    //         location = anything BUT Century City
    // }
    // if (classes !== entered) return alert("you must enter a class first");
    // if (classes === "consulting and project management")
    //   location = "Century City";
    // if (location !== entered) return alert("you must enter a class first");
  }

  function saveRecord(context) {
    // always return a boolean
  }

  return {
    saveRecord: saveRecord,
    validateField: validateField,
    fieldChanged: fieldChanged,
  };
});
