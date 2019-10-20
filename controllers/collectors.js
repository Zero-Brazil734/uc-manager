class collectors {
    constructor(client) {
        this.client = client
    }

    async messageCollector(message, options = { user }, cb) {
        this.client.fetchUser(options.user).catch(err => {
            if(String(err).includes("Unknown User")) throw new Error("Unknown User")
        })

        let collector = message.channel.createMessageCollector(m => m.author.id === options.user)

        return cb(collector)
    }

    async reactionCollector(message, options = { emoji, user }, cb) {
        message.react(options.emoji)

        this.client.fetchUser(options.user).catch(err => {
            if(String(err).includes("Unknown User")) throw new Error("Unknown User")
        })

        let filter = (reaction, rruser) => reaction.emoji.name === options.emoji && rruser.id === options.user
        let collector = message.createReactionCollector(filter)

        return cb(collector)
    }
}

module.exports = collectors