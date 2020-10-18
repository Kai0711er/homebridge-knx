//START
var HandlerPattern = require('./handlerpattern.js');
var log = require('debug')('WindowCoveringTilt2');
var movingDir = 0; // 0=down 1=up
var closingTime;
var openingOffset;
var secsDownPerCent;
var secsUpPerCent;

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
                    console.log("Times:" + closingTime + " " + openingOffset);
                    
                    //closed
                    if(newValue == 0){
                        this.myAPI.knxWrite("TargetPosition", 1, "DPT1"); // send the new position to the KNX bus
                        this.myAPI.setValue("TargetPosition", 0); // top position, so home shows closing
                        this.myAPI.setValue("PositionState", 0); // down?
                        this.myAPI.setValue("CurrentPosition", 0);
				        movingDir = 0;
                    }
                    //open
                    else if(newValue == 100){
                        this.myAPI.knxWrite("TargetPosition", 0, "DPT1"); // send the new position to the KNX bus
                        this.myAPI.setValue("TargetPosition", 100); // top position, so home shows "opening"
                        this.myAPI.setValue("PositionState", 1); //up?
                        this.myAPI.setValue("CurrentPosition", 100);
                        movingDir = 1;
                    }
                    else if(oldValue != null){

                        // moving down
                        if(newValue < oldValue){
                            var movingPerCentDown = oldValue - newValue;
                            var totalMilisToMoveUp = movingPerCentDown * secsDownPerCent *1000;
                            console.log("Moving " + totalMilisToMoveUp + "ms down...");
                            console.log("Moving " + movingPerCentDown + "% down...");
                            this.movingDownKNX();
                            this.myAPI.setValue("TargetPosition", newValue); // top position, so home shows closing
                            setTimeout(() => {
                                this.myAPI.knxWrite("HoldPosition", 1, "DPT1"); // send the new position to the KNX bus
                                console.log("KNX stop!");
                                this.myAPI.setValue("PositionState", 0); // down?
                                this.myAPI.setValue("CurrentPosition", newValue);
                              },totalMilisToMoveUp)
                        }

                        // moving up
                        else if(newValue > oldValue){
                            var movingPerCentUp = newValue - oldValue;
                            var totalMilisToMoveUp = movingPerCentUp * secsUpPerCent *1000;
                            console.log("Moving " + totalMilisToMoveUp + "ms up...");
                            console.log("Moving " + movingPerCentUp + "% up...");
                            this.movingUpKNX();
                            this.myAPI.setValue("TargetPosition", newValue); // top position, so home shows "opening"
                            setTimeout(() => {
                                this.myAPI.knxWrite("HoldPosition", 1, "DPT1"); // send the new position to the KNX bus
                                console.log("KNX stop!");
                                this.myAPI.setValue("PositionState", 1); //up?
                                this.myAPI.setValue("CurrentPosition", newValue);
                            },totalMilisToMoveUp)
                        }

                        // not moving
                        else if(newValue == oldValue){
                            
                        }
                    }
                }

        } // onHKValueChange

        onServiceInit(){
            closingTime = this.myAPI.getLocalConstant("closingTime");
            openingOffset = this.myAPI.getLocalConstant("openingOffset");
            secsDownPerCent = closingTime / 100; // will be float
            secsUpPerCent = (closingTime+openingOffset)/100; // will be float
        }

        movingDownKNX(){
            this.myAPI.knxWrite("TargetPosition", 1, "DPT1"); // send the new position to the KNX bus
            console.log("KNX down!");
        }

        movingUpKNX(){
            this.myAPI.knxWrite("TargetPosition", 0, "DPT1"); // send the new position to the KNX bus
            console.log("KNX up!");
        }

        stopKNX(){
            this.myAPI.knxWrite("HoldPosition", 1, "DPT1"); // send the new position to the KNX bus
            console.log("KNX stop!");
        }

} // class

module.exports= WindowCoveringTilt2;

//END