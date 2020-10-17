//START
var HandlerPattern = require('./handlerpattern.js');
var log = require('debug')('WindowCoveringTilt2');
var movingDir = 0; // 0=down 1=up

class WindowCoveringTilt2 extends HandlerPattern {

        onKNXValueChange(field, oldValue, knxValue) {
                // value for HomeKit
                var newValue;

                console.log('INFO: onKNXValueChange(' + field + ", "+ oldValue + ", "+ knxValue+ ")");

        } // onBusValueChange

        onHKValueChange(field, oldValue, newValue) {
                // homekit will only send a TargetPosition value, so we do not care about (non-) potential others


                if (field === "TargetPosition") {
                        console.log('INFO: onHKValueChange(' + field + ", "+ oldValue + ", "+ newValue + ")");
                        // update the PositionState characteristic:
                        // get the last current Position
                        //var lastPos = this.myAPI.getValue("CurrentPosition");

                        if (newValue < 20) {
                                this.myAPI.knxWrite("TargetPosition", 1, "DPT1"); // send the new position to the KNX bus
                                this.myAPI.setValue("TargetPosition", 0); // top position, so home shows closing
                                this.myAPI.setValue("PositionState", 0); // down?
								this.myAPI.setValue("CurrentPosition", 0);
								movingDir = 0;
                        }
                        else if (newValue > 80){
                                this.myAPI.knxWrite("TargetPosition", 0, "DPT1"); // send the new position to the KNX bus
                                //this.myAPI.setValue("PositionState", 1) // sets HK value to open -> no infinite opening...
                                //this.myAPI.setValue("CurrentPosition", newValue); // inform homekit
                                //this.myAPI.setValue("PositionState", 2); //stopped
                                this.myAPI.setValue("TargetPosition", 100); // top position, so home shows "opening"
                                this.myAPI.setValue("PositionState", 1); //up?
                                this.myAPI.setValue("CurrentPosition", 100);
                                movingDir = 1;
                        }
                        else if (newValue == 50){
								this.myAPI.knxWrite("HoldPosition", 1, "DPT1"); // send the new position to the KNX bus
								if(movingDir == 0){
									this.myAPI.setValue("PositionState", 0); // down?
									this.myAPI.setValue("CurrentPosition", 50);
								}
								else if(movingDir == 1){
									this.myAPI.setValue("PositionState", 1); // up?
									this.myAPI.setValue("CurrentPosition", 50)
								}
                        }

                }

        } // onHKValueChange

} // class

module.exports= WindowCoveringTilt2;

//END