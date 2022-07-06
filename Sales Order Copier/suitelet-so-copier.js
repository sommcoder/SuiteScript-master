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

define([
  "N/search",
  "N/ui/serverWidget",
  "N/record",
  "N/url",
  "N/https",
], function (search, ui, record, url, https, crypto) {
  // general global variables:
  let reqParams;
  //   let recordId;
  let recordType;
  let ogRecordTranId;

  // global sublist array variables:
  let sublistLines;
  const sublistFieldValuesArr = [];

  function onRequest(context) {
    try {
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
        reqParams = context.request.parameters;
        recordType = reqParams.currRecordType;
        recordId = reqParams.currRecordId;
        ogRecordTranId = reqParams.recordTranId;

        log.debug({
          title: "req params:",
          details: reqParams,
        });

        log.debug({
          title: "tran id:",
          details: ogRecordTranId,
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

        const subsidiaryField = salesOrderCopyForm.addField({
          id: "subsidiary_field",
          label: "Subsidiary",
          type: "text",
          container: "custpage_customer_details_field_group",
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

        ////////// item details sublist: ///////

        itemDetailsSublist = salesOrderCopyForm.addSublist({
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

        const rateField = itemDetailsSublist.addField({
          id: "rate_field",
          label: "Rate",
          type: "text",
        });

        const quantityField = itemDetailsSublist.addField({
          id: "quantity_field",
          label: "Quantity",
          type: "text",
        });

        const shipdateField = itemDetailsSublist.addField({
          id: "shipdate_field",
          label: "Shipdate",
          type: "text",
        });

        let entityId; // global variable, used on Record.copy
        let i = 0; // counter variable for search

        search
          .create({
            type: recordType,
            filters: [["item", "anyof", sublistItems]],
            columns: [
              { name: "entity" },
              { name: "subsidiary" },
              { name: "location" },
              { name: "department" },
              { name: "class" },
              { name: "item" },
              { name: "rate" },
              { name: "quantity" },
              { name: "shipdate" },
            ],
          })
          .run()
          .each((result) => {
            entityId = result.getValue({
              name: "entity",
            });

            //non-select fields:
            customerField.defaultValue = result.getText({
              name: "entity",
            });

            subsidiaryField.defaultValue = result.getText({
              name: "subsidiary",
            });
            // select fields:
            locationField.addSelectOption({
              value: result.getValue({
                name: "location",
              }),
              text: result.getText({
                name: "location",
              }),
            });

            departmentField.addSelectOption({
              value: result.getValue({
                name: "department",
              }),
              text: result.getText({
                name: "department",
              }),
            });

            classField.addSelectOption({
              value: result.getValue({
                name: "class",
              }),
              text: result.getText({
                name: "class",
              }),
            });

            //////// item details sublist ///////

            itemDetailsSublist.setSublistValue({
              id: "item_field",
              line: i,
              value: result.getText({
                name: "item",
              }),
            });
            itemDetailsSublist.setSublistValue({
              id: "rate_field",
              line: i,
              value: result.getValue({
                name: "rate",
              }),
            });
            itemDetailsSublist.setSublistValue({
              id: "quantity_field",
              line: i,
              value: result.getValue({
                name: "quantity",
              }),
            });

            itemDetailsSublist.setSublistValue({
              id: "shipdate_field",
              line: i,
              value:
                result.getValue({
                  name: "shipdate",
                }) || 0,
            });

            i++;

            return true;
          });

        log.debug({
          title: " itemDetailsSublist",
          details: itemDetailsSublist,
        });

        sublistLines = itemDetailsSublist.lineCount;

        sublistFieldArr = [
          checkboxField.id,
          itemField.id,
          rateField.id,
          shipdateField.id,
        ];

        log.debug({
          title: "sublistLines",
          details: sublistLines,
        });

        log.debug({
          title: "sublistFieldArr",
          details: sublistFieldArr,
        });

        // NS auto populates the sales order record upon saving...

        const submitButton = salesOrderCopyForm.addSubmitButton({
          label: "Submit Record",
        });

        // WRITE Suitelet Page:
        context.response.writePage({
          pageObject: salesOrderCopyForm,
        });
      } else {
        // when form is submitted, a POST request is called when the submitButton is clicked!

        log.debug({
          title: "context:",
          details: context.request,
        });

        log.debug({
          title: "POST parameters:",
          details: context.request.parameters,
        });

        log.debug({
          title: "POST body:",
          details: context.request.body,
        });

        //Form: Customer Details values:

        const classFieldValue = context.request.parameters.inpt_class_field;

        const departmentFieldValue =
          context.request.parameters.inpt_department_field;

        const locationFieldValue =
          context.request.parameters.inpt_location_field;

        // Form: Item Details Sublist Values:
        // using global variables/arrays:
        // loop through item sublist
        for (let i = 0; i < sublistFieldArr.length; i++) {
          for (let j = 0; j < sublistLines.length; j++) {
            result_[i] = context.ServerRequest.getSublistValue({
              group: "custpage_item_details_sublist",
              line: j,
              name: i,
            });
            sublistFieldValuesArr.push(result_[i]);
          }
        }

        // copy original record and adjust values!

        log.debug({
          title: "sublistFieldValuesArr:",
          details: sublistFieldValuesArr,
        });

        const copiedRecord = record.copy({
          type: recordType,
          id: recordId,
          defaultValues: {
            entity: entityId,
          },
        });

        copiedRecord.save();

        log.debug({
          title: "Copied record object:",
          details: copiedRecord,
        });

        // const headers = new Array();
        // // use destructuring to populate array with key/value pairs!
        // headers["Content-Type"] = "application/json";
        // headers["User-Agent-x"] = "SuiteScript Call";

        // log.debug({
        //   title: "url?:",
        //   details: context.request.url,
        // });

        //   context.response.sendRedirect({
        //     identifier: recordType,
        //     type: "RECORD",
        //     editMode: false,
        //     id: number | string,
        //     parameters: {},
        //   });
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
