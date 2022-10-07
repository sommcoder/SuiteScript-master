/*

new or old lineInit && location === blank {
  populate Header Location (if exists)
}

header location changed, change all line locations

line level location changed, throw alert if != to headerLocation

*/

/**
 *@NApiVersion 2.0
 *@NScriptType ClientScript
 */
define(["N/ui/dialog"], function (dialog) {
  var currRecord;
  var headerLocationVal;
  var lineLocationVal;
  var sublistId;
  var fieldId;
  var lnCount;

  function saveRecord(context) {
    currRecord = context.currentRecord;
    lnCount = currRecord.getLineCount({
      sublistId: "item",
    });
    console.log("saveRecord!");
    // each item sublist item's location value should be equal to the header's location value
    for (var i = 0; i < lnCount; i++) {
      // iterate through sublist lines
      currRecord.selectLine({
        sublistId: "item",
        line: i,
      });
      lineLocationVal = currRecord.getCurrentSublistValue({
        sublistId: "item",
        fieldId: "location",
      });
      // if ANY of the lines DO NOT equal the headLocationVal, return false!
      if (lineLocationVal !== headerLocationVal) return false;
      else return true;
    }
  }

  // user selects the sublist line:
  function lineInit(context) {
    try {
      currRecord = context.currentRecord;
      sublistId = context.sublistId;

      lineLocationVal = currRecord.getCurrentSublistValue({
        sublistId: "item",
        fieldId: "location",
      });
      // if the line being "initted" evals falsey
      // ie. line-location is not entered yet
      if (!lineLocationVal) {
        headerLocationVal = currRecord.getValue({
          fieldId: "location",
        });
        if (headerLocationVal) {
          currRecord.setCurrentSublistValue({
            sublistId: "item",
            fieldId: "location",
            value: headerLocationVal,
          });
        }
      }
    } catch (err) {
      console.log(err);
    }
  }

  function validateLine(context) {
    currRecord = context.currentRecord;
    sublistId = context.sublistId;
    headerLocationVal = currRecord.getValue({
      fieldId: "location",
    });
    lineLocationVal = currRecord.getCurrentSublistValue({
      sublistId: "item",
      fieldId: "location",
    });

    if (lineLocationVal && sublistId === "item") {
      // and line DOESN'T equal the header-level location:
      if (headerLocationVal !== lineLocationVal) {
        dialog.alert({
          title: "Location Warning",
          message:
            "line-level location and header-level location values MUST match!",
        });
        return false;
      }
    }
    return true;
  }

  function validateField(context) {
    currRecord = context.currentRecord;
    fieldId = context.fieldId;
    sublistId = context.sublistId;

    headerLocationVal = currRecord.getValue({
      fieldId: "location",
    });
    lineLocationVal = currRecord.getCurrentSublistValue({
      sublistId: "item",
      fieldId: "location",
    });
    console.log("validateField:", fieldId);

    // if the user adds value to the line-level location:
    if (lineLocationVal && sublistId === "item") {
      // and line DOESN'T equal the header-level location:
      if (headerLocationVal !== lineLocationVal) {
        dialog.alert({
          title: "Location Warning",
          message:
            "line-level location and header-level location values MUST match!",
        });
      }
      // if no line location value, initiallly set to headerLocationVal
    } else {
      currRecord.setCurrentSublistValue({
        sublistId: "item",
        fieldId: "location",
        value: headerLocationVal,
        ignoreFieldChange: true,
      });
    }
    return true;
  }

  function fieldChanged(context) {
    try {
      currRecord = context.currentRecord;
      sublistId = context.sublistId;
      fieldId = context.fieldId;
      line = context.line;

      // header location field changes:
      if (fieldId === "location" && sublistId === null) {
        console.log("FC: header location");
        headerLocationVal = currRecord.getValue({
          fieldId: "location",
        });
        console.log("headerLocationVal:", headerLocationVal);
        lnCount = currRecord.getLineCount({
          sublistId: "item",
        });
        console.log("lnCount:", lnCount);

        for (var i = 0; i < lnCount; i++) {
          // iterate through & select the sublist lines
          currRecord.selectLine({
            sublistId: "item",
            line: i,
          });

          // get lineLocationVal
          lineLocationVal = currRecord.getCurrentSublistValue({
            sublistId: "item",
            fieldId: "location",
          });

          if (lineLocationVal !== headerLocationVal) {
            // set the sublistFields
            currRecord.setCurrentSublistValue({
              sublistId: "item",
              fieldId: "location",
              value: headerLocationVal,
              ignoreFieldChange: true, // this is imperative, otherwise on fieldChange that new event trigger perhaps ends the execution of the for loop???
            });

            // commit the currently selected line
            currRecord.commitLine({
              sublistId: "item",
            });
          }
        }
      }
    } catch (err) {
      console.log(err);
    }
  }
  return {
    lineInit: lineInit,
    saveRecord: saveRecord,
    validateLine: validateLine,
    validateField: validateField,
    fieldChanged: fieldChanged,
  };
});
