import mongoose from "mongoose";
import {IContact} from "../models/IContact";

const GroupSchema = new mongoose.Schema<IContact>({
    name: {type: String, required: true, unique: true}
}, {timestamps: true});

const GroupCollection = mongoose.model<IContact>('groups', GroupSchema);
export default GroupCollection;