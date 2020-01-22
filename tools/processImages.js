const jimp = require('jimp');
const fs = require('fs');

async function thumbnailImage(path, filename){
	
	let out = './public/thumbnail/' + filename
	
	if (fs.existsSync('./public/thumbnail/' + filename)) {
		return true
	}
	if (!fs.existsSync(path + filename)) {
		console.log("file not found");
		return false
	}
	let image = await jimp.read(path + filename)
	// if (image.bitmap.width>1200 || image.bitmap.height>1200){
	// 	await image.scale(0.3).write(out)
	// 	image = await jimp.read(out)
	// }
	let w = image.bitmap.width
	let h = image.bitmap.height
	if(w > h){
		x = (w - h) / 2;
		y = 0
		w = h
	}else if (w < h){
		y = (h - w) / 2;
		x = 0
		h = w
	} else if (w == h) {
		x = 0
		y = 0
	}
	await image.crop( x, y, w, h ).resize(300, 300).quality(30).write(out)
	return true
}

async function compressImage(path, filename, width){
	if (fs.existsSync(path + filename)) {
		return true
	}
	let image = await jimp.read(path + filename)
	if (width) {
		let w = image.bitmap.width
		let h = image.bitmap.height
		if(w > h){
			x = (w - h) / 2;
			y = 0
			w = h
		}else if (w < h){
			y = (h - w) / 2;
			x = 0
			h = w
		} else if (w == h) {
			x = 0
			y = 0
		}
		image.crop( x, y, w, h )
		image.resize(width, width)
	}
	await image.quality(80).writeAsync(path + filename)
	let stats = await fs.statSync(path + filename)
	return stats.size;
}

module.exports = {
  'thumbnailImage': thumbnailImage,
  'compressImage': compressImage
};