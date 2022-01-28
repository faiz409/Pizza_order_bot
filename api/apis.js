const axios = require('axios');

module.exports.getid = async (step) => {
    var res = await axios.get(`http://localhost:3979/pizza/${ step.values.id }`);
    const data = res.data;
    return data;
};

module.exports.getdetails = async (step) => {
    const params = {
        userName: `${ step.values.userName.toUpperCase() }`,
        mobile: `${ step.values.mobile }`,
        address: `${ step.values.address.toUpperCase() }`,
        pizzaType: `${ step.values.pizzaType.value.toUpperCase() }`,
        pizzaSize: `${ step.values.pizzaSize.value.toUpperCase() }`,
        pizzaTopping: `${ step.values.pizzaTopping.value.toUpperCase() }`,
        pizzaQuantity: `${ step.values.pizzaQuantity }`,
        mail: `${ step.values.mail }`
    };
    // console.log(params);
    var res = await axios.get('http://localhost:3979/pizza', { params });
    const data = res.data;
    return data;
};

module.exports.postid = async (step) => {
    const params = {
        userName: `${ step.values.userName.toUpperCase() }`,
        mobile: `${ step.values.mobile }`,
        address: `${ step.values.address.toUpperCase() }`,
        pizzaType: `${ step.values.pizzaType.value.toUpperCase() }`,
        pizzaSize: `${ step.values.pizzaSize.value.toUpperCase() }`,
        pizzaTopping: `${ step.values.pizzaTopping.value.toUpperCase() }`,
        pizzaQuantity: `${ step.values.pizzaQuantity }`,
        mail: `${ step.values.mail }`
    };
    var rep = await axios.post('http://localhost:3979/pizza', params);
    const data1 = rep.data;
    return data1;
};

module.exports.deleteid = (step) => {
    var res = axios.delete(`http://localhost:3979/pizza/${ step.values.id }`)
        .then(res => {
            console.log(res.data);
        })
        .catch(err => {
            console.log(err);
        });

    const data2 = res.data;
    return data2;
};
