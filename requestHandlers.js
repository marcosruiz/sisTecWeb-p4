var querystring = require("querystring"),
fs = require("fs"),
formidable = require("formidable"),
mongoConnector = require("./mongoConnector"),
url = require('url');

/*
It shows a form to insert a new note and a list with the user notes
*/
function welcome(response, request){
	console.log("Request handler 'login' was called.");
	var form = new formidable.IncomingForm();
	form.parse(request, function(error, fields) {
		response.writeHead(200, {'content-type': 'text/html'});
		response.write('<!DOCTYPE html><html><body>');
		//Check data and insert into our database
		if(fields['username'] == '' | fields['password'] == '' ){
			response.write('Username and password are obligatoty fields.');
		}else{
			var user = { username: fields['username'], password: fields['password']};
			mongoConnector.findUser(fields['username'], function(err, row){
				if(err) throw err;
				var form ='Welcome Mr. '+ fields['username'] + '<br/>' +
					'<form action="/saveMemo" enctype="multipart/form-data" '+
					'method="post">'+
					'Date*: <input type="date" name="date"/><br/>' +
					'Text*: <input type="text" name="text"/><br/>' +
					'File: <input type="file" name="file" multiple="multiple"/><br/>'+
					'<input type="hidden" name="username" value="'+ fields['username'] +'"/>' +
					'<input type="hidden" name="password" value="'+ fields['password'] +'"/>' +
					'<input type="submit" value="Save note" /></form><br/>';
				if(row == null){
					//User doesnt exists, so we create a new user
					mongoConnector.insertUser(user, function(err, row){
						response.write(form);
						responseTableOfNotes(response, fields['username']);
					});
				} else{
					//User exists
					//Check password
					if(fields['password'] == row['password']){
						//Password is correct
						response.write(form);
						responseTableOfNotes(response, fields['username']);
					} else{
						//Password is not correct
						response.write('Password is not correct.');
						response.write('</body></html>');
						response.end();
					}
				}
			});
		}
});

}

/*
It writes a table of notes
*/
function responseTableOfNotes(response, username){
	mongoConnector.listNotes(username, function(err, rows){
		if(err) throw err;
		response.write('<table>');
		response.write('<tr><th>User</th><th>Id</th><th>Date</th><th>Text</th><th>File</th><th>Info</th><th>Delete</th></tr>');
		for (var i = 0; i < rows.length; i++) {
			var form = '<div><form action="/deleted" enctype="multipart/form-data" '+
				'method="post">'+
				'<input type="hidden" name="id" value="'+ rows[i]._id +'">'+
				'<input type="submit" value="Delete"></input>'+
				'</form></div>';
			response.write('<tr>');
			response.write('<td>' + rows[i].username + '</td>');
			response.write('<td>' + rows[i]._id + '</td>');
			response.write('<td>' + rows[i].date + '</td>');
			response.write('<td>' + rows[i].text + '</td>');
			response.write('<td>' + '<a href="./downloadFile?='+ rows[i]._id  +'">' + rows[i].route_file + '</a>' + '</td>');
			response.write('<td>' + '<a href="./showMemo?='+ rows[i]._id  +'">Details</a>' + '</td>');
			response.write('<td>' + form + '</td>');
			response.write('</tr>');
		};
		response.write('</table>');

		//TODO this should not be here, but...
		response.write('</body></html>');
		response.end();
	});
}

/*
It shows a form to do login
*/
function logged(response){
	console.log("Request handler 'welcome' was called.");
	var body = '<html>'+
		'<head>'+
		'<meta http-equiv="Content-Type" '+
		'content="text/html; charset=UTF-8" />'+
		'</head>'+
		'<body>'+
		'<form action="/welcome" enctype="multipart/form-data" '+
		'method="post">'+
		'Username: <input type="text" name="username"/><br/>' +
		'Password: <input type="password" name="password"/><br/>' +
		'<input type="submit" value="Login" />'+
		'</form>'+
		'</body>'+
		'</html>';

	response.writeHead(200, {"Content-Type": "text/html"});
	response.write(body);
	response.end();
}

/*
It shows a form with an obligatotry date, an obligatory text, an optional
file and a submit button witch calls to /saveMemo
*/
function setMemo(response){
	console.log("Request handler 'setMemo' was called.");

	var body = '<html>'+
		'<head>'+
		'<meta http-equiv="Content-Type" '+
		'content="text/html; charset=UTF-8" />'+
		'</head>'+
		'<body>'+
		'<form action="/saveMemo" enctype="multipart/form-data" '+
		'method="post">'+
		'Date*: <input type="date" name="date"/><br/>' +
		'Text*: <input type="text" name="text"/><br/>' +
		'File: <input type="file" name="file" multiple="multiple"/><br/>'+
		'<input type="submit" value="Save note" />'+
		'</form>'+
		'</body>'+
		'</html>';

	response.writeHead(200, {"Content-Type": "text/html"});
	response.write(body);
	response.end();
}

/*
Show a list of all notes of our database
*/
function showAllMemo(response){
	mongoConnector.listAllNotes(function(err, rows){
		if(err) throw err;
		response.writeHead(200, {'content-type': 'text/html'});
		response.write('<!DOCTYPE html><html><body>');
		response.write('<table>');
		response.write('<tr><th>Owner</th><th>Id</th><th>Date</th><th>Text</th><th>File</th><th>Info</th></tr>');
		for (var i = 0; i < rows.length; i++) {
			response.write('<tr>');
			response.write('<td>' + rows[i].username + '</td>');
			response.write('<td>' + rows[i]._id + '</td>');
			response.write('<td>' + rows[i].date + '</td>');
			response.write('<td>' + rows[i].text + '</td>');
			response.write('<td>' + '<a href="./downloadFile?='+ rows[i]._id  +'">' + rows[i].route_file + '</a>' + '</td>');
			response.write('<td>' + '<a href="./showMemo?='+ rows[i]._id  +'">Details</a>' + '</td>');
			response.write('</tr>');
		};
		response.write('</table>');
		response.write('</body></html>');
		response.end();
	});
}

/*
Show all info about a specific notes
*/
function showMemo(response, request){
	var url_parts = url.parse(request.url, true);
	var id = url_parts.query[""];
	mongoConnector.findNote(id, function(err, rows){
		if(err) throw err;
		response.writeHead(200, {'content-type': 'text/html'});
		response.write('<!DOCTYPE html><html><body>');
		if(rows.length !== 0){
			response.write('<table>');
			response.write('<tr><th>Owner</th><th>Id</th><th>Date</th><th>Text</th><th>Download</th></tr>');
			response.write('<tr>');
			response.write('<td>' + rows[0].username + '</td>');
			response.write('<td>' + rows[0]._id + '</td>');
			response.write('<td>' + rows[0].date + '</td>');
			response.write('<td>' + rows[0].text + '</td>');
			response.write('<td>' + '<a href="./downloadFile?='+ rows[0]._id  +'">' + rows[0].route_file + '</a>' + '</td>');
			response.write('</tr>');
			response.write('</table>');
		}else{
			response.write('This note does not exist. ');
		}
		response.write('</body></html>');
		response.end();
	});
}

/*
Download undefined file
*/
function downloadFile(response, request){
	console.log("Request handler 'downloadFile' was called.");
	var url_parts = url.parse(request.url, true);
	var id = url_parts.query[""];
	if(typeof id !== 'undefined'){
		mongoConnector.findNote(id, function(err, rows){
			if(err) throw err;
			if(rows.length !== 0){
				response.writeHead(200, {});
				fs.createReadStream(rows[0].route_file).pipe(response);
			} else{
				response.writeHead(200, {"Content-Type": "text/plain"});
				response.write("There was a problem with our database connection.");
				response.end();
			}
		});
	}else{
		response.writeHead(404, {"Content-Type": "text/plain"});
		response.write("404 Not found");
		response.end();
	}
}

/*
Check user credentials
*/
function checkUser(response, request, err, callback){
	//Check data and insert into our database
	var form = new formidable.IncomingForm();
	form.parse(request, function(error, fields, files){
		if(fields['username'] == '' | fields['password'] == '' ){
			var msg = "Username and password are obligatoty fields";
			err(msg);
		}else{
			var user = { username: fields['username'], password: fields['password']};
			mongoConnector.findUser(fields['username'], function(err, row){
				if(err) throw err;
				if(row == null){
					//User doesnt exists
					msg = "User doesnt exists";
					err(msg);
				} else{
					//User exists
					//Check password
					if(fields['password'] == row['password']){
						//Password is correct
						callback(response, request);
					} else{
						//Password is not correct
						var msg = "Password is not correct";
						err(msg);
					}
				}
			});
		}
	});
	callback(response,request);
}

function err(msg){
	response.writeHead(200, {"Content-Type": "text/plain"});
	response.write(msg);
	response.end();
}

/*
Save a file in ./tmp/ and save a note in our database
*/
function saveMemo(response, request){
		console.log("Request handler 'saveMemo' was called.");
		checkUser(response, request, err, checkNoteAndSave);
}

function checkNoteAndSave(response, request){
	console.log("function 'checkNoteAndSave' was called. ");
	var form = new formidable.IncomingForm();
	form.parse(request, function(error, fields, files) {
		//If there are a file it will save it
		var route = "";
		if(typeof files.file !== 'undefined'){
			if(files.file.name != ''){
				route = "./tmp/" + files.file.name;
				/* Possible error on Windows systems:
				tried to rename to an already existing file */
				fs.rename(files.file.path, route, function(error) {
					if (error) {
						fs.unlink(route);
						fs.rename(files.file.path, route);
					}
				});
			}
		}

		//Check data and insert into our database
		console.log("Username: " + fields['username']);
		if(typeof fields['date'] == 'undefined' | typeof fields['text'] == 'undefined' | fields['date'] == '' | fields['text'] == ''){
			response.writeHead(200, {'content-type': 'text/html'});
			response.write('<!DOCTYPE html><html><body>');
			response.write('Date and Text are obligatoty.');
			response.write('</body></html>');
			response.end();
		}else{
			var note = { date: fields['date'], text: fields['text'], route_file: route, username: fields['username'] };
			mongoConnector.insertNote(note, function(err, rows){
				response.writeHead(200, {'content-type': 'text/html'});
				response.write('<!DOCTYPE html><html><body>');
				if(err){
					response.write('There was a problem with our database connection.');
				} else {
					response.write('Note saved.');
				}
				response.write('</body></html>');
				response.end();
			});
		}
});
}

/*
Show a list of notes and a form to delete one of them
*/
function deleteMemo(response){
	console.log("Request handler 'deleteMemo' was called.");

	mongoConnector.listAllNotes(function(err, rows){
		if(err) throw err;
		response.writeHead(200, {'content-type': 'text/html'});
		response.write('<!DOCTYPE html><head><title>deleteMemo</title></head><html><body>');
		response.write('<table>');
		response.write('<tr><th>Owner</th><th>Id</th><th>Date</th><th>Text</th><th>File</th><th>Info</th></tr>');
		for (var i = 0; i < rows.length; i++) {

			var formButtonDelete = '<div><form action="/deleted" enctype="multipart/form-data" '+
				'method="post">'+
				'<input type="hidden" name="id" value="'+ rows[i]._id +'">'+
				'<input type="submit" value="Delete"></input>'+
				'</form></div>';

			response.write('<tr>');
			response.write('<td>' + rows[i].username + '</td>');
			response.write('<td>' + rows[i]._id + '</td>');
			response.write('<td>' + rows[i].date + '</td>');
			response.write('<td>' + rows[i].text + '</td>');
			response.write('<td>' + '<a href="./downloadFile?='+ rows[i]._id  +'">' + rows[i].route_file + '</a>' + '</td>');
			response.write('<td>' + '<a href="./showMemo?='+ rows[i]._id  +'">Details</a>' + '</td>');
			response.write('<td>' + formButtonDelete + '</td>');
			response.write('</tr>');
		};
		response.write('</table><br/>');
		response.write('</body></html>');
		response.end();
	});
}

/*
Delete the specified note
*/
function deleted(response, request){
	console.log("Request handler 'deleted' was called.");
	var id;
	var form = new formidable.IncomingForm();
	form
		.on('field', function(field, value){
			if(field == "id"){
				id = value;
			}
		})
    .on('end', function() {
			if(typeof id !== 'undefined'){
				mongoConnector.deleteNote(id, function(err, rows){
					response.writeHead(200, {'content-type': 'text/html'});
					response.write('<!DOCTYPE html><html><body>');
					if(err){
						response.write('There was a problem deleting note ' + id + '.');
					} else {
						response.write('Note ' + id + ' was deleted.');
					}
					response.write('</body></html>');
					response.end();
				});
			} else{
				response.writeHead(200, {'content-type': 'text/plain'});
				response.write('There was a problem with our database connection.');
				response.end();
			}
    });
		form.parse(request);

}

exports.setMemo = setMemo;
exports.saveMemo = saveMemo;
exports.showAllMemo = showAllMemo;
exports.showMemo = showMemo;
exports.deleteMemo = deleteMemo;
exports.deleted = deleted;
exports.downloadFile = downloadFile;
exports.logged = logged;
exports.welcome = welcome;
