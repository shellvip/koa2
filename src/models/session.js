const nedbP = require('nedb-promise');
const path = require('path');
const Nedb = require('nedb');

var nedb = new Nedb({ filename: path.join(__dirname, 'db', 'session.db'), autoload: true });
nedb.persistence.setAutocompactionInterval(1000*60*60*6);
let Session = nedbP.fromInstance(nedb);

Session.insertSession = async (obj) => {
    var session = {
        _id: '',        
        user_id: '',
        ip_address: '',
        user_agent: '',
        logged_out_at: 0,
        expired_at: Date.now() + 1000 * 60 * 60 * 24 * 14,
        created_at: Date.now()
    };
    
    return await Session.insert(Object.assign(session, obj));
};

module.exports = Session;
