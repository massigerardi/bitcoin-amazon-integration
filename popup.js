var first_run = false;
if (!localStorage['ran_before']) {
  first_run = true;
  localStorage['ran_before'] = '1';
}

if (first_run) localStorage['user_id'] = makeid();

getCurrentTabUrl(function(url) {
  renderStatus(url);
});


function makeid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}

// storage management

function store(cart) {
  var value = JSON.stringify(cart)
  localStorage['bitcoincart'] = value;
}

function clearCart() {
  var cart = {
    items: [],
    price: {
        amount: 0.0,
        unit: "BTC"
    }
  }
  store(cart)
  $('#cart').empty()
}

function loadCart() {
  var cart = localStorage['bitcoincart']
  if (cart) {
    return JSON.parse(cart);  
  }
  return {
    items: [],
    price: {
        amount: 0.0,
        unit: "BTC"
    }
    
  }
}

function removeItem(productId) {
  var cart = loadCart()
  var item = find(productId)
  if (item != null) {
    delete cart.items[productId]
    $(productId).remove()
    cart.price = calculatePrice(cart.items)
    store(cart)
  }
  refreshCart(cart)
}

function refreshCart(cart) {
    $('#cart-items').text(cart.items.length);
    $('#cart-price-unit').text(cart.price.unit);
    $('#cart-price-amount').text(cart.price.amount);
}

function addToCart() {
  var cart = loadCart()
  var key = currentProduct.id
  if (find(key)) return
  cart.items.push(currentProduct)
  cart.price = calculatePrice(cart.items)
  store(cart)
  refreshCart(cart)
  $('.cart-button-add').remove()
  $("#"+key).append("<span class='cart-item-success-message'>Successfull added product</span>")
}

function closeWindow() {
  window.close();
}


/**
 * Get the current URL.
 *
 * @param {function(string)} callback - called when the URL of the current tab
 *   is found.
 */
function getCurrentTabUrl(callback) {
  // Query filter to be passed to chrome.tabs.query - see
  // https://developer.chrome.com/extensions/tabs#method-query
  var queryInfo = {
    active: true,
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, function(tabs) {
    callback(tabs[0]);
  });

}

function renderStatus(tab) {
  var urlRegex = /^https?:\/\/(?:[^\.]+\.)?amazon\.(de|it)/;
  var url = tab.url
  if (urlRegex.test(url)) {
    chrome.runtime.onConnect.addListener(function (port) {
      port.onMessage.addListener(function (msg) {
        if (msg.product != null) {
          renderProduct(msg.product);
        }
      });
    });
    chrome.tabs.sendMessage(tab.id, { text: "get_product" }, null);
  } 
  populateItems();
  $('.cart-button-clear').click(clearCart)
  $('.cart-button-continue').click(closeWindow)
  $('.cart-button-checkout').click(checkout)
}

function checkout(){
  console.log('checkout')
}

var currentProduct;

function find(productId) {
  var cart = loadCart()
  return cart.items.find(function(item){ 
        return item.id === productId
    })
}

function renderProduct(product) {
  var item = find(product.id)
  if (item == null) {
      currentProduct = product
      getBitcoinPrice(product)
      populateItem(product)
      var id = '#'+product.code;
      if (product.active) {
        $(id).append("<a href='#' class='cart-button-add'>Add</a>")
        $('.cart-button-add').click(addToCart)
      } else {
        $(id).append("<span class='cart-item-fail-message'>No Valid Product</span>")
      }
  }
}

function getBitcoinPrice(product) {
  var searchUrl = 'https://blockchain.info/tobtc?currency='+product.price.unit+'&value='+product.price.amount
  $.ajaxSetup({async: false});
  $.get(searchUrl,
      function(data) {
          if(data.isOk == false) {
            console.log(data.message);
            return
          }
          var amount = data
          var unit = "BTC"
          if (amount < 1) {
            amount *= 1000;
            unit = "mBTC"
          }
          product.btcprice.amount = amount
          product.btcprice.unit = unit
      });          
}  



function calculatePrice(items) {
  var total = 0.0
  var unit = "BTC"
  for (var key =0; key < items.length; key++) {
      var item = items[key]
      var price = item.btcprice.amount
      var unit = item.btcprice.unit
      if (unit == "mBTC") price /= 1000
      total = total + price
  }
  if (total < 1) {
    total *= 1000
    unit = "mBTC"
  }
  return {
    unit: unit,   
    amount: total.toFixed(5)
  }

}

var cartitem = "<li class='cart-item' id='${code}'>\n"
  + "<span class='cart-item-pic'><img src='${imagesrc}'></span>\n"
  + "<span class='cart-item-desc'>${title}</span>\n"
  + "<span class='cart-item-price-btc'>${btcprice.unit} ${btcprice.amount}</span>\n"
  + "<span class='cart-item-price'>${price.unit} ${price.amount}</span>\n"
  + "</li>\n"

function populateItem(item) {
    var entry = cartitem
        .replace("${code}", item.code)
        .replace("${imagesrc}", item.imagesrc)
        .replace("${title}", item.title)
        .replace("${btcprice.amount}", item.btcprice.amount.toFixed(5))
        .replace("${btcprice.unit}", item.btcprice.unit)
        .replace("${price.amount}", item.price.amount)
        .replace("${price.unit}", item.price.unit)
    $('#cart').append(entry)
}



function populateItems() {
  var cart = loadCart()
  for (var key =0; key < cart.items.length; key++) {
      var item = cart.items[key]
      populateItem(item)
  }
  calculatePrice(cart.items)
  refreshCart(cart)

}



