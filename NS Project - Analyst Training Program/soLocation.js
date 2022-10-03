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
      if (lineLocationVal !== headerLocationVal) return false;
      else return true;
    }
  }

  // validates a new line being added/created:
  function validateLine(context) {
    try {
      currRecord = context.currentRecord;
      sublistId = context.sublistId;
      if (sublistId === "item") {
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
      return true;
    } catch (err) {
      console.log(err);
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

      if (!lineLocationVal) {
        headerLocationVal = currRecord.getValue({
          fieldId: "location",
        });
        if (!headerLocationVal) {
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
              ignoreFieldChange: true,
            });

            // commit the currently selected line
            currRecord.commitLine({
              sublistId: "item",
            });
          }
        }
      }

      // items:
      // 27012;
      // 27034;
      // 27320;

      // line level location fieldChange:
      if (fieldId === "location" && sublistId === "item") {
        console.log("FC: line location");

        headerLocationVal = currRecord.getValue({
          fieldId: "location",
        });
        lineLocationVal = currRecord.getCurrentSublistValue({
          sublistId: "item",
          fieldId: "location",
        });

        if (headerLocationVal !== lineLocationVal) {
          // window.alert(
          //   "line-level location and header-level location values MUST match!"
          // );
          dialog.alert({
            title: "Location Warning",
            message:
              "line-level location and header-level location values MUST match!",
          });
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
    fieldChanged: fieldChanged,
  };
});
