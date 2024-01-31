// Music features
const COUNT = 10;
const [dark, light, middle] = [1.0, 0.1, 0.5];
const rnd = Math.random
const array = length => Array.from({length}, rnd);
const numbers = (from, length) => Array.from({length}, (_,i ) => from + i);
const rndin = (s = 0, e = s) => (s = (+(s !== e) * s), s + Math.floor(rnd() * (e - s + 1)));
const rndcol = () => rndin(255);
const rgba = (a=dark, r=rndcol(), g=rndcol(), b=rndcol()) => `rgba(${r},${g},${b},${a})`;
const T = m => Array.from(m[0], (_, i) => Array.from(m, (_, j) => m[j][i]));
const none = undefined;
const vowels = "aeieoeau";
const consonants = "qwmrtzpmsdfnnghjkhrgnsltydnxrnmfcdvdcbnmn";
const word = (length, m = 1) => Array.from({length}, (_, i) =>
             (((i + m) % 2) && consonants.charAt(rndin(consonants.length-1))) || vowels.charAt(rndin(vowels.length-1))
       ).join('');
const sentence = (arr) => arr.map(v => word(v, rndin(1, arr.length))).join(' ').replace(/[ ]+/g, ' ')
 
const features = [
       "danceability", "energy","valence","tempo","instrumentalness","loudness",
       "acousticness","speechiness","mode","key","liveness","time_signature"
];
const colors = features.map(_ => ({border:rgba(), hover:rgba(), background:rgba()}));
const time_range = ["short_term", "medium_term", "long_term"];
 
// Loads dataset
const loadDatasets = (features, n) => ({
    borderColor: colors.map(b => b.border),
    borderSkipped: false,
    backgroundColor: colors.map(b => b.background),
    
    // Array with all features of a song
    data: array(features.length),
   
    // For hover effect
    hoverBorderWidth: 3,
    hoverBorderColor: colors.map(b => b.background),
    hoverBackgroundColor: colors.map(b => b.background.replace(/[^,]+(?=\))/, 0.7)),
   
    // Own data & functions
    imgs: [], // Uploaded images
    title: sentence(Array.from({length:rndin(1, 10)}, (_, i) => rndin((i + 1) % 3, 9))), // Title of the song
    setAlpha: function(a, b) { this.backgroundColor[b] = this.backgroundColor[b].replace(/[^,]+(?=\))/, a) }, // hover
});
 
const allSongs = Array.from({length: 99}, (_, i) => loadDatasets(features, i + 1));
allSongs.unshift(Object.assign(loadDatasets(features, 0),
       {title: 'All songs', data: allSongs.reduce((a, d) => a.map((v, i) => d.data[i]/allSongs.length + v), Array.from(features, () => 0))}));
const datasets = [allSongs[0]];
 
const test = (...args) => console.log(...args);
const menu = document.getElementById("contextMenu");
const imageinput = document.getElementById("imageinput");
const info = document.getElementById("pageInfo");
 
const chart = new Chart("myChart", {
  type: "bar",
  data: { labels: features, datasets, current: { _datasetIndex: 0 } },
  options: {
    responsive: true, animation: { duration: 0 },
    title: { display: true, text: 'A brief history of Time'} ,
    scales: {
      xAxes: [{display: true, gridLines: { display: false }, scaleLabel: { display: true, labelString: 'All Songs' }, ticks: {autoSkip: false} }],
      yAxes: [{display: true, gridLines: { display: false }, scaleLabel: { display: true, labelString: 'Measures' }, ticks: {autoSkip: false, beginAtZero: true, max: 1 } }],
       },
       legend: { display: false},
 
 
      
       onClick: function (evt, [_chart = {}]) {
         const {_index} = _chart;
         const [dataset, feature] = [this.data.datasets[0], this.data.labels[_index]];
         chart.data.current._index = _index;
         console.log('options.onClick', evt, chart.data.current, _chart, this);
    },
    onContextmenu: function (evt, {_index = undefined} = {}) {
      evt.preventDefault();
      evt.stopPropagation();
      const {x, y, display = 'block'} = evt.target.getBoundingClientRect();
      const left = parseInt(evt.pageX) + 'px';
      const top = parseInt(evt.pageY - y) + 'px';
      Object.assign(menu.style, {left, top, display});
      chart.data.current._index = _index;
      console.log('options.onContextmenu', evt, chart.data.current, {x, y, left, top});
      return false; 
    },
    onMousedown: function (evt, item) {
      menu.style.display = "none";
    },
    onMouseout: function (evt) {
         const {_datasetIndex, _index} = chart.data.current;
    },
    onHover: function(evt, [_chart = {}]) {
         const {_index} = _chart;
         if (chart.data.datasets[0].imgs[_index]) {
           chart.canvas.style.backgroundImage = chart.data.datasets[0].imgs[_index];
         }
         //console.log('options.onHover', evt, items, _chart, _datasetIndex, _index, this);
       },
       onImageChange: function(evt, f) {
         const load = img => (chart.canvas.style.backgroundImage = img, img);
         const {_index, value = evt.target.value} = chart.data.current;
         const fr = new FileReader();
      fr.onload = (e) => chart.data.datasets[0].imgs[_index] = load(`url('${e.target.result}')`);
      fr.readAsDataURL(f);
         //console.log('options.onImageChange', evt, _datasetIndex, _index);
       },
       onPage(evt) {
         let { _datasetIndex } = chart.data.current;
         const [regex, value] = [/\s*[+-]/g, evt.target.value];
         const [offset, i, last] = [regex.test(value), parseInt(value.replace(/\s*/g, '')), allSongs.length - 1];
         if (offset) _datasetIndex += i; else _datasetIndex = i;
         (_datasetIndex < 0 && (_datasetIndex = 0)) || (_datasetIndex > last && (_datasetIndex = last))
         chart.data.datasets[0] = allSongs[_datasetIndex];
         chart.data.current._datasetIndex = _datasetIndex;
         this.scales.xAxes[0].scaleLabel.labelString = chart.data.datasets[0].title;
         chart.canvas.style.backgroundImage = chart.data.datasets[0].imgs[undefined] || "";
         info.value = `${_datasetIndex} / ${last}`;
         chart.update();
       }
  }
});

 
chart.canvas.addEventListener('contextmenu', (evt) =>
       chart.options.onContextmenu(evt, chart.getElementAtEvent(evt)[0])
, false);
chart.canvas.addEventListener('mouseout', (evt) =>
       chart.options.onMouseout(evt)
, false);
chart.canvas.addEventListener('mousedown', (evt) =>
       chart.options.onMousedown(evt, chart.getElementAtEvent(evt)[0])
, false);
menu.addEventListener('click', (evt) => menu.style.display = "none", false);
imageinput.addEventListener('change', (evt) =>
       chart.options.onImageChange(evt, evt.target.files[0])
, false);
Array.from(document.querySelectorAll(".navigation input[type='radio']"), input =>
  input.addEventListener('click', (evt) => chart.options.onPage(evt), false)
);