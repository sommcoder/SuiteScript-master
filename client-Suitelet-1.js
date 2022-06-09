/**
 *@NApiVersion 2.x
 *@NScriptType ClientScript
 */
define(["N/ui/serverWidget", "N/record"], function (serverWidget, record) {
  function renderWidget() {
    try {
    } catch (err) {
      console.log(err);
    }
  }
  return {
    renderWidget: renderWidget,
    // sublistChanged: sublistChanged,
  };
});
