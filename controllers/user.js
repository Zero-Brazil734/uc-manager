const userModel = require("../models/user")
const chalk = require("chalk").default

module.exports = {
    async setUser(user) {
        await userModel.create({
            _id: user.id,
            name: user.username
        })
        return console.log(`${chalk.green("[")}${chalk.blue("MongoDB")}${chalk.green("]")} Successfully saved the user: ${user.username}(${user.id})`)
    },

    async newUnion(user, svclass, server) {
        await userModel.findOneAndUpdate({ _id: user.id }, { $set: {
            svclass: svclass,
            svadmin: true
        }})

        await userModel.findOneAndUpdate({ _id: user.id }, { $push: {
            servers: server.id
        }}).then(() => console.log(`${chalk.green("[")}${chalk.blue("MongoDB")}${chalk.green("]")} Successfully registered to union the user: ${user.tag}(${user.id})`))
    }
}