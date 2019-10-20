const { Schema, model } = require("mongoose")

const userSchema = new Schema({
    _id: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    svadmin: {
        type: Boolean,
        required: false,
        default: false
    },
    createdAt: {
        type: Date,
        required: false,
        default: Date.now()
    },
    blacklisted: {
        type: Boolean,
        required: false,
        default: false
    },
    blacklistedAt: {
        type: Date,
        required: false
    }
}, { versionKey: false })


module.exports = model("users", userSchema)