# Kite Flying Weather Web App

A Web App designed for Kite Flyers.

```
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *  *
* Graphical User Interfaces - Group Project                                  *
* February 2019                                                              *
* Queen Mary University of London                                            *
*                                                                            *
* @Authors Alberto Morabito                                                  *
*          Nadia Goodlet                                                     *
*          Olha Lyubinets                                                    *
*          Tasnia Khan                                                       *
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *  *
```

## Get started

- Register a new account on http://aerisweather.com/ and save the Client ID and Secret for later
- Clone this repository
- `cd` to the repo and run `npm i`
- Create an `.env.local` file and add the following variables:

```
REACT_APP_CLIENT_ID=<your ID>
REACT_APP_CLIENT_SECRET=<your secret>
```

One variable per line, no spaces.

- Replace `<your ID>` with your ID, same for secret.
- Finally, to start the server run `npm start`

Frameworks used:

- React.js
- Node.js
- AerisWeather API
- Material-UI


## Overview

For this project, we started with a stakeholder analysis, followed by the creation of various design and finally proceeded with the implementation of one of them.
Our primary stakeholder is anyone interested in Kite flying as a hobby. Our app provides weather information in a simple UI, with the possibility to personalise it.

### How does it work?

The main screen displays the most important information to fly a kite: wind speed and direction, along with other weather data.
Via settings menu, it is possible to select the optimal weather conditions in which you want to fly: minimum temperature, minimum wind speed, whether you want to fly only during daytime. You can also change the units.

Once you've selected your optimal conditions (we provide some default ones), the graph on the main page will make sense:
If during the next 24 hours your conditions are met, the graph will be green and the kite will start moving. If not, everything remains gray.

You can use the slider at the bottom of the graph to display the forecast for that hour.

You can change the location and/or the date by using the controls on the top right of the app.

![weather](https://user-images.githubusercontent.com/17802955/54031224-0d98b900-41a6-11e9-974a-e88b5084e586.jpg)

