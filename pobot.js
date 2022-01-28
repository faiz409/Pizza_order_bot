// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ActivityHandler, MessageFactory } = require('botbuilder');
const { PizzaOrderDialog } = require('./componentDialogs/pizzaOrderDialog');
const { CancelOrderDialog } = require('./componentDialogs/cancelOrderDialog');
const { AddressDialog } = require('./componentDialogs/addressDialog');
const { CardFactory } = require('botbuilder');
const welcomeCard = require('./resources/adaptiveCards/welcomeCard.json');
const cards = [welcomeCard];

class POBOT extends ActivityHandler {
    constructor(conversationState) {
        super();
        this.conversationState = conversationState;
        this.dialogState = this.conversationState.createProperty('dialogState');
        this.pizzaOrderDialog = new PizzaOrderDialog(this.conversationState);
        this.cancelOrderDialog = new CancelOrderDialog(this.conversationState);
        this.addressDialog = new AddressDialog(this.conversationState);
        this.previousIntent = this.conversationState.createProperty('previousIntent');
        this.conversationData = this.conversationState.createProperty('conversationData');

        this.onMessage(async (context, next) => {
            await this.dispatchToIntentAsync(context);
            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });

        this.onDialog(async (context, next) => {
            await this.conversationState.saveChanges(context, false);
            next();
        });

        this.onMembersAdded(async (context, next) => {
            await this.sendWelcomeMessage(context);
            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });
    }

    async sendWelcomeMessage(context) {
        const membersAdded = context.activity.membersAdded;
        // Iterate for check user id not equal to bot id.
        for (let cnt = 0; cnt < membersAdded.length; cnt++) {
            if (membersAdded[cnt].id !== context.activity.recipient.id) {
                await context.sendActivity({
                    attachments: [CardFactory.adaptiveCard(cards[0])]
                });
                await this.sendSuggestedActions(context);
            }
        }
    }

    async sendSuggestedActions(context) {
        var reply = MessageFactory.suggestedActions(['Make order', 'Cancel order', 'Address'], 'What would you like to do?');
        await context.sendActivity(reply);
    }

    async dispatchToIntentAsync(context) {
        var currentIntent = '';
        const previousIntent = await this.previousIntent.get(context, {});
        const conversationData = await this.conversationData.get(context, {});
        if (previousIntent.intentName && conversationData.endDialog === false) {
            currentIntent = previousIntent.intentName;
        } else if (previousIntent.intentName && conversationData.endDialog === true) {
            currentIntent = context.activity.text.toLowerCase();
        } else {
            currentIntent = context.activity.text.toLowerCase();
            await this.previousIntent.set(context, { intentName: context.activity.text.toLowerCase() });
        }
        switch (currentIntent) {
        case 'make order':
            console.log('Make order case');
            await this.conversationData.set(context, { endDialog: false });
            await this.pizzaOrderDialog.run(context, this.dialogState);
            conversationData.endDialog = await this.pizzaOrderDialog.isDialogComplete();
            if (conversationData.endDialog) {
                await this.previousIntent.set(context, { intentName: null });
                await this.sendSuggestedActions(context);
            }
            break;

        case 'cancel order':
            console.log('Cancel order case');
            await this.conversationData.set(context, { endDialog: false });
            await this.cancelOrderDialog.run(context, this.dialogState);
            conversationData.endDialog = await this.cancelOrderDialog.isDialogComplete();
            if (conversationData.endDialog) {
                await this.previousIntent.set(context, { intentName: null });
                await this.sendSuggestedActions(context);
            }
            break;

        case 'address':
            console.log('Address case');
            await this.conversationData.set(context, { endDialog: false });
            await this.addressDialog.run(context, this.dialogState);
            conversationData.endDialog = await this.addressDialog.isDialogComplete();
            if (conversationData.endDialog) {
                await this.previousIntent.set(context, { intentName: null });
                await this.sendSuggestedActions(context);
            }
            break;
        default:
            console.log('Did not match make order case');
            break;
        }
    }
}

module.exports.POBOT = POBOT;
