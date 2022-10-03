/**
 *@NApiVersion 2.1
 *@NScriptType Suitelet
 */
define(["N/ui/serverWidget", "N/search", "N/record"], function (
  ui,
  search,
  record
) {
  function onRequest(context) {
    try {
      if (context.request.method == "GET") {
        log.debug({
          title: "request params:",
          details: context.request,
        });

        let reqParams = context.request.parameters;

        log.debug({
          title: "reqParams:",
          details: reqParams,
        });

        const sublistItems = JSON.parse(reqParams.sublistItems);
        const currRecordId = reqParams.currRecordId;
        const currRecordType = reqParams.currRecordType;

        log.debug({
          title: "sublistItems:",
          details: sublistItems,
        });

        if (currRecordType !== "salesorder") return;

        // create the form
        const qtyDistForm = ui.createForm({
          title: "qty distribution",
        });

        qtyDistForm.clientScriptFileId = 17164;

        qtyDistForm.addFieldGroup({
          id: "custpage_header_fieldgroup",
          label: "Main",
        });

        const overrideBox = qtyDistForm.addField({
          id: "custpage_qty_dist_override_box",
          label: "override?",
          type: "checkbox",
          container: "custpage_header_fieldgroup",
        });

        const recordTypeField = qtyDistForm.addField({
          id: "custpage_record_type_hidden",
          label: "recordType",
          type: "text",
          container: "custpage_header_fieldgroup",
        });

        recordTypeField.updateDisplayType({
          displayType: "hidden",
        });

        recordTypeField.defaultValue = currRecordType;

        const recordIdField = qtyDistForm.addField({
          id: "custpage_record_id_hidden",
          label: "recordId",
          type: "text",
          container: "custpage_header_fieldgroup",
        });

        recordIdField.updateDisplayType({
          displayType: "hidden",
        });

        recordIdField.defaultValue = currRecordId;

        const totalField = qtyDistForm.addField({
          id: "custpage_total_quantity_field",
          label: "Total Quantity",
          type: "float",
          container: "custpage_header_fieldgroup",
        });

        totalField.updateDisplayType({
          displayType: "entry",
        });

        totalField.updateDisplaySize({
          height: 60,
          width: 15,
        });

        totalField.isMandatory = true;

        qtyDistForm.addSubmitButton({
          label: "Submit",
        });

        const itemSublist = qtyDistForm.addSublist({
          id: "custpage_qty_dist_form_item_sublist",
          label: "Item",
          tab: "item",
          type: "list",
        });

        const nameField = itemSublist.addField({
          id: "custpage_item_name_field",
          label: "Name",
          type: "text",
        });

        const lineKeyField = itemSublist.addField({
          id: "custpage_line_key_field",
          label: "Line Key",
          type: "text",
        });

        // hidden unique line key field:
        lineKeyField.updateDisplayType({
          displayType: "hidden",
        });

        const distRatioField = itemSublist.addField({
          id: "custpage_qty_distribution_field",
          label: "Ratio Number",
          type: "float",
        });

        //   distRatioField.updateDisplaySize({
        //     height: 10,
        //     width: 10,
        //   });

        const currItemTotalsField = itemSublist.addField({
          id: "custpage_curr_item_totals",
          label: "current qty",
          type: "float",
        });

        currItemTotalsField.updateDisplayType({
          displayType: "entry",
        });

        currItemTotalsField.isMandatory = true;

        const newItemTotalsField = itemSublist.addField({
          id: "custpage_new_item_totals",
          label: "new qty",
          type: "float",
        });

        newItemTotalsField.isMandatory = true;

        newItemTotalsField.updateDisplayType({
          displayType: "entry",
        });

        // const newAmountTotalsField = itemSublist.addField({
        //   id: "custpage_new_amount_field",
        //   label: "amount",
        //   type: "float",
        // });

        // newAmountTotalsField.isMandatory = true;

        // newAmountTotalsField.updateDisplayType({
        //   displayType: "entry",
        // });

        // array used as the filter for our search method below
        let itemIds = [];
        for (let i = 0; i < sublistItems.length; i++) {
          let lineKey = Object.keys(sublistItems[i]);
          let itemId = Object.keys(sublistItems[i][lineKey]);

          // used for search method:
          itemIds.push(+itemId);

          // sets the hidden uniquelinekeyfield:
          itemSublist.setSublistValue({
            id: "custpage_line_key_field",
            line: i,
            value: lineKey,
          });

          // sets the currQty field:
          itemSublist.setSublistValue({
            id: "custpage_curr_item_totals",
            line: i,
            value: sublistItems[i][lineKey][itemId],
          });
        }

        log.debug({
          title: "itemIds",
          details: itemIds,
        });
        // create a search to lookup the Item Record: qty distribution values:
        let i = 0;
        search
          .create({
            type: "item",
            filters: [["internalid", "anyof", itemIds]],
            columns: ["custitem7", "displayname"],
          })
          .run()
          .each((result) => {
            log.debug({
              title: 'results"',
              details: result,
            });

            itemSublist.setSublistValue({
              id: "custpage_item_name_field",
              line: i,
              value: result.getValue({
                name: "displayname",
              }),
            });

            itemSublist.setSublistValue({
              id: "custpage_qty_distribution_field",
              line: i,
              value: result.getValue({
                name: "custitem7",
              }),
            });

            i++;
            return true;
          });

        if (overrideBox === "T") {
          distRatioField.updateDisplayType({
            displayType: "entry",
          });
        }

        context.response.writePage({
          pageObject: qtyDistForm,
        });
      } else {
        // POST block: save the record with information on the suitelet form
        log.debug({
          title: "POST request parameters:",
          details: context.request.parameters,
        });
        // POST (once we click the SubmitBtn)
        const req = context.request;
        const lnCount = req.getLineCount({
          group: "custpage_qty_dist_form_item_sublist",
        });

        const boxVal = req.parameters.custpage_qty_dist_override_box;
        log.debug({
          title: "boxVal:",
          details: boxVal,
        });
        // let key = function(obj) {
        //   return obj.
        // }

        ////// this below could be not needed???!!

        let sublistValObj = {};
        let quantity;
        let key;
        let amount;

        for (let i = 0; i < lnCount; i++) {
          key = req.getSublistValue({
            group: "custpage_qty_dist_form_item_sublist",
            line: i,
            name: "custpage_line_key_field",
          });

          quantity = +req.getSublistValue({
            group: "custpage_qty_dist_form_item_sublist",
            line: i,
            name: "custpage_new_item_totals",
          });

          // amount = +req.getSublistValue({
          //   group: "custpage_qty_dist_form_item_sublist",
          //   line: i,
          //   name: "custpage_new_amount_field",
          // });
          // each line has a unique linekey, validation was already done in the client script!
          sublistValObj[key] = {
            quantity: quantity,
            // amount: amount,
          };
        }

        log.debug({
          title: "sublistValObj:",
          details: sublistValObj,
        });

        // special hidden fields with critical data:
        const recordId = req.parameters.custpage_record_id_hidden;
        const recordType = req.parameters.custpage_record_type_hidden;

        /// load record based on above^
        const ogRecord = record.load({
          type: recordType,
          id: recordId,
        });

        log.debug({
          title: "ogRecord:",
          details: ogRecord,
        });

        // get line count:
        let lineCount = ogRecord.getLineCount({
          sublistId: "item",
        });

        log.debug({
          title: "ogRecord ln Count:",
          details: lineCount,
        });

        let lineKeyArr = Object.keys(sublistValObj);

        // set the sublist on the copied record
        for (let i = 0; i < lineCount; i++) {
          log.debug({
            title: "iteration values:",
            details: sublistValObj[lineKeyArr[i]].quantity,
          });
          ogRecord.setSublistValue({
            sublistId: "item",
            fieldId: "quantity",
            line: i,
            value: sublistValObj[lineKeyArr[i]].quantity,
          });

          // ogRecord.setSublistValue({
          //   sublistId: "item",
          //   fieldId: "amount",
          //   line: i,
          //   value: sublistValObj[lineKeyArr[i]].amount,
          // });
        }

        ogRecord.save();

        log.debug({
          title: "ogRecord POST save:",
          details: ogRecord,
        });
      }
    } catch (err) {
      log.debug({
        title: "try/catch error:",
        details: err,
      });
    }
  }

  return {
    onRequest: onRequest,
  };
});
