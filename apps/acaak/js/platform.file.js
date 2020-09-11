if (!window.platform) var platform = {}

platform.file = {
	writeFile: function (fileEntry, dataObj) {
		// Create a FileWriter object for our FileEntry (log.txt).
		fileEntry.createWriter(function (fileWriter) {

			fileWriter.onwriteend = function() {
				console.log("Successful write to file " + fileEntry.fullPath);
			};

			fileWriter.onerror = function (e) {
				console.log("Failed file write: " + e.toString());
			};

			// If data object is not passed in,
			// create a new Blob instead.
			if (!dataObj) {
				dataObj = new Blob([''], { type: 'text/plain' });
			}

			fileWriter.write(dataObj);
		});
	},
	
	readFile: function(fileEntry, onRead) {
		fileEntry.file(function (file) {
			var reader = new FileReader();

			reader.onloadend = function() {
				console.log(fileEntry.fullPath, this.result);
				onRead(this.result)
			};

			reader.readAsText(file);

		}, function(){ console.log('error reading file', fileEntry) });
	},
	
	existsPersistentDirectory: function(dirName, setResult){
		window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fs) {
			fs.root.getDirectory(dirName, { create: false, exclusive: false }, function(dirEntry) {
				setResult(dirEntry)
			}, function(){ 
				setResult(false, 'Fail processing directory ' + dirName)
			})
		}, function(){ setResult(null, 'Error loading file system') })
	},
	
	makePersistentDirectory: function(dirName, setResult){
		window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fs) {
			fs.root.getDirectory(dirName, { create: true, exclusive: false }, function(dirEntry) {
				setResult(dirEntry)
			}, function(){ 
				setResult(false, 'Fail creating directory ' + dirName)
			})
		}, function(){ setResult(null, 'Error loading file system') })
	},
	
	readPersistentDirectoryEntries: function(dirName, setResult){
		window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fs) {
			fs.root.getDirectory(dirName, { create: false, exclusive: false }, function(dirEntry) {
				dirEntry.createReader().readEntries(function(entries) {
					setResult(entries)
				}, function(){
					setResult(null, 'Error reading directory ' + dirName)
				})
			}, function(){ 
				setResult(false, 'Directory not found ' + dirName)
			})
		}, function(){ setResult(null, 'Error loading file system') })
	},
	
	existsPersistentTextFile: function(fileName, setResult) {
		window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fs) {
			fs.root.getFile(fileName, { create: false, exclusive: false }, function(fileEntry) {
				setResult(fileEntry)
			}, function(){ 
				setResult(false, 'File not found')
			})
		}, function(){ setResult(null, 'Error loading file system') })
	},
	
	writePersistentTextFile: function(fileName, data, setResult) {
		let me = this
		window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fs) {
			fs.root.getFile(fileName, { create: true, exclusive: false }, function (fileEntry) {
				me.writeFile(fileEntry, data);
				setResult(fileEntry)
			}, function(){ 
				setResult(null, 'Fail creating file ' + fileName)
			});
		}, function(){ setResult(null, 'Error loading file system') })
	},
	
	readPersistentTextFile: function(fileName, setResult) {
		let me = this
		window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fs) {
			fs.root.getFile(fileName, { create: false, exclusive: false }, function (fileEntry) {
				me.readFile(fileEntry, function(result){
					setResult(result)
				})
			}, function(){ 
				setResult(false, 'File not found ' + fileName)
			})
		}, function(){ setResult(null, 'Error loading file system') })
	},
	
	deletePersistentTextFile: function(fileName, setResult) {
		window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fs) {
			fs.root.getFile(fileName, { create: false, exclusive: false }, function (fileEntry) {
				fileEntry.remove(function(){
					if (setResult) setResult(true)
				}, function(){
					if (setResult) setResult(false, 'Error deleting file ' + fileName, 'RM1')
				});
			}, function(){ 
				if (setResult) setResult(false, 'File not found ' + fileName, 'FS1')
			});
		}, function(){ if (setResult) setResult(null, 'Error loading file system', 'FS2') })
	},
}
