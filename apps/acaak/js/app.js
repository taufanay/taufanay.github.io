var app = {
	// Application Constructor
	initialize: function() {
		// Onsen UI manage cordova device ready here
		ons.ready(this.onDeviceReady);
	},

	// deviceready Event Handler
	//
	// The scope of 'this' is the event. In order to call the 'receivedEvent'
	// function, we must explicitly call 'app.receivedEvent(...);'
	onDeviceReady: function() {	
		ons.setDefaultDeviceBackButtonListener(function(event) {
			ons.notification.confirm('Do you want to close the app?', {cancelable:true}) // Ask for confirmation
				.then(function(index) {
					if (index === 1) { // OK button
						navigator.app.exitApp(); // Close the app
					}
			});
		});
		
		main()
	},
};
