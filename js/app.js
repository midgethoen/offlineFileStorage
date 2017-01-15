if (false && 'serviceWorker' in navigator) {
	navigator.serviceWorker.register('../sw.js', { scope: '/' }).then((reg) => {
		if (reg.installing) {
			console.log('Service worker installing');
		} else if(reg.waiting) {
			console.log('Service worker installed');
		} else if(reg.active) {
			console.log('Service worker active');
		}
	}).catch((error) => {
		console.log('Registration failed with ' + error); // Registration failed
	});

  // Communicate with the service worker using MessageChannel API.
  function sendMessage(message) {
    return new Promise((resolve, reject) => {
      const messageChannel = new MessageChannel();
      messageChannel.port1.onmessage = function(event) {
        resolve(`Direct message from SW: ${event.data}`);
      };

      navigator.serviceWorker.controller.postMessage(message, [messageChannel.port2])
    });
  }
}


function setResult(id, str) {
	document.getElementById(id).innerHTML = str
}
setDownloadResult = setResult.bind(undefined, 'downloadResult')
setOpenResult = setResult.bind(undefined, 'openResult')

function download() {
	console.log('download');
	var xhr = new XMLHttpRequest;
	xhr.responseType = "arraybuffer";
	xhr.open("GET", '/files/test.pdf');
  xhr.addEventListener('progress', function (event) {
		var percentage = parseInt(100*(event.loaded / event.total))
		setDownloadResult(`File download.. ${percentage}%`)
	})
	xhr.addEventListener("load", function (event) {
		var bytes = new Uint8Array(xhr.response);
		var binary = '';
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode( bytes[ i ] );
    }
		localStorage.file = btoa( binary )
		setDownloadResult('File download.. done')
	});
	xhr.send()
}

function openFile() {
	console.log('open');

	var binary = atob(localStorage.file)
	var array = []
	for(var i = 0; i < binary.length; i++) array.push(binary.charCodeAt(i));
	var blob = new Blob([new Uint8Array(array)], {type: 'application/pdf'});
	const url = URL.createObjectURL(blob)

	window.open(url, '_self');
	setOpenResult('Has opened file')
}

document.getElementById('downloadButton').onclick = download
document.getElementById('openButton').onclick = openFile
