var server = require("./server");
var router = require("./router");
var requestHandlers = require("./requestHandlers");
var nodeglob = require("node-glob");
var notesDAO = require("./notesDAO");

notesDAO.connect();

var handle = {};
handle["/"] = requestHandlers.setmemo;
handle["/setmemo"] = requestHandlers.setmemo;
handle["/savetask"] = requestHandlers.savetask;
handle["/showallmemo"] = requestHandlers.showallmemo;
handle["/showmemo"] = requestHandlers.showmemo;
handle["/deletememo"] = requestHandlers.deletememo;
handle["/deleted"] = requestHandlers.deleted;
handle["/downloadfile"] = requestHandlers.downloadfile;

server.start(router.route, handle);
