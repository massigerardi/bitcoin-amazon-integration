
var product = getProductDescription()

var event = document.createEvent("CustomEvent");  
event.initCustomEvent("BitcoinProductDescription", true, true, {"passback":product});
window.dispatchEvent(event);
/*
<div id="cerberus-data-metrics" style="display: none;" 
data-asin="B002RBF1PO" data-asin-price="28.04" data-asin-shipping="0" data-asin-currency-code="EUR" data-substitute-count="-1" data-device-type="WEB" data-display-code="Asin is not eligible because it has a retail offer"></div>
*/
function getProductDescription() {
    var active = true
    var details = document.getElementById('cerberus-data-metrics');
    var title = document.getElementById('productTitle').textContent.trim()
    var price = {
        amount: details.attributes['data-asin-price'].value,
        unit: details.attributes['data-asin-currency-code'].value
    }
    var btcprice = {
        amount: 0.0,
        unit: "BTC"
    }
    var id = details.attributes['data-asin'].value
    var imagesrc = document.getElementById('imageBlock').querySelector('span.a-button-selected img').attributes['src'].value
    return {
        active: active,
        id: id,
        price: price,
        btcprice: btcprice,
        title: title,
        imagesrc: imagesrc,
        url: ''
    }
}
    