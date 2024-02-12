
let currentSong = new Audio();
let songs;
let currfolder;

async function getSongs(folder) {
    currfolder = folder;
    let a = await fetch(`http://127.0.0.1:3000/${currfolder}/`);
    let response = await a.text();
    // console.log(response);
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${currfolder}/`)[1]);
        }
    }

    //Adding the songs to list
    let songsUL = document.querySelector(".song_list").getElementsByTagName("ul")[0];
    songsUL.innerHTML = "";
    for (const song of songs) {
        songsUL.innerHTML = songsUL.innerHTML + `<li>
        <img class="filter" src="Assets/Images/music.svg" alt="">
        <div class="info">
            ${song.replaceAll("%20", " ")}
        </div>
        <div class="playNow flex">
            <span>Play Now</span><img class="filter" src="Assets/Images/play2.svg" alt="">
        </div>
    </li>`;
    }
    //Adding event listener to each song
    Array.from(document.querySelector(".song_list").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", () => {
            // console.log(e.querySelector(".info").innerHTML);
            playMusic(e.querySelector(".info").innerHTML.trim());
            play.querySelector("img").src = "Assets/Images/pause.svg";
            document.querySelector(".songInfo").innerHTML = e.querySelector(".info").innerHTML.replace(".mp3", "");
        })
    });

    return songs;
}

function playMusic(track) {
    currentSong.src = `/${currfolder}/` + track;
    console.log(currentSong.src);
    document.querySelector(".songInfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"
    currentSong.play();
}

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

//For displaying albums
async function displayAlbum(){
    let a = await fetch("http://127.0.0.1:3000/Songs/");
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let cardsContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchors);
    for (let i = 0; i < array.length; i++) {
        const e = array[i];
        if(e.href.includes("/Songs")){
            let folder = e.href.split("/").slice(-2)[0];
            //Getting metadata
            let x = await fetch(`http://127.0.0.1:3000/Songs/${folder}/info.json`);
            let resp = await x.json();
            cardsContainer.innerHTML = cardsContainer.innerHTML + `<div data-folder ="${folder}" class="card">
            <div class="imagePart">
                <img src="/Songs/${folder}/cover.jpeg" alt="Cover">
                <div class="play_hover">
                    <div class="circle">
                        <img src="Assets/Images/play_effect.svg" alt="Play">
                    </div>
                </div>
            </div>
            <div class="playlistTitle">
                <h4>${resp.title}</h4>
            </div>
            <div class="playlistDesc">${resp.description}</div>
        </div>`
        }
    }

    //Add event listeners to albums
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item=>{
            console.log(`Songs/${item.currentTarget.dataset.folder}`);
            songs = await getSongs(`Songs/${item.currentTarget.dataset.folder}`);
            playMusic(songs[0]);
            play.querySelector("img").src = "Assets/Images/pause.svg"
        })
    });
}

async function main() {
    await getSongs("Songs/Chill");
    currentSong.src = `/${currfolder}/` + songs[0].trim();
    document.querySelector(".songInfo").innerHTML = songs[0].replace(/\.mp3|%20/g, " ");
    document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;

    displayAlbum();

    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.querySelector("img").src = "Assets/Images/pause.svg"
        }
        else {
            currentSong.pause();
            play.querySelector("img").src = "Assets/Images/play.svg"
        }
    })

    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
        document.querySelector(".circleSeek").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })

    //Adding event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let perc = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        console.log(perc);
        document.querySelector(".circleSeek").style.left = perc + "%";
        currentSong.currentTime = (perc / 100) * currentSong.duration;
    })

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = 0;
    })

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = -125 + "%";
    })

    //Event Listener for previous button
    previous.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        console.log(index);
        if (index > 0) {
            playMusic(songs[index - 1]);
            play.querySelector("img").src = "Assets/Images/pause.svg"
        }
    })

    //Event Listener for next button
    next.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        console.log(index);
        if (index < songs.length - 1) {
            playMusic(songs[index + 1]);
            play.querySelector("img").src = "Assets/Images/pause.svg";
        }
    })

    //Adjusting volume range
    document.querySelector(".volume").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log(parseInt(e.target.value));
        currentSong.volume = parseInt(e.target.value) / 100;
        if (e.target.value == 0) {
            document.querySelector(".volume").querySelector("img").src = "Assets/Images/mute.svg";
        }
        else {
            document.querySelector(".volume").querySelector("img").src = "Assets/Images/volume.svg";
        }
    })

    document.querySelector(".volume>img").addEventListener("click", e =>{
        if(document.querySelector(".volume>img").src.includes("volume.svg")){
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("volume.svg","mute.svg");
            document.querySelector(".volume").getElementsByTagName("input")[0].value = 0;
            currentSong.volume = 0;
        }
        else{
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("mute.svg","volume.svg");
            document.querySelector(".volume").getElementsByTagName("input")[0].value = 10;
            currentSong.volume = 0.1;
        }
    })

}

main()