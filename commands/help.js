const { RichEmbed } = require("discord.js")
const userModel = require("../models/user")

exports.run = async(client, message, args) => {
    if (!args[0]) {
        let level;
        let embed = new RichEmbed()
            .setAuthor(client.user.username + "의 도움말:", client.user.avatarURL)
            .setDescription(`오류/버그시 <@${client.ownerid}>(제로ㅣBrazil#5005 / ${client.ownerid})의 갠디 또는 DSUv2에서 제보 해주시길 바랍니다.\n\n***__단축키 및 사용법 확인: 도움말 <명령어>__***`)
            .setColor(client.color)
            .setTimestamp()
            .setFooter(message.author.username, message.author.avatarURL)
            .addField("🔧 | 유틸리티:", "\`ping\`, \`등록\`, \`도움말\`")

        userModel.findById(message.author.id, async (err, res) => {
            if (err) {
                message.reply(" error")
                client.logger.error(err)
            }

            if (!res) level = 0
            if (res && res.svadmin !== true) level = 0
            if (res && res.svadmin === true) level = 1
            if (message.author.id === client.ownerid) level = 2

            switch (level) {
            case 0:
                message.channel.send(embed)
                break;
            case 1:
                message.channel.send(embed.addField("⚖ | 연합 서버:", "\`홍보\`, \`접두사변경\`"))
                break;
            case 2:
                message.channel.send(embed.addField("⚖ | 연합 서버:", "\`홍보\`, \`접두사변경\`").addField("🔐 | 개발자:", "\`cmd\`"))
                break;
            default:
                break;
            }
        })
    }else{
        if(!client.commands.get(args[0]) && !client.aliases.get(args[0])) return message.channel.send(`${message.author} 님, 해당 명령어는 존재하지 않습니다.`)

        if(client.commands.get(args[0])) {
            var info = await new RichEmbed().addField(`명령어 이름: ${client.commands.get(args[0]).config.name}`, `**명령어 설명:** ${client.commands.get(args[0]).config.description}\n**단축키 목록:** ${client.commands.get(args[0]).config.aliases.join(", ")}`)
        }
        if(client.aliases.get(args[0])) {
            var info = await new RichEmbed().addField(`명령어 이름: ${client.aliases.get(args[0]).config.name}`, `**명령어 설명:** ${client.aliases.get(args[0]).config.description}\n**단축키 목록:** ${client.aliases.get(args[0]).config.aliases.join(", ")}`)
        }

        message.channel.send(info.setAuthor(`${client.user.username}의 ${args[0]} 명령어 도움말:`, client.user.avatarURL).setTimestamp().setFooter(message.author.username, message.author.avatarURL).setColor(client.color))
    }
}

exports.config = {
    name: "도움말",
    aliases: ["help", "도움", "?"],
    description: "모든 명령어들의 리스트와 각종 명령어의 세부 사항을 볼수 있습니다."
}