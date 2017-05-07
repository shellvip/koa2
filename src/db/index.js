// 3rd
const assert = require('better-assert')
const uuid = require('uuid')
//const knex = require('knex')({ client: 'pg' })
//const {sql, _raw} = require('pg-extra')
const debug = require('debug')('app:db:index')
const crypto = require('crypto');
// 1st
const belt = require('../belt')
const config = require('../config')
//const {pool} = require('./util')

// This module is for general database queries that haven't
// yet been split off into more specific db submodules.
const User = require('../models/user');
const Message = require('../models/message');
const Session = require('../models/session');
const Ratelimit = require('../models/ratelimit');
// RE-EXPORT SUBMODULES

exports.admin = require('./admin')
exports.ratelimits = require('./ratelimits')

// QUERY JUNK DRAWER

// UUID -> User | undefined
//
// Also bumps user's last_online_at column to NOW().
exports.getUserBySessionId = async function (sessionId) {
  assert(belt.isValidUuid(sessionId))
  // return pool.one(sql`
  //   UPDATE users
  //   SET last_online_at = NOW()
  //   WHERE id = (
  //     SELECT u.id
  //     FROM users u
  //     WHERE u.id = (
  //       SELECT s.user_id
  //       FROM active_sessions s
  //       WHERE s.id = ${sessionId}
  //     )
  //   )
  //   RETURNING *
  // `)

  // CREATE VIEW active_sessions AS
  // SELECT *
  // FROM sessions
  // WHERE expired_at > NOW()
  //   AND logged_out_at IS NULL

  let active_session = await Session.findOne({ _id: sessionId, expired_at: { $gt: Date.now() }, logged_out_at: 0 });
  if (!active_session) return null;

  let [n, user] = await User.update({ _id: active_session.user_id }, { $set: { last_online_at: Date.now() } }, { returnUpdatedDocs: true });

  return user;
}

// Case-insensitive uname lookup
exports.getUserByUname = async function (uname) {
  assert(typeof uname === 'string')
  // return pool.one(sql`
  //   SELECT *
  //   FROM users
  //   WHERE lower(uname) = lower(${uname})
  // `)
  return await User.findOne({uname});
}

exports.checkPassword = async function (uname, password) {
  assert(typeof uname === 'string')
  // return pool.one(sql`
  //   SELECT *
  //   FROM users
  //   WHERE lower(uname) = lower(${uname})
  // `)
  return await User.findOne({
        uname,
        password: crypto.createHash('md5').update(password).digest('base64')
    });
}

// //////////////////////////////////////////////////////////

exports.getRecentMessages = async function () {
  // return pool.many(sql`
  //   SELECT
  //     m.*,
  //     to_json(u.*) "user"
  //   FROM messages m
  //   LEFT JOIN users u ON m.user_id = u.id
  //   WHERE m.is_hidden = false
  //   ORDER BY m.id DESC
  //   LIMIT 25
  // `)

  let msgs = await Message.cfind({is_hidden: false}).sort({created_at: -1}).limit(25).exec();
  return await Promise.all(msgs.map(async msg => {
    msg.user = await User.findOne({_id: msg.user_id});
    return msg;
  }));
}

exports.getRecentMessagesForUserId = async function (userId) {
  //assert(Number.isInteger(userId))
  // return pool.many(sql`
  //   SELECT
  //     m.*,
  //     to_json(u.*) "user"
  //   FROM messages m
  //   LEFT JOIN users u ON m.user_id = u.id
  //   WHERE m.is_hidden = false
  //     AND u.id = ${userId}
  //   ORDER BY m.id DESC
  //   LIMIT 25
  // `)

  let msgs = await Message.cfind({user_id: userId, is_hidden: false }).sort({ created_at: -1 }).limit(25).exec();
  return await Promise.all(msgs.map(async msg => {
    msg.user = await User.findOne({ _id: msg.user_id });
    return msg;
  }));
}

// //////////////////////////////////////////////////////////

// Returns inserted message
//
// data.user_id is optional int
// data.markup is string
// data.ip_address is string
// data.user_agent is optional string
exports.insertMessage = async function (data) {
  assert(typeof data.markup === 'string')
  assert(typeof data.ip_address === 'string')
  // return pool.one(sql`
  //   INSERT INTO messages (user_id, markup, ip_address, user_agent)
  //   VALUES (
  //     ${data.user_id},
  //     ${data.markup},
  //     ${data.ip_address}::inet,
  //     ${data.user_agent})
  //   RETURNING *
  // `)

  return await Message.insertMessage({
    user_id: data.user_id,
    markup: data.markup,
    ip_address: data.ip_address,
    user_agent: data.user_agent
  });
}

// //////////////////////////////////////////////////////////

// Returns created user record
//
// email is optional
exports.insertUser = async function (uname, password, email) {
  assert(typeof uname === 'string')
  assert(typeof password === 'string')
  // const digest = await belt.hashPassword(password)
  // return pool.one(sql`
  //   INSERT INTO users (uname, email, digest)
  //   VALUES (${uname}, ${email}, ${digest})
  //   RETURNING *
  // `)

  return await User.insertUser({
    uname,
    password,
    email
  });
}

// userAgent is optional string
exports.insertSession = async function (userId, ipAddress, userAgent, interval) {
  //assert(Number.isInteger(userId))
  assert(typeof ipAddress === 'string')
  assert(typeof interval === 'number')
  // return pool.one(sql`
  //   INSERT INTO sessions (id, user_id, ip_address, user_agent, expired_at)
  //   VALUES (
  //     ${uuid.v4()},
  //     ${userId},
  //     ${ipAddress}::inet,
  //     ${userAgent},
  //     NOW() + ${interval}::interval
  //   )
  //   RETURNING *
  // `)

  return await Session.insertSession({
    _id: uuid.v4(),
    user_id: userId,
    ip_address: ipAddress,
    user_agent: userAgent,
    expired_at: Date.now() + interval
  });
}

exports.logoutSession = async function (userId, sessionId) {
  //assert(Number.isInteger(userId))
  assert(typeof sessionId === 'string')
  // return pool.query(sql`
  //   UPDATE sessions
  //   SET logged_out_at = NOW()
  //   WHERE user_id = ${userId}
  //     AND id = ${sessionId}
  // `)

  return await Session.update({_id: sessionId, user_id: userId}, {$set: {logged_out_at: Date.now()}});
}

exports.hideMessage = async function (messageId) {
  assert(messageId)
  // return pool.query(sql`
  //   UPDATE messages
  //   SET is_hidden = true
  //   WHERE id = ${messageId}
  // `)

  return await Message.update({_id: messageId}, {$set: {is_hidden: true}});
}

exports.getMessageById = async function (messageId) {
  assert(messageId)
  // return pool.one(sql`
  //   SELECT *
  //   FROM messages
  //   WHERE id = ${messageId}
  // `)

  return await Message.findOne({_id: messageId});
}

// //////////////////////////////////////////////////////////

exports.updateUser = async function (userId, fields) {
  //assert(Number.isInteger(userId))
  const WHITELIST = ['email', 'role']
  assert(Object.keys(fields).every((key) => WHITELIST.indexOf(key) > -1))
  // const string = knex('users')
  //   .where({ id: userId })
  //   .update(fields)
  //   .returning('*')
  //   .toString()
  // return pool.one(_raw`${string}`)

  return await User.update({_id: userId}, {$set: fields});
}

// //////////////////////////////////////////////////////////

exports.updateMessage = async function (messageId, fields) {
  //assert(Number.isInteger(messageId))
  const WHITELIST = ['is_hidden', 'markup']
  assert(Object.keys(fields).every((key) => WHITELIST.indexOf(key) > -1))
  // const string = knex('messages')
  //   .where({ id: messageId })
  //   .update(fields)
  //   .returning('*')
  //   .toString()
  // return pool.one(_raw`${string}`)

  return await Message.update({_id: messageId}, {$set: fields});
}

// //////////////////////////////////////////////////////////

exports.getMessages = async function (page) {
  page = page || 1
  assert(Number.isInteger(page))
  const perPage = config.MESSAGES_PER_PAGE
  const offset = (page - 1) * perPage
  const limit = perPage
  // return pool.many(sql`
  //   SELECT
  //     m.*,
  //     to_json(u.*) AS "user"
  //   FROM messages m
  //   LEFT OUTER JOIN users u ON m.user_id = u.id
  //   ORDER BY m.id DESC
  //   OFFSET ${offset}
  //   LIMIT ${limit}
  // `)

  let msgs = await Message.cfind({}).sort({created_at: -1}).skip(offset).limit(limit).exec();
  return await Promise.all(msgs.map(async msg => {
    msg.user = await User.findOne({_id: msg.user_id});
    return msg;
  }));
}

// //////////////////////////////////////////////////////////

// Returns Int
exports.getMessagesCount = async function () {
  // const {count} = await pool.one(sql`
  //   SELECT COUNT(*) AS "count"
  //   FROM messages
  //   WHERE is_hidden = false
  // `)
  // return count

  return await Message.count({is_hidden: false});
}

// //////////////////////////////////////////////////////////

// Returns Int
exports.getUsersCount = async function () {
  // const {count} = await pool.one(sql`
  //   SELECT COUNT(*) AS "count"
  //   FROM users
  // `)
  // return count

  return await User.count({});
}

// //////////////////////////////////////////////////////////

// TODO: user.messages_count counter cache
// TODO: idx for is_hidden
exports.getUsers = async function (page) {
  page = page || 1
  assert(Number.isInteger(page))
  const perPage = config.USERS_PER_PAGE
  const offset = (page - 1) * perPage
  const limit = perPage
  // return pool.many(sql`
  //   SELECT
  //     u.*,
  //     (
  //       SELECT COUNT(*)
  //       FROM messages
  //       WHERE user_id = u.id AND is_hidden = false
  //     ) AS messages_count
  //   FROM users u
  //   ORDER BY u.id DESC
  //   OFFSET ${offset}
  //   LIMIT ${limit}
  // `)

  let users = await User.cfind({}).sort({created_at: -1}).skip(offset).limit(limit).exec();
  return await Promise.all(users.map(async user => {
    user.messages_count = await Message.count({user_id: user._id, is_hidden: false});
    return user;
  }));
}

// //////////////////////////////////////////////////////////
