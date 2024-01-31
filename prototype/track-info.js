let currentTrack = null;

let datasets = [{data: [0.636, 0.72, 0.0432, 0.0893, 0.0178, 0.0868, 0.425], label: 'feature percentage'}];
let chart = null;

async function afterDocumentLoaded() {

    // Local file uploaded into storage
    document.getElementById("img-upload").addEventListener("change", async (ev) => {
        serverLog("User uploaded image from local storage");
        ev.preventDefault();
        const file = ev.target.files[0];
        const image = await loadImage(file);
        const imgObject = {imgNr: generateCodeVerifier(5), image}
        createGridItem(imgObject);
        currentTrack.images.push(imgObject);

        ev.target.value = '';
    });

    document.getElementById("img-url").addEventListener("change", (ev) => {
        serverLog("User uploaded image from URL");
        ev.preventDefault();
        const image = ev.target.value;
        const imgObject = {imgNr: generateCodeVerifier(5), image}
        createGridItem(imgObject);
        currentTrack.images.push(imgObject);
        ev.target.value = '';
    });
    
    chart = new Chart("tracks-audio-features", {
        type: "bar",
        data: { labels: FEATURES, datasets},
        options: {
            responsive: true, animation: { duration: 0 },
            title: { display: true, text: 'Audio Features'} ,
            plugins: {
                legend: {
                    // onClick: (e, item, legend) => {
                    //     serverLog("User modified track's audio features");
                    //     originalOnClick.call(this, e, item, legend);
                    // }
                }
            }
        }
    });
    const originalOnClick = chart.options.plugins.legend.onClick;
    chart.options.plugins.legend.onClick = (e, item, legend) => {
        serverLog("NOT IMPORTANT: User modified track's audio features");
        originalOnClick.call(chart, e, item, legend);
    }
};


function populateTrackInfo(track, message) {

    serverLog(message);


    // Populate
    const audio = document.getElementById('myAudio');
    audio.src = track.preview_url;
    const img = document.getElementById("track-image");
    img.src = track.imgUrl;
    document.getElementById("track-name").innerText = track.name;
    document.getElementById("track-artist").innerText = track.artists.join(", ");
    document.getElementById("track-album").innerText = track.album;
    const durationInMs = track.duration_ms;
    const minutes = Math.floor(durationInMs / 60000);
    const seconds = ((durationInMs % 60000) / 1000).toFixed(0);
    const formattedDuration = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    document.getElementById("track-duration").innerText = formattedDuration;
    const keyNames = ["C", "C♯/D♭", "D", "D♯/E♭", "E", "F", "F♯/G♭", "G", "G♯/A♭", "A", "A♯/B♭", "B"];
    const keyName = keyNames[track.features.key] || "unknown";
    document.getElementById("track-key").innerText = keyName; 
    document.getElementById("track-tempo").innerText = track.features.tempo; 
    document.getElementById("track-mode").innerText = track.features.mode == 0 ? "minor": "major"; 
    document.getElementById("track-signature").innerText = track.features.time_signature; 

    // Play the audio when the mouse enters the element
    img.addEventListener('mouseenter', function() {
        audio.play();
        timer = setTimeout(function() {
            serverLog("User listens to track preview in track info page");
        }, 1000); // 1000 milliseconds = 1 second
    });

    // Pause the audio when the mouse leaves the element
    img.addEventListener('mouseleave', function() {
        clearTimeout(timer);
        audio.pause();
        audio.currentTime = 0; // Optional: reset audio to the start
    });

    // Clear grid if new track displaying
    Array.from(document.getElementById("grid-container").childNodes).forEach((node) => {
        if (node.id !== "add-image") {
            node.remove();
        }
    });

    currentTrack = track; 
    const images = track.images || [];
    track.images = images;
    images.forEach(createGridItem);

    const chartElement = document.getElementById("tracks-audio-features");
    // chart.data.datasets = track.features.entries.filter((feature) => FEATURES.includes(feature.name)).map((feature) => {
    //     const {name, value} = feature;
    //     return {label: name, data: [value]};
    // });
   chart.data.datasets[0].data = Object.entries(track.features)
    .filter((feature) => FEATURES
    .includes(feature[0]))
    .map((feature) => feature[1] * 100);
    chart.update();

    document.getElementById("img-adder").style.display = "block";
}


function createGridItem(imgObject) {
    const gridItem = document.createElement('div');
    const imgNr = generateCodeVerifier(5);
    //gridItem.setAttribute("img-nr", imgNr);
    const img = document.createElement("img");
    const del = document.createElement("div");

    gridItem.imgObject = imgObject;
    img.src = imgObject.image;
    
    // Set CSS styles for the image

    gridItem.appendChild(img);
    gridItem.appendChild(del);
    imgObject.selected && gridItem.classList.add("selected");

    gridItem.addEventListener('mouseover', function() {
        img.style.filter = 'brightness(50%)';
        del.style.display = 'block';
    });
    gridItem.addEventListener('mouseout', function() {
        img.style.filter = 'brightness(100%)';
        del.style.display = 'none';
    });

    // Remove on right click
    gridItem.addEventListener('contextmenu', function(ev) {
        serverLog("User removed image from track");
        ev.preventDefault();
        currentTrack.images.splice(currentTrack.images.findIndex((img) => img.imgNr === imgObject.imgNr), 1);
        gridItem.remove();  
    });

    // Select as title img on click
    gridItem.addEventListener('click', function() {
        serverLog("User modified track's title image");
        // const imageObject = currentTrack.images.find((img) => img.imgNr === imgNr);
        // imageObject.selected = !imageObject.selected;
        // First undo selected on other element
        const prevSelected = gridItem.parentElement.querySelector(".selected");

        // Then set selected on this element
        imgObject.selected = !imgObject.selected;
        gridItem.classList.toggle("selected");
        currentTrack.displayImg = imgObject.selected ? imgObject.image : null;

        delete prevSelected?.imgObject.selected;
        prevSelected?.classList.remove("selected");
    });

    document.getElementById("grid-container").insertBefore(gridItem, document.getElementById("add-image"));
}



function loadImage(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}