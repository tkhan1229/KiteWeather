import "date-fns";
import React, { Component } from "react";
import { createStyles, withStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import DateFnsUtils from "@date-io/date-fns";
import { MuiPickersUtilsProvider, DatePicker } from "material-ui-pickers";
import CalendarToday from "@material-ui/icons/CalendarToday";
import InputAdornment from "@material-ui/core/InputAdornment";

class Calendar extends Component {
  handleDateChange = date => {
    this.props.onChangeDate(date);
  };

  render() {
    const { classes, isForecastAvailable, selectedDate } = this.props;

    return (
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <Grid container className={classes.grid}>
          <DatePicker
            margin="normal"
            value={selectedDate}
            onChange={this.handleDateChange}
            error={!isForecastAvailable}
            helperText={
              isForecastAvailable
                ? null
                : "Forecast not available for this date."
            }
            InputProps={{
              disableUnderline: true,
              className: classes.text,
              endAdornment: (
                <InputAdornment>
                  <CalendarToday className={classes.icon} />
                </InputAdornment>
              )
            }}
          />
        </Grid>
      </MuiPickersUtilsProvider>
    );
  }
}
const styles = createStyles({
  grid: {
    width: "100%",
    zIndex: 5,
    justifyContent: "flex-end",
    // Moving it 6.5vw to the left to be aligned with settings and location
    position: "relative",
    right: "6.5vw",
    top: "-3vh"
  },
  icon: {
    color: "white"
  },
  text: {
    color: "white"
  }
});

export default withStyles(styles)(Calendar);
