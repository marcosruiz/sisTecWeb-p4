var querystring = require("querystring"),
fs = require("fs"),
formidable = require("formidable"),
notesDAO = require("./notesDAO"),
url = require('url');

/*
It shows a form with an obligatotry date, an obligatory text, an optional
file and a submit button witch calls to /savetask
*/
function setmemo(response){
	console.log("Request handler 'setmemo' was called.");

	var body = '<html>'+
		'<head>'+
		'<meta http-equiv="Content-Type" '+
		'content="text/html; charset=UTF-8" />'+
		'</head>'+
		'<body>'+
		'<form action="/savetask" enctype="multipart/form-data" '+
		'method="post">'+
		'Date*: <input type="date" name="date"/><br/>' +
		'Text*: <input type="text" name="text"/><br/>' +
		'File: <input type="file" name="file" multiple="multiple"/><br/>'+
		'<input type="submit" value="Save task" />'+
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
function showallmemo(response){
	notesDAO.listNotes(function(err, rows){
		if(err) throw err;
		response.writeHead(200, {'content-type': 'text/html'});
		response.write('<!DOCTYPE html><html><body>');
		response.write('<table>');
		response.write('<tr><th>Id</th><th>Date</th><th>Text</th><th>File</th><th>Info</th></tr>');
		for (var i = 0; i < rows.length; i++) {
			response.write('<tr>');
			response.write('<td>' + rows[i].id + '</td>');
			response.write('<td>' + rows[i].date + '</td>');
			response.write('<td>' + rows[i].text + '</td>');
			response.write('<td>' + '<a href="./downloadfile?='+ rows[i].id  +'">' + rows[i].route_file + '</a>' + '</td>');
			response.write('<td>' + '<a href="./showmemo?='+ rows[i].id  +'">Details</a>' + '</td>');
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
function showmemo(response, request){
	var url_parts = url.parse(request.url, true);
	var id = url_parts.query[""];
	notesDAO.findNote(id, function(err, rows){
		if(err) throw err;
		response.writeHead(200, {'content-type': 'text/html'});
		response.write('<!DOCTYPE html><html><body>');
		if(rows.length !== 0){
			response.write('<table>');
			response.write('<tr><th>Id</th><th>Date</th><th>Text</th><th>Download</th></tr>');
			response.write('<tr>');
			response.write('<td>' + rows[0].id + '</td>');
			response.write('<td>' + rows[0].date + '</td>');
			response.write('<td>' + rows[0].text + '</td>');
			response.write('<td>' + '<a href="./downloadfile?='+ rows[0].id  +'">' + rows[0].route_file + '</a>' + '</td>');
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
function downloadfile(response, request){
	console.log("Request handler 'downloadfile' was called.");
	var url_parts = url.parse(request.url, true);
	var id = url_parts.query[""];
	if(typeof id !== 'undefined'){
		notesDAO.findNote(id, function(err, rows){
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
Save a file in ./tmp/ and save a note in our database
*/
function savetask(response, request){
		console.log("Request handler 'savetask' was called.");

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
			if(fields['date'] == '' | fields['text'] == '' ){
				response.writeHead(200, {'content-type': 'text/html'});
				response.write('<!DOCTYPE html><html><body>');
				response.write('Date and Text are obligatoty.');
				response.write('</body></html>');
				response.end();
			}else{
				var note = { date: fields['date'], text: fields['text'], route_file: route };
				notesDAO.insertNote(note, function(err, rows){
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
function deletememo(response){
	console.log("Request handler 'deletememo' was called.");

	var form = '<form action="/deleted" enctype="multipart/form-data" '+
		'method="post">'+
		'Write an id: <input name="id" type="number"></input>'+
		'<input type="submit"></input>'+
		'</form>';

	notesDAO.listNotes(function(err, rows){
		if(err) throw err;
		response.writeHead(200, {'content-type': 'text/html'});
		response.write('<!DOCTYPE html><head><title>deletememo</title></head><html><body>');
		response.write('<table>');
		response.write('<tr><th>Id</th><th>Date</th><th>Text</th><th>File</th><th>Info</th></tr>');
		for (var i = 0; i < rows.length; i++) {
			response.write('<tr>');
			response.write('<td>' + rows[i].id + '</td>');
			response.write('<td>' + rows[i].date + '</td>');
			response.write('<td>' + rows[i].text + '</td>');
			response.write('<td>' + '<a href="./downloadfile?='+ rows[i].id  +'">' + rows[i].route_file + '</a>' + '</td>');
			response.write('<td>' + '<a href="./showmemo?='+ rows[i].id  +'">Details</a>' + '</td>');
			response.write('</tr>');
		};
		response.write('</table><br/>');
		response.write(form);
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
				notesDAO.deleteNote(id, function(err, rows){
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

exports.setmemo = setmemo;
exports.savetask = savetask;
exports.showallmemo = showallmemo;
exports.showmemo = showmemo;
exports.deletememo = deletememo;
exports.deleted = deleted;
exports.downloadfile = downloadfile;
