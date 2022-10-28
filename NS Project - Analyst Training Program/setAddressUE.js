/*
 
MYERS-HOLUM, inc.        <---- companyname or addressee (in address sublist)


244 Madison Avenue, Suite 217     
New York, NY 10016
Telephone: (212) 753-5353


MYERS-HOLUM, inc. <-- make bold, ensure MYERS-HOLUM is in caps and strong/bold

244 Madison Avenue, Suite 217  
New York, NY 10016 <-- City 1st, State as acronym, then Address 2 (ZIP code)
Telephone: (212) 753-5353 <--- add Telephone: (212) 753-5353


So we're taking the relevant information from the body/header and inserting into the address sublist's subrecord

insert new address sub-record entry into the 


// Label field is mandatory? Records Browser says it's not!


// when a customer record is created for the first time, you set the default address in the address book to be the one specified


Header:
defaultaddress:
This field automatically shows the default billing address that you enter and add using the Address subtab


Sublist:
Edit sub-record

*/

/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
define(["N/record"], function (record) {
  function afterSubmit(context) {
    try {
      // populate the Customer Records Address SubRecord with the relevant information the user has provided
      let newRecord = context.newRecord;
      let type = context.type;

      if (type !== "edit") return; // create guard clause

      // if the defaultaddress field has no value, populate the address book subrecord
      // defaultaddress field automatically shows the default billing address that you enter and add using the Address subtab

      // if (
      //   !newRecord.getValue({
      //     fieldId: "defaultaddress",
      //   })
      // ) {
      //   log.debug({
      //     title: "no address",
      //     details: "no address",
      //   });

      let lnCount = newRecord.getLineCount({
        sublistId: "addressbook",
      });

      log.debug({
        title: "lnCount",
        details: lnCount,
      });

      let reqFieldObj = {
        addressee: "MYERS-HOLUM, inc.",
        state: "NY",
        country: 2, // United States
        city: "New York",
        zip: 10016,
        addr1: "244 Madison Avenue",
        addr2: "Suite 217",
        addrphone: "(212) 753-5353",
      };

      let fieldKeysArr = Object.keys(reqFieldObj);

      // address sublist loop:
      for (let i = 0; i < lnCount; i++) {
        // get the addressbook subrecord in the address sublist
        let ab_SubRecord = newRecord.getSublistSubrecord({
          sublistId: "addressbook",
          fieldId: "addressbookaddress",
          line: i,
        });

        log.debug({
          title: "ab_SubRecord",
          details: ab_SubRecord,
        });

        // Sublist Subrecord SETTING Loop:
        for (let j = 0; j < fieldKeysArr.length; j++) {
          log.debug({
            title: "fieldKeysArr[j]",
            details: fieldKeysArr[j],
          });

          log.debug({
            title: "reqFieldObj[fieldKeysArr[j]]",
            details: reqFieldObj[fieldKeysArr[j]],
          });

          ab_SubRecord.setValue({
            fieldId: fieldKeysArr[j],
            value: reqFieldObj[fieldKeysArr[j]],
          });
        }

        log.debug({
          title: "ab_SubRecord",
          details: ab_SubRecord,
        });
        // newRecord.save();
        // ab_SubRecord.save();
      }
      // }
    } catch (err) {
      log.debug({
        title: "try/catch error:",
        details: err,
      });
    }
  }
  return {
    afterSubmit: afterSubmit,
  };
});
