const schedule = require('node-schedule');
const rp = require('request-promise');
const requestSelf = async ()=>{
    console.log('request self at: ' + new Date());
    await rp('https://appsc.herokuapp.com');
};

schedule.scheduleJob('30 */5 0-16 * * *', async () => {
    await requestSelf();
});

const crawlGif = async ()=>{
    console.log('crawl gif at: ' + new Date());
    await rp('https://appsc.herokuapp.com/test');
};

schedule.scheduleJob('0 1 1,6,11 * * *', async () => {
    await crawlGif();
    console.log('crawl gif ok at: ' + new Date());
});


require('./src').start();

