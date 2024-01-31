const FEATURES = [
  "danceability", "energy","valence","instrumentalness",
  "acousticness","speechiness","liveness",
];

const categories = ["short_term", "medium_term", "long_term"];

const DATA_COUNT = FEATURES.length;
const NUMBER_CFG = {count: DATA_COUNT, min: 0, max: 100};


function calculateAverage(tracks) {
    const results = tracks.reduce((sum, track) => {
        const entry = Object.entries(track.features)
            .filter((feature) => FEATURES
            .includes(feature[0]))
            .map((feature) => feature[1] * 100);
        return sum.map((v, i) => v + entry[i]);
    }, Array.from({length: DATA_COUNT}, () => 0));
    return results.map((v) => v / tracks.length);
}

const short_data = () => calculateAverage(short_tracks);
const medium_data = () => calculateAverage(medium_tracks);
const long_data = () => calculateAverage(long_tracks);

// Data for chart
const data = {
    labels: FEATURES,
    datasets: [
      {
        label: 'short term', // Period of the song from API Request
        data: short_data(), // Audio features for a song as array from API Request
        backgroundColor: "red",
      },
      {
        label: 'medium term',
        data: medium_data(),
        backgroundColor: "green",
      },
      {
        label: 'long term',
        data: long_data(),
        backgroundColor: "blue",
      },
    ]
  };

const config = {
    type: 'bar',
    data: data,
    options: {
        plugins: {
        }
    }
}


