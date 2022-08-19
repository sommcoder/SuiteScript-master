/* 
on save of a SALES ORDER, create Purchase Order for the items and quantities listed on that order

The items on the purchase order must be Lot Numbered items (look into this, check if the account has any)

Link the PO to the Sales Order through a field and VICE VERSA (two-way link)

On receipt of the Purchase Order I want you to ADD the LOTs received onto the Inventory Detail of the Sales order

onSave, sales order creates a purchase order that is two-way linked
onsave of receipt of the PO, add the LOT NUMBERS received onto the Inventory detail subrecord of the SO

Create the sales order for the buyer, onSave creates a PO for a seller for the items/quantityies on the Sales Order
Think Amazon for products they don't MAKE themselves. They purchase it from the manufacturer and sell it to the consumer.

    // ITEMs must be LOT NUMBERED
    // hard-code a VENDER on the Purchase Order


--------- Summary: --------------
1) On save, create new Purchase order
2) auto-populate the items and quantities from sales order into the PO
   the items on the SO MUST be LOT NUMBERED.
3) have the PO and SO linked through a field (two way link)... the PO field?
4) On receipt of the PO, add the LOTs received onto the INVENTORY DETAIL of the SALES ORDERs


----------- Use Cases: ----------

1) user doesn't choose the lot number custom form
2) SO with no lot numbered items
3) PO location gets changes
4) PO item gets deleted
5) SO line gets deleted

*/

/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
define(["N/record", "N/search"], function (record, search) {
  function afterSubmit(context) {
    try {
      const currRecord = context.newRecord;
      const currRecordId = currRecord.id;
      const currRecordType = currRecord.type;
      const contextType = context.type;
      // global variable:
      let lotNumberedItem;

      //--------------- Sales Orders Block ------------------------------//
      if (currRecordType === "salesorder" && contextType === "create") {
        createPO();
      }

      //---------------- Item Receipt Block---------------------------------//
      if (currRecordType === "itemreceipt") {
        setLots();
      }

      // declarations get hoisted to the top of the block
      // function declaration 1:
      function createPO() {
        let poRecord;
        let soSublistValue;
        let customer;
        let bodyFieldValue;

        /////////////////////////////////////////////////////////////////////

        const skippedIndices_SO = [];
        const numLines = currRecord.getLineCount({
          sublistId: "item",
        });
        const sharedSublistFieldsArr = [
          "item",
          "quantity",
          "description",
          "rate",
          "amount",
        ];

        // ITEM SUBLIST LINE LOOP:
        // SETS the lot numbered line items on the newly created PO Record
        for (let l = 0; l < numLines; l++) {
          lotNumberedItem = currRecord.getSublistValue({
            sublistId: "item",
            fieldId: "isnumbered",
            line: l,
          });

          if (lotNumberedItem === "T") {
            // if there is no value on the PO record variable yet, create and set it
            if (!poRecord) {
              poRecord = record.create({
                type: "purchaseorder",
              });
            }

            for (let i = 0; i < sharedSublistFieldsArr.length; i++) {
              soSublistValue =
                currRecord.getSublistValue({
                  sublistId: "item",
                  fieldId: sharedSublistFieldsArr[i],
                  line: l,
                }) || 0;

              poRecord.setSublistValue({
                sublistId: "item",
                fieldId: sharedSublistFieldsArr[i],
                line: skippedIndices_SO[0] ? skippedIndices_SO[0] : l,
                value: soSublistValue,
              });

              // link SO ENTITY, set as CUSTOMER on each item line in PO:
              customer = currRecord.getValue({
                fieldId: "entity",
              });

              poRecord.setSublistValue({
                sublistId: "item",
                fieldId: "customer",
                line: skippedIndices_SO[0] ? skippedIndices_SO[0] : l,
                value: customer,
              });
            }
            // after setting the current skipped index, remove that index from the array and loop over the process again. The data structure needs to be a QUEUE than a STACK (FIFO):
            skippedIndices_SO.shift(0);
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
          // if the lot numbered item is 'F', add the index number to the skippedIndices_SO array
          else {
            log.debug({
              title: "Skipped Index:",
              details: l,
            });
            skippedIndices_SO.push(l);
          }
        }
        /////////////////////////////////////////////////////////////////////
        // BODY FIELDS: get and set
        const sharedBodyFieldsArr = [
          "tranid",
          "trandate",
          "entity",
          "memo",
          "subsidiary",
          "department",
          "class",
          "location",
        ];

        for (let i = 0; i < sharedBodyFieldsArr.length; i++) {
          bodyFieldValue = currRecord.getValue({
            fieldId: sharedBodyFieldsArr[i],
          });
          poRecord.setValue({
            fieldId: sharedBodyFieldsArr[i],
            value: bodyFieldValue,
          });
        }
        /////////////////////////////////////////////////////////////////////////
        // UNIQUE PO Fields:
        poRecord.setValue({
          fieldId: "entity", // entity = Vendor in a PO
          value: 1840, // Adam Smith CPA hard-coded Vendor
        });
        // set the CustomForm on the PO record BEFORE saving it
        poRecord.setValue({
          fieldId: "customform",
          value: "341", // hard coded so that we can set the value of "custbody14" below
        });
        // set the custom field on the PO to be the link to the SO
        poRecord.setValue({
          fieldId: "custbody14",
          value: currRecordId,
        });
        /////////////////////////////////////////////////////////////////////////////////
        const poRecordId = poRecord.save();

        // submit the linked SO Field separately
        record.submitFields({
          type: "salesorder",
          id: currRecordId,
          values: {
            custbody14: poRecordId,
          },
        });
      }

      // function declaration 2:
      function setLots() {
        const soRecordId = search.lookupFields({
          type: "purchaseorder",
          id: currRecord.getValue({
            fieldId: "createdfrom",
          }),
          columns: "custbody14",
        });

        const soRecord = record.load({
          type: "salesorder",
          id: soRecordId.custbody14[0].value,
        });

        // search global variables:
        let invDetail_SO;

        // Object variables:
        const lotNumberItemObj = {};
        let lnKey_SO, lotId, quantity, itemLocation;

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
              "custcol18",
              "locationnohierarchy",
            ],
          })
          .run()
          .each((result) => {
            log.debug({
              title: "result:",
              details: result,
            });

            lotId = result.getValue({
              name: "inventorynumber",
              join: "inventoryDetail",
            });

            quantity = result.getValue({
              name: "quantity",
              join: "inventoryDetail",
            });

            lnKey_SO = result.getValue({
              name: "custcol18",
            });

            itemLocation = result.getValue({
              name: "locationnohierarchy",
            });

            // if no item object exists yet, create one and assign it to an object that contains the location and lots properties, location is a number and lots is an empty array that will be filled
            if (!lotNumberItemObj[lnKey_SO])
              lotNumberItemObj[lnKey_SO] = {
                location: itemLocation,
                lots: [],
              };

            lotNumberItemObj[lnKey_SO].lots.push({
              lot: lotId,
              quantity: quantity,
            });

            return true;
          });

        /////////////////////////////////////////////////////////////////
        // GET the line count of the SO item sublist:
        let soItemLineCount = soRecord.getLineCount({
          sublistId: "item",
        });

        // keys = array of the lineKeys
        let keys = Object.keys(lotNumberItemObj);
        let soLineKey;
        let itemKeysValues;
        let irLocation;
        let soLocation = soRecord.getValue({
          fieldId: "location",
        });
        log.debug({
          title: "keys array:",
          details: keys,
        });

        // ITEM SUBLIST LINE LOOP:
        for (let l = 0; l < soItemLineCount; l++) {
          // Determine if the line item is LOT NUMBERED:
          lotNumberedItem = soRecord.getSublistValue({
            sublistId: "item",
            fieldId: "isnumbered",
            line: l,
          });

          soLineKey = soRecord.getSublistValue({
            sublistId: "item",
            fieldId: "lineuniquekey",
            line: l,
          });

          log.debug({
            title: "soLineKey:",
            details: soLineKey,
          });

          if (lotNumberedItem === "T" && keys.includes(soLineKey)) {
            // if the previous conditions are valid we're good to do the following procedures and check for ir location to match the so location
            // this reassigns the values array of the item that we are going to loop through
            itemKeysValues = Object.values(lotNumberItemObj[soLineKey]).flat();

            // splice out the location value which mutates the original array to
            irLocation = itemKeysValues.splice(0, 1);

            // if the irLocation of the item DOESN'T match the soLocation, continue to the next iteration!
            // the value of irLocation gets type-coerced before their equality is checked
            if (irLocation != soLocation) {
              log.debug({
                title: "Not the same location!",
                details: [irLocation, "/", soLocation],
              });
              continue;
            }

            // only bother GETTING the inv detail subrecord IF the item sublist item is lot numbered:
            invDetail_SO = soRecord.getSublistSubrecord({
              sublistId: "item",
              fieldId: "inventorydetail",
              line: l,
            });

            // if (itemKeysValues[n].location !== soLocation) continue;

            // loop through the lot numbers of each line key in our Object and set them to the InvDetails inventoryassignment sublist lines
            for (let n = 0; n < itemKeysValues.length; n++) {
              log.debug({
                title: "itemKeysValues in the n loop:",
                details: [
                  itemKeysValues[n],
                  "/",
                  itemKeysValues[n].lot,
                  "/",
                  itemKeysValues[n].quantity,
                ],
              });
              // if the location of the lot is NOT the location of the SO iterate the counter!

              // SET the quantity on the SO sub:
              invDetail_SO.setSublistValue({
                sublistId: "inventoryassignment",
                fieldId: "quantity",
                line: n,
                value: itemKeysValues[n].quantity,
              });

              invDetail_SO.setSublistValue({
                sublistId: "inventoryassignment",
                fieldId: "issueinventorynumber",
                line: n,
                value: itemKeysValues[n].lot,
              });

              log.debug({
                title: "invDetail_SO values check:",
                details: [
                  "ID sublist line:",
                  n,
                  "lot:",
                  itemKeysValues[n].lot,
                  "quantity:",
                  itemKeysValues[n].quantity,
                  invDetail_SO,
                ],
              });
            }
          } else {
            log.debug({
              title: "skipped line #",
              details: ["skipped line:", l, "skipped so lineKey:", soLineKey],
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
