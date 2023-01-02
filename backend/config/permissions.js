var data = [
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
		resource: "spec",
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

module.exports = data