var path = require('path');
var root = path.dirname(require.main.filename || process.mainModule.filename);
require('dotenv').config({ path: root + '/../.env' })
const knex = require(root + '/../config/database')
var moment = require('moment');
//console.log(moment().format("YYYY/MM/DD"));
//return;
//process.env.TZ = "Asia/Taipei"
/* 
 *  whitch node
 *  /home/ubuntu/.nvm/versions/node/v12.8.0/bin/node /home/ubuntu/nodeapp/ezgoo/jobs/promotions.js
 *  >> /home/ubuntu/nodeapp/ezgoo/jobs/logs/promotions.log
 */

async function main() {
	var rightNow = new Date();
	var today = moment().format("YYYY/MM/DD")
	console.log("== Starting..." + moment().format("YYYY/MM/DD HH:mm:ss") + " ==")
	
	//變更特價
	let all_prom = await knex("promotions").where({
		status: 1,
		change: 0
	}).where("start_at", "<=", today).where("expire_at", ">=", today)
	if (all_prom.length === 0) {
		console.log("沒有需要變更特價的活動")
	}
	for (let i in all_prom) {
		console.log("開始變更特價:" + all_prom[i].id + "." + all_prom[i].name)
		change_price(JSON.parse(all_prom[i].content))
		await knex("promotions").where("id", all_prom[i].id).update({
			change: 1
		})
	}
	
	//變回原價
	all_prom = await knex("promotions").where({
		change: 1
	}).where("expire_at", "<", today)
	if (all_prom.length === 0) {
		console.log("沒有需要取消特價的活動")
	}
	for (let i in all_prom) {
		console.log("開始取消特價:" + all_prom[i].id + "." + all_prom[i].name)
		set_price_zero(JSON.parse(all_prom[i].content))
		await knex("promotions").where("id", all_prom[i].id).update({
			change: 0
		})
	}
	console.log("== Finish ==\n")
	return
}

async function change_price(change_product) {
	for (let i in change_product) {
		await knex("product").where("id", change_product[i].id).update({
			spec_price: change_product[i].spec_price
		})
	}
}

async function set_price_zero(change_product) {
	for (let i in change_product) {
		await knex("product").where("id", change_product[i].id).update({
			spec_price: 0
		})
	}
}

main()