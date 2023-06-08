const crud = require('./db/crud');

async function identify(email, phoneNumber) {
    let contacts;
    if(email && phoneNumber) {
        contacts = await findContactsByEmailOrPhone(email, phoneNumber);
    } else if (email && !phoneNumber) {
        contacts = await crud.findContactsByEmail(email);
    } else if(!email && phoneNumber) {
        contacts = await crud.findContactsByPhoneNumber(phoneNumber);
    } else {
        throw new Error("Please provide either email or phoneNumber");
    }
    if(contacts && contacts.length) {
        let indexOfContact = contacts.findIndex(contact => contact.email === email && contact.phoneNumber === phoneNumber);        
        if(indexOfContact<0) {
            let primaryContact = contacts.find(contact => contact.linkPrecedence === "primary");
            contacts.push(await crud.createSecondaryContact(email, phoneNumber, primaryContact.id));
        }
    } else {
        contacts = [];
        contacts.push(await crud.createPrimaryContact(email, phoneNumber));
    }
    return createResponse(contacts);
}

async function findContactsByEmailOrPhone(email, phoneNumber) {
    let contacts = await crud.findContactsByPhoneOrEmail(email, phoneNumber);
    if(!contacts || !contacts.length) return [];
    return await updatePrimarySecondaryContacts(contacts);
}

async function updatePrimarySecondaryContacts(contacts) {
    let primaryContacts = contacts.filter(contact => contact.linkPrecedence === "primary");
    if(primaryContacts.length > 1) {
        let oldestPrimaryContact;
        let newerPrimaryContact;
        if(primaryContacts[0].createdAt <= primaryContacts[1].createdAt) {
            oldestPrimaryContact = primaryContacts[0];
            newerPrimaryContact = primaryContacts[1];
        } else {
            oldestPrimaryContact = primaryContacts[1];
            newerPrimaryContact = primaryContacts[0];
        }
        await contacts.forEach(async contact => {
            if(contact.linkedId === newerPrimaryContact.id) 
                await crud.updateContactLinkedId(contact, oldestPrimaryContact.id);
        })
        await crud.updateContactToSecondary(newerPrimaryContact, oldestPrimaryContact.id);
        contacts = await crud.findContactsByPrimaryId(oldestPrimaryContact.id);
    }
    return contacts;
}

function createResponse(contacts) {
    let res = { contact: {
        primaryContactId: undefined,
        emails: [],
        phoneNumbers: [],
        secondaryContactIds: []
    }};
    contacts.forEach(contact => {
        if(contact.linkPrecedence === "primary") {
            res.contact.primaryContactId = contact.id;
            res.contact.emails.unshift(contact.email);
            res.contact.phoneNumbers.unshift(contact.phoneNumber);
        } else {
            res.contact.emails.push(contact.email);
            res.contact.phoneNumbers.push(contact.phoneNumber);
            res.contact.secondaryContactIds.push(contact.id);
        }
    })
    return res;
}

module.exports = {identify};