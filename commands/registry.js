require("dotenv").config()

const Discord = require("discord.js")
const db = require("mongoose").connection
const guildController = require("../controllers/guild.js")
const userController = require("../controllers/user.js")
const errModel = require("../models/errormodel.js")
const moment = require("moment-timezone")
const config = require("../config.json")
moment.locale("ko-KR")

exports.run = async (client, message, args) => {
    let query = args[0]

    db.collection("guilds").findOne({ _id: message.guild.id }, (err, res) => {
        if (err) {
            message.reply(" error")
            client.users.get(config.OWNERID).send(errModel.db
                .replace("{collection}", "guilds")
                .replace("{server.name}", client.guilds.get(res._id).name)
                .replace("{server.id}", res._id)
                .replace("{author.tag}", message.author.tag)
                .replace("{author.id}", message.author.id)
                .replace("{cmd.content}", message.content)
                .replace("{err}", err)
                .replace("{at}", moment(Date.now()).tz("America/Sao_Paulo").format("LLLL")))
            throw new Error(err)
        }


        switch (query) {
        case "유저":
            db.collection("users").findOne({ _id: message.author.id }, (erro, resp) => {
                if (erro) {
                    message.reply(" error")
                    client.users.get(config.OWNERID).send(errModel.db
                        .replace("{collection}", "users")
                        .replace("{server.name}", message.guild.name)
                        .replace("{server.id}", message.guild.id)
                        .replace("{author.tag}", message.author.tag)
                        .replace("{author.id}", message.author.id)
                        .replace("{cmd.content}", message.content)
                        .replace("{err}", err)
                        .replace("{at}", moment(Date.now()).tz("America/Sao_Paulo").format("LLLL")))
                    throw new Error(err)
                }

                if (resp) return message.channel.send(`${message.author} 님은 이미 등록을 하셨습니다.`)

                let userEmbed = new Discord.RichEmbed()
                    .setTitle("DSUv2 Manager의 유저 이용 약관:")
                    .setColor("#ffffff")
                    .setDescription("**이 문서를 확인하지 않아 생기는 불이익은 책임지지 않습니다.**\n\n[[이용 약관 바로가기]](https://github.com/Zero-Brazil734/dsu-manager/blob/master/documents/users.md)")
                    .setTimestamp()
                    .setFooter(message.author.username, message.author.avatarURL)
                message.channel.send(userEmbed).then(msg => {
                    msg.react("✅").then(() => msg.react("❌"))

                    let filter = (reaction, user) => reaction.emoji.name === "✅" && user.id === message.author.id
                    let collector = msg.createReactionCollector(filter, { max: 1, time: 60000 })


                    collector.on("collect", () => {
                        try {
                            userController.setUser(message.author)
                            message.channel.send(`${message.author} 님의 등록을 성공적으로 처리 했습니다. \`TIP: 만약 연합 서버이시다면 !!등록 연합을 하신 후에 !!등록 운영자를 써주세요.\``)
                        } catch (err) {
                            client.users.get(config.OWNERID).send(errModel.db
                                .replace("{collection}", "user model")
                                .replace("{server.name}", message.guild.name)
                                .replace("{server.id}", message.guild.id)
                                .replace("{author.tag}", message.author.tag)
                                .replace("{author.id}", message.author.id)
                                .replace("{cmd.content}", message.content)
                                .replace("{err}", err)
                                .replace("{at}", moment(Date.now()).tz("America/Sao_Paulo").format("LLLL")))
                            throw new Error(err)
                        }
                    })

                    let filtro = (reaction, user) => reaction.emoji.name === "❌" && user.id === message.author.id
                    let coletor = msg.createReactionCollector(filtro, { max: 1 })

                    coletor.on("collect", () => {
                        msg.delete()
                        return message.channel.send("취소 되었습니다")
                    })
                })
            })
            break;
        case "서버":
            if (message.author.id !== message.guild.ownerID) return message.channel.send(`${message.author} 님, 서버 등록은 해당 서버의 오너만이 가능합니다.`)
            db.collection("guilds").findOne({ _id: message.guild.id }, (erro, resp) => {
                if (erro) {
                    client.users.get(config.OWNERID).send(errModel.db
                        .replace("{collection}", "guilds")
                        .replace("{server.name}", message.guild.name)
                        .replace("{server.id}", message.guild.id)
                        .replace("{author.tag}", message.author.tag)
                        .replace("{author.id}", message.author.id)
                        .replace("{cmd.content}", message.content)
                        .replace("{err}", erro)
                        .replace("{at}", moment(Date.now()).tz("America/Sao_Paulo").format("LLLL")))

                    throw new Error(erro)
                }

                if (resp) return message.channel.send(`${message.author} 님, "${message.guild.name}" 서버는 이미 등록 절차가 완료된 상태입니다. \`TIP: 만약 등업을 하고 싶으신거라면 ${res ? res.prefix : "!!"}등업을 사용 해주세요\``)

                let guildEmbed = new Discord.RichEmbed()
                    .setTitle("DSUv2 Manager의 서버 등록 정책:")
                    .setColor("#ffffff")
                    .setTimestamp()
                    .setDescription("**이 문서를 확인하지 않아 생기는 불이익은 책임지지 않습니다.**\n\n[[등록 정책 바로가기]](https://github.com/Zero-Brazil734/dsu-manager/blob/master/documents/servers.md)")
                    .setFooter(message.guild.name, message.guild.iconURL)
                message.channel.send(guildEmbed).then(msg => {
                    msg.react("✅").then(() => msg.react("❌"))

                    let filter = (reaction, user) => reaction.emoji.name === "✅" && user.id === message.author.id
                    let collector = msg.createReactionCollector(filter, { max: 1, time: 60000 })

                    collector.on("collect", () => {
                        try {
                            guildController.store(message.guild, message.author)
                            message.channel.send(`${message.author} 님, 해당 서버의 등록 절차가 성공적으로 완료 되었습니다. \`TIP: 연합 서버라면 !!등록 연합으로 다시 가입하셔야 합니다.\``)
                        } catch (err) {
                            client.users.get(config.OWNERID).send(errModel.db
                                .replace("{collection}", "guild model")
                                .replace("{server.name}", message.guild.name)
                                .replace("{server.id}", message.guild.id)
                                .replace("{author.tag}", message.author.tag)
                                .replace("{author.id}", message.author.id)
                                .replace("{cmd.content}", message.content)
                                .replace("{err}", err)
                                .replace("{at}", moment(Date.now()).tz("America/Sao_Paulo").format("LLLL")))
                            throw new Error(err)
                        }
                    })

                    let filtro = (reaction, user) => reaction.emoji.name === "❌" && user.id === message.author.id
                    let coletor = msg.createReactionCollector(filtro, { max: 1 })

                    coletor.on("collect", () => {
                        msg.delete()
                        return message.channel.send(`${message.author} 님, 해당 서버의 등록 절차가 취소 되었습니다.`)
                    })
                })
            })
            break;
        case "연합":
            if (message.author.id !== message.guild.ownerID) return message.channel.send(`${message.author} 님, 연합 서버 등록은 해당 서버의 오너만이 가능합니다.`)
            if (!message.member.hasPermission("ADMINISTRATOR")) return message.channel.send(`${message.author} 님, 연합으로 등록을 하시려면 \`${message.guild.name}\`의 관리자이셔야 합니다.`)

            db.collection("guilds").findOne({ _id: message.guild.id }, (erro, resp) => {
                if (erro) {
                    client.users.get(config.OWNERID).send(errModel.db
                        .replace("{collection}", "guilds")
                        .replace("{server.name}", message.guild.name)
                        .replace("{server.id}", message.guild.id)
                        .replace("{author.tag}", message.author.tag)
                        .replace("{author.id}", message.author.id)
                        .replace("{cmd.content}", message.content)
                        .replace("{err}", erro)
                        .replace("{at}", moment(Date.now()).tz("America/Sao_Paulo").format("LLLL")))

                    throw new Error(erro)
                }

                if (!resp) return message.channel.send(`${message.author} 님, 먼저 해당 서버를 등록 해주세요. \`!!등록 서버\``)

                let unionEmbed = new Discord.RichEmbed()
                    .setTitle("DSUv2의 연합 서버 신청 조건 및 유의 사항:")
                    .setColor("#ffffff")
                    .setFooter(message.guild.name, message.guild.iconURL)
                    .setTimestamp()
                    .setDescription("**이 문서를 확인하지 않아 생기는 불이익은 책임지지 않습니다.**")
                    .addField("💡『Balance』:", "[[Balance 문서]](https://github.com/Zero-Brazil734/dsu-manager/blob/master/documents/balance.md)")
                    .addField("💡『Brilliance』:", "[[Brilliance 문서]](https://github.com/Zero-Brazil734/dsu-manager/blob/master/documents/brilliance.md)")
                    .addField("💡『Bravery』:", "[[Bravery 문서]](https://github.com/Zero-Brazil734/dsu-manager/blob/master/documents/bravery.md)")
                message.channel.send(unionEmbed).then(msg => {
                    msg.react("✅").then(() => msg.react("❌"))

                    let filter = (reaction, user) => reaction.emoji.name === "✅" && user.id === message.author.id
                    let collector = msg.createReactionCollector(filter, { max: 1, time: 60000 })


                    collector.on("collect", () => {
                        try {
                            message.channel.send(`${message.author} 님, 자신의 DM을 확인 해주세요.`)

                            let unionEmbed = new Discord.RichEmbed()
                                .setTitle("DSUv2의 연합 서버 신청 조건 및 유의 사항:")
                                .setColor("#ffffff")
                                .setDescription("검사가 완료 되었습니다.")

                            message.author.send(`"${message.guild.name}" 서버가 최소 조건 기준치를 넘었는지 확인 중입니다...`).then(async mm => {
                                let memberCount = message.guild.members.filter(b => b.user.bot === false).size

                                if (memberCount < 50 && memberCount > 100) {
                                    var svclass = "Balance"
                                    await unionEmbed.addField("⚖동의시 예상 레벨: ", "💡『Balance』")
                                } else if (memberCount < 100 && memberCount < 200) {
                                    var svclass = "Brilliance"
                                    await unionEmbed.addField("⚖동의시 예상 레벨: ", "💡『Brilliance』")
                                } else if (memberCount < 200) {
                                    var svclass = "Bravery"
                                    await unionEmbed.addField("⚖동의시 예상 레벨: ", "💡『Bravery』")
                                } else {
                                    var svclass = "Unknown"
                                    await unionEmbed.addField("⚖동의시 예상 레벨: ", "unknown")
                                }

                                setTimeout(() => {
                                    mm.edit(unionEmbed).then(() => message.author.send(".").then(m => m.delete()))

                                    message.author.send(`\`\`\`md\n- 서버 장르 : \n- 초대 링크(무제한) : \n- 신청 역할 : ${svclass}\n- 신청 사유 : \n- 서버 홍보지/홍보문구 : - 디스코드 ToS/Guidelines 확인 : (예/아니요)\n\`\`\`위의 양식에 따라서 5분 안에 작성 해주세요.`).then(m => {
                                        let collect = m.channel.createMessageCollector(a => a.author.id === message.author.id, { time: 60000 * 5 })

                                        collect.on("collect", () => {
                                            let collected = collect.collected.last().content

                                            message.author.send("그대로 확정 하시겠습니까?").then(react => {
                                                react.react("✅")

                                                let f = (reaction, user) => reaction.emoji.name === "✅" && user.id === message.author.id
                                                let c = react.createReactionCollector(f, { max: 1, time: 60000 })

                                                c.on("collect", async () => {
                                                    let confirm = new Discord.RichEmbed()
                                                        .setTitle("새로운 연합 신청:")
                                                        .setThumbnail(message.guild.iconURL)
                                                        .setTimestamp()
                                                        .setColor("#ffffff")
                                                        .setDescription(`**신청자:** ${message.author.tag}(${message.author.id})\n**신청 서버:** ${message.guild.name}(${message.guild.id})\n**예상 레벨:** ${svclass}`)
                                                        .addField("📋양식:", collected)
                                                        .setFooter(message.guild.name, message.guild.iconURL)
                                                    await client.users.get(config.OWNERID).send(confirm)
                                                    message.author.send(`✅ | "${message.guild.name}" 서버에 대한 신청을 전송 완료 했습니다. 심사를 기다려주세요.`)
                                                })
                                            })
                                        })
                                    })
                                }, 3500)
                            })
                        } catch (err) {
                            client.users.get(config.OWNERID).send(errModel.cmd
                                .replace("{cmd}", "등록")
                                .replace("{server.name}", message.guild.name)
                                .replace("{server.id}", message.guild.id)
                                .replace("{author.tag}", message.author.tag)
                                .replace("{author.id}", message.author.id)
                                .replace("{cmd.content}", message.content)
                                .replace("{err}", err)
                                .replace("{at}", moment(Date.now()).tz("America/Sao_Paulo").format("LLLL")))
                            throw new Error(err)
                        }
                    })

                    let filtro = (reaction, user) => reaction.emoji.name === "❌" && user.id === message.author.id
                    let coletor = msg.createReactionCollector(filtro, { max: 1 })

                    coletor.on("collect", () => {
                        msg.delete()
                        return message.channel.send(`${message.author} 님, 해당 서버의 등록 절차가 취소 되었습니다.`)
                    })
                })
            })
            break;
        case "운영자":
            if (!message.member.hasPermission("ADMINISTRATOR")) return message.channel.send(`${message.author} 님, 운영자로써의 등록은 해당 서버의 관리자 권한이 필요합니다.`)

            db.collection("guilds").findOne({ _id: message.guild.id }, (erro, resp) => {
                if (erro) {
                    client.users.get(config.OWNERID).send(errModel.db
                        .replace("{collection}", "guilds")
                        .replace("{server.name}", message.guild.name)
                        .replace("{server.id}", message.guild.id)
                        .replace("{author.tag}", message.author.tag)
                        .replace("{author.id}", message.author.id)
                        .replace("{cmd.content}", message.content)
                        .replace("{err}", error)
                        .replace("{at}", moment(Date.now()).tz("America/Sao_Paulo").format("LLLL")))
                    throw new Error(err)
                }

                if (!resp) return message.channel.send(`${message.author} 님, 해당 서버를 먼저 등록 해주세요. \`${resp ? resp.prefix : "!!"}등록 서버\``)

                if (resp.union === false) return message.channel.send(`${message.author} 님, 해당 서버는 연합 서버로 등록이 안 되있거나 승인이 미완료 상태입니다.`)

                db.collection("users").findOne({ _id: message.author.id }, async (error, respo) => {
                    if (error) {
                        client.users.get(config.OWNERID).send(errModel.db
                            .replace("{collection}", "users")
                            .replace("{server.name}", message.guild.name)
                            .replace("{server.id}", message.guild.id)
                            .replace("{author.tag}", message.author.tag)
                            .replace("{author.id}", message.author.id)
                            .replace("{cmd.content}", message.content)
                            .replace("{err}", error)
                            .replace("{at}", moment(Date.now()).tz("America/Sao_Paulo").format("LLLL")))
                        throw new Error(err)
                    }

                    if (respo.svadmin === true) return message.channel.send(`${message.author} 님은 이미 한 서버의 "서버 운영자"로써 등록 되있습니다.`)

                    switch (resp.svclass) {
                    case "Balance":
                        var adminsLimit = 2
                        break;
                    case "Brilliance":
                        var adminsLimit = 3
                        break;
                    case "Bravery":
                        var adminsLimit = 4
                        break;
                    case "DSUv2":
                        var adminsLimit = 9999999
                        break;
                    default:
                        await message.channel.send(`${message.author} 님, 해당 서버의 레벨을 읽을수 없습니다.`)
                        throw new Error(`${message.author} 님, 해당 서버의 레벨을 읽을수 없습니다.`)
                    }

                    if (resp.svadmins.length >= adminsLimit) return message.channel.send(`${message.author} 님, 해당 서버(${message.guild.name})는 이미 서버 운영자가 제한 수에 도달 했습니다. \`해당 서버의 제한 수: ${adminsLimit}명\``)
                })

                let adminEmbed = new Discord.RichEmbed()
                    .setTitle("DSUv2 Manager의 서버 운영자 이용 약관:")
                    .setColor("#ffffff")
                    .setFooter(message.author.username, message.author.avatarURL)
                    .setTimestamp()
                    .setDescription("**이 문서를 확인하지 않아 생기는 불이익은 책임지지 않습니다.**\n\n[바로가기](https://github.com/Zero-Brazil734/dsu-manager/blob/master/documents/users.md)")
                message.channel.send(adminEmbed).then(a => {
                    client.collectors.reactionCollector(a, { emoji: "✅", user: message.author.id }, (collector) => {
                        collector.on("collect", () => {
                            message.channel.send(`✅ | ${message.guild.owner}님의 승인을 기다려주세요.`)

                            let ownerEmbed = new Discord.RichEmbed()
                                .setTitle("DSUv2 Manager의 연합 서버 운영자 추가 신청:")
                                .setFooter(message.author.username, message.author.avatarURL)
                                .setTimestamp()
                                .setColor(client.color)
                                .setDescription(`승인/거절은 아래 이모지를 눌러주세요.\n\n**__승인한 순간부터 ${message.author}(${message.author.tag})님은 ${message.guild.name} 서버의 관리진 의견 대변인이 되며, 입장을 표명하는 분들 중 한 명이 되십니다.__**`)
                                .addField("👤신청자", `${message.author}(${message.author.tag})`)
                            message.guild.owner.send(ownerEmbed).then(o => {
                                client.collectors.reactionCollector(o, { emoji: "✅", user: message.guild.ownerID }, collector => {
                                    collector.on("collect", () => {
                                        db.collection("guilds").findOneAndUpdate({ _id: message.guild.id }, {
                                            $push: {
                                                svadmins: message.author.id
                                            }
                                        })

                                        db.collection("users").findOneAndUpdate({ _id: message.author.id }, {
                                            $set: {
                                                svadmin: true
                                            }
                                        })

                                        o.delete()

                                        switch (resp.svclass) {
                                        case "Balance":
                                            var role = "577014813914431498"
                                            break;

                                        case "Brilliance":
                                            var role = "603654257215930379"
                                            break;

                                        case "Bravery":
                                            var role = "603655904826753045"
                                            break;

                                        default:
                                            var role = "604577092423909407"
                                            break;
                                        }
                                        if (client.guilds.get("537682452479475723").members.get(message.author.id)) client.guilds.get("537682452479475723").members.get(message.author.id).addRole(role).catch(err => {
                                            client.users.get(config.OWNERID).send(errModel.cmd
                                                .replace("{cmd}", "등록")
                                                .replace("{server.name}", message.guild.name)
                                                .replace("{server.id}", message.guild.id)
                                                .replace("{author.tag}", message.author.tag)
                                                .replace("{author.id}", message.author.id)
                                                .replace("{cmd.content}", message.content)
                                                .replace("{err}", err)
                                                .replace("{at}", moment(Date.now()).tz("America/Sao_Paulo").format("LLLL"))
                                            )

                                            throw new Error(err)
                                        })
                                        message.guild.owner.send(`✅ | ${message.author}(${message.author.tag}) 님의 신청을 성공적으로 처리 했습니다.`)
                                        message.author.send(`✅ | ${message.guild.owner}(${message.guild.owner.user.tag}) 님이 신청을 승인 하셨습니다.`)
                                    })
                                })

                                client.collectors.reactionCollector(o, { emoji: "❌", user: message.guild.ownerID }, collector => {
                                    collector.on("collect", () => {
                                        message.author.send(`❌ | ${message.guild.owner}(${message.guild.owner.user.tag}) 님이 신청을 거절 하셨습니다.`)
                                        return o.delete()
                                    })
                                })
                            })
                        })
                    })

                    client.collectors.reactionCollector(a, { emoji: "❌", user: message.author.id }, collector => {
                        collector.on("collect", () => {
                            a.delete()
                            message.channel.send(`${message.author} 님의 등록 절차가 성공적으로 취소 되었습니다.`)
                        })
                    })
                })
            })
            break;
        default:
            return message.reply(` \`${res ? res.prefix : "!!"}등록 <유저/서버/운영자/연합>\``)
        }
    })
}

exports.config = {
    name: "등록",
    aliases: ["ㄷㄹ", "가입"],
    description: "봇의 서비스에 가입합니다."
}