const rp = require('request-promise');
const Gif = require('./models/gif')

exports.crawlGif = async () => {
    try {
        //http://platform.sina.com.cn/slide/album?app_key=2733610594&format=json&ch_id=77&num=200&page=1

        var data = await rp('http://api.slide.news.sina.com.cn/interface/api_album.php?ch_id=77&num=200&page=1');
        var gifs = JSON.parse(data);
        if (gifs.status.code == '0') {

            await Gif.remove({}, { multi: true });

            for (var gif of gifs.data) {
                var p = gif.img_url.split('/'),
                    q = p.length;
                var imgSrc = "http://storage.slide.news.sina.com.cn/slidenews/77_ori/" + p[q - 2] + "/" + p[q - 1];

                await Gif.insertGif({
                    id: gif.id,
                    name: gif.name,
                    img_src: imgSrc
                });
            }
        }
    } catch (error) {

    }
};

exports.crawlAbc = async () => {

    var options = {
        uri: 'https://openbank.abchina.com/WXX_Inner/api/GetShopInfo/GetCouponByLatAndLng',
        headers: {
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 9_3 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Mobile/13E233 MicroMessenger/6.6.6 NetType/WIFI Language/zh_CN'
        },
        method: 'POST',
        json: true,
        body: {
            lng: 114.07,
            lat: 22.62
        }
    };
    try {
        return await rp(options);
    } catch (error) {
        return error;
    }
};