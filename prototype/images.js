/*SHOWS THE IMAGE OVERVIEW PREFERABLY FOR EACH MONTH LATER */

// TODO: Add API Request to do this
// "https://api.spotify.com/v1/me/top/tracks"

// "https://api.spotify.com/v1/me/top/tracks?time_range=short_term"
// "https://api.spotify.com/v1/me/top/tracks?time_range=medium_term"
// "https://api.spotify.com/v1/me/top/tracks?time_range=long_term"


// ALREADY IN USE IN SCRIPT JS
// Organize required data from tracks
const tracks = jdata.items.map(item => {
    const { id, name, duration_ms, preview_url} = item;
    return { id, name, duration_ms, preview_url,
        artists: item.artists.map(artist => artist.name),
        album: item.album.name, 
        release_date: item.album.release_date, 
        imgUrl: item.album.images[0].url};
});

// Get audio features for each track
function getAudioFeaturesSpotify(token, ids) {
    const result = await fetch("https://api.spotify.com/v1/audio-features?ids=" + ids, {
        method: "GET", headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!result.ok) {
        const error = await result.json();
        console.error('Error getting access token:', error);
        throw new Error('Error getting access token');
    }
    return await result.json();
}

function getAudioFeatures(tracks) {
    const ids = tracks.map(track => track.id).join(',');
    const audioFeatures = getAudioFeaturesSpotify(token, ids);
    return audioFeatures;
}

// tracks.forEach(track => {
//     track.imgUrl = track.album.images[0].url; // Replace 'url' with the actual property name that holds the URL
    
// });

// TODO: WORK ON THIS
// TODO: Consider small, medium and long term for this
// Create databases for each track
tracks.forEach((track, index) => {
    const imgDatabaseName = `img-${track.id}`;
    const dataDatabaseName = `data-${track.id}`;

    // Open a connection to the IndexedDB
    const request = indexedDB.open('myDatabase', 1);

    request.onerror = function(event) {
        console.log('Error opening database');
    };

    request.onupgradeneeded = function(event) {
        const db = event.target.result;

        // Create the image object store, store all urls in an array
        const imgObjectStore = db.createObjectStore(imgDatabaseName, { keyPath: 'track.id' });

        // Create the data object store
        const dataObjectStore = db.createObjectStore(dataDatabaseName, { keyPath: 'track.id' });
    };

    request.onsuccess = function(event) {
        const db = event.target.result;

        // Start a transaction
        const transaction = db.transaction([imgDatabaseName, dataDatabaseName], 'readwrite');

        // Get the image object store
        const imgObjectStore = transaction.objectStore(imgDatabaseName);

        // Get the data object store
        const dataObjectStore = transaction.objectStore(dataDatabaseName);

        // Store the image URL in the image object store
        imgObjectStore.add({ url: track.imgUrl });

        // Store the track data in the data object store
        dataObjectStore.add({ track });

        // Complete the transaction
        transaction.oncomplete = function() {
            console.log('Transaction completed');
        };

        transaction.onerror = function() {
            console.log('Transaction error');
        };

        // Close the connection to the IndexedDB
        db.close();
    };

    // Stop the loop after the first iteration for safety
    if (index === 0) {
        return;
    }
});


// Create a grid container element
const gridContainer = document.createElement('div');
gridContainer.style.display = 'grid';
gridContainer.style.gridTemplateColumns = 'repeat(5, 1fr)';
gridContainer.style.gridTemplateRows = 'repeat(4, 1fr)';
gridContainer.style.gap = '10px';

document.addEventListener('DOMContentLoaded-', function() {

    // Loop through the tracks and create grid items
    tracks.forEach(track, idx => {
        const gridItem = document.getElementByClassName('outter-grid');
        const img = document.getElementById(`img${idx + 1}`);
        const info = document.createElement('div');
        info.textContent = `${track.artists[0].name} - ${track.name}`;
        info.style.display = 'none';
        info.style.color = 'white';
        info.style.position = 'absolute';
        info.style.top = '50%';
        info.style.left = '50%';
        info.style.transform = 'translate(-50%, -50%)';
        info.style.textAlign = 'center';
        img.src = track.imgUrl;
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';
        gridItem.style.position = 'relative';
        gridItem.appendChild(img);
        gridItem.appendChild(info);
        gridItem.addEventListener('mouseover', function() {
            img.style.filter = 'brightness(50%)';
            info.style.display = 'block';
        });
        gridItem.addEventListener('mouseout', function() {
            img.style.filter = 'brightness(100%)';
            info.style.display = 'none';
        });
        gridItem.addEventListener('click', function() {
            console.log('clicked');
            // window.location.href = `./track-info.html?id=${track.id}`;
        });

        gridContainer.appendChild(gridItem);
    });

    // Append the grid container to the document body
    document.body.appendChild(gridContainer);
});