require("dotenv").config()

const Discord = require("discord.js")
const dbcm = require("dbcm")
const utils = new dbcm.Utils({ lang: "ko-KR" })
const mongoose = require("mongoose")
const guildModel = require("../models/guild")
const userModel = require("../models/user")
const db = mongoose.connection

exports.run = async (client, message, args) => {
    if (message.author.id !== require("../config.js").OWNERID) return

    let msg = message,
        guild = message.guild,
        channel = message.channel,
        author = message.author,
        text = args.join(" "),
        type

    new Promise(resolve => resolve(eval(text)))
        .then(async res => {
            let code = type = res

            if (typeof type !== "string") code = require("util").inspect(code, { depth: 0 });
            if (typeof type === "function") code = type.toString()

            let evalEmbed = new Discord.RichEmbed()
                .setAuthor("Eval", message.author.avatarURL)
                .setColor(client.color)
                .addField("⌨Input:", `\`\`\`js\n${text}\n\`\`\``)
                .addField("💻Output:", `\`\`\`js\n${code}\n\`\`\``)
            message.channel.send(evalEmbed)
        }).catch(Ecmd => {
            let Eembed = new Discord.RichEmbed()
                .setTitle("Eval Error:")
                .setColor(client.color)
                .setDescription(`\`\`\`${Ecmd}\`\`\``)
            message.channel.send(Eembed)
        })
}

exports.config = {
    name: "cmd",
    aliases: ["eval", "js", "script", "compile"],
    description: "자바스크립트 코드를 디코에서 돌립니다."
}
