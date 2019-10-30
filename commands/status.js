const { RichEmbed } = require("discord.js")
const discloud = require("discloud-status")

exports.run = (client, message, args) => {
    let embed = new RichEmbed()
    .setTitle(client.user.username+"의 호스팅 상태창: ")
    .setColor("RANDOM")
    .setDescription("**RAM 사용량: **"+discloud.usoRam()+"\n**RAM 제한치: **"+discloud.totalRam())
    .setTimestamp()
    .setFooter("Hosted with ❤️ by DisCloud", client.user.avatarURL)
    .setThumbnail(client.user.avatarURL)
    message.channel.send(embed)
}

exports.config = {
    name: "status",
    aliases: ["discloud", "ram", "램", "상태"]
}
