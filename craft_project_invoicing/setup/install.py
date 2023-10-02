import frappe


def after_install():
	setup_item()


def setup_item():
	item_list = ["Advance", "Retention"]
	for item in item_list:
		if not frappe.db.exists("Item", {"item_code": item}):
			item_doc = frappe.new_doc("Item")
			item_doc.item_code = item
			item_doc.item_group = "Services"
			item_doc.save()

	frappe.db.set_value("UOM", "Nos", "must_be_whole_number", 0)
