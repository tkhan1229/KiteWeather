import React, { Component } from "react";
import { createStyles, withStyles } from "@material-ui/core/styles";
import { MuiThemeProvider, createMuiTheme } from "@material-ui/core/styles";

import MovingKite from "./MovingKite";
import TopBar from "./TopBar";
import Settings from "./Settings";
import GeneralData from "./GeneralData";
import LocationSearchbar from "./LocationSearchbar";
import Calendar from "./Calendar";
import WindVisualisation from "./WindVisualisation";
import Clouds from "../assets/backgrounds/clouds.png";

/* --- WEATHER API --- */
const BASE_URL = "https://api.aerisapi.com";
const FETCH_CURRENT = "observations";
const FETCH_FORECAST = "forecasts";
const CLIENT_ID = process.env.REACT_APP_CLIENT_ID;
const CLIENT_SECRET = process.env.REACT_APP_CLIENT_SECRET;
const KEYS = `client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}`;
const OPTIONS_CURRENT = `%format=json&filter=allstations&limit=1&${KEYS}`;
const OPTIONS_FORECAST = `format=json&filter=1hr&limit=23&${KEYS}`;
// Requesting only certain data to improve the speed of the response
const DATA_TO_INCLUDE = `fields=periods.dateTimeISO,periods.tempC,periods.tempF,periods.windDirDEG,periods.windSpeedKTS,periods.windSpeedKPH,periods.windSpeedMPH,periods.weatherPrimary,periods.isDay`;
const OPTIONS_CALENDAR_FORECAST = `&to=+day?&format=json&filter=1hr&limit=24&${DATA_TO_INCLUDE}&${KEYS}`;
class Main extends Component {
  state = {
    // Coordinates for query
    lat: null,
    long: null,
    // Stores an object with current weather information
    currentWeather: "",
    // Stores an object with weather information for the next 23 hours
    forecastWeather: "",
    // Indicates if we received the API data correctly
    isLoaded: false,
    isSettingsMenuOpen: false,
    // Default settings. User can change these in the Settings
    temperatureUnit: "C",
    windSpeedUnit: "KPH",
    minimumTemperature: 10,
    minimumWindSpeed: 15,
    sliderValue: 0,
    currentCity: "",
    isValidCity: true,
    selectedDate: new Date(),
    // Displays an error if users select a day too far in the future
    isForecastAvailable: true,
    listOfToggledOptions: ["daytime"]
  };

  render() {
    const { classes } = this.props;
    const {
      currentWeather,
      forecastWeather,
      isLoaded,
      isSettingsMenuOpen,
      temperatureUnit,
      windSpeedUnit,
      minimumWindSpeed,
      minimumTemperature,
      isValidCity,
      isForecastAvailable,
      selectedDate,
      sliderValue,
      listOfToggledOptions
    } = this.state;

    return (
      <MuiThemeProvider theme={theme}>
        <div className={classes.container}>
          <TopBar
            isSettingsMenuOpen={isSettingsMenuOpen}
            onRefresh={this.updateWeatherBasedOnLocation}
            onCloseSettings={this.closeSettingsMenu}
            onOpenSettings={this.openSettingsMenu}
            onSaveSettings={this.saveStateToLocalStorage}
          />

          {isSettingsMenuOpen === false ? (
            <>
              <MovingKite isOkToFly={this.checkIfCanFlyKite()} />
              <LocationSearchbar
                onSelectNewCity={this.updateCurrentCity}
                isValidCity={isValidCity}
              />
              <Calendar
                onChangeDate={this.updateSelectedDate}
                isForecastAvailable={isForecastAvailable}
                selectedDate={selectedDate}
              />
              <GeneralData
                isLoaded={isLoaded}
                currentWeather={currentWeather}
                forecastWeather={forecastWeather}
                temperatureUnit={temperatureUnit}
                windSpeedUnit={windSpeedUnit}
                onChangeSliderValue={this.updateSliderValue}
                isValidCity={isValidCity}
                isForecastAvailable={isForecastAvailable}
                sliderValue={sliderValue}
              >
                <WindVisualisation
                  forecastWeather={forecastWeather}
                  isLoaded={isLoaded}
                  windSpeedUnit={windSpeedUnit}
                  sliderValue={sliderValue}
                  isOkToFly={this.checkIfCanFlyKite}
                />
              </GeneralData>
            </>
          ) : (
            <Settings
              temperatureUnit={temperatureUnit}
              windSpeedUnit={windSpeedUnit}
              minimumWindSpeed={minimumWindSpeed}
              minimumTemperature={minimumTemperature}
              onChangeTemperatureUnit={this.changeTemperatureUnit}
              onChangeSpeedUnit={this.changeSpeedUnit}
              onChangeTemperature={this.changeminimumTemperature}
              onChangeWindSpeed={this.changeminimumWindSpeed}
              listOfToggledOptions={listOfToggledOptions}
              onToggleOptions={this.updateToggledOptions}
            />
          )}
          <img className={classes.clouds} src={Clouds} alt="clouds" />
        </div>
      </MuiThemeProvider>
    );
  }

  componentDidMount() {
    // Retrieve data from localStorage
    this.setStateFromLocalStorage();
    // add event listener to save state to localStorage  when user
    // leaves/refreshes the page
    window.addEventListener("beforeunload", this.saveStateToLocalStorage);
  }

  componentWillUnmount() {
    window.removeEventListener("beforeunload", this.saveStateToLocalStorage);
    // saves if component has a chance to unmount
    this.saveStateToLocalStorage();
  }

  // Retrieve data from localStorage and update state or use defaul values
  setStateFromLocalStorage = () => {
    const storedData = JSON.parse(localStorage.getItem("whetherwind")) || null;
    // Update state only if data is available
    if (storedData) {
      const temperatureUnit = storedData.temperatureUnit || "C";
      const windSpeedUnit = storedData.windSpeedUnit || "KPH";
      const minimumTemperature = storedData.minimumTemperature || 10;
      const minimumWindSpeed = storedData.minimumWindSpeed || 15;
      const currentCity = storedData.currentCity || "London, UK";
      const listOfToggledOptions = storedData.toggledOptions || ["daytime"];

      this.setState(
        {
          temperatureUnit,
          windSpeedUnit,
          minimumTemperature,
          minimumWindSpeed,
          currentCity,
          listOfToggledOptions
        },
        () => {
          // Fetch weather after we set the state, to make sure it's the right
          // city.
          this.fetchTodayWeather(this.state.currentCity);
        }
      );
    }
  };

  // Save data we want to store in the localStorage
  saveStateToLocalStorage = () => {
    const dataToStore = {
      temperatureUnit: this.state.temperatureUnit,
      windSpeedUnit: this.state.windSpeedUnit,
      minimumTemperature: this.state.minimumTemperature,
      minimumWindSpeed: this.state.minimumWindSpeed,
      currentCity: this.state.currentCity,
      toggledOptions: this.state.listOfToggledOptions
    };
    localStorage.setItem("whetherwind", JSON.stringify(dataToStore));
  };

  // This function queries the API, and if we receive a valid response we tidy
  // it up and store it in the state
  fetchTodayWeather = currentCity => {
    this.setState({ isLoaded: false });
    let currentWeather;
    let location;
    // If no city specified by the users
    if (!currentCity) {
      const { lat, long } = this.state;
      // If coordinates have been set, query by GPS position. Otherwise use
      // automatic position (retrieved by IP)
      location = lat === null ? ":auto" : `${lat},${long}`;
    } else {
      location = currentCity;
    }
    // Fetch data from the API, sanitize it and store it.
    // Fetch current weather
    fetch(`${BASE_URL}/${FETCH_CURRENT}/${location}?${OPTIONS_CURRENT}`)
      .then(res => res.json())
      .then(result => {
        if (!result.success) {
          console.error("Current API call failed", result.error);
        } else {
          // Update the place only if it exists in the API
          if (result.response.place) {
            currentWeather = {
              placeName: result.response.place.name,
              cityName: result.response.place.city,
              countryName: result.response.place.country,
              dateTimeISO: result.response.obDateTime,
              tempC: result.response.ob.tempC,
              tempF: result.response.ob.tempF,
              humidity: result.response.ob.humidity,
              windSpeedKTS: result.response.ob.windSpeedKTS,
              windSpeedKPH: result.response.ob.windSpeedKPH,
              windSpeedMPH: result.response.ob.windSpeedMPH,
              windDirDEG: result.response.ob.windDirDEG,
              windDir: result.response.ob.windDir,
              windGustKTS: result.response.ob.windGustKTS,
              windGustKPH: result.response.ob.windGustKPH,
              windGustMPH: result.response.ob.windGustMPH,
              weather: result.response.ob.weather,
              weatherPrimary: result.response.ob.weatherPrimary,
              windchillC: result.response.ob.windchillC,
              windchillF: result.response.ob.windchillF,
              feelsLikeC: result.response.ob.feelsLikeC,
              feelsLikeF: result.response.ob.feelsLikeF,
              isDay: result.response.ob.isDay,
              sunriseISO: result.response.ob.sunriseISO,
              sunsetISO: result.response.ob.sunsetISO,
              sky: result.response.ob.sky
            };
            this.setState({ currentWeather, isValidCity: true });
            // Fetch forecast for the next 23 hours
            fetch(
              `${BASE_URL}/${FETCH_FORECAST}/${location}?${OPTIONS_FORECAST}`
            )
              .then(res => res.json())
              .then(result => {
                if (!result.success) {
                  console.error("Forecast API call failed", result.error);
                } else {
                  const forecastWeather = result.response[0].periods;
                  // Adding the currentWeather at the beginning of the forecast array
                  forecastWeather.unshift(currentWeather);
                  this.setState({ forecastWeather, isLoaded: true });
                }
              });
          } else {
            console.error("Place not supported");
            this.setState({ isValidCity: false });
          }
        }
      });
  };

  fetchAnyDateWeather = (currentCity, date) => {
    this.setState({ isLoaded: false, isForecastAvailable: true });
    let location;
    // If no city specified by the users
    if (!currentCity) {
      const { lat, long } = this.state;
      // If coordinates have been set, query by GPS position. Otherwise use
      // automatic position (retrieved by IP)
      location = lat === null ? ":auto" : `${lat},${long}`;
    } else {
      location = currentCity;
    }
    // Fetch forecast from 00:00AM of the date specified by the user till
    // midnight. A complete 24 hours window
    fetch(
      `${BASE_URL}/${FETCH_FORECAST}/${location}?from=${date}${OPTIONS_CALENDAR_FORECAST}`
    )
      .then(res => res.json())
      .then(result => {
        if (!result.success) {
          console.error("Forecast API call failed", result.error);
        } else {
          const forecastWeather = result.response[0].periods;
          // If API returns less than 24 results (i.e. forecast not available),
          // throw an error
          if (forecastWeather.length < 24) {
            this.setState({ isForecastAvailable: false, isLoaded: true });
          } else {
            this.setState({ forecastWeather, isLoaded: true });
          }
        }
      });
  };

  // This function retrieves Users' position, then updates the state with the
  // GPS data and queries the API.
  updateWeatherBasedOnLocation = () => {
    navigator.geolocation.getCurrentPosition(
      pos => {
        this.setState({ lat: pos.coords.latitude, long: pos.coords.longitude });
        this.fetchTodayWeather();
      },
      err => {
        console.error(err);
      }
    );
  };

  closeSettingsMenu = () => {
    this.setState({ isSettingsMenuOpen: false });
  };

  openSettingsMenu = () => {
    this.setState({ isSettingsMenuOpen: true });
  };

  changeTemperatureUnit = temperatureUnit => {
    this.setState({ temperatureUnit });
  };

  changeSpeedUnit = windSpeedUnit => {
    this.setState({ windSpeedUnit });
  };

  changeminimumWindSpeed = minimumWindSpeed => {
    this.setState({ minimumWindSpeed });
  };

  changeminimumTemperature = minimumTemperature => {
    this.setState({ minimumTemperature });
  };

  updateSliderValue = sliderValue => {
    this.setState({ sliderValue });
  };

  updateCurrentCity = currentCity => {
    if (currentCity) {
      this.setState({ currentCity });
      this.fetchTodayWeather(currentCity);
      // Reset to today's date
      const TODAY = new Date();
      this.setState({ selectedDate: TODAY });
    }
  };

  updateToggledOptions = listOfToggledOptions => {
    this.setState({ listOfToggledOptions });
  };

  checkIfCanFlyKite = (index = this.state.sliderValue) => {
    const {
      minimumWindSpeed,
      minimumTemperature,
      temperatureUnit,
      windSpeedUnit,
      forecastWeather,
      isLoaded,
      listOfToggledOptions
    } = this.state;
    if (isLoaded) {
      const temperature =
        temperatureUnit === "C"
          ? forecastWeather[index].tempC
          : forecastWeather[index].tempF;
      const windSpeed =
        windSpeedUnit === "KPH"
          ? forecastWeather[index].windSpeedKPH
          : windSpeedUnit === "MPH"
          ? forecastWeather[index].windSpeedMPH
          : forecastWeather[index].windSpeedKTS;
      const flyOnlyDaytime = listOfToggledOptions.includes("daytime");
      const isDay = forecastWeather[index].isDay;

      // If user selected the "Fly in daytime only" option, need additional check
      // against isDay
      if (flyOnlyDaytime) {
        if (
          temperature >= minimumTemperature &&
          windSpeed >= minimumWindSpeed &&
          isDay
        ) {
          return true;
        }
        return false;
      } else {
        if (
          temperature >= minimumTemperature &&
          windSpeed >= minimumWindSpeed
        ) {
          return true;
        }
        return false;
      }
    }
  };

  updateSelectedDate = selectedDate => {
    if (selectedDate) {
      const date = new Date(selectedDate);
      // Format the date to correctly query the API
      const formatted_date = `${date.getFullYear()}-${date.getMonth() +
        1}-${date.getDate()}`;
      this.setState({ selectedDate });
      this.fetchAnyDateWeather(this.state.currentCity, formatted_date);
    }
  };
}
const styles = createStyles({
  container: {
    display: "flex",
    flexDirection: "column",
    textAlign: "center",
    margin: "0 auto",
    maxWidth: 600
  },
  clouds: {
    marginBottom: "0%",
    bottom: "0%",
    position: "fixed"
  }
});

const theme = createMuiTheme({
  overrides: {
    // Style the slider
    MuiSlider: {
      track: { backgroundColor: "#68bcff" },
      thumb: { backgroundColor: "#68bcff" }
    },
    // Align calendar text
    MuiInputBase: {
      input: { textAlign: "center" },
      // Change number selector (temp and wind speed) color
      root: { color: "white" }
    },
    MuiCircularProgress: {
      root: {
        // Position it at the center of the screen
        position: "absolute",
        left: "calc(50vw - 25px)",
        top: "calc(50vh - 25px)",
        // On top of every other component
        zIndex: 20
      }
    },
    MuiTypography: {
      // Change settings options colour
      body1: {
        color: "white"
      },
      colorTextSecondary: {
        color: "white"
      }
    },
    // Settings header colour
    MuiListSubheader: {
      root: {
        color: "white"
      }
    }
  },
  // Needed as soon the old typography will be deprecated
  typography: {
    useNextVariants: true
  }
});

export default withStyles(styles)(Main);
