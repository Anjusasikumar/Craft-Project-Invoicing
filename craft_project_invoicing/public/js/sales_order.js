frappe.ui.form.on('Sales Order', {
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
