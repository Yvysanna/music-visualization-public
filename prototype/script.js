// Taken from Spotify API
// https://developer.spotify.com/documentation/web-api/howtos/web-app-profile

const clientId = NULL // Replace with your client ID
const LOCALHOST = "https://localhost:8080";

// Get the code from the URL
const params = new URLSearchParams(window.location.search);
const code = params.get("code");


// In Prototype wieder auskommentieren
const short_tracks = [];
const medium_tracks = [];
const long_tracks = [];


function serverLog(message) {
    fetch(`https://localhost:8000/${message}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'text/plain'
            },
    }).catch((error) => {
            //console.error('Error:', error);
    })
}


(async function main() {
// Redirect the user to the Spotify authorization page if the code parameter is not present

    if (!code) {
        redirectToAuthCodeFlow(clientId);
        console.log("Redirecting to Spotify authorization page...");
        serverLog("User is logging into Spotify");
    } else {
        const short_tracks_url = "https://api.spotify.com/v1/me/top/tracks?time_range=short_term&limit=50";
        const medium_tracks_url = "https://api.spotify.com/v1/me/top/tracks?time_range=medium_term&limit=50";
        const long_tracks_url = "https://api.spotify.com/v1/me/top/tracks?time_range=long_term&limit=50";
        const access_token_uri = "https://accounts.spotify.com/api/token";
        const feature_uri = "https://api.spotify.com/v1/audio-features?ids=";

        // Use the code to get an access token and fetch the user's profile
        const accessToken = await getAccessToken(clientId, code, access_token_uri);

        // Add token to local storage
        localStorage.setItem("token", accessToken); 
        await fetchTracks(accessToken, short_tracks_url, short_tracks);
        await fetchTracks(accessToken, medium_tracks_url, medium_tracks);
        await fetchTracks(accessToken, long_tracks_url, long_tracks);

        const trackArray = [];
        await fetchAudioFeatures(accessToken, feature_uri + short_tracks.map(track => track.id).join(','), trackArray);
        // Combine data from features into tracks
        short_tracks.forEach(track => {
            track.features = trackArray.splice(
                trackArray.findIndex(feature => feature.id === track.id), 1)[0];
        });

        await fetchAudioFeatures(accessToken, feature_uri + medium_tracks.map(track => track.id).join(','), trackArray);
        medium_tracks.forEach(track => {
            track.features = trackArray.splice(
                trackArray.findIndex(feature => feature.id === track.id), 1)[0];
        });

        await fetchAudioFeatures(accessToken, feature_uri + long_tracks.map(track => track.id).join(','), trackArray);
        long_tracks.forEach(track => {
            track.features = trackArray.splice(
                trackArray.findIndex(feature => feature.id === track.id), 1)[0];
        });

        serverLog("User is logged in and has fetched tracks and features");
    }

    function load() {
        // In side_by_side.js
        data.datasets[0].data = short_data();
        data.datasets[1].data = medium_data();
        data.datasets[2].data = long_data();

        const chart = new Chart('mainChart', config);
        const originalOnClick = chart.options.plugins.legend.onClick;
        chart.options.plugins.legend.onClick = (e, item, legend) => {
            serverLog("User toggled viewing audio features in chart");
            originalOnClick.call(chart, e, item, legend);
        }

        const displayPeriod = (tracks, message) => {
            serverLog(message);
            const div = document.getElementById("floating-div");
            div.innerHTML = "";
            tracks.forEach(track => {
                const img = document.createElement("img");
                img.src = track.displayImg || track.imgUrl;
                const audio = document.createElement("audio");
                audio.src = track.preview_url;
                img.addEventListener('click',() => {
                    document.getElementById("main-container").style.display = "none";
                    div.style.display = "none";
                    populateTrackInfo(track, "Viewing track info for one track from a period");
                });

                // Play the audio when the mouse enters the element
                img.addEventListener('mouseenter', function() {
                    timer = setTimeout(function() {
                        audio.play();
                        serverLog("User listens to track preview in overview");
                    }, 1000); // 1000 milliseconds = 1 second
                });

                // Pause the audio when the mouse leaves the element
                img.addEventListener('mouseleave', function() {
                    clearTimeout(timer);
                    audio.pause();
                    audio.currentTime = 0; // Optional: reset audio to the start
                });

                div.appendChild(img);
            });
            div.style.display = "grid";
        };

        const displayTopTracks = (tracks, container) => {
            const containerDiv = document.getElementById(container)
            containerDiv.innerHTML = "";
            tracks.slice(0, 4).forEach(track => {
                const img = document.createElement("img");
                img.src = track.displayImg || track.imgUrl;;
                img.addEventListener('click',() => {
                    document.getElementById("main-container").style.display = "none";
                    populateTrackInfo(track, "Viewing track info for one top-track")
                });
                containerDiv.appendChild(img);
            });
        };

        const displayAll = () => {
            displayTopTracks(short_tracks, "short-container");
            displayTopTracks(medium_tracks, "medium-container");
            displayTopTracks(long_tracks, "long-container");
        }

        document.getElementById("short-button").addEventListener('click', () => displayPeriod(short_tracks, "User viewing short-term tracks"));
        document.getElementById("medium-button").addEventListener('click', () => displayPeriod(medium_tracks, "User viewing medium-term tracks"));
        document.getElementById("long-button").addEventListener('click', () => displayPeriod(long_tracks, "User viewing long-term tracks"));
        // document.getElementById("about-button").addEventListener('click', () => {
        //     serverLog("User clicked on about button");
        //     div = document.getElementById("floating-div");
        //     div.innerHTML = "";
        //     div.style.display = "grid";
        // });

        document.getElementById("top-view").addEventListener('click', function() {
            document.getElementById("floating-div").style.display = "none";
            document.getElementById("img-adder").style.display = "none";
            document.getElementById("main-container").style.display = "block";
            displayAll();
            toggleActiveMenu(this);
        });
        document.getElementById("short-view").addEventListener('click', function() {
            document.getElementById("img-adder").style.display = "none";
            displayPeriod(short_tracks, "User viewing short-term tracks");
            toggleActiveMenu(this);
        });
        document.getElementById("medium-view").addEventListener('click', function() {
            document.getElementById("img-adder").style.display = "none";
            displayPeriod(medium_tracks, "User viewing medium-term tracks");
            toggleActiveMenu(this);
        });
        document.getElementById("long-view").addEventListener('click', function() {
            document.getElementById("img-adder").style.display = "none";
            displayPeriod(long_tracks, "User viewing long-term tracks");
            toggleActiveMenu(this);
        });

        // ADD ABOUT
        function toggleActiveMenu(el) {
            const active = el.parentNode.parentNode.getElementsByClassName("active");
            active[0].classList.remove("active");
            el.classList.add("active");
        };

        displayAll();

        // In track-info.js
        afterDocumentLoaded();
    }
    if (document.getElementById("mainChart") === null) {
        document.addEventListener("DOMContentLoaded", (ev) => {
            load();
        }, false);
    } else {
        load();
    }
})();

// Redirect to Spotify authorization page
async function redirectToAuthCodeFlow(clientId) {
    const verifier = generateCodeVerifier(128);
    const challenge = await generateCodeChallenge(verifier);

    localStorage.setItem("verifier", verifier);

    // Generate a random string for the state value
    //const state = generateCodeVerifier(128);
    //localStorage.setItem("state", state);


    const params = new URLSearchParams();
    params.append("client_id", clientId);
    params.append("response_type", "code");

    // The redirect_uri parameter is the URL that Spotify will redirect the user back to after they've authorized the application. 
    // In this case, we're using a URL that points to our local Vite dev server.
    // You need to make sure this URL is listed in the Redirect URIs section of 
    // your Spotify Application Settings in your Developer Dashboard.
    params.append("redirect_uri", `${LOCALHOST}/index.html`);
    params.append("scope", "user-read-private user-read-email user-top-read");
    params.append("code_challenge_method", "S256");
    params.append("code_challenge", challenge);
    // params.append("state", state);

    document.location = `https://accounts.spotify.com/authorize?${params.toString()}`;
    // document.location = `https://localhost:8080/index.html?${params.toString()}`;
}

function generateCodeVerifier(length) {
    let text = '';
    let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

async function generateCodeChallenge(codeVerifier) {
    const data = new TextEncoder().encode(codeVerifier);
    const digest = await window.crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

// Get access token from Spotify
async function getAccessToken(clientId, code, access_token_uri) {
    const verifier = localStorage.getItem("verifier");
    console.log("Verifier 86:" + verifier);

    const params = new URLSearchParams();
    params.append("client_id", clientId);
    params.append("grant_type", "authorization_code");
    params.append("code", code);
    params.append("redirect_uri", `${LOCALHOST}/index.html`);
    params.append("code_verifier", verifier);


    //console.log(params.toString());
    //return "Nur for Testing: Please remove this line, when productivelly used";
    
    const result = await fetch(access_token_uri, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded"},//,
        // "Authorization": "Basic " + btoa(clientId + ":" + clientSecret)},
        body: params
        // body: new URLSearchParams({
        //     client_id: clientId,
        //     grant_type: 'authorization_code',
        //     code,
        //     redirect_uri: "https://localhost:8080/index.html",
        //     code_verifier: verifier,
        //   }),
    });

    if (!result.ok) {
        const error = await result.json();
        console.error('Error getting access token:', error, params);
        throw new Error('Error getting access token');
    }
    

    const { access_token } = await result.json();
    // localStorage.setItem('access_token', access_token);
    return access_token;
}

async function fetchTracks(token, url, tracksArray) {
    localStorage.setItem("token", token); // Add token to local storage

    const result = await fetch(url, {
        method: "GET", headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!result.ok) {
        const error = await result.json();
        console.error('Error fetching tracks:', error);
        throw new Error('Error fetching tracks');
    }

    // Organize required data from tracks
    const tracks = await result.json();
    
    // Return array of track objects
    tracks.items.forEach(item => {
        const { id, name, duration_ms, preview_url} = item;
        tracksArray.push({ id, name, duration_ms, preview_url,
            artists: item.artists.map(artist => artist.name),
            album: item.album.name, 
            release_date: item.album.release_date, 
            imgUrl: item.album.images[0].url});
    });
}

// Get audio features for each track
async function fetchAudioFeatures(token, feature_uri, featureArray) {
    const result = await fetch(feature_uri, {
        method: "GET", headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!result.ok) {
        const error = await result.json();
        console.error('Error fetching audio features:', error);
        throw new Error('Error fetching audio features');
    }

    const features = await result.json();

    featureArray.length = 0; // Clear array

    features.audio_features.forEach(item => {
        const { danceability, energy, key, 
            loudness, mode, speechiness, 
            acousticness, instrumentalness, 
            liveness, valence, tempo, 
            id, duration_ms, time_signature } = item;
        featureArray.push({ danceability, energy, key, 
            loudness, mode, speechiness, 
            acousticness, instrumentalness, 
            liveness, valence, tempo, 
            id, duration_ms, time_signature });
    });
}

