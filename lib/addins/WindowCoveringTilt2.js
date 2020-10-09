//START
var HandlerPattern = require('./handlerpattern.js');
var log = require('debug')('WindowCoveringTilt2');

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

			} else if (newValue > 80){
				this.myAPI.knxWrite("TargetPosition", 0, "DPT1"); // send the new position to the KNX bus

			}
            else if (newValue == 50){
				this.myAPI.knxWrite("HoldPosition", 1, "DPT1"); // send the new position to the KNX bus

			}

			

		} 
		
	} // onHKValueChange
} // class	
module.exports=	WindowCoveringTilt2;

//END