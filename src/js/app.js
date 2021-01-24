import {settings, select, classNames} from './settings.js';//importuj obiekt settings z pliku settings.js wazna jest kropka i slash
import Product from './components/Product.js';  //import domyslny , bez nawiasow klamrowych
import Cart from './components/Cart.js';



const app = {
  initMenu: function(){
    const thisApp = this;

    for(let productData in thisApp.data.products){
      new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
    }
  },

  initData: function(){
    const thisApp = this;
  
    thisApp.data = {};
    const url = settings.db.url + '/' + settings.db.product;
  
    fetch(url)
      .then(function(rawResponse){
        return rawResponse.json();
      })
      .then(function(parsedResponse){
        console.log('products throught api', parsedResponse);//test-api-response
        thisApp.data.products = parsedResponse;
        thisApp.initMenu();
      });
  },

  initCart: function(){
    const thisApp = this;

    const cartElem = document.querySelector(select.containerOf.cart);
    thisApp.cart = new Cart(cartElem);

    thisApp.productList = document.querySelector(select.containerOf.menu);

    thisApp.productList.addEventListener('add-to-cart', function(event){
      app.cart.add(event.detail.product); 
    });
  },

  init: function(){
    const thisApp = this;

    thisApp.initData();
      
    thisApp.initCart();
  },
};

app.init();

