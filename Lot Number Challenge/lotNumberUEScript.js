/* 
on save of a SALES ORDER, create Purchase Order for the items and quantities listed on that order

The items on the order must be Lot Numbered items (look into this, check if the account has any)

Link the PO to the Sales Order through a field and VICE VERSA (two-way link)

On receipt of the Purchase Order I want you to ADD the LOTs received onto the Inventory Detail of the Sales order

onSave, sales order creates a purchase order that is two-way linked
onsave of receipt of the PO, add the LOT NUMBERS received onto the Inventory detail of the SO

Create the sales order for the buyer, onSave creates a PO for a seller for the items/quantityies on the Sales Order
Think Amazon for products they don't MAKE themselves. They purchase it from the manufacturer and sell it to the consumer.

    // ITEMs must be LOT NUMBERED
    // hard-code a VENDER on the Purchase Order


--------- Summary: ----------
1) On save, create new Purchase order
2) auto-populate the items and quantities from sales order into the PO
   the items on the SO MUST be LOT NUMBERED.
3) have the PO and SO linked through a field (two way link)... the PO field?
4) On receipt of the PO, add the LOTs received onto the INVENTORY DETAIL of the SALES ORDERs

*/

/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
define(["N/record", "N/search"], function (record, search) {
  function afterSubmit(context) {
    try {
      /* 
      -SO and PO are linked through a custom field
      -now that we have our script deploying on sales order and purchase order records
      */
      const currRecord = context.newRecord;
      const currRecordId = currRecord.id;
      const currRecordType = currRecord.type;
      const contextType = context.type;

      // need access to this variable in the item receipt conditional block:

      //---------------Sales Order CONDITIONAL BLOCK:
      if (currRecordType === "salesorder") {
        const custForm = currRecord.getValue({
          fieldId: "customform",
        });

        // Custom Form guard clause:
        if (custForm !== "340") return;

        log.debug({
          title: "passed gaurd clause?",
          details: "yes!",
        });

        log.debug({
          title: "newRecordId:",
          details: currRecordId,
        });

        const poRecord = record.create({
          type: "purchaseorder",
        });

        log.debug({
          title: "poRecord BEFORE loop:",
          details: poRecord,
        });

        // ITEMs must be LOT NUMBERED
        // hard-code a VENDER on the Purchase Order

        const sharedFields = [
          "tranid",
          "trandate",
          "entity",
          "memo",
          "subsidiary",
          "department",
          "class",
          "location",
        ];

        // loop shared fields:
        for (let i = 0; i < sharedFields.length; i++) {
          // get value from SO
          const gotValue = currRecord.getValue({
            fieldId: sharedFields[i],
          });

          log.debug({
            title: "the GOT values:",
            details: gotValue,
          });
          // set value on PO
          poRecord.setValue({
            fieldId: sharedFields[i],
            value: gotValue,
          });
        }

        log.debug({
          title: "poRecord AFTER loop:",
          details: poRecord,
        });

        // unique PO fields:
        poRecord.setValue({
          fieldId: "entity", // entity = Vendor in a PO
          value: 1840, // Adam Smith CPA hard-coded Vendor
        });

        log.debug({
          title: "poRecord AFTER Entity:",
          details: poRecord,
        });

        // const poSublistFields = [];

        const sharedSublistFields = [
          "item",
          "quantity",
          "description",
          "rate",
          "amount",
        ];

        const numLines = currRecord.getLineCount({
          sublistId: "item",
        });

        log.debug({
          title: "numLines",
          details: numLines,
        });

        // loop for like-sublist fields:
        for (let l = 0; l <= numLines - 1; l++) {
          log.debug({
            title: "l value:",
            details: l,
          });
          for (let i = 0; i < sharedSublistFields.length; i++) {
            log.debug({
              title: "i values",
              details: i,
            });
            let soSublistValue =
              currRecord.getSublistValue({
                sublistId: "item",
                fieldId: sharedSublistFields[i],
                line: l,
              }) || 0;
            log.debug({
              title: "soSublistValue:",
              details: soSublistValue,
            });

            poRecord.setSublistValue({
              sublistId: "item",
              fieldId: sharedSublistFields[i],
              line: l,
              value: soSublistValue,
            });

            // link SO customer, set on each item line in PO
            const customer = currRecord.getValue({
              fieldId: "entity",
            });

            poRecord.setSublistValue({
              sublistId: "item",
              fieldId: "customer",
              line: l,
              value: customer,
            });
          }
        }

        // set the CustomForm on the PO record BEFORE saving it
        poRecord.setValue({
          fieldId: "customform",
          value: "341",
        });

        poRecord.setValue({
          fieldId: "custbody14",
          value: currRecordId,
        });

        const poRecordId = poRecord.save();

        const soRecord = record.submitFields({
          type: "salesorder",
          id: currRecordId,
          values: {
            custbody14: poRecordId,
          },
        });

        log.debug({
          title: "PO Record AFTER Sublist Loop:",
          details: [poRecordId, poRecord],
        });

        log.debug({
          title: "poRecordId:",
          details: poRecordId,
        });

        log.debug({
          title: "soRecordId:",
          details: soRecord.id,
        });
      }

      //---------------- Item Receipt CONDITIONAL BLOCK:
      if (currRecordType === "itemreceipt") {
        log.debug({
          title: "currRecord itemReceipt:",
          details: currRecord,
        });
        log.debug({
          title: "currRecordType itemReceipt:",
          details: currRecordType,
        });
        log.debug({
          title: "context Type itemReceipt:",
          details: contextType,
        });

        const itemLines = currRecord.getLineCount({
          sublistId: "item",
        });

        const inventoryDetailsArr = [];
        // create a loop and push to arr in the situation in which there are MULTIPLE items and therefore multiple inventory details
        for (let l = 0; l < itemLines; l++) {
          inventoryDetailsArr.push(
            currRecord.getSublistSubrecord({
              sublistId: "item",
              fieldId: "inventorydetail",
              line: l,
            })
          );
        }

        const soRecordId = search.lookupFields({
          type: "purchaseorder",
          id: currRecord.getValue({
            fieldId: "createdfrom",
          }),
          columns: "custbody14",
        });

        log.debug({
          title: "SO Search Result:",
          details: soRecordId,
        });

        log.debug({
          title: "Search Result:",
          details: soRecordId.custbody14[0].value,
        });

        log.debug({
          title: "inventoryDetailsArr:",
          details: inventoryDetailsArr,
        });

        const salesOrderRecord = record.load({
          type: "salesorder",
          id: soRecordId.custbody14[0].value,
        });

        // this is assuming the # of lines on the PO is the same on the SO, which it SHOULD be since the SO creates the PO:

        log.debug({
          title: "Item Receipt id:",
          details: currRecordId,
        });


        search.createFilter({
          name: string,
          join: string,
          operator: string,
          values: 
        })

        search
          .create({
            type: "transaction",
            filter: [["internalidnumber", "equalto", currRecordId]], // item receipt id
            columns: ["serialnumbers"],
          })
          .run()
          .each((result) => {
            log.debug({
              title: "Saved Search Result:",
              details: result,
            });
          });
        // for (let i = 0; i < itemLines; i++) {
        //   let lotNumber = inventoryDetailsArr[i].getSublistValue({
        //     sublistId: "inventoryassignment",
        //     fieldId: "issueinventorynumber",
        //     line: i,
        //   });
        //   log.debug({
        //     title: "Lot Number Result:",
        //     details: lotNumber,
        //   });
        //   salesOrderRecord.setSublistValue({
        //     sublistId: "item",
        //     fieldId: "inventorydetail",
        //     line: i,
        //     value: lotNumber,
        //   });
        // }
      }
    } catch (err) {
      log.debug({
        title: "error:",
        details: err,
      });
    }
  }

  return {
    afterSubmit: afterSubmit,
  };
});
