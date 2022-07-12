/* 

sales order:
have a button on sales order record called 'create copy', wehn pressed its going to display a popup (suitelet) where in the header it will default the current sales order infomration thats going to be copied which includes:
- customer
- subsidiary
- location
- department 
- class

but it will allow the user to change the location, department and class (customer/sub are not!)
futhermore it will show a sublist which includes the current items on the order, the information shown on the sublist will include item name, rate, quantity, expected shipdate. (all of these fields should be editable except for item name).

in front of each line a checkbox field will be generated to allow users to select which item will be copied over. onLoad of the popup, this checkbox field will be defaulted to checked for all lines. 

onSubmit of the popup, the sales order will be created with the information entered, and the webpage will be automatically REDIRECTED to the NEW ORDER. 

*/
/**
 *@NApiVersion 2.1
 *@NScriptType Suitelet
 */

define(["N/search", "N/ui/serverWidget", "N/record"], function (
  search,
  ui,
  record
) {
  function onRequest(context) {
    try {
      log.debug({
        title: "window.open() worked?",
        details: "yes!",
      });

      if (context.request.method == "GET") {
        log.debug({
          title: "passed GET?:",
          details: "yes!",
        });

        log.debug({
          title: "context:",
          details: context.request,
        });

        // global variable assignments:
        let reqParams = context.request.parameters;
        let recordId = reqParams.currRecordId;
        let recordType = reqParams.currRecordType;
        let recordTranId = reqParams.recordTranId;

        log.debug({
          title: "req params:",
          details: reqParams,
        });

        log.debug({
          title: "recordType AND recordId",
          details: [recordType, "AND", recordId],
        });

        const sublistItems = JSON.parse(reqParams.sublistValuesArr);

        // create the form on the script:
        const salesOrderCopyForm = ui.createForm({
          title: "Copy Order",
          hideNavBar: true,
        });

        ///////// display Order FieldGroup: /////////
        const customerDetailsFieldGroup = salesOrderCopyForm.addFieldGroup({
          id: "custpage_customer_details_field_group",
          label: "Info to copy:",
        });

        const customerField = salesOrderCopyForm.addField({
          id: "entity_field",
          label: "Customer",
          type: "text",
          container: "custpage_customer_details_field_group",
        });
        customerField.updateDisplayType({
          displayType: "inline",
        });

        const subsidiaryField = salesOrderCopyForm.addField({
          id: "subsidiary_field",
          label: "Subsidiary",
          type: "text",
          container: "custpage_customer_details_field_group",
        });
        subsidiaryField.updateDisplayType({
          displayType: "inline",
        });

        const locationField = salesOrderCopyForm.addField({
          id: "inpt_location_field",
          label: "Location",
          type: "select",
          container: "custpage_customer_details_field_group",
        });

        const departmentField = salesOrderCopyForm.addField({
          id: "inpt_department_field",
          label: "Department",
          type: "select",
          container: "custpage_customer_details_field_group",
        });

        const classField = salesOrderCopyForm.addField({
          id: "inpt_class_field",
          label: "Class",
          type: "select",
          container: "custpage_customer_details_field_group",
        });

        //////////// hidden fields:///////////
        const recordIdHiddenField = salesOrderCopyForm.addField({
          id: "record_id_hidden",
          label: "hidden",
          type: "text",
          container: "custpage_customer_details_field_group",
        });
        recordIdHiddenField.updateDisplayType({
          displayType: "hidden",
        });
        recordIdHiddenField.defaultValue = recordId;

        const recordTypeHiddenField = salesOrderCopyForm.addField({
          id: "record_type_hidden",
          label: "hidden",
          type: "text",
          container: "custpage_customer_details_field_group",
        });
        recordTypeHiddenField.updateDisplayType({
          displayType: "hidden",
        });
        recordTypeHiddenField.defaultValue = recordType;
        /////////////////////////////////////////

        ////////// item details sublist: ///////

        const itemDetailsSublist = salesOrderCopyForm.addSublist({
          id: "custpage_item_details_sublist",
          label: "Items to copy:",
          type: "list",
        });
        itemDetailsSublist.addMarkAllButtons();

        const checkboxField = itemDetailsSublist.addField({
          id: "checkbox_field",
          label: "select",
          type: "checkbox",
        });
        checkboxField.defaultValue = "T";

        const itemField = itemDetailsSublist.addField({
          id: "item_field",
          label: "Item",
          type: "text",
        });
        // item CANNOT be changed via User Entry!

        const rateField = itemDetailsSublist.addField({
          id: "rate_field",
          label: "Rate",
          type: "text",
        });
        rateField.updateDisplayType({
          displayType: "entry",
        });

        const quantityField = itemDetailsSublist.addField({
          id: "quantity_field",
          label: "Quantity",
          type: "text",
        });
        quantityField.updateDisplayType({
          displayType: "entry",
        });

        const shipdateField = itemDetailsSublist.addField({
          id: "shipdate_field",
          label: "Shipdate",
          type: "date",
        });
        shipdateField.updateDisplayType({
          displayType: "entry",
        });

        // function scoped variables:
        let i = 0; // counter variable
        let entityId;
        const departmentArr = [];
        const classArr = [];
        let subsidiary;

        // filter to find JUST the item(s) in the current sales order
        const uiDataSearchResults = search
          .create({
            type: recordType,
            filters: [
              ["internalid", "anyof", recordId],
              "AND",
              ["mainline", "is", "F"],
            ],
            columns: [
              "entity",
              "subsidiary",
              "department",
              "class",
              "item",
              "rate",
              "quantity",
              "shipdate",
            ],
          })
          .run()
          .each((result) => {
            // if result has an empty item iterate to NEXT result
            log.debug({
              title: "search began?",
              details: "YES!",
            });
            if (
              result.getValue({
                name: "item",
              }) <= 0
            )
              return;

            log.debug({
              title: "search results",
              details: result,
            });

            // // entity number:
            // entityId = result.getValue({
            //   name: "entity",
            // });

            // //non-select fields:

            // customerField.defaultValue = result.getText({
            //   name: "entity", // customer
            // });

            // subsidiaryField.defaultValue = result.getText({
            //   name: "subsidiary",
            // });

            // // to be used in the second saved search
            // subsidiary = result.getText({
            //   name: "subsidiary",
            // });

            // log.debug({
            //   title: "SubsidiaryValue:",
            //   details: subsidiary,
            // });

            // log.debug({
            //   title: "location Result",
            //   details: result.getValue({
            //     name: "location",
            //   }),
            // });

            // // select fields:
            // if (
            //   !locationArr.includes(
            //     result.getValue({
            //       name: "location",
            //     })
            //   )
            // ) {
            //   locationArr.push(
            //     result.getValue({
            //       name: "location",
            //     })
            //   );
            //   locationField.addSelectOption({
            //     value: result.getValue({
            //       name: "location",
            //     }),
            //     text: result.getText({
            //       name: "location",
            //     }),
            //   });
            // }

            // if (
            //   !departmentArr.includes(
            //     result.getValue({
            //       name: "department",
            //     })
            //   )
            // ) {
            //   departmentArr.push(
            //     result.getValue({
            //       name: "department",
            //     })
            //   );

            //   departmentField.addSelectOption({
            //     value: result.getValue({
            //       name: "department",
            //     }),
            //     text:
            //       result.getText({
            //         name: "department",
            //       }) || "",
            //   });
            // }

            // if (
            //   !classArr.includes(
            //     result.getValue({
            //       name: "class",
            //     })
            //   )
            // ) {
            //   classArr.push(
            //     result.getValue({
            //       name: "class",
            //     })
            //   );
            //   classField.addSelectOption({
            //     value: result.getValue({
            //       name: "class",
            //     }),
            //     text:
            //       result.getText({
            //         name: "class",
            //       }) || "",
            //   });
            // }

            // //////// item details sublist ///////

            // itemDetailsSublist.setSublistValue({
            //   id: "item_field",
            //   line: i,
            //   value:
            //     result.getText({
            //       name: "item",
            //     }) || "",
            // });
            // itemDetailsSublist.setSublistValue({
            //   id: "rate_field",
            //   line: i,
            //   value:
            //     result.getValue({
            //       name: "rate",
            //     }) || 0,
            // });
            // itemDetailsSublist.setSublistValue({
            //   id: "quantity_field",
            //   line: i,
            //   value:
            //     result.getValue({
            //       name: "quantity",
            //     }) || 0,
            // });

            // itemDetailsSublist.setSublistValue({
            //   id: "shipdate_field",
            //   line: i,
            //   value:
            //     result.getValue({
            //       name: "shipdate",
            //     }) || 0,
            // });

            // i++;

            return true;
          });

        log.debug({
          title: "search Results:",
          details: uiDataSearchResults,
        });

        // const locationArr = [];

        // search
        //   .create({
        //     type: recordType,
        //     filters: [
        //       ["subsidiary", "anyof", subsidiary],
        //       "AND",
        //       ["mainline", "is", "F"],
        //     ],
        //     columns: ["location"],
        //   })
        //   .run()
        //   .each((result) => {
        //     if (
        //       result.getValue({
        //         name: "location",
        //       }) <= 0
        //     )
        //       return;

        //     if (
        //       !locationArr.includes(
        //         result.getValue({
        //           name: "location",
        //         })
        //       )
        //     ) {
        //       locationArr.push(
        //         result.getValue({
        //           name: "location",
        //         })
        //       );
        //     }

        //     log.debug({
        //       title: "loc search results:",
        //       details: result,
        //     });
        //     return true;
        //   });

        // log.debug({
        //   title: "subsidiary Arr AFTER:",
        //   details: subsidiaryArr,
        // });

        const submitButton = salesOrderCopyForm.addSubmitButton({
          label: "Submit Record",
        });

        // WRITE Suitelet Page:
        context.response.writePage({
          pageObject: salesOrderCopyForm,
        });
      } else {
        // when form is submitted, a POST request is called when the submitButton is clicked!

        const reqParams = context.request.parameters;
        log.debug({
          title: "POST parameters:",
          details: reqParams,
        });

        const requestObj = context.request;

        log.debug({
          title: "Request Obj",
          details: requestObj,
        });

        const recordId = reqParams.record_id_hidden;
        const recordType = reqParams.record_type_hidden;

        log.debug({
          title: "POST: recordType & recordId:",
          details: [recordType, "AND", recordId],
        });

        // Form: Customer Details values:
        const classFieldValue = reqParams.inpt_class_field;

        log.debug({
          title: "classFieldValue:",
          details: classFieldValue,
        });

        const departmentFieldValue = reqParams.inpt_department_field;

        log.debug({
          title: "departmentFieldValue",
          details: departmentFieldValue,
        });

        const locationFieldValue = reqParams.inpt_location_field;

        log.debug({
          title: "locationFieldValue",
          details: locationFieldValue,
        });

        const sublistLineCount = requestObj.getLineCount({
          group: "custpage_item_details_sublist",
        });

        // copy the record
        const copiedRecord = record.copy({
          type: recordType,
          id: recordId,
        });

        log.debug({
          title: "copiedRecord",
          details: copiedRecord,
        });

        for (let i = 0; i < sublistLineCount.length; i++) {
          const item = requestObj.getSublistValue({
            group: "custpage_item_details_sublist",
            line: i,
            name: "item_field",
          });
          const rate = requestObj.getSublistValue({
            group: "custpage_item_details_sublist",
            line: i,
            name: "rate_field",
          });
          const quantity = requestObj.getSublistValue({
            group: "custpage_item_details_sublist",
            line: i,
            name: "quantity_field",
          });
          const shipDate = requestObj.getSublistValue({
            group: "custpage_item_details_sublist",
            line: i,
            name: "shipdate_field",
          });

          // set the sublist values on the copied Record
          copiedRecord.setSublistValue({
            sublistId: "custpage_item_details_sublist",
            fieldId: "item_field",
            line: i,
            value: item,
          });
          copiedRecord.setSublistValue({
            sublistId: "custpage_item_details_sublist",
            fieldId: "rate_field",
            line: i,
            value: rate,
          });
          copiedRecord.setSublistValue({
            sublistId: "custpage_item_details_sublist",
            fieldId: "quantity_field",
            line: i,
            value: quantity,
          });
          copiedRecord.setSublistValue({
            sublistId: "custpage_item_details_sublist",
            fieldId: "shipdate_field",
            line: i,
            value: shipDate,
          });
        }

        // // set the copied record!
        copiedRecord.setValue({
          fieldId: "location",
          value: locationFieldValue,
        });
        copiedRecord.setValue({
          fieldId: "class",
          value: classFieldValue,
        });
        copiedRecord.setValue({
          fieldId: "department",
          value: departmentFieldValue,
        });

        // on SAVE, returns a record id #
        const copiedRecordId = copiedRecord.save();

        log.debug({
          title: "copiedRecordId",
          details: copiedRecordId,
        });

        // POST response:
        context.response.sendRedirect({
          identifier: recordType,
          type: "RECORD",
          editMode: false,
          id: copiedRecordId,
        });
      }
    } catch (err) {
      log.debug({
        title: "Error:",
        details: err,
      });
    }
  }

  return {
    onRequest: onRequest,
  };
});
