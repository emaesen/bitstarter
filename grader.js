#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

 + cheerio
	 - https://github.com/MatthewMueller/cheerio
	 - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
	 - http://maxogden.com/scraping-with-node.html

 + commander.js
	 - https://github.com/visionmedia/commander.js
	 - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
	 - http://en.wikipedia.org/wiki/JSON
	 - https://developer.mozilla.org/en-US/docs/JSON
	 - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var util = require('util');
var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var restler = require('restler');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";
var URL_DEFAULT = "http://polar-everglades-6614.herokuapp.com/";

var getUrl = function(url, callback) {
	var handleResponse = function(result, response) {
		if (result instanceof Error) {
			console.error('Error: ' + util.format(response && response.message));
		} else {
			callback(result);
		}
	};
	restler.get(url).on('complete', handleResponse);
};

var assertFileExists = function(infile) {
	var instr = infile.toString();
	if(!fs.existsSync(instr)) {
		console.log("%s does not exist. Exiting.", instr);
		process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
	}
	return instr;
};

var cheerioHtmlFile = function(htmlfile) {
	return cheerio.load(fs.readFileSync(htmlfile));
};

var cheerioHtmlString = function(htmlstring) {
	return cheerio.load(htmlstring);
};

var loadChecks = function(checksfile) {
	return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlsrc, checksfile, isFile) {
	$ = isFile? cheerioHtmlFile(htmlsrc) : cheerioHtmlString(htmlsrc);
	var checks = loadChecks(checksfile).sort();
	var out = {};
	for(var ii in checks) {
		var present = $(checks[ii]).length > 0;
		out[checks[ii]] = present;
	}
	// program output is generated here. It'd be better to externalize this to its own function
	var outJson = JSON.stringify(out, null, 4);
	console.log(outJson);
	// still return out instead of outJson because that makes more sense for the exports functionality
	return out;
};

var clone = function(fn) {
	// Workaround for commander.js issue.
	// http://stackoverflow.com/a/6772648
	return fn.bind({});
};

if(require.main == module) {
	program
		.option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
		.option('-f, --file [html_file]', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
		.option('-u, --url [url]', 'URL to index.html', URL_DEFAULT)
		.parse(process.argv);

	var args = process.argv.join(",")+" ";
	if (args.match(/,-f(ile)? /)) {
		console.log(">>>> Checking file " + program.file);
		checkHtmlFile(program.file, program.checks, true);
	} else {
		console.log(">>>> Checking url " + program.url);
		getUrl(program.url, function(result) {
			checkHtmlFile(result, program.checks);
		});
	}
} else {
	exports.checkHtmlFile = checkHtmlFile;
}
