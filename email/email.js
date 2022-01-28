module.exports = {
    mailto: function(userName, mobile, address, pizzaType, pizzaSize, pizzaTopping, pizzaQuantity, id, mail) {
        var nodemailer = require('nodemailer');

        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: '',
                pass: ''
            }
        });

        var mailOptions = {
            from: '',
            to: `${ mail }`,
            subject: 'Order placed...',
            html: `<h1>Hi ${ userName } your order is booked</h1> <h3>Here are the following details</h3> <h4>Name:- ${ userName }</h4><h4>Order Id:- ${ id } <h4><h4>Mobile No:- ${ mobile }</h4><h4>Address:- ${ address }</h4><h4>Pizza Type:- ${ pizzaType } <h4>Pizza Size:- ${ pizzaSize }</h4> <h4>Pizza Exrtra Topping:- ${ pizzaTopping }</h4> <h4>Pizza Quantity:- ${ pizzaQuantity }</h4><h4>Email:- ${ mail }</h4>`
        };

        transporter.sendMail(mailOptions, function(error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });
    }
};
