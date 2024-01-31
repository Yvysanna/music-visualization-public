### Music Visualization Tool

This is the final GitHub repository linked to my Master Thesis Project, a music visualization tool to support self-reflection and self-expression. I am Yvette Rosanna Schröder, pursuing my Master's Degree at the University of Amsterdam. The process to this GitHub Repository is logged within a private repository. For access to the private repository, please contact me.

![visualization](image/overview.png)

The prototype is written in JavaScript, HTML and CSS. To run the prototype, nodeJS 10.1.0 is required, download it [here](https://nodejs.org/en/blog/release/v20.8.0)

run the prototype with

`http-server -S -C cert.pem -K key.pem --cors`

to start serving the application

If interaction logging is required, run the command below before starting the server

`node log.js`

NOTE! Mostly the API request fails on the first run; additionally, to access the application, you need to be registered as tester within this application owner's Spotify development dashboard.
<br><br>

The <b>questionnaire</b> directory contains scripts that were run to process, analyze and visualize data from the questionnaire. The scripts are written in Python3.11. The requirements for the scripts can be installed with 

`pip install requirements`

<b>prep.ipynb</b> is for the pre-processing of the data. For example, all unfinished responses are filtered out, the column about user’s average music listening is cleaned and participant’s location is determined based on the longitude and latitude collected during the survey.

In <b>analysis.ipynb</b>, scripts can be run to visualize some of the data or observe parts of it.

<b>codes.ipynb</b> was an approach toward counting code appearances. This approach was not followed further but the code remains part of the work that has been done.

<b>evalanalysis.ipynb</b>, contains a few scripts that can be run to visualize some of the data from the evaluation session or observe parts of it.
