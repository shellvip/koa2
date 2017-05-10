const nedbP = require('nedb-promise');
const path = require('path');
const Nedb = require('nedb');

var nedb = new Nedb({ filename: path.join(__dirname, 'db', 'gif.db'), autoload: true });
nedb.persistence.setAutocompactionInterval(1000*60*60*6);
let Gif = nedbP.fromInstance(nedb);

Gif.insertGif = async (obj) => {
    var gif = {
        ip_address: '',
        created_at: Date.now()
    };
    
    return await Gif.insert(Object.assign(gif, obj));
};

module.exports = Gif;
