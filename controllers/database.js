const { EventEmitter } = require("events")
const guildModel = require("../models/guild.js")

class database extends EventEmitter {
    constructor(model = guildModel) {
        super(model)

        model.watch().on("change", data => {
            this.emit("change", data)
        })
    }
}

module.exports = database