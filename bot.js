require("dotenv").config()

const Discord = require("discord.js")
const client = new Discord.Client({
    autoReconnect: true,
    disableEveryone: true,
    disabledEvents: [
        "TYPING_START",
        "USER_NOTE_UPDATE",
        "RELATIONSHIP_ADD",
        "RELATIONSHIP_REMOVE"
    ]
})
const dbcm = require("dbcm")
const cm = new dbcm.bot(client, {
    lang: "ko-KR",
    runCommand: {
        cooldown: {
            time: 3000,
            msg: `%{message.author} 님은 현재 쿨타임 중입니다. \`쿨타임: %{cmd.cooldown}초\``
        },
        blacklist: {}
    }
})
const chalk = require("chalk").default
const utils = new dbcm.utils({ lang: "ko-KR" })
const mongoose = require("mongoose")
const db = mongoose.connection
const moment = require("moment-timezone")
moment.locale("ko-KR")

cm.registerCommands(__dirname + "/commands", { createSample: false })

mongoose.connect(process.env.DB_ACCESS, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })
    .then(async () => {
        await console.log(chalk.green("[") + chalk.blue("MongoDB") + chalk.green("]") + " Database successfully stabilized.")
    })
    .catch(err => {
        setTimeout(() => {
            process.exit()
        }, 1000)
        throw new Error(err)
    })

client.on("ready", () => {
    db.collection("users").countDocuments({ svadmin: true }, userCount => {
        db.collection("guilds").countDocuments({ union: true }, guildCount => {
            console.log(require("./models/ready").readyMsg(client))
            let s = [
                { name: `DSUv2 Servers Admins: ${userCount}명`, type: "STREAMING", url: "https://www.twitch.tv/zero734kr" },
                { name: `DSUv2 Servers: ${guildCount}`, type: "PLAYING" },
                { name: `DSUv2 Users: ${client.users.size}명`, type: "LISTENING" },
                { name: `Help: ${process.env.PREFIX}도움말`, type: "WATCHING" }
            ]

            function st() {
                let rs = s[Math.floor(Math.random() * s.length)];
                client.user.setPresence({ game: rs }).catch(err => console.error(err));
            }

            st();
            setInterval(() => st(), 7500);
        })
    })
})


require("./models/guild").find({ union: true }).then(s => {
    s.forEach(res => {
        if (!res || res.ads === "" || res.adstime === 0) return

        try {
            setInterval(() => {
                client.guilds.get("537682452479475723").channels.filter(f => f.name.includes("홍보")).array()[0].send(String(res.ads))
            }, parseInt(String(res.adstime), 10))
        } catch (err) {
            client.users.get(process.env.OWNERID).send(require("./models/errormodel.js").db
                .replace("{collection}", "guild model")
                .replace("{author.tag}", client.user.tag)
                .replace("{author.id}", client.user.id)
                .replace("{cmd.content}", "자동 타이머 홍보")
                .replace("{err}", err)
                .replace("{at}", moment(Date.now()).tz("America/Sao_Paulo").format("LLLL")))

            throw new Error(err)
        }
    })
})

client.on("guildBanAdd", (server, user) => {
    db.collection("guilds").findOne({ _id: server.id }, (err, res) => {
        if (err) {
            client.users.get(process.env.OWNERID).send(require("./models/errormodel").db
                .replace("{collection}", "guilds")
                .replace("{author.tag}", client.user.tag)
                .replace("{author.id}", client.user.id)
                .replace("{cmd.content}", "guildBanAdd Action")
                .replace("{err}", err)
                .replace("{at}", moment(Date.now()).tz("America/Sao_Paulo").format("LLLL")))

            throw new Error(err)
        }
        let black = new Discord.RichEmbed()
            .setTitle("DSUv2 Manager 밴 감지:")
            .setColor("#ffffff")
            .setDescription(`해당 서버, \`${server.name}\`에서 유저가 밴 당한것을 감지 했습니다. 만약 해당 유저(\`${user.username}\`)님을 DSUv2의 블랙리스트에 등재하고 싶으시다면 밴하신 서버에서 \`${res ? res.prefix : "!!"}블랙\`을 입력 해주세요.`)
            .setFooter(server.name, server.iconURL)
            .setTimestamp()
        client.users.get(server.ownerID).send(black)
    })
})

client.on("guildBanRemove", (server, user) => {
    db.collection("guilds").findOne({ _id: server.id }, (err, res) => {
        if (err) {
            client.users.get(process.env.OWNERID).send(require("./models/errormodel").db
                .replace("{collection}", "guilds")
                .replace("{author.tag}", client.user.tag)
                .replace("{author.id}", client.user.id)
                .replace("{cmd.content}", "guildBanRemove Action")
                .replace("{err}", err)
                .replace("{at}", moment(Date.now()).tz("America/Sao_Paulo").format("LLLL")))

            throw new Error(err)
        }

        let black = new Discord.RichEmbed()
            .setTitle("DSUv2 Manager 언밴 감지:")
            .setColor("#ffffff")
            .setDescription(`해당 서버, \`${server.name}\`에서 유저가 언밴 당한것을 감지 했습니다. 만약 해당 유저(\`${user.username}\`)님을 DSUv2의 블랙리스트에서 삭제하고 싶으시다면 밴하신 서버에서 \`$${res.prefix}언블랙\`을 입력 해주세요.`)
            .setFooter(server.name, server.iconURL)
            .setTimestamp()
        client.users.get(server.ownerID).send(black)
    })
})

client.on("guildCreate", server => {
    let newGuild = new Discord.RichEmbed()
        .setTitle("DSUv2 Manager의 새로운 서버 입장:")
        .setColor("#ffffff")
        .setDescription(`${server.name} 서버에서 DSUv2 Manager가 입장한것을 감지 했습니다.\n\n\`\`\`md\n# 서버 등록:\n* 해당 서버에서 \`!!등록 서버\`를 입력 해주세요.\n\n# 연합 서버 등록:\n* 해당 서버에서 \`!!등록 연합\`을 입력 해주세요.\n\n# 유저 등록:\n* 해당 서버에서 \`!!등록 유저\`를 입력 해주세요.\n\`\`\``)
        .setFooter(server.name, server.iconURL)
        .setTimestamp()
    client.users.get(client.guilds.get(server.id).ownerID).send(newGuild)
})

client.on("guildDelete", server => {
    db.collection("guilds").findOne({ _id: server.id }, (err, res) => {
        if (err) {
            client.users.get(process.env.OWNERID).send(require("./models/errormodel").db
                .replace("{collection}", "guilds")
                .replace("{author.tag}", client.user.tag)
                .replace("{author.id}", client.user.id)
                .replace("{cmd.content}", "guildBanRemove Action")
                .replace("{err}", err)
                .replace("{at}", moment(Date.now()).tz("Asia/Seoul").format("LLLL")))

            throw new Error(err)
        }

        let guild = new Discord.RichEmbed()
            .setTitle("DSUv2 Manager의 서버 퇴장:")
            .setColor("#ffffff")
            .setDescription(`${server.name} 서버에서 DSUv2 Manager가 퇴장한것을 감지 했습니다.\n\n\`\`\`md\n# 주의!\n* 연합 서버가 한번 이 봇을 초대하고 퇴장시키는 행위는 연합을 끊는것으로 간주됩니다.\n* 봇이 퇴장되면 해당 서버에 대한 모든 데이터가 삭제됩니다.`)
        client.users.get(server.ownerID).send(guild)

        if (!res) {
            client.users.get(process.env.OWNERID).send(`\`\`\`md\n# DSUv2 Manager 서버 퇴장 알림:\n* 연합 여부: Unknown\n* Class: ${res.svclass}\n\`\`\``)
        } else {
            client.users.get(process.env.OWNERID).send(`\`\`\`md\n# DSUv2 Manager 서버 퇴장 알림:\n* 연합 여부: ${res.union}\n* Class: ${res.svclass}\n\`\`\``)
            db.collection("guilds").findOneAndDelete({ _id: server.id })
        }
    })
})

client.on("guildMemberRemove", member => {
    if (member.guild.id === "537682452479475723") {
        db.collection("users").findOne({ _id: member.id }, (err, res) => {
            if (err) {
                client.users.get(process.env.OWNERID).send(require("./models/errormodel").db
                    .replace("{collection}", "users")
                    .replace("{author.tag}", client.user.tag)
                    .replace("{author.id}", client.user.id)
                    .replace("{cmd.content}", "guildMemberRemove Action")
                    .replace("{err}", err)
                    .replace("{at}", moment(Date.now()).tz("America/Sao_Paulo").format("LLLL")))

                throw new Error(err)
            }

            if (res) {
                db.collection("guilds").findOne({ svadmins: { $in: [message.author.id] } }, async (erro, resp) => {
                    if (res.svadmin === true) {

                        if (erro) {
                            client.users.get(process.env.OWNERID).send(require("./models/errormodel").db
                                .replace("{collection}", "guilds")
                                .replace("{author.tag}", client.user.tag)
                                .replace("{author.id}", client.user.id)
                                .replace("{cmd.content}", "guildMemberRemove Action")
                                .replace("{err}", err)
                                .replace("{at}", moment(Date.now()).tz("America/Sao_Paulo").format("LLLL")))

                            throw new Error(err)
                        }

                        if (resp) {
                            await db.collection("guilds").findOneAndUpdate({ svadmins: { $in: [message.author.id] } }, { $pull: { svadmins: [message.author.id] } })
                            client.users.get(resp.svowner) ? client.users.get(resp.svowner).send(`⚠ | ${member}(${member.user.tag}) 님이 DSUv2 서버에서 나가셔서 ${resp.name} 서버 운영자 목록에서 삭제 됬습니다.`) : null
                            member ? member.send(`⚠ | ${member}(${member.user.tag}) 님이 DSUv2 서버에서 나가셔서 ${resp.name} 서버 운영자 목록에서 삭제 됬습니다.`) : null
                        }
                    }

                    if(resp.svadmins.length <= 0) {
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
client.on("rateLimit", info => {
    rateLimit.set(rateLimit.size + 1, info)
    exports.rateLimitInfo = rateLimit

    if (rateLimit.has(150)) {
        rateLimit.clear()
        client.destroy().then(() => client.login(process.env.TOKEN))
    }
})
client.on("warn", info => console.warn(chalk.blue("WARN: ") + chalk.yellow(info)))

client.on("message", async message => {
    if (message.system || message.author.bot || message.channel.type === "dm") return

    db.collection("guilds").findOne({ _id: message.guild.id }, (err, res) => {
        if (err) return client.users.get(process.env.OWNERID).send(require("./models/errormodel").db
            .replace("{collection}", "guilds")
            .replace("{author.tag}", client.user.tag)
            .replace("{author.id}", client.user.id)
            .replace("{cmd.content}", "prefix detection")
            .replace("{err}", err)
            .replace("{at}", moment(Date.now()).tz("America/Sao_Paulo").format("LLLL")))

        if (!res) {
            var prefix = process.env.prefix
        } else {
            var prefix = String(res.prefix)
        }

        if (!message.content.startsWith(prefix)) return

        const args = message.content.slice(prefix.length).trim().split(/ +/g)
        const command = args.shift().toLowerCase()

        cm.runCommand(command, message, args).catch(err => console.error(err))

        const logger = `${chalk.green(`-----------------[명령어 사용]-----------------`)}\n${chalk.blueBright("유저: ")}${chalk.yellow(`${message.author.tag} / ${message.author.id}\n`)}${chalk.blue("명령어: ")}${chalk.yellow(`${command}\n`)}${chalk.blue("메세지: ")}${chalk.yellow(`${moment(message.createdAt).tz("America/Sao_Paulo").format("LLLL")}\n`)}${chalk.green("-----------------[명령어 사용]-----------------\n")}`
        if (client.commands.get(command)) console.log(logger)
        if (client.aliases.get(command)) console.log(logger)
    })
})

client.login(process.env.TOKEN)