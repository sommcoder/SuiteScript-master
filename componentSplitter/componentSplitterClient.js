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
define([], function () {
  var fieldId;
  var sublistField;
  var subLnCount;
  var itemRatioValue;
  var totalQuantityNum;
  var subLine;

  // Field Value State: Tracks the values presently in the item totals fields. Their sum NEEDS to equal the value in totalQty field
  var itemTotalsArr = [];
  var fieldValueSum;

  // UI id's:
  var overrideBoxId = "custpage_qty_dist_override_box";
  var totalQtyId = "custpage_total_quantity_field";
  var itemSublistId = "custpage_qty_dist_form_item_sublist";
  var itemTotalsId = "custpage_item_totals";
  var distRatioId = "custpage_qty_distribution_field";

  function pageInit(context) {
    try {
      currRecord = context.currentRecord;
      subLnCount = currRecord.getLineCount({
        sublistId: itemSublistId,
      });
      for (var i = 0; i < subLnCount; i++) {
        sublistField = currRecord.getSublistField({
          sublistId: itemSublistId,
          fieldId: itemTotalsId,
          line: i,
        });
        sublistField.isDisabled = true;
      }
    } catch (err) {
      console.log(err);
    }
  }

  function fieldChanged(context) {
    try {
      console.log("FC:", context.fieldId);
      fieldId = context.fieldId;
      currRecord = context.currentRecord;
      if (fieldId == overrideBoxId) toggleOverride(currRecord);

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
      if (sublistId === itemSublistId && !itemTotalsArr.includes(fieldId))
        addFieldValues(fieldId);

      return true;
      // else return false
    } catch (err) {
      console.log(err);
    }
  }

  function addFieldValues(id) {
    itemTotalsArr.push(id);
    fieldValueSum = itemTotalsArr.reduce(function (prev, curr) {
      prev + curr;
    });
    console.log("fieldValueSum:", fieldValueSum);
  }

  // function postSourcing(context) {
  //   try {
  //     console.log("PS context:", context);
  //     console.log("PS sub:", context.sublistId);
  //     console.log("PS field:", context.fieldId);
  //     fieldId = context.fieldId;
  //   } catch (err) {
  //     console.log(err);
  //   }
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
    // postSourcing: postSourcing,
  };
});
