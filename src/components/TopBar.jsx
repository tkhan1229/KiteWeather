import React, { Component } from "react";
import { createStyles, withStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import SettingsIcon from "../assets/icons/menu.png";
import Logo from "../assets/icons/logo.png";
import ArrowBackIcon from "@material-ui/icons/NavigateBefore";
import CheckIcon from "@material-ui/icons/Check";

class TopBar extends Component {
  state = {
    isSettingsMenuOpen: false
  };

  handleCloseSettings = () => {
    this.props.onCloseSettings();
    // Also save when close settings so that the LocationSearchbar shows
    // the current session's city, not the saved one from last session
    this.props.onSaveSettings();
    this.setState({ isSettingsMenuOpen: false });
  };

  handleOpenSettings = () => {
    this.props.onOpenSettings();
    this.setState({ isSettingsMenuOpen: true });
  };

  handleSaveSettings = () => {
    this.props.onSaveSettings();
  };

  render() {
    const { classes } = this.props;
    const { isSettingsMenuOpen } = this.state;
    return (
      <>
        <AppBar
          position="static"
          variant="dense"
          classes={{
            colorPrimary: classes.navBarColour
          }}
          className={classes.container}
        >
          <Toolbar className={classes.toolbar}>
            {/* Conditional rendering based on which component we are rendering
             */}
            {!isSettingsMenuOpen && (
              <IconButton color="inherit" aria-label="logo">
                <img src={Logo} alt="logo" className={classes.leftIcon} />
              </IconButton>
            )}
            {isSettingsMenuOpen && (
              <IconButton
                color="inherit"
                aria-label="Go back"
                onClick={this.handleCloseSettings}
              >
                <ArrowBackIcon />
              </IconButton>
            )}
            {!isSettingsMenuOpen && (
              <IconButton
                color="inherit"
                aria-label="Settings"
                onClick={this.handleOpenSettings}
              >
                <img
                  src={SettingsIcon}
                  className={classes.rightIcon}
                  alt="settings"
                />
              </IconButton>
            )}
            {isSettingsMenuOpen && (
              <IconButton
                color="inherit"
                aria-label="Save"
                onClick={this.handleSaveSettings}
              >
                <CheckIcon />
              </IconButton>
            )}
          </Toolbar>
        </AppBar>
      </>
    );
  }
}

const styles = createStyles({
  title: {
    flexGrow: 1
  },
  navBarColour: {
    backgroundColor: "transparent"
  },
  linkToSettings: {
    textDecoration: "none",
    color: "inherit",
    display: "none"
  },
  container: {
    display: "flex",
    flexDirection: "column",
    textAlign: "center",
    margin: "0 auto",
    boxShadow: "none"
  },
  toolbar: {
    justifyContent: "space-between"
  },
  leftIcon: {
    width: "1em",
    flexPosition: "flex-start"
  },
  rightIcon: {
    width: "1em",
    flexPosition: "flex-end"
  }
});

export default withStyles(styles)(TopBar);
