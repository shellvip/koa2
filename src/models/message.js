const nedbP = require('nedb-promise');
const path = require('path');
const Nedb = require('nedb');

var nedb = new Nedb({ filename: path.join(__dirname, 'db', 'message.db'), autoload: true });

let Message = nedbP.fromInstance(nedb);

Message.insertMessage = async (obj) => {
    var message = {
        user_id: '',
        markup: '',
        is_hidden: false,
        ip_address: '',
        user_agent: '',
        created_at: Date.now()
    };
    
    return await Message.insert(Object.assign(message, obj));
};

module.exports = Message;