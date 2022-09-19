/*
----------- Use Cases: ----------
1) override TRUE: 
  - new Qty field enables
  - allows user to enter their own values
  - All of the values MUST add up to the Total Qty field

2) override FALSE:
  - script calcs the curr qty values.
  - this is what gets submitted



*/

/**
 *@NApiVersion 2.0
 *@NScriptType ClientScript
 */
define(["N/ui/message"], function (msg) {
  // UI components:
  var fieldId;
  var sublistField;
  var sublistId;
  var subLnCount;
  var itemRatioValue;
  var totalQuantityNum;
  var subLine;
  var newItemValue;

  // line memory:
  var lineKey;
  var itemTotalsArr = [];

  // UI messages:
  var overrideMsg;

  // UI id's:
  var overrideBoxId = "custpage_qty_dist_override_box";
  var totalQtyId = "custpage_total_quantity_field";
  var itemSublistId = "custpage_qty_dist_form_item_sublist";
  var currItemTotalsId = "custpage_curr_item_totals";
  var newItemTotalsId = "custpage_new_item_totals";
  var distRatioId = "custpage_qty_distribution_field";
  var lineKeyFieldId = "custpage_line_key_field";

  function pageInit(context) {
    try {
      currRecord = context.currentRecord;
      subLnCount = currRecord.getLineCount({
        sublistId: itemSublistId,
      });
      // create the message for future: msg.show() calls
      overrideMsg = msg.create({
        type: "information",
        title: "Override Feature Info",
        duration: 6500, // milliseconds
        message:
          "Ensure that the 'new qty' field of each line item equals the total quantity in the Main body field BEFORE submitting the form",
      });

      for (var i = 0; i < subLnCount; i++) {
        // initially, set all amount fields to disabled!
        sublistField = currRecord.getSublistField({
          sublistId: itemSublistId,
          fieldId: currItemTotalsId,
          line: i,
        });
        sublistField.isDisabled = true;
        sublistField = currRecord.getSublistField({
          sublistId: itemSublistId,
          fieldId: newItemTotalsId,
          line: i,
        });
        sublistField.isDisabled = true;

        // on pageInit construct the line/amount object in memory for future assignment on fieldChange
        // lineValue = currRecord.getSublistValue({
        //   sublistId: itemSublistId,
        //   fieldId: currItemTotalsId,
        //   line: i,
        // });

        lineKey = currRecord.getSublistValue({
          sublistId: itemSublistId,
          fieldId: lineKeyFieldId,
          line: i,
        });

        console.log("line Key:", lineKey);

        // on pageInit all of the amounts should be a 0 integer to be assigned on fieldChange
        itemTotalsArr[i] = {
          lineKey: lineKey,
          amount: 0,
        };
      }
      console.log("page init:", itemTotalsArr);
    } catch (err) {
      console.log(err);
    }
  }

  function fieldChanged(context) {
    try {
      fieldId = context.fieldId;
      sublistId = context.sublistId;
      currRecord = context.currentRecord;
      subLine = context.line;

      console.log(
        "FC:",
        "sublistId:",
        sublistId,
        "fieldId:",
        fieldId,
        "subLine:",
        subLine
      );

      // override box clicked:
      if (fieldId == overrideBoxId) toggleOverride(currRecord);

      // changed a new qty sublist field:
      if (fieldId == newItemTotalsId) {
        console.log("changed new item total fields:");

        // this is a MANUAL assignment
        // reset the itemTotalsArr:
        keyValue = currRecord.getSublistValue({
          sublistId: itemSublistId,
          fieldId: lineKeyFieldId,
          line: subLine,
        });
        // get the item that was changed
        newItemValue = currRecord.getSublistValue({
          sublistId: itemSublistId,
          fieldId: newItemTotalsId,
          line: subLine,
        });
        // reassign the itemTotalsArr based on which key/newItemValue was changed:
        itemTotalsArr[subLine].lineKey = keyValue;
        itemTotalsArr[subLine].amount = newItemValue;
        console.log("FC: manual:", itemTotalsArr);
      }

      // changed the total field:
      if (fieldId == totalQtyId) {
        // total qty field change:
        console.log("yes, the fieldId was totalQtyId");

        // check override value:
        overrideBoxValue = currRecord.getValue({
          fieldId: overrideBoxId,
        });

        // if the box is true, exit current code execution
        if (overrideBoxValue) return;
        else {
          // if box is false, calculate and set CURRQTY fields using ratio number:
          totalQuantityNum = currRecord.getValue({
            fieldId: totalQtyId,
          });

          console.log("FC num:", totalQuantityNum);

          for (var i = 0; i < subLnCount; i++) {
            itemRatioValue = currRecord.getSublistValue({
              sublistId: itemSublistId,
              fieldId: distRatioId,
              line: i,
            });
            currRecord.selectLine({
              sublistId: itemSublistId,
              line: i,
            });

            var currQtyVal = +Number.parseFloat(
              totalQuantityNum * itemRatioValue
            ).toFixed(2);

            currRecord.setCurrentSublistValue({
              sublistId: itemSublistId,
              fieldId: currItemTotalsId,
              value: currQtyVal,
            });

            // currItemValue = currRecord.getSublistValue({
            //   sublistId: itemSublistId,
            //   fieldId: currItemTotalsId,
            //   line: i,
            // });
            // reset the itemTotalsArr:
            keyValue = currRecord.getSublistValue({
              sublistId: itemSublistId,
              fieldId: lineKeyFieldId,
              line: subLine,
            });
            // reassigns lineKey:
            itemTotalsArr[subLine].lineKey = keyValue;
            itemTotalsArr[subLine].amount = currQtyVal;
          }
          console.log("FC calc: itemTotalsArr", itemTotalsArr);
        }
      }
    } catch (err) {
      console.log(err);
    }
  }

  function validateField(context) {
    try {
      fieldId = context.fieldId;
      sublistId = context.sublistId;
      subLine = context.line;

      console.log(
        "VF, field:",
        fieldId,
        "sublist:",
        sublistId,
        "subLine:",
        subLine
      );

      return true;
      // only validate that the fields entered are LESS than the total field
      // validate onSubmit that the values in the Array all add up to the total qty field val

      // if (fieldId === currItemTotalsId) {
      //   overrideBoxValue = currRecord.getValue({
      //     fieldId: overrideBoxId,
      //   });

      //   console.log("box:", overrideBoxValue);

      //   if (overrideBoxValue === true) {
      //     // get total quantity field value
      //     totalQuantityNum = currRecord.getValue({
      //       fieldId: totalQtyId,
      //     });
      //     console.log("total quantity:", totalQuantityNum);
      //     // if the user is using override, see if the individual amount will equal the total quantity when dividing by the item's ratio
      //     itemRatioValue = currRecord.getSublistValue({
      //       sublistId: itemSublistId,
      //       fieldId: distRatioId,
      //       line: subLine,
      //     });

      //     console.log("ratio:", itemRatioValue);

      //     sublistLineAmount = currRecord.getSublistValue({
      //       sublistId: itemSublistId,
      //       fieldId: fieldId,
      //       line: subLine,
      //     });

      //     console.log("sublistLineAmount", sublistLineAmount);

      //     console.log("math:", sublistLineAmount / itemRatioValue);

      //     if (totalQuantityNum === sublistLineAmount / itemRatioValue)
      //       return true;
      //   }
      // }
    } catch (err) {
      console.log(err);
    }
  }

  function toggleOverride(currRecord) {
    // Handles the user's VIEW:
    // apparently .isDisabled should affect the ENTIRE sublist column, however during testing this did not work! Only the field specified was disabled

    // set the variable to the value:
    overrideBoxValue = currRecord.getValue({
      fieldId: overrideBoxId,
    });

    // if the override box is TRUE, show message
    if (overrideBoxValue === true) overrideMsg.show();

    for (var i = 0; i < subLnCount; i++) {
      sublistField = currRecord.getSublistField({
        sublistId: itemSublistId,
        fieldId: newItemTotalsId,
        line: i,
      });

      // reset the new QTY sublist values to an empty string
      currRecord.selectLine({
        sublistId: itemSublistId,
        line: i,
      });
      currRecord.setCurrentSublistValue({
        sublistId: itemSublistId,
        fieldId: newItemTotalsId,
        value: "",
      });

      sublistField.isDisabled === true
        ? (sublistField.isDisabled = false)
        : (sublistField.isDisabled = true);
    }
  }

  // assigned differently depending if the override box is activated or not.
  // if box is true: get values from NEW QTY
  // if box is false: get values form CURR QTY
  // this array will be used for our form validation onSubmit
  // Recalculates the item totalsArr:

  return {
    pageInit: pageInit,
    fieldChanged: fieldChanged,
    validateField: validateField,
  };
});

/*
 
you just need to validate that the line item equals the total quantity field
 
*/
