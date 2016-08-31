var server = require("./server");
var router = require("./router");
var requestHandlers = require("./requestHandlers");
var mongo = require("./mongoConnector");

mongo.connect();

var handle = {};
handle["/"] = requestHandlers.logged;
handle["/saveMemo"] = requestHandlers.saveMemo;
handle["/saveMemo"] = requestHandlers.saveMemo;
handle["/showAllMemo"] = requestHandlers.showAllMemo;
handle["/showMemo"] = requestHandlers.showMemo;
handle["/deleteMemo"] = requestHandlers.deleteMemo;
handle["/deleted"] = requestHandlers.deleted;
handle["/downloadFile"] = requestHandlers.downloadFile;
handle["/logged"] = requestHandlers.logged;
handle["/welcome"] = requestHandlers.welcome;

server.start(router.route, handle);
