/*
----------- Use Cases: ----------
1) override: TRUE, then enter total quantity
fields SHOULD NOT populate, field's sum NEEDS to equal the value in Total Qty field

2) override: FALSE, enter total quantity FIRST, field values populate

3) override: FALSE, 

4) case 4

*/

/**
 *@NApiVersion 2.0
 *@NScriptType ClientScript
 */
define(["N/ui/message"], function (msg) {
  var fieldId;
  var sublistField;
  var sublistId;
  var subLnCount;
  var itemRatioValue;
  var totalQuantityNum;
  var subLine;

  // Field Value State: Tracks the values presently in the item totals fields. Their sum NEEDS to equal the value in totalQty field

  // Object Design:
  // var itemTotalsArr = [
  //   {lineKey: lineKey,
  //    amount: amount},
  //   lineKey: lineKey,
  //    amount: amount},
  //   lineKey: lineKey,
  //    amount: amount},
  // ];

  // line memory:
  var lineKey;
  var lineValue;
  var itemTotalsArr = [];
  var fieldValueSum;
  var overrideMsg;

  // UI id's:
  var overrideBoxId = "custpage_qty_dist_override_box";
  var totalQtyId = "custpage_total_quantity_field";
  var itemSublistId = "custpage_qty_dist_form_item_sublist";
  var itemTotalsId = "custpage_item_totals";
  var distRatioId = "custpage_qty_distribution_field";
  var lineKeyField = "custpage_line_key_field";

  function pageInit(context) {
    try {
      currRecord = context.currentRecord;
      subLnCount = currRecord.getLineCount({
        sublistId: itemSublistId,
      });

      overrideMsg = msg.create({
        type: "information",
        title: "Override Feature Info",
        duration: 6500, // milliseconds
        message:
          "Ensure that the 'amount' of each line item equals the total quantity in the Main body field",
      });

      for (var i = 0; i < subLnCount; i++) {
        // initially, set all amount fields to disabled!
        sublistField = currRecord.getSublistField({
          sublistId: itemSublistId,
          fieldId: itemTotalsId,
          line: i,
        });
        sublistField.isDisabled = true;

        // construct the line/amount object in memory

        lineValue = currRecord.getSublistValue({
          sublistId: itemSublistId,
          fieldId: itemTotalsId,
          line: i,
        });

        lineKey = currRecord.getSublistValue({
          sublistId: itemSublistId,
          fieldId: lineKeyField,
          line: i,
        });

        console.log("line Key:", lineKey);

        itemTotalsArr[i] = {
          lineKey: lineKey,
          amount: lineValue,
        };
      }
      console.log(itemTotalsArr);
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
      // override box change:
      if (fieldId == overrideBoxId) {
        toggleOverride(currRecord);
        overrideMsg.show();
      }

      // item total field change:
      if (fieldId == itemTotalsId) {
        itemValue = currRecord.getSublistValue({
          sublistId: itemSublistId,
          fieldId: itemTotalsId,
          line: subLine,
        });

        keyValue = currRecord.getSublistValue({
          sublistId: itemSublistId,
          fieldId: lineKeyField,
          line: subLine,
        });

        console.log("key:", keyValue, "item:", itemValue);

        itemTotalsArr[subLine].lineKey = keyValue;
        itemTotalsArr[subLine].amount = itemValue;
      }
      console.log("FC: itemTotalsArr:", itemTotalsArr);

      // if each line's amount is filled out THEN we perform the calculation:
      for (var i = 0; i < itemTotalsArr.length; i++) {
        console.log("iteration:", itemTotalsArr[i].amount);

        /*
         
        fix below!
         
        */
        // the += operator is not doing what I want!
        fieldValueSum += itemTotalsArr[i].amount;

        console.log("itemFieldSum:", fieldValueSum);
      }

      // total qty field change:
      if (fieldId == totalQtyId) {
        totalQuantityNum = currRecord.getValue({
          fieldId: fieldId,
        });

        console.log("FC num:", totalQuantityNum);

        for (var i = 0; i < subLnCount; i++) {
          itemRatioValue = currRecord.getSublistValue({
            sublistId: itemSublistId,
            fieldId: distRatioId,
            line: i,
          });
          console.log(i, itemRatioValue);

          console.log(i, totalQuantityNum * itemRatioValue);

          console.log(
            Number.parseFloat(totalQuantityNum * itemRatioValue).toFixed(2)
          );
          currRecord.selectLine({
            sublistId: itemSublistId,
            line: i,
          });
          currRecord.setCurrentSublistValue({
            sublistId: itemSublistId,
            fieldId: itemTotalsId,
            value: Number.parseFloat(totalQuantityNum * itemRatioValue).toFixed(
              2
            ),
          });
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

      // push unique fieldIds to the array
      // if (sublistId === itemSublistId && !itemTotalsArr.includes(fieldId))
      //   addFieldValues(fieldId);

      return true;
      // if (fieldValueSum) {
      //   console.log("we're good!");
      //   return true;
      // } else {
      //   console.log("line totals do not equal grand total");
      //   return false;
      // }
    } catch (err) {
      console.log(err);
    }
  }

  // function addFieldValues(id) {
  //   itemTotalsArr.push(id);
  //   fieldValueSum = itemTotalsArr.reduce(function (prev, curr) {
  //     prev + curr;
  //   });
  //   console.log("fieldValueSum:", fieldValueSum);
  // }

  function toggleOverride(currRecord) {
    // apparently .isDisabled should affect the ENTIRE sublist column, however during testing this did not work! Only the field specified was disabled
    for (var i = 0; i < subLnCount; i++) {
      sublistField = currRecord.getSublistField({
        sublistId: itemSublistId,
        fieldId: itemTotalsId,
        line: i,
      });

      sublistField.isDisabled === true
        ? (sublistField.isDisabled = false)
        : (sublistField.isDisabled = true);
    }
  }

  return {
    pageInit: pageInit,
    fieldChanged: fieldChanged,
    validateField: validateField,
  };
});
