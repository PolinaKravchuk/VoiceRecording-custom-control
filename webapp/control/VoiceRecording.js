sap.ui.define([
	"sap/ui/core/Control",
	"sap/ui/model/json/JSONModel",
	"sap/m/Input",
	"sap/m/Button",
	"sap/m/MessageBox"
], function (Control, JSONModel, Input, Button, MessageBox) {
	"use strict";
	
	return Control.extend("demo.meetup.VoiceRecording", {
		metadata: {
			properties: {
				"audioName": "string",
				"imageSource": {defaultValue: "images/microphone.png"},
				"imageWidth": {type: "sap.ui.core.CSSSize", defaultValue: "150px"},
				"imageHeight": {type: "sap.ui.core.CSSSize", defaultValue: "170px"}
			},
			aggregations: {
				"socicons": {type: "sap.ui.core.Icon", multiple: true}
			},
			events: {
				recordFinished: {
					name: "",
					url: ""
				}
			}
		},
		
		init: function () {
			var sCssPath = jQuery.sap.getModulePath("demo.meetup","/control/css/style.css");
			jQuery.sap.includeStyleSheet(sCssPath);
			
			this._setInitialSettings();
			
		},
		
		_setInitialSettings: function () {
			this.aAudioFiles = [];
			this._aStandardControls = [];
			this.oMediaRecorder = null;
		},
		
		generateId: function (sId) {
			return "custom-voice-recording--" + sId;
		},
		
		generateClass: function (sId) {
			return "custom-voice-recording--" + sId;
		},
		
		getControlById: function(sId) {
			return sap.ui.getCore().byId(sId);
		},

		renderer: function(oRm, oControl) {
			oRm.openStart("div", oControl.generateId("control-container"));
			oRm.class(oControl.generateClass("control-container"));
			oRm.writeControlData(oControl);
			oRm.openEnd();
				
				oRm.openStart("div");
				oRm.class(oControl.generateClass("soc-toolbar"));
				oRm.openEnd();
					oControl.getSocicons().forEach(oIcon => {
						oRm.renderControl(oIcon);
					});
				oRm.close("div");
				
				oControl.renderFileNameInput(oRm);
				oControl.renderButtonsContainer(oRm);
				oControl.renderButtonsFooter(oRm);
				
			oRm.close("div");
		},
		
		onAfterRendering: function () {
			this._setStateToStopBtn(false);
			this._oControlModel = new JSONModel({
				"fileName": ""
			});
			
			this.setModel(this._oControlModel, "customModel");
			
			$("#" + this.generateId("recording-button-img")).click(() => {
				this._changeFlagState(true);
				this._setStateToStopBtn(true);
				this._startRecordAudio();
			});
		},
		
		renderFileNameInput: function (oRm) {
			var that = this;
			oRm.openStart("div");
			oRm.openEnd();
				let oInput = new Input({
					placeholder: "Enter file name...",
					value: this.getAudioName.call(this),
					liveChange: this.setAudioNameValue.bind(this)
				});
				this._aStandardControls.push(oInput);
				oRm.renderControl(oInput);
			oRm.close("div");
		},
		
		setAudioName: function(value) {
			this.setProperty("audioName", value, true);
			return this;
		},
		
		setAudioNameValue: function(oEvent) {
			this.setProperty("audioName", oEvent.getParameter("value"), true);
			return this;
		},
		
		renderButtonsContainer: function (oRm) {
			oRm.openStart("div", this.generateId("recording-buttons-container"));
			oRm.class(this.generateClass("recording-buttons-container"));
			oRm.openEnd();
				
				this.renderRecordingImgBtn(oRm);
				this.renderRecordingFlag(oRm);
				
			oRm.close("div");
		},
		
		renderRecordingImgBtn: function (oRm) {
			oRm.openStart("div", this.generateId("recording-btn-container"));
			oRm.class(this.generateClass("recording-btn-container"));
			oRm.openEnd();
					
				oRm.openStart("div", this.generateId("recording-button"));
				oRm.class(this.generateClass("recording-button"));
				oRm.openEnd();
						
					oRm.openStart("img", this.generateId("recording-button-img"));
					oRm.attr("src", this.getImageSource());
					oRm.attr("width", this.getImageWidth());
					oRm.attr("height", this.getImageHeight());
					oRm.class(this.generateClass("recording-button-img"));
					oRm.openEnd();
							
					oRm.close("img");	
						
				oRm.close("div");	
					
			oRm.close("div");
		},
		
		renderRecordingFlag: function (oRm) {
			oRm.openStart("div", this.generateId("recording-flag-container"));
			oRm.attr("width", this.getImageWidth());
			oRm.attr("width", this.getImageHeight());
			oRm.class(this.generateClass("recording-flag-container"));
			oRm.openEnd();
				
				oRm.openStart("div", this.generateId("recording-flag"));
				oRm.class(this.generateClass("recording-flag"));
				oRm.class(this.generateClass("notRec"));
				oRm.openEnd();
						
				oRm.close("div");
				
			oRm.close("div");
		},
		
		renderButtonsFooter: function (oRm) {
			oRm.openStart("div", this.generateId("footer-container"));
			oRm.class(this.generateClass("footer-container"));
			oRm.openEnd();
				
				let oStopButton = new Button ({
					text: "Stop",
					press: this.onStopPress.bind(this)
				});
				this._oStopBtn = oStopButton;
				this._aStandardControls.push(oStopButton);
				
				oRm.renderControl(oStopButton);
				
			oRm.close("div");
		},
		
		_startRecordAudio: function () {
			navigator.mediaDevices.getUserMedia({ audio: true })
			  .then(stream => {
			    this.oMediaRecorder = new MediaRecorder(stream);
			    this.oMediaRecorder.start();
			
				this._addStopListener();
    
			    this.aAudioChunks = [];
			
			    this.oMediaRecorder.addEventListener("dataavailable", event => {
			      this.aAudioChunks.push(event.data);
			    });
			  });	
		},
		
		_addStopListener: function () {
			this.oMediaRecorder.addEventListener("stop", () => {
				this._saveCancelAudioFile();
		      
		    });	
		},
		
		_saveCancelAudioFile: function () {
				Promise
					.resolve()
					.then(() => {
						return this._showConfirmation("Do you want to save this recording?", "Save confirmation")
					})
					.then(() => {
						this._saveAudioFile();	  
					})
					.catch((oError) => {
						console.log(oError);
					});	
		},
		
		_showConfirmation: function (sText, sTitle) {
			let oPromise = new Promise(function(resolve, reject) {
				MessageBox.show(sText, {
					title: sTitle,
					actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
					onClose: function (sAction) {
						if (sAction === MessageBox.Action.OK) {
							resolve();
						} else {
							var oError = new Error(MessageBox.Action.CANCEL);
							reject(oError);
						}
					}
				});	
			});	
			
			return oPromise;
		},
		
		_saveAudioFile: function () {
			const oAudioBlob = new Blob(this.aAudioChunks);
	        const sAudioUrl = URL.createObjectURL(oAudioBlob);
			let sName = this.getAudioName() || "unknown";
			
			this.fireRecordFinished({name: sName, url: sAudioUrl})
		    this.aAudioFiles.push({name: sName, url: sAudioUrl});
		},
		
		onStopPress: function (oEvent) {
			this.oMediaRecorder.stop();
			this._changeFlagState(false);
			this._setStateToStopBtn(false);
		},
		
		_setStateToStopBtn: function (bState) {
			let oBtn = this._oStopBtn;
			let sStateClass = bState ? "" : "disabled";
			
			if (sStateClass) {
				oBtn.$().addClass(this.generateClass("disabled"));
			} else {
				oBtn.$().removeClass(this.generateClass("disabled"));
			}
			oBtn.setEnabled(bState);
		},
		
		_changeFlagState:  function (bState) {
			let oFlag = $("#" + this.generateId("recording-flag"));
			let sClass = bState ? "rec" : "notRec";
			let sOldClass = !bState ? "rec" : "notRec";
			
			oFlag.addClass(this.generateClass(sClass));
			oFlag.removeClass(this.generateClass(sOldClass));
		},
		
		destroy: function () {
			Control.prototype.destroy.apply(this, arguments);
			this._oStopBtn = null;
			this.aAudioFiles = [];
			this._aStandardControls = [];
			this.oMediaRecorder = null;
			
			this._aStandardControls.forEach((oControl) => {
				oControl.destroy();
			});
		}
	});
});


