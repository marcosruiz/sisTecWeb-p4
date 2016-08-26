var mysql = require("mysql");

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "toor",
  database: "notes"
});

function connect(){
  con.connect(function(err){
    if(err){
      console.log('Error connecting to Db');
      return;
    }
    console.log('Connection established');
  });
}

function listNotes(callback){
  con.query('SELECT * FROM notes', callback);
}

function findNote(id, callback){
  con.query('SELECT * FROM notes WHERE id = ' + id, callback);
}

function deleteNote(id, callback){
  con.query('DELETE FROM notes WHERE id= ' + id, callback);
}

function insertNote(note, callback){
  con.query('INSERT INTO notes SET ?', note, callback);
}

exports.connect = connect;
exports.listNotes = listNotes;
exports.findNote = findNote;
exports.deleteNote = deleteNote;
exports.insertNote = insertNote;
