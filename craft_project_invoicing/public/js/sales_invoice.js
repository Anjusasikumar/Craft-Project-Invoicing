frappe.ui.form.on('Sales Invoice', {
	onload_post_render: function (frm) {
		if (frm.doc.sales_order && frm.doc.__islocal) {
			frappe.db.get_doc("Sales Order", frm.doc.sales_order)
				.then(doc => {
					if (doc.enable_project_invoicing) {
						let adv_amount = doc.base_net_total * (doc.advance_percentage / 100);
						let delivery_amount = doc.base_net_total * (doc.on_delivery_percentage / 100);
						let balance_delivery_amount = 0;
						if (doc.advance_billed && !doc.retention_billed) {
							balance_delivery_amount = delivery_amount - (doc.total_billed_amount - adv_amount);
						}
						let retention = doc.base_net_total * (doc.retention_percentage / 100);

						// Advance Billing
						if (!doc.advance_billed && doc.advance_percentage && doc.base_net_total) {
							frappe.db.get_doc("Item", "Advance")
								.then(item_doc => {
									let income_account = '';
									$.each(item_doc.item_defaults, function (k, i) {
										if (i.company == frm.doc.company) {
											income_account = i.income_account;
										}
									});
									let rate = adv_amount;
									frm.clear_table("items");
									let row = frm.add_child("items", {
										item_code: item_doc.name,
										item_name: item_doc.item_name,
										rate: rate,
										qty: 1,
										conversion_factor: 1,
										uom: item_doc.stock_uom,
										description: item_doc.description,
										sales_order: doc.sales_order,
										income_account: income_account,
										project: frm.doc.project,
										cost_center: frm.doc.cost_center
									});
									frm.trigger('rate', row.doctype, row.name);
									frm.refresh_fields("items");
								});
								set_taxes(frm, frm.doc.sales_order);
						}
						// Retention Billing
						else if (doc.advance_billed && doc.on_delivery_billed && !doc.retention_billed && doc.retention_percentage && doc.base_net_total) {
							frappe.db.get_doc("Item", "Retention")
								.then(item_doc => {
									let income_account = '';
									$.each(item_doc.item_defaults, function (k, i) {
										if (i.company == frm.doc.company) {
											income_account = i.income_account;
										}
									});
									let rate = doc.base_net_total * (doc.retention_percentage / 100);
									frm.clear_table("items");
									let row = frm.add_child("items", {
										item_code: item_doc.name,
										item_name: item_doc.item_name,
										rate: rate,
										qty: 1,
										conversion_factor: 1,
										uom: item_doc.stock_uom,
										description: item_doc.description,
										sales_order: doc.sales_order,
										income_account: income_account,
										project: frm.doc.project,
										cost_center: frm.doc.cost_center
									});
									frm.trigger('rate', row.doctype, row.name);
									frm.refresh_fields("items");
									if (!frm.doc.taxes_and_charges) {
										set_taxes(frm, frm.doc.sales_order);
									}
								});
						} else {
							frappe.db.get_value("Company", frm.doc.company, "project_invoicing_tax_template")
								.then(r => {
									if (r.message) {
										frm.set_value("taxes_and_charges", r.message.project_invoicing_tax_template);
										setTimeout(() => {
											$.each(frm.doc.taxes, function (k, t) {
												if (t.is_advance && !t.is_retention) {
													frappe.model.set_value(t.doctype, t.name, "rate", -(doc.advance_percentage));
												} else if (!t.is_advance && t.is_retention) {
													frappe.model.set_value(t.doctype, t.name, "rate", -(doc.retention_percentage));
												}
											});
										}, 1000);
									}
									else {
										frappe.throw({ message: __("Project invoicing template not found in company"), title: __("Message") })
									}
								});
						}
					}
				});
		}
	},

	validate: function (frm) {
		if (frm.doc.items && frm.doc.items.length > 0 && frm.doc.items[0].sales_order) {
			frappe.call({
				method: "craft_project_invoicing.events.sales_invoice.get_so_detail",
				args: {
					"sales_order": frm.doc.items[0].sales_order,
					"invoice_per": frm.doc.custom_invoice_percentage
				},
				callback: function (r) {
					if (r.message) {
						$.each(frm.doc.items, function (k, i) {
							if (r.message[i.so_detail]) {
								frappe.model.set_value(i.doctype, i.name, "custom_so_qty", r.message[i.so_detail].so_qty);
								if (r.message[i.so_detail].qty) {
									frappe.model.set_value(i.doctype, i.name, "qty", r.message[i.so_detail].qty);
								}
							}
						});
					}
				}
			});
		}
	},
});

var set_taxes = function(frm, sales_order) {
	frappe.db.get_value("Sales Order", sales_order, "taxes_and_charges")
	.then(r => {
		if (r.message.taxes_and_charges) {
			setTimeout(() => {
				frm.set_value("taxes_and_charges", r.message.taxes_and_charges);
				frm.trigger("taxes_and_charges", frm.doc.doctype, frm.doc.name);
			}, 1000);
		}
	})
};