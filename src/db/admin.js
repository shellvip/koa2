// 1st
//const {pool} = require('./util')
//const {sql} = require('pg-extra')
const User = require('../models/user');
const Message = require('../models/message');

// //////////////////////////////////////////////////////////

// only counts visible messages, not hidden ones since they are effectively
// deleted
exports.getStats = async function () {  
    users_count = await User.count({});
    messages_count = await Message.count({is_hidden: false});

    return {users_count, messages_count};
 
  // return pool.one(sql`
  //   SELECT
  //     (SELECT COUNT(*) FROM users) AS users_count,
  //     (SELECT COUNT(*) FROM messages WHERE is_hidden = false) AS messages_count
  // `)
}

// //////////////////////////////////////////////////////////

exports.deleteHiddenMessages = async function () {
  return await Message.remove({is_hidden: true}, {multi: true});
  // return pool.query(sql`
  //   DELETE FROM messages
  //   WHERE is_hidden = true
  // `)
}
