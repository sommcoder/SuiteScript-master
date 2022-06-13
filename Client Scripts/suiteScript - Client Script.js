// simple client script on employee record that on page load alerts who the user name is and alerts the employee name that they're on

// for existing employees only

// need the runtime module

// depending on the subsidiary of the employee, the phone number is expected in a certain format for Canada, must start with 519 or 647 and by 7 digit long entry for USA, must start with 333 902 and  is 7 digits long as well. All other subsidiaries must be 11 digits long

// create an alert to specify how many digits to input in the phone input

// employee record
// interal id: phone and subsidiary

/**
 *@NApiVersion 2.x
 *@NScriptType ClientScript
 */

define(["N/runtime"], function (runtime) {
  var currRecord;
  var subsidiaryChanged;

  function validatePhoneNumber() {
    if (subsidiaryChanged === "3" || subsidiaryChanged === "2")
      alert("you must enter a 7 digit phone number");
    else alert("you must enter a 11 digit phone number");
  }

  function pageInit(context) {
    console.log("pageInit", context);
    try {
      currRecord = context.currentRecord;
      var user = runtime.getCurrentUser().name;
      var employee = currRecord.getValue({
        fieldId: "entityid",
      });
      var activeEmp = currRecord.getValue({
        fieldId: "isinactive",
      });
      if (activeEmp === true) employee = "💥inactive🚫";
      alert(
        "You are user: " + user + " and are accessing employee: " + employee
      );
    } catch (err) {
      console.log(err);
    }
  }
  function validateField(context) {
    console.log("validate field", context);

    return true;
    // validateField requires a boolean to be returned
  }

  function fieldChanged(context) {
    console.log("field changed", context);

    if (context.fieldId != "subsidiary") return;

    subsidiaryChanged = context.currentRecord.getValue({
      fieldId: "subsidiary",
    });
    console.log(typeof subsidiaryChanged);

    validatePhoneNumber(subsidiaryChanged);
    console.log(subsidiaryChanged);

    if (SubsidiaryChanged === "Canada")
      try {
        var fieldChanged = context.fieldId;

        if (fieldChanged != "firstname" && fieldChanged != "lastname") return;

        currRecord = context.currentRecord;

        var empNewFirstName = currRecord.getValue({
          fieldId: "firstname",
        });
        var empNewLastName = currRecord.getValue({
          fieldId: "lastname",
        });
        var empNewName = empNewFirstName + "." + empNewLastName;

        var empNewEmail = empNewName.toLowerCase().concat("@myersholum.com");

        console.log(empNewEmail);

        currRecord.setValue({
          fieldId: "email",
          value: empNewEmail,
        });
      } catch (err) {
        console.error(err);
      }
  }
  return {
    pageInit: pageInit,
    fieldChanged: fieldChanged,
    validateField: validateField,
  };
});

// on change on the employee name, update the employee's email address to match the first name and last name order with a . in between and the myers holum email extension, toLowerCase()
