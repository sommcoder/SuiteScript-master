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
      -now that we have our script deploying on sales order and item receipt records
      */
      const currRecord = context.newRecord;
      const currRecordId = currRecord.id;
      const currRecordType = currRecord.type;
      const contextType = context.type;

      // need access to this variable in the item receipt conditional block:

      //---------------Sales Order CONDITIONAL BLOCK:
      if (currRecordType === "salesorder") {
        if (contextType !== "edit") return;
        const custForm = currRecord.getValue({
          fieldId: "customform",
        });

        // Custom Form guard clause:
        if (custForm !== "340") return;

        // log.debug({
        //   title: "newRecordId:",
        //   details: currRecordId,
        // });

        const poRecord = record.create({
          type: "purchaseorder",
        });

        // log.debug({
        //   title: "poRecord BEFORE loop:",
        //   details: poRecord,
        // });

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

        // loop shared BODY FIELDS:
        for (let i = 0; i < sharedFields.length; i++) {
          const gotValue = currRecord.getValue({
            fieldId: sharedFields[i],
          });
          poRecord.setValue({
            fieldId: sharedFields[i],
            value: gotValue,
          });
        }

        // unique PO fields:
        poRecord.setValue({
          fieldId: "entity", // entity = Vendor in a PO
          value: 1840, // Adam Smith CPA hard-coded Vendor
        });

        const sharedSublistFieldsArr = [
          "item",
          "quantity",
          "description",
          "rate",
          "amount",
        ];

        const numLines = currRecord.getLineCount({
          sublistId: "item",
        });

        // log.debug({
        //   title: "numLines",
        //   details: numLines,
        // });

        const skippedIndices_IR = [];
        let invDetail_IR;
        // ITEM SUBLIST LINE LOOP:
        for (let l = 0; l < numLines; l++) {
          // log.debug({
          //   title: "line index:",
          //   details: ["INDEX", l, "OF", numLines - 1, "INDICES"],
          // });

          let lotNumberedItem = currRecord.getSublistValue({
            sublistId: "item",
            fieldId: "isnumbered",
            line: l,
          });

          // log.debug({
          //   title: "lotNumberedItem",
          //   details: lotNumberedItem,
          // });

          if (lotNumberedItem === "T") {
            invDetail_IR = currRecord.getSublistSubrecord({
              sublistId: "item",
              fieldId: "inventorydetail",
              line: l,
            });

            log.debug({
              title: "invDetail_IR",
              details: invDetail_IR,
            });
            // log.debug({
            //   title: "l: get from index:",
            //   details: l,
            // });
            // log.debug({
            //   title: "ternary exp: get on index:",
            //   details: skippedIndices_IR[0] ? skippedIndices_IR[0] : l,
            // });
            for (let i = 0; i < sharedSublistFieldsArr.length; i++) {
              let soSublistValue =
                currRecord.getSublistValue({
                  sublistId: "item",
                  fieldId: sharedSublistFieldsArr[i],
                  line: l,
                }) || 0;

              // log.debug({
              //   title: "soSublistValue from l:",
              //   details: [sharedSublistFieldsArr[i], soSublistValue, "FROM", l],
              // });

              poRecord.setSublistValue({
                sublistId: "item",
                fieldId: sharedSublistFieldsArr[i],
                line: skippedIndices_IR[0] ? skippedIndices_IR[0] : l,
                value: soSublistValue,
              });

              // link SO ENTITY, set as CUSTOMER on each item line in PO:
              const customer = currRecord.getValue({
                fieldId: "entity",
              });

              poRecord.setSublistValue({
                sublistId: "item",
                fieldId: "customer",
                line: skippedIndices_IR[0] ? skippedIndices_IR[0] : l,
                value: customer,
              });
            }
            // after setting the current skipped index, remove that index from the array and loop over the process again. The data structure needs to be a QUEUE than a STACK (FIFO):
            skippedIndices_IR.shift(0);
            // check to ensure that the sublist is actually being set properly:
            log.debug({
              title: "item sublist POST loop:",
              details: poRecord.getSublistValue({
                sublistId: "item",
                fieldId: "item",
                line: l,
              }),
            });
          }
          // if the lot numbered item is 'F', add the index number to the skippedIndices_IR array
          else {
            log.debug({
              title: "Skipped Index:",
              details: l,
            });
            skippedIndices_IR.push(l);
          }
        }

        // set the CustomForm on the PO record BEFORE saving it
        poRecord.setValue({
          fieldId: "customform",
          value: "341",
        });

        // set the custom field on the PO to be the link to the SO
        poRecord.setValue({
          fieldId: "custbody14",
          value: currRecordId,
        });

        const poRecordId = poRecord.save();

        log.debug({
          title: "PO Record AFTER Sublist Loop:",
          details: poRecord,
        });

        log.debug({
          title: "poRecordId:",
          details: poRecordId,
        });

        // submit Fields to get the SO record
        const soRecord = record.submitFields({
          type: "salesorder",
          id: currRecordId,
          values: {
            custbody14: poRecordId,
          },
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
          title: "SO Search Result:",
          details: soRecordId.custbody14[0].value,
        });

        //////////////////////////////////////////////////////////////////////
        // This is ONE of the few exceptions where we HAVE to use record.load
        //////////////////////////////////////////////////////////////////////
        const soRecord = record.load({
          type: "salesorder",
          id: soRecordId.custbody14[0].value,
        });

        // this is assuming the # of lines on the PO is the same on the SO, which it SHOULD be since the SO creates the PO:

        log.debug({
          title: "Item Receipt id:",
          details: currRecordId,
        });

        // search global variables:
        let invDetail_SO;

        // item grouping variables:
        const lotNumberItemGroups = {};
        let item, lot, quantity;

        search
          .create({
            type: "transaction",
            filters: [
              ["internalidnumber", "equalto", currRecordId],
              "AND",
              ["mainline", "is", "F"],
            ],
            columns: [
              "serialnumbers",
              search.createColumn({
                name: "inventorynumber",
                join: "inventoryDetail",
              }),
              search.createColumn({
                name: "quantity",
                join: "inventoryDetail",
              }),
              "item",
              "number",
            ],
          })
          .run()
          .each((result) => {
            log.debug({
              title: "result:",
              details: result,
            });
            item = result.getValue({
              name: "item",
            });

            lotId = result.getValue({
              name: "inventorynumber",
              join: "inventoryDetail",
            });

            quantity = result.getValue({
              name: "quantity",
              join: "inventoryDetail",
            });

            // lotNum = result.getValue({
            //   name: "issueinventorynumber",
            // });

            ///////////////// object template:
            // object = {
            //   item: [
            //     { lot: lot, quantity: quantity },
            //     { lot: lot, quantity: quantity },
            //   ],
            //   item: [
            //     { lot: lot, quantity: quantity },
            //     { lot: lot, quantity: quantity },
            //   ],
            // };

            // if no item object exists yet, create one and assign it to an array of {lot: quantity} pairings
            if (!lotNumberItemGroups[item]) lotNumberItemGroups[item] = [];

            // each pass includes
            lotNumberItemGroups[item].push({
              lot: lotId,
              quantity: quantity,
            });

            log.debug({
              title: "lotNumberItemGroups:",
              details: lotNumberItemGroups,
            });
            return true;
          });

        /////////////////////////////////////////////////////////////////
        // GET the line count of the SO item sublist:
        let soItemLineCount = soRecord.getLineCount({
          sublistId: "item",
        });

        log.debug({
          title: "soItemLineCount",
          details: soItemLineCount,
        });

        let i = 0; // the counter for each inventory detail sublist line

        // ITEM SUBLIST LINE LOOP:
        for (let l = 0; l < soItemLineCount; l++) {
          // Determine if the line item is LOT NUMBERED:
          lotNumberedItem = soRecord.getSublistValue({
            sublistId: "item",
            fieldId: "isnumbered",
            line: l,
          });
          log.debug({
            title: "lotNumberedItem?:",
            details: lotNumberedItem,
          });

          if (lotNumberedItem === "T") {
            // only bother GETTING the inv detail subrecord IF the item sublist item is lot numbered:
            invDetail_SO = soRecord.getSublistSubrecord({
              sublistId: "item",
              fieldId: "inventorydetail",
              line: l,
            });

            log.debug({
              title: "invDetail_SO: got the invDetail?:",
              details: ["item sublist line:", l, "record:", invDetail_SO],
            });

            log.debug({
              title: "lotNumberItemGroups[i]",
              details: lotNumberItemGroups[i],
            });

            //
            // i = inv detail line number
            lotNumberItemGroups[i].forEach((itm) => {
              log.debug({
                title: "SO setting values:",
                details: [
                  "item",
                  itm,
                  "quantity:",
                  itm.quantity,
                  "lot:",
                  itm.lot,
                ],
              });

              // SET the quantity on the SO sub:
              invDetail_SO.setSublistValue({
                sublistId: "inventoryassignment",
                fieldId: "quantity",
                line: i,
                value: itm.quantity,
              });

              invDetail_SO.setSublistValue({
                sublistId: "inventoryassignment",
                fieldId: "issueinventorynumber",
                line: i,
                value: itm.lot,
              });
              log.debug({
                title: "inventory detail:",
                details: ["lotNum line:", i, invDetail_SO],
              });
            });
            // AFTER the forEach loop is complete we go back to the line loop above
            i++;
          } else {
            log.debug({
              title: "skipped line #",
              details: ["skipped line:", l],
            });
          }
        }
        soRecord.save();
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
