const guildModel = require("../models/guild")
const { RichEmbed } = require("discord.js")

exports.run = (client, message, args) => {
    let query = args[0]

    switch (query) {
    case "설정":
        guildModel.findById(message.guild.id, (err, res) => {
            if (err) {
                message.reply(" error")
                client.logger.error(err)
            }

            if (!res) return message.channel.send(`${message.author} 님, 해당 서버는 등록이 안 되있어 홍보 정보 열람이 불가능합니다. \`!!등록 서버\``)

            switch (res.promoTime) {
            case 43200000:
                var time = "12시간"
                break;
            case 86400000:
                var time = "24시간"
                break;
            case 0:
                var time = "없음"
                break;
            default:
                var time = "Unknown"
                break;
            }

            if (res.promoText == "") {
                var text = "없음"
            } else {
                var text = String(res.promoText).length > 1024 ? String(res.promoText).substr(0, 998) + "\`홍보글이 너무 길어 DM으로 전송 했습니다.\`" : res.promoText
            }
            let info = new RichEmbed()
                .setTitle(`${message.guild.name}의 홍보 설정 목록:`)
                .setColor(client.color)
                .setFooter(message.guild.name, message.guild.iconURL)
                .setTimestamp()
                .addField("<:profile:631222466802483200>서버 레벨:", res.svclass === "none" ? "없음" : res.svclass)
                .addField("<:timer:631234008528977930>홍보 타이머:", time)
                .addField("<:doc:631237659439923215>홍보글:", text)
            message.channel.send(info)
        })
        break;
    case "생성":
        if (message.author.id !== message.guild.ownerID) return message.channel.send(`${message.author} 님, 홍보 타이머 생성 권한은 해당 서버의 오너만 가지고 있습니다.`)
        guildModel.findById(message.guild.id, (err, res) => {
            if (err) {
                message.reply(" error")
                client.logger.error(err)
            }

            if (!res) return message.channel.send(`${message.author} 님, ${message.guild.name} 서버가 등록이 안 되있습니다.`)
            if (res.union !== true) return message.channel.send(`${message.author} 님, 해당 서버는 연합 서버가 아니어서 생성 권한이 없습니다.`)
            if (res.promoText != "") return message.channel.send(`${message.author} 님, 해당 서버는 이미 홍보글이 있습니다. 홍보글 수정을 원하신다면 \`${res.prefix ? res.prefix : "!!"}홍보 업뎃\`을 써주세요.`)

            message.channel.send("✅ | DM을 확인 해주세요.")

            message.author.send(`"${message.guild.name}" 서버가 최소 조건 기준치를 넘었는지 확인 중입니다...`).then(async msg => {
                let unionEmbed = new RichEmbed()
                    .setTitle("DSUv2의 연합 서버 신청 조건 및 유의 사항:")
                    .setColor("#ffffff")
                    .setDescription("검사가 완료 되었습니다.")

                let memberCount = message.guild.members.filter(b => b.user.bot === false).size
                if (memberCount < 50 && memberCount > 100) {
                    return message.channel.send(`${message.author} 님, 해당 서버는 Balance라서 생성 권한이 부족합니다.`)
                }
                if (memberCount < 100 && memberCount < 200) {
                    var time = 86400000
                    await unionEmbed.addField("⚖서버 레벨: ", "💡『Brilliance』")
                } else if (memberCount < 200) {
                    var time = 43200000
                    await unionEmbed.addField("⚖서버 레벨: ", "💡『Bravery』")
                } else {
                    var time = 0
                    await unionEmbed.addField("⚖서버 레벨: ", "unknown")
                }

                setTimeout(() => {
                    msg.edit(unionEmbed)
                    message.author.send(`이제 "${message.guild.name}"의 홍보글을 보내주세요. \`(주의 사항: 2000자 이상은 무효 처리됩니다.)\``).then(m => {
                        client.collectors.messageCollector(m, { user: message.author.id }, cb => {
                            cb.on("collect", () => {
                                message.author.send("확정 하시겠습니까?").then(ms => {
                                    client.collectors.reactionCollector(ms, { emoji: "✅", user: message.author.id }, yes => {
                                        yes.on("collect", () => {
                                            guildModel.findByIdAndUpdate(message.guild.id, {
                                                $set: {
                                                    promoText: String(cb.collected.last().content),
                                                    promoTime: time
                                                }
                                            }).then(() => {
                                                message.author.send("✅ | 성공적으로 홍보글을 생성 했습니다.")
                                            }).catch(erro => {
                                                message.author.send(" error")
                                                client.logger.error(erro)
                                            })
                                        })
                                    })
                                })
                            })
                        })
                    })
                }, 3500)
            })
        })
        break;
    case "삭제":
        if (message.author.id !== message.guild.ownerID) return message.channel.send(`${message.author} 님, 홍보 타이머 삭제 권한은 해당 서버의 오너만 가지고 있습니다.`)

        guildModel.findById(message.guild.id, (err, res) => {
            if (err) {
                message.reply(" error")
                client.logger.error(err)
            }

            if (!res) return message.channel.send(`${message.author} 님, ${message.guild.name} 서버가 등록이 안 되있습니다.`)
            if (res.union !== true) return message.channel.send(`${message.author} 님, 해당 서버는 연합 서버가 아니어서 삭제 권한이 없습니다.`)
            if (res.promoText == "") return message.channel.send(`${message.author} 님, 해당 서버는 이미 홍보글이 없습니다. 홍보글 생성을 원하신다면 \`${res.prefix ? res.prefix : "!!"}홍보 생성\`을 써주세요.`)

            message.channel.send("⚠ | 삭제를 확인 하시겠습니까?").then(m => {
                client.collectors.reactionCollector(m, { emoji: "✅", user: message.author.id }, yes => {
                    yes.on("collect", () => {
                        guildModel.findByIdAndUpdate(message.guild.id, { 
                            $set: {
                                promoText: "",
                                promoTime: 0
                            }
                        }).then(() => {
                            message.channel.send("✅ | 성공적으로 삭제 되었습니다.")
                        }).catch(erro => {
                            message.channel.send(erro)
                            client.logger.error(erro)
                        })
                    })
                })
            })
        })
        break;
    case "수정":
        guildModel.findById(message.guild.id, (err, res) => {
            if(err) {
                message.reply(" error")
                client.logger.error(err)
            }

            if (!res) return message.channel.send(`${message.author} 님, ${message.guild.name} 서버가 등록이 안 되있습니다.`)
            if (res.union !== true) return message.channel.send(`${message.author} 님, 해당 서버는 연합 서버가 아니어서 수정 권한이 없습니다.`)
            if (res.promoText == "") return message.channel.send(`${message.author} 님, 해당 서버는 홍보글이 없습니다. 홍보글 생성을 원하신다면 \`${res.prefix ? res.prefix : "!!"}홍보 생성\`을 써주세요.`)

            message.channel.send("✅ | DM을 확인 해주세요.")

            message.author.send(`"${message.guild.name}" 서버가 최소 조건 기준치를 넘었는지 확인 중입니다...`).then(async msg => {
                let unionEmbed = new RichEmbed()
                    .setTitle("DSUv2의 연합 서버 신청 조건 및 유의 사항:")
                    .setColor("#ffffff")
                    .setDescription("검사가 완료 되었습니다.")

                let memberCount = message.guild.members.filter(b => b.user.bot === false).size

                if (memberCount < 50 && memberCount > 100) {
                    return message.channel.send(`${message.author} 님, 해당 서버는 Balance라서 수정 권한이 부족합니다.`)
                } else if (memberCount < 100 && memberCount < 200) {
                    var time = 86400000
                    await unionEmbed.addField("⚖서버 레벨: ", "💡『Brilliance』")
                } else if (memberCount < 200) {
                    var time = 43200000
                    await unionEmbed.addField("⚖서버 레벨: ", "💡『Bravery』")
                } else {
                    var time = 0
                    await unionEmbed.addField("⚖서버 레벨: ", "unknown")
                }

                setTimeout(() => {
                    msg.edit(unionEmbed)
                    message.author.send(`이제 "${message.guild.name}"의 홍보글을 보내주세요. \`(주의 사항: 2000자 이상은 무효 처리됩니다.)\``).then(m => {
                        client.collectors.messageCollector(m, { user: message.author.id }, cb => {
                            cb.on("collect", () => {
                                message.author.send("확정 하시겠습니까?").then(ms => {
                                    client.collectors.reactionCollector(ms, { emoji: "✅", user: message.author.id }, yes => {
                                        yes.on("collect", () => {
                                            guildModel.findByIdAndUpdate(message.guild.id, {
                                                $set: {
                                                    promoText: String(cb.collected.last().content),
                                                    promoTime: time
                                                }
                                            }).then(() => {
                                                message.author.send("✅ | 성공적으로 홍보글을 수정 했습니다.")
                                            }).catch(erro => {
                                                message.author.send(" error")
                                                client.logger.error(erro)
                                            })
                                        })
                                    })
                                })
                            })
                        })
                    })
                }, 3500)
            })
        })
        break;
    default:
        message.reply(" `!!홍보 <설정/생성/삭제/수정>`")
        break;
    }
}

exports.config = {
    name: "홍보",
    aliases: ["ㅎㅂ", "promo"],
    description: "해당 서버에 대한 홍보의 정보를 확인 또는 생성, 수정, 삭제합니다."
}