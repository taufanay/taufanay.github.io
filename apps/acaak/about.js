var about = {
	init: function() {
		console.log('Init About Page')
		var page = $('#About')
		var html = ''
		
		for (let prop in cordova.file) {
			html += '<b>' + prop + '</b><br />' + encodeURI(cordova.file[prop]) + '</br >'
		}
		
		page.find('[data-js=platformInfo]').html(html)
		page.find('[data-js=versionBox]').text(env.version)
	}
}
