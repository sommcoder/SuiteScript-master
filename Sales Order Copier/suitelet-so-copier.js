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

define(["N/search", "N/ui/serverWidget"], function (search, ui) {
  function onRequest(context) {
    try {
      if (context.request.method !== "GET") return;

      const reqParams = context.request.parameters;
      const recordType = reqParams.currRecordType;
      const recordId = reqParams.currRecordId;

      log.debug({
        title: "req params:",
        details: reqParams,
      });

      const sublistItems = JSON.parse(reqParams.sublistValuesArr);

      // create the form on the script:
      const suiteletForm = ui.createForm({
        title: "Copy Order",
        hideNavBar: true,
      });

      log.debug({
        title: "suitelet Form:",
        details: suiteletForm,
      });

      ///////// display Order sublist: //////////
      const displayOrderSublist = suiteletForm.addSublist({
        id: "custpage_display_order_sublist",
        label: "Copied Order Details:",
        type: "list",
      });

      displayOrderSublist.addField({
        id: "entity_field",
        label: "Customer",
        type: "text",
      });

      displayOrderSublist.addField({
        id: "subsidiary_field",
        label: "Subsidiary",
        type: "text",
      });

      const locationField = displayOrderSublist.addField({
        id: "location_field",
        label: "Location",
        type: "select",
      });

      const departmentField = displayOrderSublist.addField({
        id: "department_field",
        label: "Department",
        type: "select",
      });

      const classField = displayOrderSublist.addField({
        id: "class_field",
        label: "Class",
        type: "select",
      });

      ////////// item details sublist: /////////
      const itemDetailsSublist = suiteletForm.addSublist({
        id: "custpage_item_details_sublist",
        label: "Item Details:",
        type: "list",
      });

      const itemField = itemDetailsSublist.addField({
        id: "item_field",
        label: "Item",
        type: "select",
      });

      const rateField = itemDetailsSublist.addField({
        id: "rate_field",
        label: "Rate",
        type: "checkbox",
      });

      const quantityField = itemDetailsSublist.addField({
        id: "quantity_field",
        label: "Quantity",
        type: "checkbox",
      });

      const shipdateField = itemDetailsSublist.addField({
        id: "shipdate_field",
        label: "Shipdate",
        type: "checkbox",
      });

      // all of the item details should be EDITABLIE except for 'item name'

      // add auto-filled checkbox field next to each line item to determine which items will be copied!

      // need to include a submit button which will create the new order where the browser will redirect to this new order!

      let i = 0;

      const soSearch = search
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
          /////// display order sublist ////
          displayOrderSublist.setSublistValue({
            id: "entity_field",
            line: i,
            value: result.getText({
              name: "entity",
            }),
          });
          displayOrderSublist.setSublistValue({
            id: "subsidiary_field",
            line: i,
            value: result.getText({
              name: "subsidiary",
            }),
          });

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

          itemField.addSelectOption({
            value: result.getValue({
              name: "item",
            }),
            text: result.getText({
              name: "item",
            }),
            isSelected: true,
          });

          rateField.addSelectOption({
            value: result.getValue({
              name: "rate",
            }),
            text: result.getText({
              name: "rate",
            }),
            isSelected: true,
          });

          quantityField.addSelectOption({
            value: result.getValue({
              name: "quantity",
            }),
            text: result.getText({
              name: "quantity",
            }),
            isSelected: true,
          });

          shipdateField.addSelectOption({
            value: result.getValue({
              name: "shipdate",
            }),
            text: result.getText({
              name: "shipdate",
            }),
            isSelected: true,
          });

          i++;
        });

      // WRITE Suitelet Page:
      context.response.writePage({
        pageObject: suiteletForm,
      });
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
