const nedbP = require('nedb-promise');
const path = require('path');
const Nedb = require('nedb');

var nedb = new Nedb({ filename: path.join(__dirname, 'db', 'ratelimit.db'), autoload: true });
nedb.persistence.setAutocompactionInterval(1000*60*60*6);
let Ratelimit = nedbP.fromInstance(nedb);

Ratelimit.insertRatelimit = async (obj) => {
    var ratelimit = {
        ip_address: '',
        created_at: Date.now()
    };
    
    return await Ratelimit.insert(Object.assign(ratelimit, obj));
};

module.exports = Ratelimit;
