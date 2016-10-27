"use strict";

var wd = require("wd");
var localTunnel = require("localtunnel")
var async = require("async");
var Testee = require("testee").Manager;

var testeePort = 3996;

var serverConfig = {
	host: 'ondemand.saucelabs.com',
	port: 80,
	username: process.env.SAUCE_USERNAME,
	password: process.env.SAUCE_ACCESS_KEY
};

var platforms = [{
	browserName: 'Safari',
	'appium-version': '1.6.0',
	platformName: 'iOS',
	platformVersion: '9.3',
	deviceName: 'iPhone Simulator'
}];

function logger(type, a) {
	return function(b) {
		var msg = '';
		msg += a ? a : '';
		msg += a && b ? ' ' : '';
		msg += b ? b : '';
		
		console[type](msg);
	};
}

var localhostTunnel;

// allow Sauce Labs VMs to access localhost
function openLocalhostTunnel() {
	return new Promise(function(resolve, reject) {
		var localtunnel = require('localtunnel');
		 
		localtunnel(testeePort, function(err, tunnel) {
			if (err) {
				reject(err);
				return;
			}
		 
			localhostTunnel = tunnel;
			resolve(tunnel.url);
		});
	});
}

function closeLocalhostTunnel() {
	return localhostTunnel.close();
}

var testeeServer;

function startTesteeServer() {
	testeeServer = new Testee({
		port: testeePort
	});

	return testeeServer.startServer();
}

function stopTesteeServer() {
	testeeServer.shutdown();
}

function runTest(driver, platform) {
	return function(callback) {
		console.log('Running Tests for', platform.name);

		driver.init(platform)
			.then(function() {
				return driver
					.get(localhostTunnel.url + '/test/index.html')
					.sleep(30000)
					.title()
					.then(function(title) {
						var passed = /CanJS tests/.test(title);
						console.log('Tests for', platform.name, passed ? 'passed' : 'failed');
						callback(null, passed);
					});
			})
			.catch(callback);
	}
}

function runAllTests() {
	var tests = [];
	var driver = wd.promiseChainRemote(serverConfig);
		
	driver.on('status', function (info) {
		console.log(info);
	});

	driver.on('command', function (msg, path, data) {
		console.log(' > ' + msg, path, data || '');
	});

	driver.on('http', function (msg, path, data) {
		console.log(' > ' + msg, path, (data || ''));
	});

	platforms.forEach(function(p) {
		p.name = 'qunit tests - ' + p.browserName + ' ' + p.platformName + ' ' + p.platformVersion;
		tests.push(runTest(driver, p))
	});

	return new Promise(function(resolve, reject) {
		async.parallel(tests, function(err, results) {
			if (err) {
				console.error(err);
				reject(err);
				return;
			}

			var passed = results.reduce(function(last, result) {
				return last && result;
			}, true)

			driver
				.quit()
				.finally(function () {
					console.log("Driver Closed");
					driver.sauceJobStatus(passed);
				});

			resolve(passed);
		});
	});
}

startTesteeServer()
	.then(logger("log", "Testee Server Started"))
	.then(openLocalhostTunnel)
	.then(logger("log", "Tunnel to localhost Open at:"))
	.then(runAllTests)
	.then(logger("log", "Running Tests Complete. Passed:"))
	.then(closeLocalhostTunnel)
	.then(logger("log", "Tunnel to localhost Closed"))
	.then(stopTesteeServer)
	.then(logger("log", "Testee Server Stopped"))
	.catch(logger("error"));
