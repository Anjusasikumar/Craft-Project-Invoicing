import frappe

def validate(doc,method):
    if doc.enable_project_invoicing and (doc.advance_percentage or doc.on_delivery_percentage or doc.retention_percentage):
        total = doc.advance_percentage + doc.on_delivery_percentage + doc.retention_percentage
        if total != 100:
            frappe.throw(
                title='Error',
                msg='Total of Advance, On Delivery and Retention should be <b>100%</b>'
            )