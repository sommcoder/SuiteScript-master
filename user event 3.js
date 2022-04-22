//within create, when the employee record is saved, if the supervisor field is blank, default to the company CEO based on job title, and set the CEO to the supervisor. Additionally, add to the memo/comments of the employee record that supervisor was defaulted to CEO because it was empty.

// after a new employee record is created for the first time, send an email to the supervisors email with an HR note saying
// "subject: new employee introduction - <employee name>"" "body: hey <supervisor name> a new employee record has been created for <employee name> please ensure that the information entered on the record is correct. LINE BREAK Hyper link the employee record"

/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 */
define([], function () {
  function beforeLoad(context) {}

  function beforeSubmit(context) {}

  function afterSubmit(context) {}

  return {
    beforeLoad: beforeLoad,
    beforeSubmit: beforeSubmit,
    afterSubmit: afterSubmit,
  };
});
