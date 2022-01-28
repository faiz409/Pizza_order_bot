const { WaterfallDialog, ComponentDialog } = require('botbuilder-dialogs');
const { ConfirmPrompt, ChoicePrompt, TextPrompt } = require('botbuilder-dialogs');
const { DialogSet, DialogTurnStatus } = require('botbuilder-dialogs');
const { CardFactory } = require('botbuilder');
const addressCard = require('../resources/adaptiveCards/addressCard.json');

const cards = [addressCard];

const CHOICE_PROMPT = 'CHOICE_PROMPT';
const TEXT_PROMPT = 'TEXT_PROMPT';
const CONFIRM_PROMPT = 'CONFIRM_PROMPT';
const WATERFALL_DIALOG = 'WATERFALL_DIALOG';
var endDialog = '';

class AddressDialog extends ComponentDialog {
    constructor(conversationState) {
        super('addressDialog');
        this.addDialog(new TextPrompt(TEXT_PROMPT));
        this.addDialog(new ChoicePrompt(CHOICE_PROMPT));
        this.addDialog(new ConfirmPrompt(CONFIRM_PROMPT));
        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.firstStep.bind(this),
            this.secondStep.bind(this)
        ]));
        this.initialDialogId = WATERFALL_DIALOG;
    }

    async run(context, accessor) {
        const dialogSet = new DialogSet(accessor);
        // set class id
        dialogSet.add(this);
        const dialogContext = await dialogSet.createContext(context);

        const results = await dialogContext.continueDialog();
        if (results.status === DialogTurnStatus.empty) {
            // start class
            await dialogContext.beginDialog(this.id);
        }
    }

    async firstStep(step) {
        endDialog = false;
        await step.context.sendActivity({
            text: 'Your welcome in Pizza World',
            attachments: [CardFactory.adaptiveCard(cards[0])]
        });
        return await step.prompt(CONFIRM_PROMPT, 'Are you Interested?', ['Yes', 'No']);
    }

    async secondStep(step) {
        if (step.result === true) {
            await step.context.sendActivity('Thank you!!');
            endDialog = true;
            return await step.endDialog();
        }

        if (step.result === false) {
            await step.context.sendActivity('At least try one time.');
            endDialog = true;
            return await step.endDialog();
        }
    }

    async isDialogComplete() {
        return endDialog;
    }
}

module.exports.AddressDialog = AddressDialog;
