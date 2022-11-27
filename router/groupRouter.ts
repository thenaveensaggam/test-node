import {Router, Request, Response} from 'express';
import {body, validationResult} from 'express-validator';
import {IGroup} from "../models/IGroup";
import GroupCollection from "../schemas/GroupSchema";
import {APP_CONSTANTS} from "../Contants";
import mongoose from "mongoose";

const groupRouter: Router = Router();

/**
 * @usage create Group
 * @url : http://localhost:9000/groups/
 * @method : POST
 * @param : name
 */
groupRouter.post('/', [
    body('name').not().isEmpty().withMessage('name is required')
], async (request: Request, response: Response) => {
    let errors = validationResult(request);
    if (!errors.isEmpty()) {
        return response.status(401).json({
            msg: errors.array()[0].msg,
            data: null,
            status: APP_CONSTANTS.FAILED
        })
    }

    try {
        let {name} = request.body;
        // check if the name already exists
        let group: IGroup | null = await GroupCollection.findOne({name: name}); // select * from Group where name = "";
        if (group) {
            return response.status(400).json({
                msg: 'Group is already exists',
                data: null,
                status: APP_CONSTANTS.FAILED
            });
        }
        // insert
        let newGroup: IGroup = {
            name: name
        };
        let groupResponse = await new GroupCollection(newGroup).save();
        if (groupResponse) {
            return response.status(200).json(groupResponse);
        }
    } catch (error) {
        return response.status(500).json({
            msg: 'Server Error',
            data: null,
            status: APP_CONSTANTS.FAILED
        })
    }
})

/**
 * @usage get all Groups
 * @url : http://localhost:9000/groups/
 * @method : GET
 * @param : no-params
 */
groupRouter.get('/', async (request: Request, response: Response) => {
    try {
        let groups = await GroupCollection.find(); // select * from groups;
        return response.status(200).json(groups);
    } catch (error) {
        return response.status(500).json({
            msg: 'Server Error',
            data: null,
            status: APP_CONSTANTS.FAILED
        })
    }
});

/**
 * @usage get a Group
 * @url : http://localhost:9000/groups/:groupId
 * @method : GET
 * @param : no-params
 */
groupRouter.get('/:groupId', async (request: Request, response: Response) => {
    let {groupId} = request.params;
    try {
        let mongoGroupId = new mongoose.Types.ObjectId(groupId);
        let group: IGroup | null = await GroupCollection.findById(mongoGroupId);
        if (!group) {
            return response.status(404).json({
                msg: 'Group is not found',
                data: null,
                status: APP_CONSTANTS.FAILED
            });
        }
        return response.status(200).json(group);
    } catch (error) {
        if (!mongoose.isValidObjectId(groupId)) {
            return response.status(500).json({
                msg: 'Invalid Group Id',
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
});

export default groupRouter;