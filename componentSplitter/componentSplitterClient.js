/**
 *@NApiVersion 2.0
 *@NScriptType ClientScript
 */
define(["N/ui/message", "N/error"], function (msg, error) {
  // context variables:
  var fieldId;
  var subLine;
  var sublistField;
  var sublistId;

  //
  var subLnCount;
  var newItemValue;

  // memory:
  var lineKey;
  var itemTotalsArr = [];
  var ratioWeightTotal = 0;
  var itemRatioValue;
  var totalQuantityNum;
  var totalCalcItemVals = 0;

  // UI messages:
  var overrideMsg;
  var failedEntryMsg;

  // Custom UI internal id's:
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

      failedEntryMsg = msg.create({
        type: "warning",
        title: "Incorrect Quantity Values",
        duration: 6500, // milliseconds
        message:
          "the sum of the line items DO NOT equal the value in the 'Total Quantity' field",
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

        lineKey = currRecord.getSublistValue({
          sublistId: itemSublistId,
          fieldId: lineKeyFieldId,
          line: i,
        });

        console.log("line Key:", lineKey);

        ratioWeightTotal += currRecord.getSublistValue({
          sublistId: itemSublistId,
          fieldId: distRatioId,
          line: i,
        });

        console.log("ratioweighttotal:", ratioWeightTotal);

        // set the inital values for linekey/qty object for each item line in the sublist:
        itemTotalsArr[i] = {
          lineKey: lineKey,
          qty: 0,
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
        itemTotalsArr[subLine].qty = newItemValue;
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
          // if box is false, calculate and set NEWQTY fields using ratio number:
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
            console.log(
              "math check:",
              (itemRatioValue / ratioWeightTotal) * totalQuantityNum
            );

            var newQtyVal = +Number.parseFloat(
              (itemRatioValue / ratioWeightTotal) * totalQuantityNum
            ).toFixed(2);

            console.log("newQtyValue", newQtyVal);

            currRecord.setCurrentSublistValue({
              sublistId: itemSublistId,
              fieldId: newItemTotalsId,
              value: newQtyVal,
            });

            // reset the itemTotalsArr:
            keyValue = currRecord.getSublistValue({
              sublistId: itemSublistId,
              fieldId: lineKeyFieldId,
              line: subLine,
            });
            // reassigns lineKey:
            itemTotalsArr[subLine].lineKey = keyValue;
            itemTotalsArr[subLine].qty = newQtyVal;
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
      // do I need any validations?
      // each newQty field SHOULD be less than the value in the 'Total Qty' field

      return true;
    } catch (err) {
      console.log(err);
    }
  }

  function saveRecord(context) {
    try {
      currRecord = context.currentRecord;

      // throw error if Total QTY field has no value
      if (
        !currRecord.getValue({
          fieldId: totalQtyId,
        })
      ) {
        console.log("total qty has no value");
        return false;
      }

      // sums the individual line item qty's:
      for (var i = 0; i < itemTotalsArr.length; i++)
        totalCalcItemVals += itemTotalsArr[i].qty;

      // total must EQUAl the total qty fields value:
      if (Math.ceil(totalCalcItemVals) === totalQuantityNum) {
        return true;
      } else {
        failedEntryMsg.show();
        return false;
      }
    } catch (err) {
      log.debug({
        title: "try/catch error:",
        details: err,
      });
    }
  }

  function toggleOverride(currRecord) {
    try {
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
    } catch (err) {
      log.debug({
        title: "try/catch error:",
        details: err,
      });
    }
  }

  return {
    pageInit: pageInit,
    fieldChanged: fieldChanged,
    validateField: validateField,
    saveRecord: saveRecord,
  };
});
