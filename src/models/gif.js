const nedbP = require('nedb-promise');
const path = require('path');
const Nedb = require('nedb');
const rp = require('request-promise');

var nedb = new Nedb({ filename: path.join(__dirname, 'db', 'gif.db'), autoload: true });
nedb.ensureIndex({ fieldName: 'id'});
nedb.persistence.setAutocompactionInterval(1000 * 60 * 60 * 6);
let Gif = nedbP.fromInstance(nedb);

Gif.insertGif = async (obj) => {

    return await Gif.update({id: obj.id}, obj, {upsert: true});
};

module.exports = Gif;
