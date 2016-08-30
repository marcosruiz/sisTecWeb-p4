var server = require("./server");
var router = require("./router");
var requestHandlers = require("./requestHandlers");
var mongo = require("./mongoConnector");

mongo.connect();

var handle = {};
handle["/"] = requestHandlers.welcome;
handle["/setmemo"] = requestHandlers.setmemo;
handle["/savememo"] = requestHandlers.savememo;
handle["/showallmemo"] = requestHandlers.showallmemo;
handle["/showmemo"] = requestHandlers.showmemo;
handle["/deletememo"] = requestHandlers.deletememo;
handle["/deleted"] = requestHandlers.deleted;
handle["/downloadfile"] = requestHandlers.downloadfile;
handle["/login"] = requestHandlers.login;
handle["/welcome"] = requestHandlers.welcome;

server.start(router.route, handle);
