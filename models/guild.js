
require("dotenv").config()

const { Schema, model } = require("mongoose")

const guildSchema = new Schema({
    _id: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        required: false,
        default: Date.now()
    },
    union: {
        type: Boolean,
        required: false,
        default: false
    },
    prefix: {
        type: String,
        required: false,
        default: "!!"
    },
    svclass: {
        type: String,
        required: false,
        default: "none"
    },
    svowner: {
        type: String,
        required: true
    },
    svadmins: {
        type: Array,
        required: false,
        default: []
    },
    promoText: {
        type: String,
        required: false,
        default: ""
    },
    promoTime: {
        type: Number,
        required: false,
        default: 0
    },
    blacklisted: {
        type: Boolean,
        required: false,
        default: false
    }
}, { versionKey: false })


module.exports = model("guilds", guildSchema)
