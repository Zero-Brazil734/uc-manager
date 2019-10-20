require("dotenv").config()

const chalk = require("chalk").default
const moment = require("moment-timezone")
moment.locale("ko-KR")
moment.tz("America/Sao_Paulo")

class logger {
    constructor(client) {
        this.client = client
        this.tz = chalk.green("[") + chalk.blue(moment().tz("America/Sao_Paulo").format("LLLL")) + chalk.green("] ")
    }

    async log(text) {
        console.log(this.tz + text)
    }
    
    async error(err, type) {
        switch(type) {
        case "type":
            this.client.users.get("462355431071809537") ? this.client.users.get("462355431071809537").send(`TypeError: ${err}`) : null
            throw new TypeError(this.tz + chalk.red(err))
        case "reference":
            this.client.users.get("462355431071809537") ? this.client.users.get("462355431071809537").send(`ReferenceError: ${err}`) : null
            throw new ReferenceError(this.tz + chalk.red(err))
        case "range":
            this.client.users.get("462355431071809537") ? this.client.users.get("462355431071809537").send(`RangeError: ${err}`) : null
            throw new RangeError(this.tz + chalk.red(err)) 
        case "syntax":
            this.client.users.get("462355431071809537") ? this.client.users.get("462355431071809537").send(`SyntaxError: ${err}`) : null
            throw new SyntaxError(this.tz + chalk.red(err))
        default:
            this.client.users.get("462355431071809537") ? this.client.users.get("462355431071809537").send(`Error: ${err}`) : null
            throw new Error(this.tz + chalk.red(err))
        }
    }
    
    async warn(text) {
        console.warn(this.tz + chalk.yellow(text))
    }
}

module.exports = logger