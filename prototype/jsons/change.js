const fs = require('fs');
//import { short_tracks } from './short_tracks.js';

function readJsonFile(filePath) {
    try {
        const jsonData = fs.readFileSync(filePath, 'utf8');
        const parsedData = JSON.parse(jsonData);
        return parsedData;
    } catch (error) {
        console.error(`Error reading JSON file: ${error}`);
        return null;
    }
}


function writeJsonFile(filePath, data) {
    try {
        const jsonData = JSON.stringify(data, null, 2);
        fs.writeFileSync(filePath, jsonData, 'utf8');
        console.log('Data written to file successfully.');
    } catch (error) {
        console.error(`Error writing JSON file: ${error}`);
    }
}

const res = readJsonFile('./long_tracks.js');


const modifiedRes = res.map(item => {
    if (Array.isArray(item.features)) {
        item.features = Object.assign({}, ...item.features);
    }
    return item;
});

// console.log(modifiedRes);

writeJsonFile('./long_tracks.js', modifiedRes) 

// console.log(res);