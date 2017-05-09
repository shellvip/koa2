const nedbP = require('nedb-promise');
const crypto = require('crypto');
const path = require('path');
const Nedb = require('nedb');

var nedb = new Nedb({ filename: path.join(__dirname, 'db', 'user.db'), autoload: true });
nedb.ensureIndex({ fieldName: 'uname', unique: true });
//nedb.ensureIndex({ fieldName: 'email', unique: true });
nedb.persistence.setAutocompactionInterval(1000*60*60*6);
let User = nedbP.fromInstance(nedb);

const user_role = ['ADMIN', 'MOD', 'MEMBER', 'BANNED'];

User.insertUser = async (obj) => {
    var user = {
        uname: '',        
        password: '',
        role: 'MEMBER',
        email: '',
        last_online_at: Date.now(),
        created_at: Date.now()
    };
    obj.password = crypto.createHash('md5').update(obj.password).digest('base64');
    return await User.insert(Object.assign(user, obj));
};

module.exports = User;
