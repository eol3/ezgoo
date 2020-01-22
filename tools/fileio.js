const fs = require('fs');
const fsPromises = require('fs').promises;

async function delete_img(path){
	if (fs.existsSync(path)) {
		try {
			await fsPromises.unlink(path)
		} catch(e) {
			console.log(e)
		}
	} else {
		return true
	}
}

async function file_size(path) {
	if (fs.existsSync(path)) {
		console.log("true")
	}
	console.log(path)
	let stats = await fs.statSync(path)
	console.log(stats.size);
	return stats.size;
}

module.exports = {
  'delete_img': delete_img,
  'file_size': file_size
};