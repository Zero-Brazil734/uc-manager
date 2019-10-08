require("dotenv").config()

const db = require("mongoose").connection
const errModel = require("../models/errormodel.js")
const moment = require("moment-timezone")
const Discord = require("discord.js")

exports.run = (client, message, args) => {
    let userid = args[0]
    userid ? userid = userid.replace(/[^0-9]/g, "") : userid = message.author.id

    client.fetchUser(userid).catch(err => {
        if (String(err).includes("Unknown User")) {
            message.channel.send(`${message.author} 님, 봇이 해당 유저의 값을 읽을수 없습니다.`)
        } else {
            client.users.get(process.env.OWNERID).send(errModel.cmd
                .replace("{cmd}", "프로필")
                .replace("{server.name}", message.guild.name)
                .replace("{server.id}", message.guild.id)
                .replace("{author.tag}", message.author.tag)
                .replace("{author.id}", message.author.id)
                .replace("{cmd.content}", message.content)
                .replace("{err}", String(err))
                .replace("{at}", moment(Date.now()).tz("America/Sao_Paulo").format("LLLL"))
            )
            throw new Error(err)
        }
    }).then(() => {
        db.collection("users").findOne({ _id: userid }, (err, res) => {
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

            if (!res) return userid === message.author.id ? message.channel.send(`${message.author} 님, 프로필은 자신이 등록한 후에만 열람할수 있습니다.`) : message.channel.send(`${message.author} 님, 해당 유저는 등록되있지 않아 확인할수 없습니다.`)

            db.collection("guilds").findOne({ svadmins: { $in: [userid] } }, (erro, resp) => {
                if (resp) {
                    var server = `${resp.name} / ${resp._id}`
                } else {
                    var server = "없음"
                }

                let userEmbed = new Discord.RichEmbed()
                    .setTitle(`${message.guild.member(userid).nickname ? message.guild.member(userid).nickname : client.users.get(userid).username} 님의 프로필:`)
                    .setColor("#ffffff")
                    .setDescription("")
                    .addField("<:union:631224478638276669>서버 운영자 여부: ", res.svadmin === true ? "네" : "아니요")
                    .addField("<:shield:631234008134451207>운영 중인 서버:", server)
                    .addField("<:mail:631237649709006858>등록일:", moment(res.createdAt).tz("Asia/Seoul").format("LLLL"))
                    .addField("<:blacklist:631233879419781161>블랙 여부", res.blacklisted === true ? `네 - 블랙 등록일: ${moment(res.blacklistedAt).tz("Asia/Seoul").format("LLLL")}` : "아니요")
                    .setThumbnail("https://cdn.discordapp.com/emojis/585909152677625857.png?v=1")
                message.channel.send(userEmbed)
            })
        })
    })
}

exports.config = {
    name: "프로필",
    aliases: ["ㅋㄷ", "카드", "ㅍㄿ", "ㅍㄹㅍ", "정보"]
} 