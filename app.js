const schedule = require('node-schedule');
const rp = require('request-promise');
const requestSelf = async ()=>{
    console.log('request self at: ' + new Date());
    await rp('https://appsc.herokuapp.com');
};

schedule.scheduleJob('30 */5 1-17 * * *', () => {
    requestSelf();
});

const requestGif = async ()=>{
    await rp('https://appsc.herokuapp.com/test');
};

schedule.scheduleJob('0 1 1,5,11 * * *', () => {
    requestGif();
});


require('./src').start();

