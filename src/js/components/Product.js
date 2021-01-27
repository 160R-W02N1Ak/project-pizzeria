import {select, classNames, templates} from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';

class Product{

  constructor(id, data){
    const thisProduct = this;

    thisProduct.id = id;
    thisProduct.data = data;

    thisProduct.renderInMenu();
    thisProduct.getElements();
    thisProduct.initAccordion();
    thisProduct.initOrderForm();
    thisProduct.initAmountWidget();
    thisProduct.processOrder();

  }

  renderInMenu(){
    const thisProduct = this;

    /* generate HTML based on template */
    const generatedHTML = templates.menuProduct(thisProduct.data);

    /* create element using utils.createElementFromHTML */
    thisProduct.element = utils.createDOMFromHTML(generatedHTML);

    /* find menu container */
    const menuContainer = document.querySelector(select.containerOf.menu);

    /*add element to menu */
    menuContainer.appendChild(thisProduct.element);

  }

  getElements(element){
    const thisProduct = this;

    thisProduct.dom = {};
    thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
    thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
    thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
    thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
    thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
    thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
    thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);

    thisProduct.dom.wrapper = element;

  }

  initAccordion(){
    const thisProduct = this;

    /* find the clickable trigger (the element that should react to clicking) */
    const clickableTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);

    /* START: add event listener to clickable trigger on event click */
    clickableTrigger.addEventListener('click', function(event) {
      /* prevent default action for event */
      event.preventDefault();

      /* find active product (product that has active class) */
      const activeProduct = document.querySelector(select.all.menuProductsActive);

      /* if there is active product and it's not thisProduct.element, remove class active from it */

      if (activeProduct !== null && activeProduct !== thisProduct.element){
        activeProduct.classList.remove('active');
      }

      /* toggle active class on thisProduct.element */
      thisProduct.element.classList.toggle('active');

    });
  }

  initOrderForm(){
    const thisProduct = this;

    thisProduct.form.addEventListener('submit', function(event){
      event.preventDefault();
      thisProduct.processOrder();
    });

    for(let input of thisProduct.formInputs){
      input.addEventListener('change', function(){
        thisProduct.processOrder();
      });
    }

    thisProduct.cartButton.addEventListener('click', function(event){
      event.preventDefault();
      thisProduct.processOrder();
      thisProduct.addToCart();
    });


  }

  processOrder(){
    const thisProduct = this;

    // convert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
    const formData = utils.serializeFormToObject(thisProduct.form);


    // set price to default price

    let price = thisProduct.data.price;

    // for every category (param)...
    for(let paramId in thisProduct.data.params) {

      // determine param value, e.g. paramId = 'toppings', param = {label: 'toppings', type: 'checkboxes'... }
      const param = thisProduct.data.params[paramId];


      // for every option in this category
      for(let optionId in param.options) {

        // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
        const option = param.options[optionId];

        const optionSelected = formData[paramId] && formData[paramId].includes(optionId);

        if(optionSelected) {
          if(!option.default == true) {
            price = price + option.price;
          }
        }
        else {
          if(option.default == true) {
            price = price - option.price;
          }
        }
        const optionImage = thisProduct.imageWrapper.querySelector('.' + paramId + '-' + optionId);
        if(optionImage) {
          if(optionSelected) {
            optionImage.classList.add(classNames.menuProduct.imageVisible);
          }
          else {
            optionImage.classList.remove(classNames.menuProduct.imageVisible);
          }
        }
      }
    }

    // update calculated price in the HTML
    //console.log(price);
    price *= thisProduct.amountWidget.value;
    //console.log(price);
    thisProduct.priceMulti = price;
    thisProduct.priceElem.innerHTML = price;

  }

  initAmountWidget(){
    const thisProduct = this;

    thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
    thisProduct.amountWidgetElem.addEventListener('updated', function(){
      thisProduct.processOrder();
    });
  }

  addToCart(){
    const thisProduct = this;

    const event = new CustomEvent('add-to-cart', {
      bubbles: true,
      detail: {
        product: this.prepareCartProduct(),
      },
    });

    thisProduct.element.dispatchEvent(event);

  }

  prepareCartProduct(){
    const thisProduct = this;

    const productSummary = {
      id: thisProduct.id,
      name: thisProduct.data.name,
      amount: thisProduct.amountWidget.value,
      priceSingle: thisProduct.data.price,
      price: thisProduct.priceMulti,
      params: thisProduct.prepareCartProductParams()
    };

    return productSummary;
  }

  prepareCartProductParams(){
    const thisProduct = this;

    const formData = utils.serializeFormToObject(thisProduct.form);
    const params = {};

    for(let paramId in thisProduct.data.params) {
      const param = thisProduct.data.params[paramId];

      params[paramId] = {
        label: param.label,
        options: {}
      };
      for(let optionId in param.options) {
        const option = param.options[optionId];
        const optionSelected = formData[paramId] && formData[paramId].includes(optionId);

        if(optionSelected){
          params[paramId].options[optionId] = option.label;
        }
      }
    }
    return params;
  }

}

export default Product;