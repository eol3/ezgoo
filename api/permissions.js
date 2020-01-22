const express = require('express')
const perm = express.Router()
const permModel = require('../models/permissions')
const my = require("../tools/myModules");
const permissions = require('../config/permissions');

perm.get('/', my.checkStoreId, my.authLogin, my.wrapAsync(async function(req, res, next) {
	if (req.query.group === undefined) {
		req.query.group = "general"
	}
	let role = ""
	if (req.session.user.role === undefined) {
		await permModel.getRole(req)
	}
	if (req.query.group === "manage" && req.session.user.role.manage !== undefined) {
		role = req.session.user.role.manage
	} else if (req.query.group === "general" && req.session.user.role.general !== undefined) {
		role = req.session.user.role.general
	}
	
	// let data = await permModel.getList(role, req)
	// res.json(data)

	let data = {};
	for (let i in permissions) {
		let key = permissions[i].resource
		for (let j in permissions[i].permisions) {
			if (permissions[i].permisions[j].role === role) {
				data[key] = {
					read: permissions[i].permisions[j].read,
					write: permissions[i].permisions[j].write,
					all: permissions[i].permisions[j].all
				}
			}
		}
	}
	res.json(data)
}))


module.exports = perm