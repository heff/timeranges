#!/usr/bin/env node
'use strict';
var meow = require('meow');
var timeranges = require('./');

var cli = meow({
	help: [
		'Usage',
		'  $ timeranges [input]',
		'',
		'Examples',
		'  $ timeranges',
		'  unicorns & rainbows',
		'',
		'  $ timeranges ponies',
		'  ponies & rainbows',
		'',
		'Options',
		'  --foo  Lorem ipsum. Default: false'
	]
});

console.log(timeranges(cli.input[0] || 'unicorns'));
