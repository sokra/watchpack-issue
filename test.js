var fs = require("graceful-fs");
var chokidar = require("chokidar");
var path = require("path");
var async = require("async");

var testPath = path.join(__dirname, "fixtures");

try {
	fs.mkdirSync(testPath);
} catch(e) {}
try {
	fs.writeFileSync(path.join(testPath, "b"), "");
} catch(e) {}
try {
	fs.unlinkSync(path.join(testPath, "a"));
} catch(e) {}

var watcher = chokidar.watch(testPath, {
	ignoreInitial: true,
	persistent: true,
	followSymlinks: false,
	depth: 0,
	ignorePermissionErrors: true
});
watcher.on("add", onFileAdded);
watcher.on("addDir", onDirectoryAdded);
watcher.on("change", onChange);
watcher.on("unlink", onFileUnlinked);
watcher.on("unlinkDir", onDirectoryUnlinked);
watcher.on("error", onWatcherError);

async.series([
	function(callback) {
		setTimeout(callback, 1000);
	},
	function(callback) {
		console.log("# change file 'b'");
		fs.writeFileSync(path.join(testPath, "b"), "");
		setTimeout(callback, 1000);
	},
	function(callback) {
		console.log("# create file 'a'");
		fs.writeFileSync(path.join(testPath, "a"), "");
		setTimeout(callback, 1000);
	},
	function(callback) {
		console.log("# change file 'b'");
		fs.writeFileSync(path.join(testPath, "b"), "");
		setTimeout(callback, 1000);
	},
	function(callback) {
		console.log("# change file 'a'");
		fs.writeFileSync(path.join(testPath, "a"), "");
		setTimeout(callback, 1000);
	},
	function(callback) {
		watcher.close();
	},
]);

function onFileAdded(p, stats) {
	console.log("add", path.relative(__dirname, p), stats);
}

function onDirectoryAdded(p, stats) {
	console.log("addDir", path.relative(__dirname, p), stats);
}

function onChange(p, stats) {
	console.log("change", path.relative(__dirname, p), stats);
}

function onFileUnlinked(p) {
	console.log("unlink", path.relative(__dirname, p));
}

function onDirectoryUnlinked(p) {
	console.log("unlinkDir", path.relative(__dirname, p));
}

function onWatcherError(err) {
	console.log("error", err);
}
