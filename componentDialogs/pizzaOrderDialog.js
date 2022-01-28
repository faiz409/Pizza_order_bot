const { WaterfallDialog, ComponentDialog } = require('botbuilder-dialogs');
const { ConfirmPrompt, ChoicePrompt, DateTimePrompt, NumberPrompt, TextPrompt } = require('botbuilder-dialogs');
const { DialogSet, DialogTurnStatus } = require('botbuilder-dialogs');
const { postid, getdetails } = require('../api/apis');
const { CardFactory } = require('botbuilder');
const { mailto } = require('../email/email');
const addressCard = require('../resources/adaptiveCards/addressCard.json');

const cards = [addressCard];

const CHOICE_PROMPT = 'CHOICE_PROMPT';
const NUMBER_PROMPT = 'NUMBER_PROMPT';
const TEXT_PROMPT = 'TEXT_PROMPT';
const DATETIME_PROMPT = 'DATETIME_PROMPT';
const CONFIRM_PROMPT = 'CONFIRM_PROMPT';
const WATERFALL_DIALOG = 'WATERFALL_DIALOG';
var endDialog = '';

class PizzaOrderDialog extends ComponentDialog {
    constructor(conversationState) {
        super('pizzaOrderDialog');
        this.addDialog(new TextPrompt(TEXT_PROMPT));
        this.addDialog(new ChoicePrompt(CHOICE_PROMPT));
        this.addDialog(new NumberPrompt(NUMBER_PROMPT));
        this.addDialog(new DateTimePrompt(DATETIME_PROMPT));
        this.addDialog(new ConfirmPrompt(CONFIRM_PROMPT));
        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.firstStep.bind(this),
            this.getNameOfUser.bind(this),
            this.getNumberOfUser.bind(this),
            this.getAddressOfUser.bind(this),
            this.getNameOfPizza.bind(this),
            this.getSizeOfPizza.bind(this),
            this.getToppingOfPizza.bind(this),
            this.getNumberOfPizza.bind(this),
            this.getMail.bind(this),
            this.confirmStep.bind(this),
            this.summaryStep.bind(this)
        ]));
        this.initialDialogId = WATERFALL_DIALOG;
    }

    async run(context, accessor) {
        const dialogSet = new DialogSet(accessor);
        // set class id
        dialogSet.add(this);
        // console.log(dialogSet.add(this));
        // console.log(this);
        const dialogContext = await dialogSet.createContext(context);

        const results = await dialogContext.continueDialog();
        if (results.status === DialogTurnStatus.empty) {
            // start class
            await dialogContext.beginDialog(this.id);
            // console.log(await dialogContext.beginDialog(this.id));
            // console.log(this.id);
        }
    }

    async firstStep(step) {
        endDialog = false;
        return await step.prompt(CONFIRM_PROMPT, 'Would you like to order a pizza?', ['Yes', 'No']);
    }

    async getNameOfUser(step) {
        if (step.result === true) {
            return await step.prompt(TEXT_PROMPT, 'What is your name?');
        }

        if (step.result === false) {
            await step.context.sendActivity('Please, try one more time');
            endDialog = true;
            return await step.endDialog();
        }
    }

    async getNumberOfUser(step) {
        step.values.userName = step.result;
        return await step.prompt(NUMBER_PROMPT, `Hi! ${ step.values.userName } , what is your mobile number?`);
    }

    async getAddressOfUser(step) {
        step.values.mobile = step.result;
        return await step.prompt(TEXT_PROMPT, `${ step.values.userName } , what is your address?`);
    }

    async getNameOfPizza(step) {
        step.values.address = step.result;
        await step.context.sendActivity({ attachments: [CardFactory.adaptiveCard(cards[0])] });
        return await step.prompt(CHOICE_PROMPT, `${ step.values.userName }, which type of pizza you want to order?`, ['OTC', 'Margherita', 'Double Cheese Margherita', 'Peppy Paneer', 'Mexican Green Wave', 'Deluxe Veggie', 'Veg Extravaganza']);
    }

    async getSizeOfPizza(step) {
        step.values.pizzaType = step.result;
        return await step.prompt(CHOICE_PROMPT, 'Size of pizza?', ['XL', 'L', 'M', 'S']);
    }

    async getToppingOfPizza(step) {
        step.values.pizzaSize = step.result;
        return await step.prompt(CHOICE_PROMPT, 'Topping of pizza?', ['None', 'Black Olives', 'Crisp Capsicum', 'Paneer', 'Mushroom', 'Golden Corn', 'Fresh Tomato', 'Jalapeno', 'Red Pepper']);
    }

    async getNumberOfPizza(step) {
        step.values.pizzaTopping = step.result;
        return await step.prompt(NUMBER_PROMPT, 'Quantity of pizza?');
    }

    async getMail(step) {
        step.values.pizzaQuantity = step.result;
        return await step.prompt(TEXT_PROMPT, 'Enter Your mail address');
    }

    async confirmStep(step) {
        step.values.mail = step.result;
        var msg = `
        You have entered the following values: 
        Customer Name: ${ step.values.userName } 
        Customer Mobile No: ${ step.values.mobile } 
        Customer Address: ${ step.values.address } 
        Pizza Type: ${ JSON.stringify(step.values.pizzaType.value) } 
        Pizza Size: ${ JSON.stringify(step.values.pizzaSize.value) } 
        Pizza Topping: ${ JSON.stringify(step.values.pizzaTopping.value) }
        Pizza Quantity: ${ step.values.pizzaQuantity }
        Customer email: ${ step.values.mail } `;
        await step.context.sendActivity(msg);
        return await step.prompt(CONFIRM_PROMPT, 'Are you sure that all details are correct?', ['Yes', 'No']);
    }

    async summaryStep(step) {
        if (step.result === true) {
            await postid(step);
            const pizzaDetails = await getdetails(step);
            await step.context.sendActivity(`Order successfully. Your Order ID- ${ pizzaDetails[0]._id.toUpperCase() }`);
            // eslint-disable-next-line no-unused-vars
            const sendmail = await mailto(step.values.userName.toUpperCase(), step.values.mobile, step.values.address, step.values.pizzaType.value.toUpperCase(), step.values.pizzaSize.value.toUpperCase(), step.values.pizzaTopping.value.toUpperCase(), step.values.pizzaQuantity, pizzaDetails[0]._id.toUpperCase(), step.values.mail);
            endDialog = true;
            return await step.endDialog();
        }

        if (step.result === false) {
            await step.context.sendActivity('Please, try again');
            endDialog = true;
            return await step.endDialog();
        }
    }

    async isDialogComplete() {
        return endDialog;
    }
}

module.exports.PizzaOrderDialog = PizzaOrderDialog;
