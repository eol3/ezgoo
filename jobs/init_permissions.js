var path = require('path');
var root = path.dirname(require.main.filename || process.mainModule.filename);
require('dotenv').config({ path: root + '/../.env' })
const knex = require(root + '/../config/database')

var store_id = 1;
let resources = ["product", "class", "order", "post", "store", "promotions", "specification", "permissions"]
var init = [
	{
		resource: "product",
		permisions: [
			{
				role: "owner",
				read: 1,
				write: 1,
				all: 1
			},
			{
				role: "editor",
				read: 1,
				write: 1,
				all: 1
			},
			{
				role: "picker",
				read: 1,
				write: 0,
				all: 0
			}
		]
	},
	{
		resource: "class",
		permisions: [
			{
				role: "owner",
				read: 1,
				write: 1,
				all: 1
			},
			{
				role: "editor",
				read: 1,
				write: 1,
				all: 1
			},
			{
				role: "picker",
				read: 1,
				write: 0,
				all: 0
			}
		]
	},
	{
		resource: "order",
		permisions: [
			{
				role: "owner",
				read: 1,
				write: 1,
				all: 1
			},
			{
				role: "editor",
				read: 1,
				write: 1,
				all: 1
			},
			{
				role: "picker",
				read: 1,
				write: 1,
				all: 1
			}
		]
	},
	{
		resource: "store",
		permisions: [
			{
				role: "owner",
				read: 1,
				write: 1,
				all: 1
			},
			{
				role: "editor",
				read: 1,
				write: 1,
				all: 1
			},
			{
				role: "picker",
				read: 1,
				write: 0,
				all: 0
			}
		]
	},
	{
		resource: "post",
		permisions: [
			{
				role: "owner",
				read: 1,
				write: 1,
				all: 1
			},
			{
				role: "editor",
				read: 1,
				write: 1,
				all: 1
			},
			{
				role: "picker",
				read: 0,
				write: 0,
				all: 0
			}
		]
	},
	{
		resource: "promotions",
		permisions: [
			{
				role: "owner",
				read: 1,
				write: 1,
				all: 1
			},
			{
				role: "editor",
				read: 1,
				write: 1,
				all: 1
			},
			{
				role: "picker",
				read: 1,
				write: 0,
				all: 0
			}
		]
	},
	{
		resource: "specification",
		permisions: [
			{
				role: "owner",
				read: 1,
				write: 1,
				all: 1
			},
			{
				role: "editor",
				read: 1,
				write: 1,
				all: 1
			},
			{
				role: "picker",
				read: 1,
				write: 0,
				all: 0
			}
		]
	},
	{
		resource: "permissions",
		permisions: [
			{
				role: "owner",
				read: 1,
				write: 1,
				all: 1
			},
			{
				role: "editor",
				read: 0,
				write: 0,
				all: 0
			},
			{
				role: "picker",
				read: 0,
				write: 0,
				all: 0
			}
		]
	},
]

async function main(){
	for (let i in init) {
		for (let j in init[i].permisions) {
			let insert_obj = {
				...init[i].permisions[j],
				store_id: store_id,
				resource: init[i].resource,
				create_at: knex.fn.now()
			}
			await knex("permissions").insert(insert_obj)
		}
	}
	return true
}

main()