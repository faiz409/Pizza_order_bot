const express = require('express');
const dataSchema = require('../models/databaseSchema');
const router = express.Router();

router.get('/:id', async (req, res) => {
    try {
        const chatbot = await dataSchema.findById(req.params.id);
        res.json(chatbot);
        // console.log(data3);
    } catch (err) {
        console.log('Error' + err);
    }
});

router.post('/', async (req, res) => {
    // eslint-disable-next-line new-cap
    const chatbot = new dataSchema({
        userName: req.body.userName,
        mobile: req.body.mobile,
        address: req.body.address,
        pizzaType: req.body.pizzaType,
        pizzaSize: req.body.pizzaSize,
        pizzaTopping: req.body.pizzaTopping,
        pizzaQuantity: req.body.pizzaQuantity,
        mail: req.body.mail
    });
    try {
        const pizzaData1 = await chatbot.save();
        res.json(pizzaData1);
    } catch (err) {
        console.log('Error' + err);
    }
});

router.get('/', async (req, res) => {
    try {
        // console.log(req.query);
        const chatbot = await dataSchema.find(req.query);
        res.json(chatbot);
        // console.log(data);
    } catch (err) {
        console.log(err);
    }
});

router.delete('/:id', async (req, res) => {
    // console.log(req);
    try {
        const deleteOrder = await dataSchema.findByIdAndDelete(req.params.id);
        console.log(req.params.id);
        if (!req.params.id) {
            return res.status(404).send();
        }
        return res.json(deleteOrder);
    } catch (err) {
        console.log('Error' + err);
    }
});

module.exports = router;
