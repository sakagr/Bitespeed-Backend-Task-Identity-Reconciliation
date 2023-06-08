const Contact = require('./models/Contact');
const { Op } = require('sequelize');

async function createPrimaryContact(email, phoneNumber) {
    return  await Contact.create({
        phoneNumber: phoneNumber || null,
        email: email || null,
        linkedId: null,
        linkPrecedence: "primary",
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null
    });
}

async function createSecondaryContact(email, phoneNumber, primaryContactId) {
    return await Contact.create({
        phoneNumber: phoneNumber || null,
        email: email || null,
        linkedId: primaryContactId,
        linkPrecedence: "secondary",
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null 
    });
}

async function findContactsByEmail(email) {
    let contact = await Contact.findOne({
        where: {
            email: email
        }
    });
    if (contact == null) return [];
    if(contact.linkPrecedence === "primary") {
        return await findContactsByPrimaryId(contact.id);
    } else {
        return await findContactsByPrimaryId(contact.linkedId);
    }
}

async function findContactsByPhoneNumber(phoneNumber) {
    let contact = await Contact.findOne({
        where: {
            phoneNumber: phoneNumber
        }
    });
    if (contact == null) return [];
    if(contact.linkPrecedence === "primary") {
        return await findContactsByPrimaryId(contact.id);
    } else {
        return await findContactsByPrimaryId(contact.linkedId);
    }
}

async function findContactsByPhoneOrEmail(email, phoneNumber) {
    return await Contact.findAll({
        where: {
            [Op.or]: [
                {email: email},
                {phoneNumber: phoneNumber}
            ]
        }
    });
}

async function findContactsByPrimaryId(id) {
    return await Contact.findAll({
        where: {
            [Op.or]: [
                {id: id},
                {linkedId: id}
            ]
        }
    }).catch(err => {
        console.log(err);
    });
}

async function updateContactToSecondary(contact, primaryContactId) {
    await contact.update({
        linkedId: primaryContactId,
        linkPrecedence: "secondary"
    });
}

async function updateContactLinkedId(contact, primaryContactId) {
    await contact.update({
        linkedId: primaryContactId,
    });
}

module.exports = {
    createPrimaryContact,
    createSecondaryContact,
    findContactsByEmail,
    findContactsByPhoneNumber,
    findContactsByPhoneOrEmail,
    findContactsByPrimaryId,
    updateContactToSecondary,
    updateContactLinkedId
}