frappe.ui.form.on('Sales Order', {
	custom_order_invoicing_type: function (frm) {
		if (frm.doc.custom_order_invoicing_type && frm.doc.custom_order_invoicing_type == "Project Invoicing") {
		    frm.set_value("enable_project_invoicing", 1);
		}
	},
    advance_percentage: function (frm) {
		if (frm.doc.advance_percentage) {
		    frm.set_value("on_delivery_percentage", (100 - (frm.doc.advance_percentage + parseFloat(frm.doc.retention_percentage))));
		}
	},

    retention_percentage: function (frm) {
		if (frm.doc.advance_percentage) {
		    frm.set_value("on_delivery_percentage", (100 - (frm.doc.advance_percentage + parseFloat(frm.doc.retention_percentage))));
		}
	},
	
	onload: function (frm) {
        if (frm.doc.enable_project_invoicing && frm.doc.retention_billed === 0) {
            frm.add_custom_button(__('Sales Invoice'), () => frm.events.make_sales_invoice(frm), __('Create'));
        }
	},

    make_sales_invoice: function (frm) {
		frappe.model.open_mapped_doc({
			method: "erpnext.selling.doctype.sales_order.sales_order.make_sales_invoice",
			frm: frm
		});
	},
});
