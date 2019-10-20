require("dotenv").config()

const { Client } = require("dbcm")
const logger = require("./logger")
const collectors = require("./collectors")
const database = require("./database")

class DSU extends Client {
    constructor(options) {
        super(options)

        this.logger = new logger(this)
        this.collectors = new collectors(this)
        this.color = "#ffffff"
        this.ownerid = process.env.OWNERID
    }

    async watchModel(model, datacb) {
        new database(model).on("change", data => {
            return datacb(data)
        })
    }
}

module.exports = DSU