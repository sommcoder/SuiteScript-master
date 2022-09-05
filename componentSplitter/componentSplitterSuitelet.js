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
        const tranId = reqParams.tranId;

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

        const totalField = qtyDistForm.addField({
          id: "custpage_total_quantity_field",
          label: "Total Quantity",
          type: "integer",
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

        //   nameField.updateDisplaySize({
        //     height: 10,
        //     width: 10,
        //   });

        const distRatioField = itemSublist.addField({
          id: "custpage_qty_distribution_field",
          label: "Qty Ratio",
          type: "float",
        });

        //   distRatioField.updateDisplaySize({
        //     height: 10,
        //     width: 10,
        //   });

        const itemTotalsField = itemSublist.addField({
          id: "custpage_item_totals",
          label: "amount",
          type: "float",
        });

        itemTotalsField.updateDisplayType({
          displayType: "entry",
        });

        itemTotalsField.isMandatory = true;

        // itemTotalsField.updateDisplayType({
        //   displayType: "disabled",
        // });

        let itemIds = [];
        for (let i = 0; i < sublistItems.length; i++) {
          let key = Object.keys(sublistItems[i]);

          log.debug({
            title: "key",
            details: key,
          });
          // used to search for the item internal ids:
          itemIds.push(sublistItems[i][key]);

          // sets the hidden uniquelinekeyfield:
          itemSublist.setSublistValue({
            id: "custpage_line_key_field",
            line: i,
            value: key,
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
        // save the record with information on the suitelet form
        log.debug({
          title: "POST request:",
          details: context,
        });
        // POST (once we click the SubmitBtn)
        const req = context.request;
        const lnCount = req.getLineCount({
          group: "custpage_qty_dist_form_item_sublist",
        });
        let sublistValues = [];

        for (let i = 0; i < lnCount; i++) {
          sublistValues.push(
            +req.getSublistValue({
              group: "custpage_qty_dist_form_item_sublist",
              line: i,
              name: "custpage_item_totals",
            })
          );
        }
        log.debug({
          title: "sublistValues:",
          details: sublistValues,
        });
        let fieldValueSum = sublistValues.reduce((pre, cur) => pre + cur);
        log.debug({
          title: "fieldValueSum POST:",
          details: fieldValueSum,
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
