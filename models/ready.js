const chalk = require("chalk").default
const address = require("address")
const moment = require("moment-timezone")
moment.locale("ko-KR")

module.exports = client => {
    return `${chalk.green(`-----------------[${client.user.username}]-----------------`)}\n${chalk.blue("Name: ")}${chalk.yellow(client.user.username)}\n${chalk.blue("ID: ")}${chalk.yellow(client.user.id)}\n${chalk.blue("Users: ")}${chalk.yellow(client.users.size)}\n${chalk.blue("Guilds: ")}${chalk.yellow(client.guilds.size)}\n${chalk.blue("Status: ")}${chalk.yellow(client.user.presence.status)}\n${chalk.blue("Presence: ")}${chalk.yellow(client.user.presence.game)}\n${chalk.blue("Created At: ")}${chalk.yellow(moment(client.user.createdTimestamp).tz("America/Sao_Paulo").format("LLLL"))}\n${chalk.blue("IP: ")}${chalk.yellow(address.ip())}\n${chalk.green(`-----------------[${client.user.username}]-----------------`)}\n`
}