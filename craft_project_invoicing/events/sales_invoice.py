import frappe
from frappe.utils import flt



@frappe.whitelist()
def get_so_detail (sales_order, invoice_per=None):
	if not sales_order:
		return

	if invoice_per and isinstance(invoice_per, str):
		invoice_per = flt(invoice_per)

	so_doc = frappe.get_doc("Sales Order", sales_order)
	so_details = {}
	if so_doc and so_doc.items:
		for item in so_doc.items:
			detail_dict = frappe._dict({
				"so_detail": item.name,
				"so_qty": item.qty,
				"qty": item.qty * (invoice_per/100) if invoice_per else None
			})
			so_details[item.name] = detail_dict

	return so_details if so_details else None