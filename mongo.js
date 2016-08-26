'use strict';
var MongoClient = require('mongodb').MongoClient;
var connection;
var collection;

function connect(){
  MongoClient.connect('mongodb://localhost:27017/notes_db',
  function(err, conn) {
    connection = conn;
    collection = connection.collection('notes');
  });
}

function disconnect(){
  //TODO
}

function insertNote(note, callback){
  collection.insert({note}, function(err, count) {

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
