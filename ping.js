const { RichEmbed } = require("discord.js")

exports.run = async(client, message, args) => {
    let botping = await message.channel.send("Calculating...")
    
    let pEmbed = new RichEmbed()
        .setTitle(`${client.user.username} Ping:`)
        .addField("💬메세지: ", `${botping.createdTimestamp - message.createdTimestamp}ms`)
        .addField("📡API: ", `${Math.round(client.ping)}ms`)
        .setFooter(`${message.author.tag}`, message.author.avatarURL)
        .setColor(client.color)
        .setTimestamp()
    botping.edit(pEmbed)
}

exports.config = {
    name: "ping",
    aliases: ["pong", "pn", "핑", "퐁"],
    description: "봇의 명령어 반응 속도를 확인할수 있습니다."
}