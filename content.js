chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
    if (msg.text ) {
        if (msg.text == "get_product") {
            console.log("get_product")
            var scr = document.createElement('script')
            document.body.appendChild(scr).src = chrome.extension.getURL('inject.js');
            window.addEventListener("BitcoinProductDescription", handleEvent );
            scr.parentNode.removeChild(scr);
        }
    }   

});

function handleEvent(e) {
    chrome.runtime.connect().postMessage({ product: e.detail.passback })
}
