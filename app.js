const schedule = require('node-schedule');
const rp = require('request-promise');
const requestSelf = async ()=>{
    console.log('request self at: ' + new Date());
    await rp('https://appsc.herokuapp.com');
};

schedule.scheduleJob('30 */5 * * * *', () => {
    requestSelf();
});

require('./src').start();

