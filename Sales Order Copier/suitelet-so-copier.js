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

define(["N/search", "N/ui/serverWidget", "N/record", "N/format"], function (
  search,
  ui,
  record,
  format
) {
  function onRequest(context) {
    try {
      if (context.request.method == "GET") {
        // global variable assignments:
        let reqParams = context.request.parameters;
        let recordId = reqParams.currRecordId;
        let recordType = reqParams.currRecordType;
        let recordTranId = reqParams.recordTranId;

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
          id: "custpage_entity_field",
          label: "Customer",
          type: "text",
          container: "custpage_customer_details_field_group",
        });

        customerField.updateDisplayType({
          displayType: "inline",
        });

        const subsidiaryField = salesOrderCopyForm.addField({
          id: "custpage_subsidiary_field",
          label: "Subsidiary",
          type: "text",
          container: "custpage_customer_details_field_group",
        });

        subsidiaryField.updateDisplayType({
          displayType: "inline",
        });

        const locationField = salesOrderCopyForm.addField({
          id: "custpage_inpt_location_field",
          label: "Location",
          type: "select",
          container: "custpage_customer_details_field_group",
        });

        const departmentField = salesOrderCopyForm.addField({
          id: "custpage_inpt_department_field",
          label: "Department",
          type: "select",
          source: "department",
          container: "custpage_customer_details_field_group",
        });

        const classField = salesOrderCopyForm.addField({
          id: "custpage_inpt_class_field",
          label: "Class",
          type: "select",
          source: "classification",
          container: "custpage_customer_details_field_group",
        });

        //////////// hidden fields:///////////
        // used to send non-ui data to the POST REQ //
        const recordIdHiddenField = salesOrderCopyForm.addField({
          id: "custpage_record_id_hidden",
          label: "hidden",
          type: "text",
          container: "custpage_customer_details_field_group",
        });
        recordIdHiddenField.updateDisplayType({
          displayType: "hidden",
        });
        recordIdHiddenField.defaultValue = recordId;

        const recordTypeHiddenField = salesOrderCopyForm.addField({
          id: "custpage_record_type_hidden",
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
          id: "custpage_checkbox_field",
          label: "select",
          type: "checkbox",
        });
        checkboxField.defaultValue = "T";

        const itemField = itemDetailsSublist.addField({
          id: "custpage_item_field",
          label: "Item",
          type: "text",
        });

        // item CANNOT be changed via User Entry!

        const rateField = itemDetailsSublist.addField({
          id: "custpage_rate_field",
          label: "Rate",
          type: "text",
        });

        rateField.updateDisplayType({
          displayType: "entry",
        });

        const quantityField = itemDetailsSublist.addField({
          id: "custpage_quantity_field",
          label: "Quantity",
          type: "text",
        });

        quantityField.updateDisplayType({
          displayType: "entry",
        });

        const shipdateField = itemDetailsSublist.addField({
          id: "custpage_shipdate_field",
          label: "Shipdate",

          type: "date",
        });
        shipdateField.updateDisplayType({
          displayType: "entry",
        });

        // function scoped variables:
        let i = 0; // counter variable
        let entityId; // used in POST Request ELSE block

        search
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
            if (
              result.getValue({
                name: "item",
              }) <= 0
            )
              return;

            // entity number for global use:
            entityId = result.getValue({
              name: "entity",
            });
            //non-select INLINE fields:
            customerField.defaultValue = result.getText({
              name: "entity", // customer
            });
            subsidiaryField.defaultValue = result.getText({
              name: "subsidiary",
            });

            //////// item details sublist ///////

            itemDetailsSublist.setSublistValue({
              id: "custpage_item_field",
              line: i,
              value:
                result.getText({
                  name: "item",
                }) || "",
            }); // getText = || ""
            itemDetailsSublist.setSublistValue({
              id: "custpage_rate_field",
              line: i,
              value:
                result.getValue({
                  name: "rate",
                }) || 0,
            }); // getValue = || 0
            itemDetailsSublist.setSublistValue({
              id: "custpage_quantity_field",
              line: i,
              value:
                result.getValue({
                  name: "quantity",
                }) || 0,
            });

            itemDetailsSublist.setSublistValue({
              id: "custpage_shipdate_field",
              line: i,
              value:
                result.getValue({
                  name: "shipdate",
                }) || 0,
            });

            i++;

            return true;
          });

        search
          .create({
            type: "location",
            filters: [
              ["subsidiary", "anyof", "2"],
              "AND",
              ["isinactive", "is", "F"],
            ],
            columns: ["internalid", "namenohierarchy"],
          })
          .run()
          .each((result) => {
            locationField.addSelectOption({
              value: result.getValue({
                name: "internalid",
              }),
              text:
                result.getValue({
                  name: "namenohierarchy",
                }) || "",
            });

            return true;
          });

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
        const requestObj = context.request;

        // these were our hidden form field values
        const recordId = reqParams.custpage_record_id_hidden;
        const recordType = reqParams.custpage_record_type_hidden;

        const sublistLineCount = requestObj.getLineCount({
          group: "custpage_item_details_sublist",
        });

        // copy the record
        const copiedRecord = record.copy({
          type: recordType,
          id: recordId,
        });

        // traverse sublist lines from bottom to top
        for (let i = sublistLineCount - 1; i >= 0; i--) {
          const checkbox = requestObj.getSublistValue({
            group: "custpage_item_details_sublist",
            line: i,
            name: "custpage_checkbox_field",
          });
          // Only the lines that are checked are affected!:
          if (checkbox === "F") {
            // clears the sublist line from the copied record if checkbox is FALSE:
            copiedRecord.removeLine({
              sublistId: "item",
              line: i,
            });
            continue;
          } else {
            const item = requestObj.getSublistValue({
              group: "custpage_item_details_sublist",
              line: i,
              name: "custpage_item_field",
            });

            const rate = requestObj.getSublistValue({
              group: "custpage_item_details_sublist",
              line: i,
              name: "custpage_rate_field",
            });

            const quantity = requestObj.getSublistValue({
              group: "custpage_item_details_sublist",
              line: i,
              name: "custpage_quantity_field",
            });

            const shipDate = requestObj.getSublistValue({
              group: "custpage_item_details_sublist",
              line: i,
              name: "custpage_shipdate_field",
            });

            // set the sublist values on the copied Record
            copiedRecord.setSublistValue({
              sublistId: "item",
              fieldId: "item_display",
              line: i,
              value: item,
            });
            copiedRecord.setSublistValue({
              sublistId: "item",
              fieldId: "rate",
              line: i,
              value: rate,
            });
            copiedRecord.setSublistValue({
              sublistId: "item",
              fieldId: "quantity",
              line: i,
              value: quantity,
            });

            const parsedDate = format.parse({
              value: shipDate,
              type: "date",
            });

            copiedRecord.setSublistValue({
              sublistId: "item",
              fieldId: "expectedshipdate",
              line: i,
              value: parsedDate,
            });
          }
        }

        // Customer Fieldgroup values from POST REQ
        const locationFieldValue = reqParams.custpage_inpt_location_field;
        const classFieldValue = reqParams.custpage_inpt_class_field;
        const departmentFieldValue = reqParams.custpage_inpt_department_field;

        // set Field Group Values on Copied Record:
        // T
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

        // POST RES Redirect:
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
