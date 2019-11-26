sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"demo/meetup/formatter/Formatter"
], function (Controller, JSONModel, Formatter) {
	"use strict";

	return Controller.extend("demo.meetup.controller.Main", {
		formatter: Formatter,
		
		onInit: function () {
			this.aFiles = [];
			this._oViewModel = new JSONModel({
				"audiofiles": []
			});
			this.getView().setModel(this._oViewModel, "viewModel");
			
		},
		  
		onRecordPress: function (oEvent) {
			if (!this.oRecordingDialog) {
				this.oRecordingDialog = sap.ui.xmlfragment("demo.meetup.view.fragments.RecordingDialog", this);
				this.getView().addDependent(this.oRecordingDialog);
			}
			
			this.oRecordingDialog.open();
		},
		  
		onAudioPress: function (oEvent) {
			var oAudioLink = oEvent.getSource();
			
			oEvent.preventDefault();
			
		  	var sAudioUrl = oAudioLink.getHref();
		  	var oAudio = new Audio(sAudioUrl);
		  	
		  	oAudio.play();
		},
		
		onRecordingFinished: function (oEvent) {
			var oParams = oEvent.getParameters();
			
			this.aFiles.push(oParams);
			
			this._oViewModel.setProperty("/audiofiles",	this.aFiles);
		},
		
		onCancelPress: function () {
			this.oRecordingDialog.close();
			// this.oRecordingDialog.destroy();
			this.oRecordingDialog = null;
		}
	});
});