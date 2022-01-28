const { WaterfallDialog, ComponentDialog } = require('botbuilder-dialogs');
const { ConfirmPrompt, TextPrompt } = require('botbuilder-dialogs');
const { DialogSet, DialogTurnStatus } = require('botbuilder-dialogs');
const { getid, deleteid } = require('../api/apis');

const TEXT_PROMPT = 'TEXT_PROMPT';
const CONFIRM_PROMPT = 'CONFIRM_PROMPT';
const WATERFALL_DIALOG = 'WATERFALL_DIALOG';
var endDialog = '';

class CancelOrderDialog extends ComponentDialog {
    constructor(conversationState) {
        super('cancelOrderDialog');
        this.addDialog(new TextPrompt(TEXT_PROMPT));
        this.addDialog(new ConfirmPrompt(CONFIRM_PROMPT));
        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.firstStep.bind(this),
            this.confirmStep.bind(this),
            this.summaryStep.bind(this)
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
        await step.context.sendActivity('Enter order Id for cancellation :');
        return await step.prompt(TEXT_PROMPT, '');
    }

    async confirmStep(step) {
        step.values.id = step.result;
        await getid(step);
        var msg = `
        You have entered the following ID: 
        Order ID: ${ step.values.id }`;
        await step.context.sendActivity(msg);
        return await step.prompt(CONFIRM_PROMPT, 'Are you sure that ID are correct?', ['Yes', 'No']);
    }

    async summaryStep(step) {
        if (step.result === true) {
            await deleteid(step);
            await step.context.sendActivity('Order cancel successfully.');
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

module.exports.CancelOrderDialog = CancelOrderDialog;
