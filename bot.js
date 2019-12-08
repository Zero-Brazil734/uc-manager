require("dotenv").config()

const Discord = require("discord.js")
const dbcm = require("dbcm")
const chalk = require("chalk").default
const mongoose = require("mongoose")
const db = mongoose.connection
const moment = require("moment-timezone")
const DSU = require("./controllers/client")
const promotion = new Discord.Collection()
const guildModel = require("./models/guild")
const userModel = require("./models/user")
const config = require("./config.js")
const client = new DSU({
    dev: "462355431071809537",
    locale: "ko-KR",
    cooldown: {
        msg: "%{message.author} 님은 현재 쿨타임 중입니다.",
        time: 3500
    },
    disableEveryone: true,
    disabledEvents: ["TYPING_START"],
    autoReconnect: true
})
const logger = client.logger
module.exports = promotion

mongoose.connect(config.DB_ACCESS, { useNewUrlParser: true, useFindAndModify: false, useUnifiedTopology: true })
    .then(() => {
        console.log(chalk.green("[") + chalk.blue("MongoDB") + chalk.green("]") + " Database connection stabilized successfully.")
    })
    .catch(err => {
        logger.error(err)
    })

client.registerCommands(__dirname + "/commands/").catch(err => logger.error(err))


client.on("ready", () => {
    require("./models/ready.js")(client)

    setInterval(() => {
        guildModel.countDocuments({ union: true }, (err, count) => {
            userModel.countDocuments({ svadmin: true }, (erro, countU) => {
                let s = [
                    {
                        name: `UC Users: ${client.users.size}명`,
                        type: "STREAMING",
                        url: "https://twitch.tv/undefined"
                    },
                    {
                        name: `UC Union Admins: ${countU}명`,
                        type: "WATCHING"
                    },
                    {
                        name: `UC Unions: ${count}`,
                        type: "LISTENING"
                    },
                    {
                        name: `UC Servers: ${client.guilds.size}`,
                        type: "PLAYING"
                    }
                ]

                function st() {
                    let rs = s[Math.floor(Math.random() * s.length)];
                    client.user.setPresence({ game: rs });
                }
        
                st()
            })
        })
    }, 7500)
})

/*client.watchModel(guildModel, data => {
    promotion.deleteAll()
    logger.log("Refreshing Promotions Texts")
    this.promo()
})
*/

let somethingliketimer = []
setInterval(async() => {
    await somethingliketimer.push(somethingliketimer.length + 1)
    guildModel.find({ union: true }).then(res => {

        res.forEach(ff => {
            if(ff.promoText == "" || ff.promoTime == 0) return

            if(ff.svclass !== "Bravery" && parseInt(somethingliketimer[somethingliketimer.length - 1], 10) % 2 == 0) return

            client.guilds.filter(f => String(f.name).includes("Congress")).array()[0].channels.filter(f => String(f.name).includes("홍보")).array()[0].send(ff.promoText)
        })
    }).catch(err => logger.error(err))
}, 43200000)

client.on("guildBanAdd", (server, user) => {
    db.collection("guilds").findOne({ _id: server.id }, (err, res) => {
        if (err) {
            client.users.get(config.OWNERID).send(require("./models/errormodel").db
                .replace("{collection}", "guilds")
                .replace("{author.tag}", client.user.tag)
                .replace("{author.id}", client.user.id)
                .replace("{cmd.content}", "guildBanAdd Action")
                .replace("{err}", err)
                .replace("{at}", moment().tz("America/Sao_Paulo").format("LLLL")))

            logger.error(err)
        }
        let black = new Discord.RichEmbed()
            .setTitle("UC Manager 밴 감지:")
            .setColor("#ffffff")
            .setDescription(`해당 서버, \`${server.name}\`에서 유저가 밴 당한것을 감지 했습니다. 만약 해당 유저(\`${user.username}\`)님을 UC의 블랙리스트에 등재하고 싶으시다면 밴하신 서버에서 \`${res ? res.prefix : "!!"}블랙 추가\`을 입력 해주세요.`)
            .setFooter(server.name, server.iconURL)
            .setTimestamp()
        client.users.get(server.ownerID).send(black)
    })
})

client.on("guildBanRemove", (server, user) => {
    db.collection("guilds").findOne({ _id: server.id }, (err, res) => {
        if (err) {
            client.users.get(config.OWNERID).send(require("./models/errormodel").db
                .replace("{collection}", "guilds")
                .replace("{author.tag}", client.user.tag)
                .replace("{author.id}", client.user.id)
                .replace("{cmd.content}", "guildBanRemove Action")
                .replace("{err}", err)
                .replace("{at}", moment().tz("America/Sao_Paulo").format("LLLL")))

            logger.error(err)
        }

        let black = new Discord.RichEmbed()
            .setTitle("UC Manager 언밴 감지:")
            .setColor("#ffffff")
            .setDescription(`해당 서버, \`${server.name}\`에서 유저가 언밴 당한것을 감지 했습니다. 만약 해당 유저(\`${user.username}\`)님을 UC의 블랙리스트에서 삭제하고 싶으시다면 밴하신 서버에서 \`$${res ? res.prefix : "!!"}블랙 삭제\`을 입력 해주세요.`)
            .setFooter(server.name, server.iconURL)
            .setTimestamp()
        client.users.get(server.ownerID).send(black)
    })
})

client.on("guildCreate", server => {
    let newGuild = new Discord.RichEmbed()
        .setTitle("UC Manager의 새로운 서버 입장:")
        .setColor("#ffffff")
        .setDescription(`${server.name} 서버에서 UC Manager가 입장한것을 감지 했습니다.\n\n\`\`\`md\n# 서버 등록:\n* 해당 서버에서 \`!!등록 서버\`를 입력 해주세요.\n\n# 연합 서버 등록:\n* 해당 서버에서 \`!!등록 연합\`을 입력 해주세요.\n\n# 유저 등록:\n* 해당 서버에서 \`!!등록 유저\`를 입력 해주세요.\n\`\`\``)
        .setFooter(server.name, server.iconURL)
        .setTimestamp()
    client.users.get(client.guilds.get(server.id).ownerID).send(newGuild)
})

client.on("guildDelete", server => {
    db.collection("guilds").findOne({ _id: server.id }, (err, res) => {
        if (err) {
            client.users.get(config.OWNERID).send(require("./models/errormodel").db
                .replace("{collection}", "guilds")
                .replace("{author.tag}", client.user.tag)
                .replace("{author.id}", client.user.id)
                .replace("{cmd.content}", "guildBanRemove Action")
                .replace("{err}", err)
                .replace("{at}", moment().tz("America/Sao_Paulo").format("LLLL")))

            logger.error(err)
        }

        let guild = new Discord.RichEmbed()
            .setTitle("UC Manager의 서버 퇴장:")
            .setColor("#ffffff")
            .setDescription(`${server.name} 서버에서 UC Manager가 퇴장한것을 감지 했습니다.\n\n\`\`\`md\n# 주의!\n* 연합 서버가 한번 이 봇을 초대하고 퇴장시키는 행위는 연합을 끊는것으로 간주됩니다.\n* 봇이 퇴장되면 해당 서버에 대한 모든 데이터가 삭제됩니다.`)
        client.users.get(server.ownerID).send(guild)

        if (!res) {
            client.users.get(config.OWNERID).send(`\`\`\`md\n# DSUv2 Manager 서버 퇴장 알림:\n* 연합 여부: Unknown\n* Class: Unknown\n\`\`\``)
        } else {
            client.users.get(config.OWNERID).send(`\`\`\`md\n# DSUv2 Manager 서버 퇴장 알림:\n* 연합 여부: ${res.union}\n* Class: ${res.svclass}\n\`\`\``)
            db.collection("guilds").findOneAndDelete({ _id: server.id })
        }
    })
})

client.on("guildMemberRemove", member => {
    if (member.guild.id === "537682452479475723") {
        db.collection("users").findOne({ _id: member.id }, (err, res) => {
            if (err) {
                client.users.get(config.OWNERID).send(require("./models/errormodel").db
                    .replace("{collection}", "users")
                    .replace("{author.tag}", client.user.tag)
                    .replace("{author.id}", client.user.id)
                    .replace("{cmd.content}", "guildMemberRemove Action")
                    .replace("{err}", err)
                    .replace("{at}", moment().tz("America/Sao_Paulo").format("LLLL")))

                logger.error(err)
            }

            if (res) {
                db.collection("guilds").findOne({ svadmins: { $in: [message.author.id] } }, async (erro, resp) => {
                    if (res.svadmin === true) {

                        if (erro) {
                            client.users.get(config.OWNERID).send(require("./models/errormodel").db
                                .replace("{collection}", "guilds")
                                .replace("{author.tag}", client.user.tag)
                                .replace("{author.id}", client.user.id)
                                .replace("{cmd.content}", "guildMemberRemove Action")
                                .replace("{err}", err)
                                .replace("{at}", moment().tz("America/Sao_Paulo").format("LLLL")))

                            logger.error(erro)
                        }

                        if (resp) {
                            await db.collection("guilds").findOneAndUpdate({ svadmins: { $in: [message.author.id] } }, { $pull: { svadmins: [message.author.id] } })
                            client.users.get(resp.svowner) ? client.users.get(resp.svowner).send(`⚠ | ${member}(${member.user.tag}) 님이 DSUv2 서버에서 나가셔서 ${resp.name} 서버 운영자 목록에서 삭제 됬습니다.`) : null
                            member ? member.send(`⚠ | ${member}(${member.user.tag}) 님이 UC 서버에서 나가셔서 ${resp.name} 서버 운영자 목록에서 삭제 됬습니다.`) : null
                        }
                    }

                    if (resp.svadmins.length <= 0) {
                        client.users.get(resp.svowner) ? client.users.get(resp.svowner).send(`⚠ | ${resp.name} 서버의 모든 서버 운영직이 나가 해당 서버의 데이터가 삭제됩니다.`) : null

                        db.collection("guilds").findOneAndDelete({ _id: member.guild.id })
                    }
                })

                db.collection("users").findOneAndDelete({ _id: member.id }).catch(err => console.error(err))
            }
        })
    }
})

let rateLimit = new Discord.Collection()
client.on("error", err => console.error(err))
client.on("debug", info => {
    if (!info.includes("[ws]")) return

    let text = info
        .replace("[ws]", chalk.green("[") + chalk.blue("ws") + chalk.green("]"))
        .replace("[connection]", chalk.yellow("[connection]"))

    console.log(text)
})
client.on("warn", info => logger.warn("WARN: " + info))

client.on("message", async message => {
    if (message.system || message.author.bot || message.channel.type === "dm") return

    db.collection("guilds").findOne({ _id: message.guild.id }, (err, res) => {
        if (err) {
            client.users.get(config.OWNERID).send(require("./models/errormodel").db
                .replace("{collection}", "guilds")
                .replace("{author.tag}", client.user.tag)
                .replace("{author.id}", client.user.id)
                .replace("{cmd.content}", "prefix detection")
                .replace("{err}", err)
                .replace("{at}", moment().tz("America/Sao_Paulo").format("LLLL")))

            logger.error(err)
        }

        if (!res) {
            if (message.content.startsWith("<@"+client.user.id+">") || message.content.startsWith("<@!"+client.user.id+">")) return message.channel.send(`${message.author} 님, "${message.guild.name}"에서의 봇 접두사는 \`!!\`입니다. \`!!도움말\``)
            var prefix = config.PREFIX
        } else {
            if (message.content.startsWith("<@"+client.user.id+">") || message.content.startsWith("<@!"+client.user.id+">")) return message.channel.send(`${message.author} 님, "${message.guild.name}"에서의 봇 접두사는 \`${res.prefix}\`입니다. \`${res.prefix}도움말\``)
            var prefix = String(res.prefix)
        }

        if (!message.content.startsWith(prefix)) return

        const args = message.content.slice(prefix.length).trim().split(/ +/g)
        const command = args.shift().toLowerCase()

        db.collection("users").findOne({ _id: message.author.id }, (erro, resp) => {
            if (erro) {
                client.users.get(config.OWNERID).send(require("./models/errormodel").db
                    .replace("{collection}", "users")
                    .replace("{author.tag}", message.author.tag)
                    .replace("{author.id}", message.author.id)
                    .replace("{cmd.content}", message.content)
                    .replace("{err}", erro)
                    .replace("{at}", moment().tz("America/Sao_Paulo").format("LLLL")))

                logger.error(erro)
            }

            if(res && res.blacklisted !== false) return message.channel.send(`${message.author} 님, 해당 서버는 블랙리스트로 지정되어 모든 명령어를 사용하실수 없습니다.`)
            resp ? resp.blacklisted === false ? client.runCommand(command, message, args).catch(err => console.error(err)) : message.channel.send(`${message.author} 님은 블랙리스트에 지정되어 명령어를 사용하실수 없습니다.`) : client.runCommand(command, message, args).catch(err => console.error(err))
        })

        let cmdLogger = `${chalk.green(`\n-----------------[명령어 사용]-----------------`)}\n${chalk.blueBright("유저: ")}${chalk.yellow(`${message.author.tag} / ${message.author.id}\n`)}${chalk.blue("명령어: ")}${chalk.yellow(`${command}\n`)}${chalk.blue("내용: ")}${chalk.yellow(message.content + "\n")}${chalk.blue("생성일: ")}${chalk.yellow(`${moment(message.createdAt).tz("America/Sao_Paulo").format("LLLL")}\n`)}${chalk.green("-----------------[명령어 사용]-----------------")}`
        if (client.commands.get(command)) console.log(cmdLogger)
        if (client.aliases.get(command)) console.log(cmdLogger)
    })
})

client.login(config.TOKEN)
