import {Router, Request, Response} from 'express';
import {APP_CONSTANTS} from "../Contants";
import {body, validationResult} from "express-validator";
import {IContact} from "../models/IContact";
import ContactCollection from "../schemas/ContactSchema";
import mongoose from "mongoose";

const contactRouter: Router = Router();

/**
 * @usage create Contact
 * @url : http://localhost:9000/contacts/
 * @method : POST
 * @param : name,imageUrl, mobile,email,company,title,groupId
 */
contactRouter.post('/', [
    body('name').not().isEmpty().withMessage('name is required'),
    body('imageUrl').not().isEmpty().withMessage('ImageUrl is required'),
    body('mobile').not().isEmpty().withMessage('Mobile is required'),
    body('email').not().isEmpty().withMessage('Email is required'),
    body('company').not().isEmpty().withMessage('Company is required'),
    body('title').not().isEmpty().withMessage('Title is required'),
    body('groupId').not().isEmpty().withMessage('GroupId is required')
], async (request: Request, response: Response) => {
    let errors = validationResult(request);
    if (!errors.isEmpty()) {
        return response.status(401).json({
            msg: errors.array().map(error => error.msg).join(',\n'),
            data: null,
            status: APP_CONSTANTS.FAILED
        })
    }
    try {
        // read form data
        let {name, imageUrl, mobile, email, company, title, groupId} = request.body;

        // check if the mobile number already exists
        let contact: IContact | null = await ContactCollection.findOne({mobile: mobile});
        if (contact) {
            return response.status(400).json({
                msg: 'Contact is already exists',
                data: null,
                status: APP_CONSTANTS.FAILED
            });
        }
        // create a contact
        let newContact: IContact = {
            name: name,
            imageUrl: imageUrl,
            company: company,
            email: email,
            title: title,
            mobile: mobile,
            groupId: groupId
        };
        let contactResponse = await new ContactCollection(newContact).save();
        if (contactResponse) {
            return response.status(200).json(contactResponse);
        }
    } catch (error) {
        console.log(error);
        return response.status(500).json({
            msg: 'Server Error',
            data: null,
            status: APP_CONSTANTS.FAILED
        })
    }
});

/**
 * @usage get all Contacts
 * @url : http://localhost:9000/contacts/
 * @method : GET
 * @param : no-params
 */
contactRouter.get("/", async (request: Request, response: Response) => {
    try {
        let contacts = await ContactCollection.find();
        return response.status(200).json(contacts)
    } catch (error) {
        console.log(error);
        return response.status(500).json({
            msg: 'Server Error',
            data: null,
            status: APP_CONSTANTS.FAILED
        })
    }
})


/**
 * @usage get a Contact
 * @url : http://localhost:9000/contacts/:contactId
 * @url-param : contactId
 * @method : GET
 * @param : no-params
 */
contactRouter.get("/:contactId", async (request: Request, response: Response) => {
    let {contactId} = request.params;
    try {
        let mongoContactId = new mongoose.Types.ObjectId(contactId);
        let contact: IContact | null = await ContactCollection.findById(mongoContactId);
        if (!contact) {
            return response.status(404).json({
                msg: 'Contact is not found',
                data: null,
                status: APP_CONSTANTS.FAILED
            });
        }
        return response.status(200).json(contact)
    } catch (error) {
        if (!mongoose.isValidObjectId(contactId)) {
            return response.status(500).json({
                msg: 'Invalid Contact Id',
                data: null,
                status: APP_CONSTANTS.FAILED
            })
        }
        return response.status(500).json({
            msg: 'Server Error',
            data: null,
            status: APP_CONSTANTS.FAILED
        })
    }
})

/**
 * @usage update Contact
 * @url : http://localhost:9000/contacts/:contactId
 * @url-param : contactId
 * @method : PUT
 * @param : name,imageUrl, mobile,email,company,title,groupId
 */
contactRouter.put('/:contactId', [
    body('name').not().isEmpty().withMessage('name is required'),
    body('imageUrl').not().isEmpty().withMessage('ImageUrl is required'),
    body('mobile').not().isEmpty().withMessage('Mobile is required'),
    body('email').not().isEmpty().withMessage('Email is required'),
    body('company').not().isEmpty().withMessage('Company is required'),
    body('title').not().isEmpty().withMessage('Title is required'),
    body('groupId').not().isEmpty().withMessage('GroupId is required')
], async (request: Request, response: Response) => {
    let errors = validationResult(request);
    if (!errors.isEmpty()) {
        return response.status(401).json({
            msg: errors.array().map(error => error.msg).join(',\n'),
            data: null,
            status: APP_CONSTANTS.FAILED
        })
    }
    let {contactId} = request.params;
    try {

        // read form data
        let {name, imageUrl, mobile, email, company, title, groupId} = request.body;

        // check if the contact already exists
        const mongoContactId = new mongoose.Types.ObjectId(contactId);
        let contact: IContact | null = await ContactCollection.findById(mongoContactId);
        if (!contact) {
            return response.status(400).json({
                msg: 'Contact is not exists',
                data: null,
                status: APP_CONSTANTS.FAILED
            });
        }
        // update a contact
        let newContact: IContact = {
            name: name,
            imageUrl: imageUrl,
            company: company,
            email: email,
            title: title,
            mobile: mobile,
            groupId: groupId
        };
        let contactResponse = await ContactCollection.findByIdAndUpdate(mongoContactId, {
            $set: newContact
        }, {new: true})
        if (contactResponse) {
            return response.status(200).json(contactResponse);
        }
    } catch (error) {
        console.log(error);
        return response.status(500).json({
            msg: 'Server Error',
            data: null,
            status: APP_CONSTANTS.FAILED
        })
    }
});

/**
 * @usage delete a Contact
 * @url : http://localhost:9000/contacts/:contactId
 * @method : DELETE
 * @url-param : contactId
 * @param : no-params
 */
contactRouter.delete("/:contactId", async (request: Request, response: Response) => {
    let {contactId} = request.params;
    try {
        let mongoContactId = new mongoose.Types.ObjectId(contactId);
        let contact: IContact | null = await ContactCollection.findById(mongoContactId);
        if (!contact) {
            return response.status(404).json({
                msg: 'Contact is not found',
                data: null,
                status: APP_CONSTANTS.FAILED
            });
        }
        // delete the contact
        let theContact = await ContactCollection.findByIdAndDelete(mongoContactId);
        if (theContact) {
            return response.status(200).json({})
        }
    } catch (error) {
        if (!mongoose.isValidObjectId(contactId)) {
            return response.status(500).json({
                msg: 'Invalid Contact Id',
                data: null,
                status: APP_CONSTANTS.FAILED
            })
        }
        return response.status(500).json({
            msg: 'Server Error',
            data: null,
            status: APP_CONSTANTS.FAILED
        })
    }
})


export default contactRouter;