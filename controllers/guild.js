const guildModel = require("../models/guild")
const chalk = require("chalk").default

module.exports = {
    async store(server, author) {
        await guildModel.create({
            _id: server.id,
            name: server.name,
            svadmins: [author.id],
            svowner: server.ownerID
        }).then(() => console.log(`${chalk.green("[")}${chalk.blue("MongoDB")}${chalk.green("]")} Successfully saved the server: ${server.name}(${server.id})`))
    },

    async newUnion(server, svclass) {
        await guildModel.findOneAndUpdate({ _id: server.id }, { $set: {
            class: svclass,
            union: true
        }}).then(() => console.log(`${chalk.green("[")}${chalk.blue("MongoDB")}${chalk.green("]")} Successfully registered to union the server: ${server.name}(${server.id})`))
    },

    async getPrefix(server) {
        const guild = await guildModel.findById(server.id)

        return String(guild.prefix)
    },

    async changePrefix(server, newPrefix) {
        await guildModel.findByIdAndUpdate(server.id, {
            prefix: newPrefix
        })

        return console.log(`${chalk.green("[")}${chalk.blue("MongoDB")}${chalk.green("]")} The prefix of the server ${server.name}(${server.id}) has changed to ${newPrefix}`)
    }
}