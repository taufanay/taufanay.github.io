var database = {
	data: {},
	fileName: 'db.json',
	init: function(defaultData, fileName, then) {
		this.data = defaultData
		this.fileName = fileName
		
		var self = this
		// check database
		platform.file.existsPersistentTextFile(this.fileName, function(data, msg, code) {
			if (!data) {
				self.flush(function(){
					if (then) {
						console.log('Database initialized.')
						then()
					}
				})
			}
			else {
				platform.file.readPersistentTextFile(self.fileName, function(data, msg, code) {
					if (data) {
						self.data = JSON.parse(data)
						if (then) {
							console.log('Database initialized.')
							then()
						}
					}
					else alert(msg)
				})
			}
		})
	},
	flush: function(then) {
		platform.file.writePersistentTextFile(this.fileName, JSON.stringify(this.data), function(data, msg, code){
			if (data) {
				if (then) then()
			}
			else alert(msg)
		})
	},
	dump: function() {
		platform.file.readPersistentTextFile(this.fileName, function(data, msg, code) {
			if (data) {
				console.log(data)
			}
			else alert(msg)
		})
	}
}
