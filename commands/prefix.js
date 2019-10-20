const guildModel = require("../models/guild")
const guildController = require("../controllers/guild")

exports.run = (client, message, args) => {
    if(message.author.id !== message.guild.ownerID) return message.channel.send(`${message.author} 님, 봇의 접두사는 해당 서버의 오너만 변경 가능합니다.`)

    guildModel.findById(message.guild.id, (err, res) => {
        if(err) {
            message.reply(" error")
            client.logger.error(err)
        }

        if(!res) return message.channel.send(`${message.author} 님, 해당 서버는 등록이 안 되있습니다. \`!!등록 서버\``)
        if(res.union !== true) return message.channel.send(`${message.author} 님, 접두사 변경은 연합 서버만 가능합니다.`)

        let newPrefix = args.join(" ")
        if(!newPrefix) return message.channel.send(`${message.author} 님, 봇의 새로운 접두사를 입력 해주세요.`)
        if(newPrefix.length >= 5) return message.channel.send(`${message.author} 님, 봇의 접두사는 4글자 이하로만 설정할수 있습니다.`)

        guildController.changePrefix(message.guild, newPrefix)
            .then(() => {
                message.channel.send(`✅ | 성공적으로 봇의 접두사가 \`${res.prefix}\`에서 \`${newPrefix}\`(으)로 변경 되었습니다.`)
            })
            .catch(erro => {
                message.channel.send("❌ | 오류로 인해 봇의 접두사가 변경되지 않았습니다.")
                client.logger.error(erro)
            })
    })
}

exports.config = {
    name: "접두사변경",
    aliases: ["setprefix", "prefix", "접두사"],
    description: "봇의 접두사를 변경합니다"
}