const schedule = require('node-schedule');
const rp = require('request-promise');
const crawl = require('./src/crawl');

const requestSelf = async ()=>{
    console.log('request self at: ' + new Date());
    await rp('https://appsc.herokuapp.com');
    await rp('https://appvv.herokuapp.com');
};

schedule.scheduleJob('30 */5 0-16 * * *', async () => {
    await requestSelf();
});

crawl.crawlGif();

schedule.scheduleJob('0 1 1,6,11 * * *', async () => {
    await crawl.crawlGif();
    console.log('crawl gif ok at: ' + new Date());
});

require('./src').start();

