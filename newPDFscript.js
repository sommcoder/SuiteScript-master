/* 
1) create a sales order PDF that replicates this format, but for the test account you have access to and the information there.
** use Camilos template he sent you


2) Header: logom address, and contact info, then pdf title plus order number and date, then Bill To and Ship To address, then a double stacked record header for some info on the order. Customer PO, sales rep, contact. Total BF doesn;t make sense for the test account so just REPLACE it with another field. then the item list.

3) In the item field, show the item BOLDED, with the description of the item underneath. Thi is followed by quantity, ignore pieces, show back order, UOM, lumber price can just be rate and total amount.

4) Show the subtotal and totals box at the bottom

5) finally, in the footer show a disclaimer with a logo and page nunber.

*** LOOK into how PDFs are made upon NS. the key term you are looking for here is NetSuite Advanced PDF/HTML. This isnt very customized and is a good starting point.

*** NS uses FreeMarker for any PDF logic you need to run and BFO for the Java PDF engine. So look into those two to see what it allows. NetSuite uses CSS2. PDFs are pretty much built from tables on NS
*/

// create a sales order that replicates this format

define;
