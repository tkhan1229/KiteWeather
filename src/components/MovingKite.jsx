import React, { Component } from "react";

class MoveKite extends Component {
  render() {
    const { isOkToFly } = this.props;
    return (
      <>
        <div>
          <img
            className={isOkToFly ? "kiteCSS moveK" : "kiteCSS"}
            src={
              isOkToFly
                ? require("../assets/graphics/greenKite.png")
                : require("../assets/graphics/greyKite.png")
            }
            alt="green kite"
          />
        </div>
      </>
    );
  }
}

export default MoveKite;
