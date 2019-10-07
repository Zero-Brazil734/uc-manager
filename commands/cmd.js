require("dotenv").config()

const { RichEmbed } = require("discord.js")
const db = require("mongoose").connection
const dbcm = require("dbcm")
const utils = new dbcm.utils({ lang: "ko-KR" })
const { inspect } = require("util")
const COR = "#ffffff"
const errModel = require("../models/errormodel")
const userModel = require("../models/user")
const guildModel = require("../models/guild")
const userController = require("../controllers/user")
const guildController = require("../controllers/guild")
const fs = require("fs")
const child = require("child_process")
const moment = require("moment-timezone")
moment.locale("ko-KR")

exports.run = (client, message, args) => {
    if (message.author.id !== process.env.OWNERID) return

    let msg = message
    let channel = message.channel
    let author = message.author
    let guild = message.guild

    let cmd = args.join(" ")
    let result = new Promise(resolve => resolve(eval(cmd)))

    result.then(async res => {
        let code = res

        if (typeof code !== "string") code = inspect(code, { depth: 0 });

        let evalEmbed = new RichEmbed()
            .setAuthor("Eval", message.author.avatarURL)
            .setColor(COR)
            .addField("⌨Input:", `\`\`\`js\n${cmd}\n\`\`\``)
            .addField("💻Output:", `\`\`\`js\n${code}\n\`\`\``)
        message.channel.send(evalEmbed)
    }).catch(Ecmd => {
        let Eembed = new RichEmbed()
            .setTitle("Eval Error:")
            .setColor(COR)
            .setDescription(`\`\`\`${Ecmd}\`\`\``)
        message.channel.send(Eembed)
    })
}

exports.config = {
    name: "cmd",
    aliases: ["compile", "script", "eval"]
}