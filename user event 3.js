// within create, when the employee record is saved, if the supervisor field is blank, default to the company CEO based on job title, and set the CEO to the supervisor. Additionally, add to the memo/comments of the employee record that supervisor was defaulted to CEO because it was empty.

/* 

after a new employee record is created for the first time, send an email to the supervisors email with an HR note saying
"subject: new employee introduction - <employee name>"" "body: hey <supervisor name> a new employee record has been created for <employee name> please ensure that the information entered on the record is correct. LINE BREAK Hyper link the employee record"

*/

/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */

define(["N/email", "N/runtime", "N/search", "N/url"], function (
  email,
  runtime,
  search,
  url
) {
  // global references:
  var newEmpId;
  var empRecord;
  var recordType;
  var supervisorId;
  var supervisorName;
  var newEmpURL;

  function beforeLoad(context) {
    try {
    } catch (err) {
      log.debug({
        title: "beforeLoad err catch",
        details: err,
      });
    }
  }

  function beforeSubmit(context) {
    try {
      //access the context type
      recordType = context.type;

      // must be in 'create' type
      if (recordType !== "create") return;

      // access the new record from context
      empRecord = context.newRecord;

      // get entityid from new record
      newEmpId = empRecord.getValue({
        fieldId: "entityid",
      });

      log.debug({
        title: "beforeSubmit: newEmpId:",
        details: newEmpId,
      });

      // access the supervisor id from the record
      supervisorId = empRecord.getValue({
        fieldId: "supervisor",
      });

      // if no supervisor then saved search for CEO:
      if (!supervisorId) {
        let ceoSearch = search.create({
          type: "employee",
          filters: [
            ["title", "is", "Chief Executive Officer"], // id: 192
          ],
          columns: ["entityid", "email", "firstname"],
        });

        ceoSearch.run().each((result) => {
          // assign to supervisorName variable
          supervisorName = result.getValue({
            name: "firstname",
          });

          empRecord.setValue({
            fieldId: "supervisor",
            value: result.id,
          });
          empRecord.setValue({
            fieldId: "comments",
            value:
              "CEO was defaulted to supervisor \nbecause the supervisor field was empty",
          });
          return false;
        });
      } else {
        // if supervisor IS set, get supervisorName!
        let supervisorNameSearch = search.create({
          type: "employee",
          filters: [
            ["internalid", "anyof", supervisorId], // find firstname of newEmp's supervisor by id
          ],
          columns: ["firstname"],
        });

        supervisorNameSearch.run().each((result) => {
          // assign to supervisorName variable
          supervisorName = result.getValue({
            name: "firstname",
          });
          log.debug({
            title: "beforeSubmit, search, supervisorName:",
            details: supervisorName,
          });
          return false;
        });
      }
    } catch (err) {
      log.debug({
        title: "before submit err catch",
        details: err,
      });
    }
  }

  function afterSubmit(context) {
    try {
      // need to reassign empRecord
      empRecord = context.newRecord;
      // did empRecord change?
      log.debug({
        title: "afterSubmit, empRecord:",
        details: empRecord,
      });

      // access the supervisor id from the record
      supervisorId = empRecord.getValue({
        fieldId: "supervisor",
      });

      // supervisorName = empRecord.getValue({
      //   fieldId: "",
      // });

      // is the supervisor Name carrying through to the afterSubmit event... ?
      log.debug({
        title: "afterSubmit: curr supervisor name:",
        details: supervisorName,
      });

      let currUser = runtime.getCurrentUser();
      log.debug({
        title: "afterSubmit, currUser:",
        details: currUser,
      });

      let currUserId = currUser.id; // camilo test
      log.debug({
        title: "afterSubmit, currUserId:",
        details: currUserId,
      });

      let newEmpRecordName = empRecord.getValue({
        fieldId: "firstname",
      });

      log.debug({
        title: "afterSubmit, newEmpRecordName:",
        details: newEmpRecordName,
      });

      newEmpId = empRecord.getValue({
        fieldId: "entityid",
      });

      log.debug({
        title: "afterSubmit, newEmpID",
        details: newEmpId,
      });

      /// URL:
      newEmpURL = url.resolveRecord({
        recordType: "employee",
        recordId: newEmpId,
        isEditMode: true,
      });

      // should log correct URL to new employee
      log.debug({
        title: "afterSubmit, newEmpURL:",
        details: newEmpURL,
      });

      email.send({
        author: currUserId,
        body: `
        <h2>Hello ${supervisorId}</h2></br>
        <p>
        A new employee record has been created for <strong>${newEmpRecordName}</strong>.</br></br>
          Please ensure that the information entered on their record is correct.</br></br>
          Click to view employee record:
          <a href="https://tstdrv2338496.app.netsuite.com/${newEmpURL}"><strong>${newEmpRecordName}</strong></a>
        </p>
        `,
        recipients: supervisorId,
        subject: `New Employee Introduction : ${newEmpRecordName}`,
        relatedRecords: {
          customRecord: {
            id: newEmpId,
            recordType: recordType,
          },
        },
      });
    } catch (err) {
      log.debug({
        title: "after submit err catch",
        details: err,
      });
    }
  }
  return {
    beforeLoad: beforeLoad,
    beforeSubmit: beforeSubmit,
    afterSubmit: afterSubmit,
  };
});
