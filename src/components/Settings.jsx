import React, { Component } from "react";
import { createStyles, withStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import ListItemText from "@material-ui/core/ListItemText";
import ListSubheader from "@material-ui/core/ListSubheader";
import Switch from "@material-ui/core/Switch";
import AddIcon from "@material-ui/icons/Add";
import RemoveIcon from "@material-ui/icons/Remove";
import InputBase from "@material-ui/core/InputBase";
import ToggleButton from "@material-ui/lab/ToggleButton";
import ToggleButtonGroup from "@material-ui/lab/ToggleButtonGroup";

const maxTemperatureC = 50;
const minTemperatureC = -18;
const maxTemperatureF = 122;
const minTemperatureF = 0;
const maxSpeedKPH = 200;
const minSpeedKPH = 0;
const maxSpeedMPH = 124;
const minSpeedMPH = 0;
const maxSpeedKTS = 107;
const minSpeedKTS = 0;

class Settings extends Component {
  state = {
    checked: ["daytime"],
    windSpeed: "",
    temperature: "",
    temperatureUnit: "",
    windSpeedUnit: ""
  };

  componentDidMount = () => {
    const {
      temperatureUnit,
      windSpeedUnit,
      minimumWindSpeed,
      minimumTemperature,
      listOfToggledOptions
    } = this.props;
    this.setState({
      temperatureUnit,
      windSpeedUnit,
      windSpeed: minimumWindSpeed,
      temperature: minimumTemperature,
      checked: listOfToggledOptions
    });
  };

  // Handling array of switches
  handleToggle = value => () => {
    const { checked } = this.state;
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];

    // Add or remove from array based on toggle status
    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    this.setState({
      checked: newChecked
    });

    this.props.onToggleOptions(newChecked);
  };

  handleChangeWindSpeedWithButton = operation => () => {
    const { windSpeed } = this.state;
    const newSpeed =
      operation === "add" ? parseInt(windSpeed) + 1 : parseInt(windSpeed) - 1;
    this.updateWindSpeedValue(newSpeed);
    this.props.onChangeWindSpeed(newSpeed);
  };

  handleChangeWindSpeed = e => {
    // Replacing leading zeros with ""
    const windSpeed = e.target.value.replace(/^0+/, "");
    this.updateWindSpeedValue(windSpeed);
  };

  // Perform boundaries check before updating the wind speed value
  updateWindSpeedValue = windSpeed => {
    // If user users letters or backspace/delete as first input, show 0 rather
    // than an empty textfield
    windSpeed = windSpeed === "" ? 0 : windSpeed;
    const { windSpeedUnit } = this.state;
    switch (windSpeedUnit) {
      case "KPH":
        if (windSpeed <= maxSpeedKPH && windSpeed >= minSpeedKPH) {
          this.setState({ windSpeed });
          this.props.onChangeWindSpeed(windSpeed);
        }
        break;
      case "MPH":
        if (windSpeed <= maxSpeedMPH && windSpeed >= minSpeedMPH) {
          this.setState({ windSpeed });
          this.props.onChangeWindSpeed(windSpeed);
        }
        break;
      case "KTS":
        if (windSpeed <= maxSpeedKTS && windSpeed >= minSpeedKTS) {
          this.setState({ windSpeed });
          this.props.onChangeWindSpeed(windSpeed);
        }
        break;
      default:
        break;
    }
  };

  handleChangeTemperatureWithButton = operation => () => {
    const { temperature } = this.state;
    const newTemperature =
      operation === "add"
        ? parseInt(temperature) + 1
        : parseInt(temperature) - 1;
    this.updateTemperatureValue(newTemperature);
    this.props.onChangeTemperature(newTemperature);
  };

  handleChangeTemperature = e => {
    // Replacing leading zeros with ""
    const temperature = e.target.value.replace(/^0+/, "");
    this.updateTemperatureValue(temperature);
  };

  // Perform boundaries check before updating the temperature value
  updateTemperatureValue = temperature => {
    temperature = temperature === "" ? 0 : temperature;
    const { temperatureUnit } = this.state;
    switch (temperatureUnit) {
      case "C":
        // If temperature entered is null (letter/backspace/delete) then set it
        // to the minimum
        if (temperature <= maxTemperatureC && temperature >= minTemperatureC) {
          this.setState({ temperature });
          this.props.onChangeTemperature(temperature);
        }
        break;
      case "F":
        if (temperature <= maxTemperatureF && temperature >= minTemperatureF) {
          this.setState({ temperature });
          this.props.onChangeTemperature(temperature);
        }
        break;
      default:
        break;
    }
  };

  // When switching units, do the conversion and display updated value
  handleChangeTemperatureUnit = (e, value) => {
    if (value) {
      this.setState({ temperatureUnit: value }, () => {
        const convertedTemperature =
          this.state.temperatureUnit === "F"
            ? Math.floor((this.state.temperature * 9) / 5 + 32)
            : Math.floor(((this.state.temperature - 32) * 5) / 9);
        this.updateTemperatureValue(convertedTemperature);
        this.props.onChangeTemperatureUnit(this.state.temperatureUnit);
      });
    }
  };

  handleChangeSpeedUnit = (e, value) => {
    // map() function used in Processing. Re-mapping wind speed values as
    // approximating them with forumlas (e.g. 1 MPH * 1.602 = 1 KPH) resulted in
    // a bug where switching between speed units would increase the speed value
    // over the limit.
    function mapRange(value, low1, high1, low2, high2) {
      return low2 + ((high2 - low2) * (value - low1)) / (high1 - low1);
    }

    if (value) {
      const oldUnit = this.state.windSpeedUnit;
      this.setState({ windSpeedUnit: value }, () => {
        const { windSpeedUnit, windSpeed } = this.state;
        let convertedWindSpeed;
        if (oldUnit === "KPH" && windSpeedUnit === "MPH")
          convertedWindSpeed = mapRange(
            windSpeed,
            minSpeedKPH,
            maxSpeedKPH,
            minSpeedMPH,
            maxSpeedMPH
          );
        if (oldUnit === "KPH" && windSpeedUnit === "KTS")
          convertedWindSpeed = mapRange(
            windSpeed,
            minSpeedKPH,
            maxSpeedKPH,
            minSpeedKTS,
            maxSpeedKTS
          );
        if (oldUnit === "MPH" && windSpeedUnit === "KPH")
          convertedWindSpeed = mapRange(
            windSpeed,
            minSpeedMPH,
            maxSpeedMPH,
            minSpeedKPH,
            maxSpeedKPH
          );
        if (oldUnit === "MPH" && windSpeedUnit === "KTS")
          convertedWindSpeed = mapRange(
            windSpeed,
            minSpeedMPH,
            maxSpeedMPH,
            minSpeedKTS,
            maxSpeedKTS
          );
        if (oldUnit === "KTS" && windSpeedUnit === "KPH")
          convertedWindSpeed = mapRange(
            windSpeed,
            minSpeedKTS,
            maxSpeedKTS,
            minSpeedKPH,
            maxSpeedKPH
          );
        if (oldUnit === "KTS" && windSpeedUnit === "MPH")
          convertedWindSpeed = mapRange(
            windSpeed,
            minSpeedKTS,
            maxSpeedKTS,
            minSpeedMPH,
            maxSpeedMPH
          );
        this.updateWindSpeedValue(Math.round(convertedWindSpeed));
        this.props.onChangeSpeedUnit(windSpeedUnit);
      });
    }
  };

  render() {
    const { classes, temperatureUnit, windSpeedUnit } = this.props;

    return (
      <>
        <List
          className={classes.root}
          subheader={
            <ListSubheader>Optimal weather conditions settings</ListSubheader>
          }
        >
          <ListItem>
            <ListItemText primary="Day time" secondary="Fly during day time" />
            <ListItemSecondaryAction>
              <Switch
                onChange={this.handleToggle("daytime")}
                checked={this.state.checked.indexOf("daytime") !== -1}
              />
            </ListItemSecondaryAction>
          </ListItem>
          <ListItem>
            <ListItemText
              primary={`Minimum Wind Speed in ${windSpeedUnit}`}
              secondary={
                this.state.windSpeedUnit === "KPH"
                  ? `Values between ${minSpeedKPH} ${windSpeedUnit} and ${maxSpeedKPH} ${windSpeedUnit}`
                  : this.state.windSpeedUnit === "MPH"
                  ? `Values between ${minSpeedMPH} ${windSpeedUnit} and ${maxSpeedMPH} ${windSpeedUnit}`
                  : `Values between ${minSpeedKTS} ${windSpeedUnit} and ${maxSpeedKTS} ${windSpeedUnit}`
              }
            />
            <ListItemSecondaryAction>
              <RemoveIcon
                size="small"
                onClick={this.handleChangeWindSpeedWithButton("subtract")}
              />
              {/* onFocus will select all the text. We need blur to remove the
               selection in case the user don't type anything after focussing*/}
              <InputBase
                type="number"
                value={this.state.windSpeed}
                onChange={this.handleChangeWindSpeed}
                onBlur={e => e.target.blur()}
                onFocus={e => e.target.select()}
                inputProps={{
                  style: { textAlign: "right", fontSize: "1.3em" }
                }}
                className={classes.windSpeed}
              />
              <AddIcon
                size="small"
                onClick={this.handleChangeWindSpeedWithButton("add")}
              />
            </ListItemSecondaryAction>
          </ListItem>
          <ListItem>
            <ListItemText
              primary={"Minimum Temperature in °" + this.state.temperatureUnit}
              secondary={
                temperatureUnit === "C"
                  ? `Values between ${minTemperatureC} °${temperatureUnit} and ${maxTemperatureC} °${temperatureUnit}`
                  : `Values between ${minTemperatureF} °${temperatureUnit} and ${maxTemperatureF} °${temperatureUnit}`
              }
            />
            <ListItemSecondaryAction>
              <RemoveIcon
                size="small"
                onClick={this.handleChangeTemperatureWithButton("subtract")}
              />
              <InputBase
                type="number"
                value={this.state.temperature}
                onChange={this.handleChangeTemperature}
                onBlur={e => e.target.blur()}
                onFocus={e => e.target.select()}
                inputProps={{
                  style: { textAlign: "right", fontSize: "1.3em" }
                }}
                className={classes.windSpeed}
              />
              <AddIcon
                size="small"
                onClick={this.handleChangeTemperatureWithButton("add")}
              />
            </ListItemSecondaryAction>
          </ListItem>
        </List>
        <List
          subheader={<ListSubheader>Units of measure</ListSubheader>}
          className={classes.root}
        >
          <ListItem>
            <ListItemText
              primary="Temperature"
              secondary="Celsius or Fahrenheit"
            />
            <ListItemSecondaryAction>
              <ToggleButtonGroup
                value={this.state.temperatureUnit}
                exclusive
                onChange={this.handleChangeTemperatureUnit}
              >
                <ToggleButton value="C">°C </ToggleButton>
                <ToggleButton value="F">°F </ToggleButton>
              </ToggleButtonGroup>
            </ListItemSecondaryAction>
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Speed"
              secondary="Kilometers, Miles or Knots"
            />
            <ListItemSecondaryAction>
              <ToggleButtonGroup
                value={this.state.windSpeedUnit}
                exclusive
                onChange={this.handleChangeSpeedUnit}
              >
                <ToggleButton value="KPH">KPH </ToggleButton>
                <ToggleButton value="MPH">MPH </ToggleButton>
                <ToggleButton value="KTS">KTS </ToggleButton>
              </ToggleButtonGroup>
            </ListItemSecondaryAction>
          </ListItem>
        </List>
      </>
    );
  }
}

const styles = createStyles({
  windSpeed: {
    width: "2.2em",
    margin: "0 0.5em",
    textAlign: "right",
    textSize: "1.4em"
  },
  root: {
    color: "white"
  }
});

export default withStyles(styles)(Settings);
