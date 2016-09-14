'use strict';
var MongoClient = require('mongodb').MongoClient;
var autoIncrement = require("mongodb-autoincrement");

var connection;
var collectionNotes;
var collectionUsers;
var connectionNameUsers = 'users';
var connectionNameNotes = 'notes';

function connect(){
  MongoClient.connect('mongodb://localhost:27017/notes_db',
  function(err, conn) {
    if(err) throw err;
    connection = conn;
    collectionNotes = connection.collection(connectionNameNotes);
    collectionUsers = connection.collection(connectionNameUsers);
    console.log('Connection established with mongo database');
  });
}

function disconnect(){
  //TODO
}

function insertUser(user, callback){
  collectionUsers.insert(user, callback);
}

function insertNote(note, callback){
  console.log("function 'insertNote' was called. ");
  autoIncrement.getNextSequence(connection, connectionNameNotes, function (err, autoIndex) {
    //var collection = db.collection(collectionName);
    collectionNotes.insert({
      _id: autoIndex,
      text: note.text,
      date: note.date,
      route_file: note.route_file,
      username: note.username
    }, callback);
  });
}

function deleteNote(id, callback){
  var query = {};
  query['_id'] = parseInt(id);
  collectionNotes.remove(query, callback);
}

function findNote(id, callback){
  var query = {};
  query['_id'] = parseInt(id);
  //collectionNotes.findOne(query, callback);
  collectionNotes.find(query).toArray(callback);
}

function listNotes(username, callback){
  collectionNotes.find({username: username}).toArray(callback);
}

function listAllNotes(callback){
  collectionNotes.find().toArray(callback);
}

function findUser(username, callback){
  collectionUsers.findOne({username: username}, callback);
}

function listUsers(callback){
  collectionNotes.find({username: username}).toArray(callback);
}

exports.connect = connect;
exports.disconnect = disconnect;
exports.insertNote = insertNote;
exports.deleteNote = deleteNote;
exports.findNote = findNote;
exports.listNotes = listNotes;
exports.listAllNotes = listAllNotes;
exports.findUser = findUser;
exports.insertUser = insertUser;
exports.listUsers = listUsers;
