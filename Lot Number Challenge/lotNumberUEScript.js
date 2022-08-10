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
            details: [sharedFields[i], gotValue],
          });
          // set value on PO
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

        log.debug({
          title: "numLines",
          details: numLines,
        });

        const skippedIndices = [];
        // loop for like-sublist fields:
        for (let l = 0; l < numLines; l++) {
          log.debug({
            title: "line index:",
            details: ["INDEX", l, "OF", numLines - 1, "INDICES"],
          });

          let lotNumberedItem = currRecord.getSublistValue({
            sublistId: "item",
            fieldId: "isnumbered",
            line: l,
          });

          log.debug({
            title: "lotNumberedItem",
            details: lotNumberedItem,
          });

          if (lotNumberedItem === "T") {
            log.debug({
              title: "skippedIndices[0]:",
              details: skippedIndices[0],
            });
            // if the previous index was "skipped", the FIRST skipped index becomes the index we are to set the fields to in the following loop

            // if the item is LOT NUMBERED, loop through the items specified fields from the array
            log.debug({
              title: "value of l BEFORE skip check",
              details: l,
            });
            if (skippedIndices[0]) l = skippedIndices[0];
            // assign l to the VALUE of the FIRST skipped Index IF it evaluates to TRUE, an empty string is FALSEY
            log.debug({
              title: "skipped index: new value of l:",
              details: l,
            });
            for (let i = 0; i < sharedSublistFieldsArr.length; i++) {
              // log.debug({
              //   title: "field loop",
              //   details: ["index: ", i, " OF ", "line: ", l],
              // });

              let soSublistValue =
                currRecord.getSublistValue({
                  sublistId: "item",
                  fieldId: sharedSublistFieldsArr[i],
                  line: l,
                }) || 0;

              // log.debug({
              //   title: "soSublistValue and i:",
              //   details: [sharedSublistFieldsArr[i], soSublistValue, i],
              // });

              poRecord.setSublistValue({
                sublistId: "item",
                fieldId: sharedSublistFieldsArr[i],
                line: l,
                value: soSublistValue,
              });

              // link SO ENTITY, set as CUSTOMER on each item line in PO:
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
            // after setting the current skipped index, remove that index from the array and loop over the process again. The data structure needs to be a QUEUE than a STACK (FIFO):
            skippedIndices.shift(0);
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
          // if the lot numbered item is 'F', add the index number to the skippedIndices array
          else {
            log.debug({
              title: "Skipped Index:",
              details: l,
            });
            skippedIndices.push(l);
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

        // const poRecordId = poRecord.save();

        log.debug({
          title: "PO Record AFTER Sublist Loop:",
          details: poRecord,
        });

        // log.debug({
        //   title: "poRecordId:",
        //   details: poRecordId,
        // });

        // submit Fields to get the SO record
        // const soRecord = record.submitFields({
        //   type: "salesorder",
        //   id: currRecordId,
        //   values: {
        //     custbody14: poRecordId,
        //   },
        // });

        // log.debug({
        //   title: "soRecordId:",
        //   details: soRecord.id,
        // });
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
        const salesOrderRecord = record.load({
          type: "salesorder",
          id: soRecordId.custbody14[0].value,
        });

        // this is assuming the # of lines on the PO is the same on the SO, which it SHOULD be since the SO creates the PO:

        log.debug({
          title: "Item Receipt id:",
          details: currRecordId,
        });

        // search global variables:
        let i = 0;
        let lotNumberId;
        let invDetail_IR;
        let invDetail_SO;
        let invDetailQuantity;
        let lineCountInvDetail_IR = invDetail_IR.getLineCount({
          sublistId: "inventoryassignment",
        });

        log.debug({
          title: "IR line count:",
          details: lineCountInvDetail_IR,
        });

        search
          .create({
            type: "transaction",
            filters: [
              ["internalidnumber", "equalto", currRecordId],
              "AND",
              ["mainline", "is", "F"],
            ],
            columns: [
              search.createColumn({
                name: "serialnumbers",
                label: "Serial/Lot Numbers",
              }),
              search.createColumn({
                name: "inventorynumber",
                join: "inventoryDetail",
                label: " Number",
              }),
            ],
          })
          .run()
          .each((result) => {
            log.debug({
              title: "Saved Search Result:",
              details: result,
            });

            // get the SUBRECORDS from both the IR and the SO:
            invDetail_IR = currRecord.getSublistSubrecord({
              sublistId: "item",
              fieldId: "inventorydetail",
              line: i,
            });

            log.debug({
              title: "Inv Detail Subrecord_IR:",
              details: invDetail_IR,
            });

            // get isnumbered boolean from the SO
            lotNumberedItem = salesOrderRecord.getSublistValue({
              sublistId: "item",
              fieldId: "isnumbered",
              line: i,
            });

            log.debug({
              title: "lot Numbered item?",
              details: lotNumberedItem,
            });

            if (lotNumberedItem === "T") {
              // if the SO line item is LOT NUMBERED, EXECUTE THE FOLLOWING:
              // Set the IR inv detail subrecord on the SO by line number
              // if the item Isn't lot numbered, the loop should iterate to the next line item

              invDetail_SO = salesOrderRecord.getSublistSubrecord({
                sublistId: "item",
                fieldId: "inventorydetail",
                line: i,
              });

              // invDetail_SO.setSublistValue({
              //   sublistId: "assignment",
              //   fieldId: "inventorydetail",
              //   line: i,
              //   value: invDetail_IR,
              // });

              log.debug({
                title: "invDetail_SO:",
                details: invDetail_SO,
              });

              // LOOP THROUGH EACH LINE OF THE INV DETAIL SUBRECORD:
              for (let l = 0; l < lineCountInvDetail_IR; l++) {
                // get the quantity from the IR's inv detailSubRecord by line
                invDetailQuantity = invDetail_IR.getSublistValue({
                  sublistId: "inventoryassignment",
                  fieldId: "quantity",
                  line: l,
                });

                log.debug({
                  title: "invDetailQuantity:",
                  details: invDetailQuantity,
                });

                // get the internalId from the saved search query by result
                lotNumberId = result.getValue({
                  name: "inventorynumber",
                  join: "inventoryDetail",
                });

                log.debug({
                  title: "lotNumberId",
                  details: lotNumberId,
                });

                // SET the quantity on the SO sub
                invDetail_SO.setSublistValue({
                  sublistId: "inventoryassignment",
                  fieldId: "quantity",
                  line: l,
                  value: invDetailQuantity,
                });

                // SET the lotNumbers internalId on the SO inv detail sub
                invDetail_SO.setSublistValue({
                  sublistId: "inventoryassignment",
                  fieldId: "receiptinventorynumber",
                  line: l,
                  value: lotNumberId,
                });
              }
            }

            // log the salesOrderRecord inventory details so we know it worked after each successful loop!

            i++;
            return true;
          });

        // salesOrderRecord.save();
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
