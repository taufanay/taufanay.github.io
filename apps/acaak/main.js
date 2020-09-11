function loadList()
{	
	var name = $('#ListSelection').val()
	var isPreset = $('#ListSelection option:selected').closest('optgroup').attr('label') == 'Presets'
	
	clearList()
	
	if (isPreset) {
		let list = []
		
		switch (name) {
		case 'Colors':
			list = [
				'Black','White','Grey',
				'Red','Pink','Brown',
				'Green','Turquoise',
				'Blue','Navy',
				'Yellow','Orange'
			]
			break
		case 'Compass':
			list = [
				'North','North East',
				'East','South East',
				'South','South West',
				'West','North West',
			]
			break
		case 'Days':
			list = [
				'Monday','Tuesday',
				'Wednesday','Thursday',
				'Friday','Saturday',
				'Sunday'
			]
			break
		case 'Dice':
			list = ['1','2','3','4','5','6']
			break
		case 'New':
			list = ['','','']
			break
		}
		
		populateList(list)
	}
	else {
		loadBookmark(name, function(list){
			populateList(list)
		})
	}
}

function saveList()
{
	var currentList = $('#ListSelection').val()
	var isPreset = $('#ListSelection option:selected').closest('optgroup').attr('label') == 'Presets'
	
	currentList = (isPreset ? '' : currentList)
	
	ons.notification.prompt('Existing name will be overridden', {cancelable:true, 'title':'Save as', defaultValue:currentList, autofocus:isPreset}).then(function(name){
		if (name) {
			saveBookmark(name, getCurrentList(true), function(success, msg, code){
				if (success) {
					addBookmarkList(name)
					$('#ListSelection optgroup[label=Bookmarks] option').filter(function(){
						return $(this).text() == name
					}).prop('selected', true)
				}
				else {
					alert(msg)
				}
			})
		}		
	})
}

function clearList()
{
	var content = $('#Options')
	content.empty()
}

function populateList(list)
{
	clearList()
	for (let i in list) {
		addOption(list[i], false)
	}
}

function deleteCurrentBookmark()
{
	var name = $('#ListSelection').val()
	var isPreset = $('#ListSelection option:selected').closest('optgroup').attr('label') == 'Presets'
	
	if (!isPreset) {
		ons.notification.confirm('Bookmark ' + helper.escapeHTML(name) +' will be deleted, are you sure?', {cancelable:true, title:"Delete Bookmark"}).then(function(index) {
			if (index === 1) {
				deleteBookmark(name, function(success, msg, code){
					$('#ListSelection optgroup[label=Bookmarks] option').filter(function(){
						return $(this).text() == name
					}).remove()
					$('#ListSelection').trigger('change')
				})
			}
		})
	}
	else {
		ons.notification.toast('Cannot delete a preset, please choose a bookmark to be deleted', {timeout:3000})
	}
}

function findBookmarkDataByName(name)
{
	for (let i in database.data.bookmarks) {
		if (database.data.bookmarks[i].name == name) {
			return database.data.bookmarks[i]
		}
	}
	
	return null
}

function deleteBookmarkDataByName(name)
{
	for (let i in database.data.bookmarks) {
		if (database.data.bookmarks[i].name == name) {
			database.data.bookmarks.splice(i, 1)
			database.flush()
			return
		}
	}
}

function saveBookmark(name, list, onResult)
{
	var bookmarkData = findBookmarkDataByName(name)
	var bookmarkDataExisted = !!bookmarkData
	
	if (!bookmarkData) {
		bookmarkData = {id:Date.now(), name:name}
	}
	
	var fileName = 'BOOKMARK/' + bookmarkData.id + '.json'
	platform.file.writePersistentTextFile(fileName, JSON.stringify(list), function(data, msg, code){
		if (data && !bookmarkDataExisted) {
			database.data.bookmarks.push(bookmarkData)
			database.flush()
		}
		
		onResult(data, msg, code)
	})
}

function loadBookmark(name, onResult)
{
	var bookmarkData = findBookmarkDataByName(name)
	
	if (!bookmarkData) {
		onResult(false, 'Bookmark not found')
	}
	
	var fileName = 'BOOKMARK/' + bookmarkData.id + '.json'
	platform.file.readPersistentTextFile(fileName, function(data, msg, code){
		if (data) {
			onResult(JSON.parse(data))
		}
		else {
			onResult(false, msg)
		}
	})
}

function deleteBookmark(name, onResult)
{
	var bookmarkData = findBookmarkDataByName(name)
	var fileName = 'BOOKMARK/' + bookmarkData.id + '.json'
	platform.file.deletePersistentTextFile(fileName, function(data, msg, code){
		deleteBookmarkDataByName(name)
		onResult(data, msg, code)
	})
}

function getCurrentList(includeEmpty=false)
{
	var list = $('#Options ons-input').map(function() {
		var onsInput = $(this)
		return onsInput.closest('ons-row').find('ons-checkbox').prop('checked')
			? onsInput.val() : ''
	}).get()
	
	return includeEmpty ? list : list.filter((v) => v.length > 0)
}

function addBookmarkList(name)
{
	var selection = $('#ListSelection')
	if (selection.find('optgroup[label=Bookmarks] option').filter(function(){
		return $(this).text() == name
	}).length == 0) {
		selection.find('optgroup[label=Bookmarks]').append('<option>' + $('<div>').text(name).html() + '</option>')
	}
}

function addOption(text='', focus=true)
{
	var content = $('#Options')
	var template = $('#OptionTemplate')
	
	content.append(template.html())
	if (text) content.find('ons-input').last().attr('value', text)

	if (focus) {
		window.setTimeout(function(){
			content.find('ons-input').last()[0]._input.focus()
		}, 100)
	}
}

function getRandomValue(values)
{
	var i = Math.floor(Math.random() * values.length);
	
	return values[i]
}

function disableControls(disabled)
{
	$('#Tab1 ons-fab').prop('disabled', disabled)
	$('#Options ons-checkbox').prop('disabled', disabled)
	$('#Options ons-input').prop('disabled', disabled)
	$('#Options ons-button').prop('disabled', disabled)
	$('#Tab1 .panel-bottom ons-button').prop('disabled', disabled)
}

function randomize()
{
	var values = getCurrentList()
	
	if (values.length < 2) {
		ons.notification.toast('Please provide at least 2 active options', {timeout:3000})
		return
	}
	
	// suffling values first
	for (var i = values.length - 1; i > 0; i--) {
		var j = Math.floor(Math.random() * (i + 1));
		var temp = values[i];
		values[i] = values[j];
		values[j] = temp;
	}
		
	var duration = 3000 // 3 seconds
	var result = $('#Result')
	disableControls(true)
	
	result.text('suffling...')
	window.setTimeout(function(){
		var interval = window.setInterval(function(){result.text(getRandomValue(values))}, 250) // show random text
		window.setTimeout(function(){
			window.clearInterval(interval)
			result.html('>>>&nbsp; <b>' + $('<div>').text(result.text()).html() + '</b> &nbsp;<<<')
			disableControls(false)
		}, duration)
	}, 500)
}

function removeOption(el)
{
	$(el).closest('ons-row').remove()
}

function start() {			
	// add bookmark list
	for (let bookmark of database.data.bookmarks) {
		addBookmarkList(bookmark.name)
	}
	
	// set default
	$('#ListSelection optgroup[label=Presets] option:contains("New")').prop('selected', true)
	$('#ListSelection').trigger('change')
}
