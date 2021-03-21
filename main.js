window.addEventListener('load', async(event) => {

    removeAD();
    _brand_();

    const notifycontainer = document.createElement('div');
    notifycontainer.classList.add('toasts');
    notifycontainer.id = 'toasts';
    document.querySelector('body').append(notifycontainer)

    var oldstate = 0;
    setInterval(function() {
        _brand_();
        removeAD();
        var newstate = document.querySelectorAll('div.songqueue-activity > a.download').length;
        if (newstate !== oldstate) {
            initDownload();
        }
        oldstate = newstate;
    }, 2000);

    document.getElementById('mainarea').style.padding = '0 0 0 70px';

});

async function initDownload() {
    var push_download_button = document.querySelectorAll('div.songqueue-activity > a.download')

    for (var i = 0; i < push_download_button.length; i++) {
        push_download_button[i].id = 'gaana_downloader_extension';
        push_download_button[i].removeAttribute('data-type');
        push_download_button[i].setAttribute('data-gde', '_____GDE_____');
        push_download_button[i].innerHTML = `<svg width="16" height="20" viewBox="0 0 16 20"> <g fill="none" fill-rule="evenodd"> <path d="M-4-1.995h24v24H-4z"></path> <path class="fill_path" d="M14 16.001v2H2v-2H0v2c0 1.102.896 2 2 2h12c1.104 0 2-.898 2-2v-2h-2zM7.293 13.708a.997.997 0 0 0 1.414 0l5-5A1 1 0 0 0 13 7.001h-2v-6a1 1 0 0 0-1-1H6a1 1 0 0 0-1 1v6H3a1 1 0 0 0-.707 1.707l5 5zM6 9.001a1 1 0 0 0 1-1v-6h2v6a1 1 0 0 0 1 1h.586L8 11.587 5.414 9.001H6z"></path> </g> </svg> <span>Download Now</span>`;
    }
}

document.addEventListener('click', function(event) {

    if (event.target.getAttribute("data-gde") === "_____GDE_____") {

        var all_songs_container = document.querySelectorAll('span.parentnode');
        var all_songs = [];

        for (var i = 0; i < all_songs_container.length; i++) {
            all_songs.push(JSON.parse(all_songs_container[i].innerText))
        }

        try {
            downloadSong(all_songs.find(ll => ll.id === (event.target.getAttribute("data-value").replace('song', ''))))
        } catch (err) {
            notify(`Sorry, that's an error, Try to Refresh the page !`, 'error')
        }
    }
})

async function downloadSong(song_detail) {
    try {
        notify(`Fetching ${song_detail.title} from server...`, 'info')
        const media_url = await fetchmediaURL(`ht=${await genST(song_detail.id)}&request_type=web&track_id=${song_detail.id}&quality=high&st=hls&t_o_i_origin=toiwidget&ssl=true&c=a`);

        const writer = new ID3Writer(await (await fetch(`${gaana_config.BACKEND_URL}/converter`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ "url": media_url }),
        })).arrayBuffer());

        notify(`Adding metadata into ${song_detail.title}...`, 'info')

        writer.setFrame('TIT2', song_detail.title)
            .setFrame('TPE1', [song_detail.artist.split('#')[0]])
            .setFrame('TCOM', [song_detail.artist.split('#')[0]])
            .setFrame('TALB', song_detail.albumtitle)
            .setFrame('TYER', song_detail.release_date.split(' ').pop())
            .setFrame('TCON', ['Soundtrack'])
            .setFrame('APIC', {
                type: 3,
                data: await (await fetch(`${gaana_config.BACKEND_URL}/image`, {
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ "url": song_detail.atw })
                })).arrayBuffer(),
                description: song_detail.title
            });

        writer.addTag();
        var download_blob = document.createElement('a');
        download_blob.style.display = "none"
        download_blob.href = URL.createObjectURL(writer.getBlob());
        download_blob.download = `${song_detail.title}.mp3`;
        document.body.appendChild(download_blob);
        download_blob.dispatchEvent(
            new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
                view: window
            })
        );
        notify(`${song_detail.title} has been downloaded...`, 'info')
    } catch (err) {
        notify(`Sorry, that's an error !`, 'error')
    }
};

async function genST(id) {
    var t = (document.cookie.split(" ").filter(function(c) { return /PHPSESSID=/.test(c) })[0]).split('PHPSESSID=')[1].split(';')[0];
    var a = id + "|" + t + "|03:40:31 sec";
    var i = CryptoJS.enc.Utf8.parse(a);
    return a = CryptoJS.MD5(i).toString(), a = a + t.slice(3, 9) + "="
}


function fetchmediaURL(payload) {
    var xhr = new XMLHttpRequest();
    return new Promise(function(resolve, reject) {
        xhr.withCredentials = true;
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {
                resolve((JSON.parse(xhr.responseText)).stream_path);
            }
        }
        xhr.open("POST", "https://apiv2.gaana.com/track/stream");
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
        xhr.send(payload);
    });
}

function notify(message, type) {
    const notif = document.createElement('div');
    notif.classList.add('toast');
    notif.classList.add(type);
    notif.innerText = message;
    document.getElementById('toasts').appendChild(notif);
    setTimeout(() => {
        notif.remove();
    }, 10000);
}


function removeAD() {
    var ads = document.querySelectorAll('div.right.add_block')
    for (var i = 0; i < ads.length; i++) {
        ads[i].remove()
    }

    var gwd_ad = document.querySelectorAll('[id=Gaana-Home-Top_Ads]')
    for (var i = 0; i < gwd_ad.length; i++) {
        gwd_ad[i].remove()
    }

    var bottom_ad = document.querySelectorAll('[id=bottomPlayerAds]')
    for (var i = 0; i < bottom_ad.length; i++) {
        bottom_ad[i].remove()
    }

    var page_ad = document.querySelectorAll('div.Gaana_HP_ATF_728.adunit')
    for (var i = 0; i < page_ad.length; i++) {
        page_ad[i].remove()
    }

    var overlay_ad = document.querySelectorAll('[id=adsOverlayOnPlayer]')
    for (var i = 0; i < overlay_ad.length; i++) {
        overlay_ad[i].remove()
    }

    var query_ad = document.querySelectorAll('div.queueads')
    for (var i = 0; i < query_ad.length; i++) {
        query_ad[i].remove()
    }

    var player_ad = document.querySelectorAll('div.player_ads')
    for (var i = 0; i < player_ad.length; i++) {
        player_ad[i].remove()
    }
    var ins_ad = document.querySelectorAll('._n_interstital_ads')
    for (var i = 0; i < ins_ad.length; i++) {
        ins_ad[i].remove()
    }
}

function _brand_() {
    var remove_brand = document.querySelectorAll('li.addFee_btn')
    for (var i = 0; i < remove_brand.length; i++) {
        remove_brand[i].remove()
    }

    var star_this = document.querySelectorAll('li._upgrade > a')[0]
    star_this.innerText = 'Star This'
    star_this.href = 'https://github.com/cachecleanerjeet/gaana-downloader-extension'

    var album_download = document.querySelectorAll('svg.download')
    for (var i = 0; i < album_download.length; i++) {
        album_download[i].remove()
    }

    var clearfix = document.querySelectorAll('div.activeonscroll.clearfix')
    for (var i = 0; i < clearfix.length; i++) {
        clearfix[i].remove()
    }
}