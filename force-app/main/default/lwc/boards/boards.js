/* eslint-disable eqeqeq */
import { LightningElement, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import Board_Object from '@salesforce/schema/Board__c';
import Name_field from '@salesforce/schema/Board__c.Name';
import Description_Field from '@salesforce/schema/Board__c.Description__c'
import NoOfSection_field from '@salesforce/schema/Board__c.NoOfSections__c'
import saveBoard from '@salesforce/apex/BoardController.saveBoard';
import getBoards from '@salesforce/apex/BoardController.getBoards';

import { NavigationMixin } from 'lightning/navigation';

const COLUMNS = [
    { label: 'Name', fieldName: 'Name' },
    { label: 'Description', fieldName: 'Description__c' },
    { label: 'Number of Sections', fieldName: 'NoOfSections__c' },
    {
        type: "button", typeAttributes: {
            label: 'Open Board',
            name: 'openBoard',
            title: 'Open Board',
            value: 'openBoard'
        }
    }
];

export default class Boards extends NavigationMixin(LightningElement) {
    columns = COLUMNS;
    showModalPopup = false;
    objectApiName = Board_Object;

    nameField = Name_field;
    descriptionField = Description_Field;
    noOfSectionfield = NoOfSection_field;

    sections = [];

    @wire(getBoards) boards;

    newButtonClickHandler() {
        this.showModalPopup = true;
    }

    popupCloseHandeler() {
        this.showModalPopup = false;
    }

    noOfSectionHandler(event) {

        let noOfSections = event.target.value;
        this.sections = [];
        for (let i = 0; i < noOfSections; i++) {
            this.sections.push({ id: i, sectionLabel: `Section ${i + 1} Title` })
        }
    }
    getRandomTheme() {
        let themes = ['slds-theme_alert-texture', 'slds-theme_warning', 'slds-theme_alt-inverse', 'slds-theme_inverse', 'slds-theme_shade'];
        return themes[Math.floor(Math.random() * themes.length)];
    }


    async handleSubmit(event) {
        event.preventDefault();
        const fields = { ...event.detail.fields };
        let sectionControls = this.template.querySelectorAll('[data-section-control]');
        let sectionList = [];
        for (let control of sectionControls) {
            sectionList.push({
                Name: control.value,
                Items_Backgroud_Theme__c: `${this.getRandomTheme()} slds-p-around_xx-small`
            });
        }
        if (!this.validateData(fields, sectionList)) {
            return;
        }
        let result = await saveBoard({ 'board': fields, 'sections': sectionList });
        this.navigateToBoardRecordPage(result);

        this.popupCloseHandeler();
        this.showToast('Data Saved Successfully');
    }

    validateData(fields, sectionList) {
        let sectionCount = parseInt(fields.NoOfSections__c);
        if (!sectionCount || sectionCount < 1 || sectionCount > 10) {
            this.showToast('Please enter valid number of sections value between 1 to 10', 'Error', 'error');
            return false;
        }
        if (sectionList.filter(a => a.Name == '').length > 0) {
            this.showToast('Please enter title for every section.', 'Error', 'error');
            return false;
        }
        return true;
    }

    showToast(message, title = 'Success', variant = 'success') {
        const event = new ShowToastEvent({
            title,
            message,
            variant
        });
        this.dispatchEvent(event);
    }

    rowActionHandler(event) {
        let boardId = event.detail.row.Id;
        const actionName = event.detail.action.name;
        if (actionName == 'openBoard') {
            this.navigateToBoardRecordPage(boardId);
        }
    }

    navigateToBoardRecordPage(boardId) {
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: boardId,
                objectApiName: Board_Object,
                actionName: 'view'
            }
        });
    }

}