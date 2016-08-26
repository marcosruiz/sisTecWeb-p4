'use strict';
var MongoClient = require('mongodb').MongoClient;
var autoIncrement = require("mongodb-autoincrement");

var connection;
var collection;
var connectionName = 'notes';

function connect(){
  MongoClient.connect('mongodb://localhost:27017/notes_db',
  function(err, conn) {
    if(err) throw err;
    connection = conn;
    collection = connection.collection(connectionName);
    console.log('Connection established with mongo database');
  });
}

function disconnect(){
  //TODO
}

function insertNote(note, callback){
  autoIncrement.getNextSequence(connection, connectionName, function (err, autoIndex) {
    //var collection = db.collection(collectionName);
    collection.insert({
      _id: autoIndex,
      text: note.text,
      date: note.date,
      route_file: note.route_file
    }, callback);
  });
}

function deleteNote(){
  //TODO
}

function findNote(){
  //TODO
}

function listNotes(callback){
  collection.find().toArray(callback);
}

exports.connect = connect;
exports.disconnect = disconnect;
exports.insertNote = insertNote;
exports.deleteNote = deleteNote;
exports.findNote = findNote;
exports.listNotes = listNotes;
