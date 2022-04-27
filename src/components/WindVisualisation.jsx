import React, { Component } from "react";
import { createStyles, withStyles } from "@material-ui/core/styles";

class WindVisualisation extends Component {
  // Storing canvas context in the state
  state = { context: null };

  componentDidMount = () => {
    // Initialise the canvas:
    const context = this.refs.canvas.getContext("2d");
    this.setState({ context });
  };

  // On component update, refresh the canvas content
  componentDidUpdate = () => {
    let windowWidth = window.innerWidth - 50;
    // clear the canvas before redrawing
    this.state.context.clearRect(0, 0, windowWidth, 200);
    this.drawAllComponents();
  };

  drawAllComponents = () => {
    this.drawUnits();
    this.drawWind();
  };

  // Draw the dynamic units (y represents wind speed and x represent time)
  drawUnits = () => {
    const { context } = this.state;
    const { isLoaded } = this.props;
    const HOURS_TO_DISPLAY = 9;
    // check if the API is loaded before drawing on canvas
    if (isLoaded) {
      // Drawing the hours (dynamical, from now to 24 hours later) on canvas
      context.font = "12px Helvetica";
      context.fillStyle = "rgb(255,255,255)";
      let date = new Date();
      // Getting the current time
      let hour = date.getHours();
      // Adjust x coordinate depending to the window size so that the graph
      // is suitable for any mobile screen size. 11.5 is a value
      // derived for the formula
      let xHourCoord = Math.floor(window.innerWidth / 11.5);
      for (let i = 0; i < HOURS_TO_DISPLAY; i++) {
        let tempHour = hour;
        // Add a 0 at the beginning if the hour has only one digit
        if (hour.toString().length === 1) {
          tempHour = "0" + hour.toString();
        }
        context.fillText(tempHour, xHourCoord, 190);
        xHourCoord += Math.floor(window.innerWidth / 11.5);
        // Normalise hours to the 00-24 range, taking into account we are
        // jumping by three hours
        if (hour > 20) {
          hour = hour - 21;
        } else {
          hour += 3;
        }
      }
      context.beginPath();
    }
  };

  // Draw the actual graph
  drawWind = () => {
    const {
      forecastWeather,
      isLoaded,
      windSpeedUnit,
      isOkToFly,
      sliderValue
    } = this.props;
    const { context } = this.state;

    if (isLoaded) {
      // Drawing the speed and time units on canvas
      context.font = "16px Helvetica";
      context.fillText(windSpeedUnit, 5, 12);
      context.fillText("hr", window.innerWidth - 65, 190);
      context.beginPath();
      context.font = "14px Helvetica";
      // Drawing the wind speed numbers on canvas (value are chosen dynamically
      // depending on the maximum speed value during next 24 hours)
      let maxWind = this.findMaxWind(windSpeedUnit);
      let speedY = 165;
      let canvasUnit = "0";
      for (let i = 0; i <= 2; i++) {
        context.fillText(canvasUnit, 10, speedY);
        speedY -= 65;
        if (i === 0) {
          canvasUnit = Math.floor(maxWind / 10) + 1;
          canvasUnit = canvasUnit.toString() + "0";
          canvasUnit = parseInt(canvasUnit) / 2;
          canvasUnit = canvasUnit.toString();
        }
        if (i === 1) {
          canvasUnit = Math.floor(maxWind / 10) + 1;
          canvasUnit = canvasUnit.toString() + "0";
        }
      }
      // Drawing the WindVisualisation
      let windXCoord = Math.floor(window.innerWidth / 11.5);
      let maximumUnit = Math.floor(maxWind / 10) + 1;
      maximumUnit = maximumUnit.toString() + "0";
      maximumUnit = parseInt(maximumUnit);
      let yCoord;
      let opacity = "0.3)";
      let unitSpeed;
      switch (windSpeedUnit) {
        case "KPH":
          unitSpeed = "windSpeedKPH";
          break;
        case "MPH":
          unitSpeed = "windSpeedMPH";
          break;
        case "KTS":
          unitSpeed = "windSpeedKTS";
        break;
        default:
          break;
      }

      // Representing each hour on the wind speed visualisation
      for (let i = 0; i <= 23; i++) {
        if (i === sliderValue) {
          opacity = "0.8)";
        } else if (i !== sliderValue && opacity === "0.8)") {
          opacity = "0.3)";
        }
        context.beginPath();
        context.strokeStyle = isOkToFly(i)
          ? "rgb(63, 198, 79, " + opacity
          : "rgb(255, 255, 255, " + opacity;
        yCoord = Math.floor(
          165 - 130 / (maximumUnit / forecastWeather[i][unitSpeed])
        );
        context.moveTo(windXCoord, yCoord);
        windXCoord += Math.floor(window.innerWidth / 32);

        if (i === 23) {
          context.lineTo(
            windXCoord,
            Math.floor(
              165 - 130 / (maximumUnit / forecastWeather[i][unitSpeed])
            )
          );
        }

        if (i !== 23) {
          context.lineTo(
            windXCoord,
            Math.floor(
              165 - 130 / (maximumUnit / forecastWeather[i + 1][unitSpeed])
            )
          );
        }
        context.lineTo(windXCoord, 165);
        windXCoord -= Math.floor(window.innerWidth / 32);
        context.lineTo(windXCoord, 165);
        context.lineTo(windXCoord, yCoord);
        windXCoord += Math.floor(window.innerWidth / 32);
        context.fillStyle = context.strokeStyle;
        context.fill();
        context.closePath();
        context.stroke();
      }
    }
  };

  // Find the maximum value of the wind speed for the forecast. This way, we can
  // dynamically set the Y axis values (wind speed) in the graph
  findMaxWind = speedUnit => {
    const { forecastWeather, isLoaded } = this.props;
    if (isLoaded) {
      let maxWind = 0;
      let unit;
      switch (speedUnit) {
        case "KPH":
          unit = "windSpeedKPH";
          break;
        case "MPH":
          unit = "windSpeedMPH";
          break;
        case "KTS":
          unit = "windSpeedKTS";
          break;
        default:
          break;
      }
      maxWind = forecastWeather[0][unit];
      for (let x = 1; x <= 23; x++) {
        if (forecastWeather[x][unit] > maxWind) {
          maxWind = forecastWeather[x][unit];
        }
      }
      return maxWind;
    }
  };

  render() {
    // dynamically change width of canvas depending on the mobile screen size
    let windowWidth = window.innerWidth - 50;

    return <canvas ref="canvas" width={windowWidth} height={200} />;
  }
}

const styles = createStyles({});

export default withStyles(styles)(WindVisualisation);
