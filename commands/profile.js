require("dotenv").config()

const db = require("mongoose").connection
const errModel = require("../models/errormodel.js")
const moment = require("moment-timezone")
const Discord = require("discord.js")

exports.run = (client, message, args) => {
    let user = message.mentions.users.first()
    if (!user) user = message.author

    db.collection("users").findOne({ _id: user.id }, (err, res) => {
        if (err) {
            client.users.get(process.env.OWNERID).send(errModel.db
                .replace("{collection}", "users")
                .replace("{server.name}", message.guild.name)
                .replace("{server.id}", message.guild.id)
                .replace("{author.tag}", message.author.tag)
                .replace("{author.id}", message.author.id)
                .replace("{cmd.content}", message.content)
                .replace("{err}", err)
                .replace("{at}", moment(Date.now()).tz("America/Sao_Paulo").format("LLLL"))
            )
        }

        if (!res) return message.channel.send(`${message.author} 님, 프로필은 자신이 등록한 후에만 열람 할수 있습니다. \`!!등록 유저\``)

        db.collection("guilds").findOne({ svadmins: { $in: [user.id] } }, (erro, resp) => {
            if (resp) {
                var server = `${resp.name} / ${resp._id}`
            } else {
                var server = "없음"
            }

            let userEmbed = new Discord.RichEmbed()
                .setTitle(`${message.guild.member(user.id).nickname ? message.guild.member(user.id).nickname : user.username} 님의 프로필:`)
                .setColor("#ffffff")
                .setDescription("")
                .addField("⚖서버 운영자: ", res.svadmin === true ? "✅" : "❌")
                .addField("📇등록일:", moment(res.createdAt).tz("Asia/Seoul").format("LLLL"))
                .addField("📋운영 중인 서버:", server)
            message.channel.send(userEmbed)
        })
    })
}

exports.config = {
    name: "프로필",
    aliases: ["ㅋㄷ", "카드", "ㅍㄿ", "ㅍㄹㅍ", "정보"]
}