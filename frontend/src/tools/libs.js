
var websiteUrl = 'https://helloavgirls.com/'

export function initHead() {
  let str = 'Hello! AV Girls - 成人影片 日本AV 色情影片 線上免費觀看'
	document.title = str
	document.querySelector('meta[name="title"]').setAttribute("content", str)
	document.querySelector('meta[name="description"]').setAttribute("content", str)
	document.querySelector('meta[name="keywords"]').setAttribute("content", '成人影片 日本AV 色情影片 線上免費觀')
	
	document.querySelector('meta[property="og:url"]').setAttribute("content", websiteUrl)
	document.querySelector('meta[property="og:title"]').setAttribute("content", str)
	document.querySelector('meta[property="og:description"]').setAttribute("content", str)
	document.querySelector('meta[property="og:image"]').setAttribute("content", '/Logo.png')
	
	document.querySelector('meta[property="twitter:url"]').setAttribute("content", websiteUrl)
	document.querySelector('meta[property="twitter:title"]').setAttribute("content", str)
	document.querySelector('meta[property="twitter:description"]').setAttribute("content", str)
	document.querySelector('meta[property="twitter:image"]').setAttribute("content", '/Logo.png')
}

export function setHead(data) {
  if (data.title) {
  	data.title += ' - Hello! AV Girls'
  } else {
    data.title = 'Hello! AV Girls - 成人影片 日本AV 色情影片 線上免費觀看'
  }
  
  document.title = data.title
	document.querySelector('meta[name="title"]').setAttribute("content", data.title)
	document.querySelector('meta[property="og:title"]').setAttribute("content", data.title)
	document.querySelector('meta[property="twitter:title"]').setAttribute("content", data.title)
  
  let description = ''
  
  if (data.description) {
    description = data.description
    description += ' - '
  }
  description += 'Hello! AV Girls 提供成人影片、日本AV、色情影片線上免費觀看服務，電腦、手機、平板，各種平台皆可使用觀看。'
  
  if (data.keywords) {
    data.keywords += '成人影片,日本AV,色情影片,線上免費觀看'
  	document.querySelector('meta[name="keywords"]').setAttribute("content", data.keywords)
  }
  
  if (data.description || data.keywords) {
    document.querySelector('meta[name="description"]').setAttribute("content", description)
  	document.querySelector('meta[property="og:description"]').setAttribute("content", description)
  	document.querySelector('meta[property="twitter:description"]').setAttribute("content", description)
  }
  
  if (data.image) {
  	document.querySelector('meta[property="og:image"]').setAttribute("content", data.image)
  	document.querySelector('meta[property="twitter:image"]').setAttribute("content", data.image)
  }
  
  if (data.url) {
    document.querySelector('meta[property="og:url"]').setAttribute("content", data.url)
  	document.querySelector('meta[property="twitter:url"]').setAttribute("content", data.url)
  }
}

export function getCookie(cname) {
  var name = cname + "=";
  var ca = document.cookie.split(';');
  for(var i=0; i<ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0)==' ') c = c.substring(1);
      if (c.indexOf(name) == 0) return c.substring(name.length,c.length);
  }
  return '';
}

export function setCookie(cname, cvalue, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + (exdays*24*60*60*1000));
  var expires = "expires="+d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";path=/; " + expires;
}

function fallbackCopyTextToClipboard(text) {
  var textArea = document.createElement("textarea");
  textArea.value = text;
  
  // Avoid scrolling to bottom
  textArea.style.top = "0";
  textArea.style.left = "0";
  textArea.style.position = "fixed";

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    var successful = document.execCommand('copy');
    // var msg = successful ? 'successful' : 'unsuccessful';
    // console.log('Fallback: Copying text command was ' + msg);
  } catch (err) {
    console.error('Fallback: Oops, unable to copy', err);
  }

  document.body.removeChild(textArea);
}
export function copyTextToClipboard(text) {
  if (!navigator.clipboard) {
    fallbackCopyTextToClipboard(text);
    return;
  }
  navigator.clipboard.writeText(text).then(function() {
    // console.log('Async: Copying to clipboard was successful!');
  }, function(err) {
    console.error('Async: Could not copy text: ', err);
  });
}

