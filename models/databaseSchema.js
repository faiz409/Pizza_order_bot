const mongooose = require('mongoose');

// eslint-disable-next-line camelcase
const dataSchema = new mongooose.Schema({
    userName: { type: String, require: true },
    mobile: { type: Number, require: true },
    address: { type: String, require: true },
    pizzaType: { type: String, require: true },
    pizzaSize: { type: String, require: true },
    pizzaTopping: { type: String, require: true },
    pizzaQuantity: { type: Number, require: true },
    mail: { type: String, require: true }

});

// eslint-disable-next-line new-cap
const pizzaOrderData = new mongooose.model('Chatbot', dataSchema);

module.exports = pizzaOrderData;
