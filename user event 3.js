// within create, when the employee record is saved, if the supervisor field is blank, default to the company CEO based on job title, and set the CEO to the supervisor. Additionally, add to the memo/comments of the employee record that supervisor was defaulted to CEO because it was empty.

/* 

after a new employee record is created for the first time, send an email to the supervisors email with an HR note saying
"subject: new employee introduction - <employee name>"" "body: hey <supervisor name> a new employee record has been created for <employee name> please ensure that the information entered on the record is correct. LINE BREAK Hyper link the employee record"

*/

/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */

define(["N/email", "N/runtime", "N/search"], function (email, runtime, search) {
  // global references:
  var ceo;
  var newEmp;
  var empRecord;
  var recordType;
  var supervisorId;
  var supervisorEmail;

  function getSupervisorInfo(context) {
    try {
      log.debug({
        title: "empRecord via getSupervisorInfo():",
        details: empRecord,
      });
      supervisorId = empRecord.getValue({
        fieldId: "supervisor",
      });
      supervisorEmail = empRecord.getValue({
        fieldId: "supervisor",
      });
    } catch (err) {
      log.debug({
        title: "getSupervisorInfo err catch",
        details: err,
      });
    }
  }

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
      recordType = context.type;
      empRecord = context.newRecord;

      log.debug({
        title: "recordType:",
        details: recordType,
      });

      log.debug({
        title: "empRecord:",
        details: empRecord,
      });

      // must be in 'create' type
      if (recordType !== "create") return;
      log.debug({
        title: "create condition",
        details: 'passed the "create" condition',
      });

      getSupervisorInfo();

      // did it work?:
      log.debug({
        title: "curr supervisor id:",
        details: supervisorId,
      });

      if (!supervisorId) {
        let ceoSearch = search.create({
          type: "employee",
          filters: [
            ["title", "is", "Chief Executive Officer"], // id: 192
          ],
          columns: ["subsidiarynohierarchy", "comments", "entityid", "email"], // return email
        });

        ceoSearch.run().each((result) => {
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
      }
    } catch (err) {
      log.debug({
        title: "before submit err catch",
        details: err,
      });
    }
  }

  // after a new employee record is created for the first time, send an email to the supervisors email with an HR note saying
  // "subject: new employee introduction - <employee name>"" "body: hey <supervisor name> a new employee record has been created for <employee name> please ensure that the information entered on the record is correct. LINE BREAK Hyper link the employee record"

  function afterSubmit(context) {
    try {
      if (recordType !== "create") return;

      let currUser = runtime.getCurrentUser();
      let currUserName = currUser.name;
      let newEmpRecordName = empRecord.entityid;
      let timeStamp = new Date().getUTCMilliseconds();

      log.debug({
        title: "currUser:",
        details: [currUser, timeStamp, currUserName],
      });

      email.send({
        author: currUserName,
        body: `Hello ${supervisorId} \n\nA new employee record has been created for ${newEmpRecordName}.\nPlease ensure that the information entered on their record is correct.\nClick to view employee record:<a href="https://tstdrv2338496.app.netsuite.com/app/common/entity/employee.nl?id=3111&whence=&cmid=1652818365763_3384">${newEmpRecordName}}</a>`,
        recipients: supervisorId,
        subject: `New Employee Introduction : ${newEmpRecordName}`,
        relatedRecords: {
          customRecord: newEmpRecordName,
        },
      });
    } catch (err) {
      log.debug({
        title: "before submit err catch",
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
