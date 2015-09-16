'use strict';
var assert = require('assert');
var timeranges = require('./');

it('should create a TimeRanges object', function () {
	assert.ok(timeranges.create());
});

it('should create a TimeRanges object with a range', function () {
	var tr = timeranges.create(0, 100);

	assert.equal(tr.length, 1);
	assert.equal(tr.start(0), 0);
	assert.equal(tr.end(0), 100);
});

it('should handle adding ranges at different locations', function () {
	var tr = timeranges.create();
	var ranges = tr._ranges;

	// []
	tr.add(50, 100);
	assert.equal(tr.length, 1);
	assert.deepEqual(ranges, [[50,100]]);

	// <>[]
	tr.add(0, 10);
	assert.equal(tr.length, 2);
	assert.deepEqual(ranges, [[0,10],[50,100]]);

	// <|] (contigous)
	tr.add(45, 50);
	assert.equal(tr.length, 2);
	assert.deepEqual(ranges, [[0,10],[45,100]]);

	// <[>]
	tr.add(40, 60);
	assert.equal(tr.length, 2);
	assert.deepEqual(ranges, [[0,10],[40,100]]);

	// <[} (shared end)
	tr.add(35, 100);
	assert.equal(tr.length, 2);
	assert.deepEqual(ranges, [[0,10],[35,100]]);

	// <[]>
	tr.add(30, 110);
	assert.equal(tr.length, 2);
	assert.deepEqual(ranges, [[0,10],[30,110]]);

	// {>] (shared start, end is less)
	tr.add(30, 105);
	assert.equal(tr.length, 2);
	assert.deepEqual(ranges, [[0,10],[30,110]]);

	// {} (exact match)
	tr.add(30, 100);
	assert.equal(tr.length, 2);
	assert.deepEqual(ranges, [[0,10],[30,110]]);

	// {]> (shared start, end is greater)
	tr.add(30, 115);
	assert.equal(tr.length, 2);
	assert.deepEqual(ranges, [[0,10],[30,115]]);

	// [<>]
	tr.add(35, 105);
	assert.equal(tr.length, 2);
	assert.deepEqual(ranges, [[0,10],[30,115]]);

	// [<} (shared end)
	tr.add(70, 115);
	assert.equal(tr.length, 2);
	assert.deepEqual(ranges, [[0,10],[30,115]]);

	// [<]>
	tr.add(70, 120);
	assert.equal(tr.length, 2);
	assert.deepEqual(ranges, [[0,10],[30,120]]);

	// [|> (contiguous)
	tr.add(120, 140);
	assert.equal(tr.length, 2);
	assert.deepEqual(ranges, [[0,10],[30,140]]);

	// []<>
	tr.add(150, 200);
	assert.equal(tr.length, 3);
	assert.deepEqual(ranges, [[0,10],[30,140],[150,200]]);

	// ([]<>) - consolodates multiple ranges
	tr.add(0, 210);
	assert.deepEqual(ranges, [[0,210]]);
	assert.equal(tr.length, 1);

	// [(]<>) - consolodates multiple ranges
	tr._ranges = [[0,10],[30,140],[150,200]];
	tr.add(5, 210);
	assert.equal(tr.length, 1);
	assert.deepEqual(ranges, [[0,210]]);
});

it('should handle a tolerance for closesness when adding a range', function () {
	var tr = timeranges.create(50, 100);
	var ranges = tr._ranges;

	tr.add(25, 49.5, 0.5);
	assert.equal(tr.length, 1);
	assert.deepEqual(ranges, [[25,100]]);

	tr.add(100.5, 125, 0.5);
	assert.equal(tr.length, 1);
	assert.deepEqual(ranges, [[25,125]]);

	tr.add(0.25, 25, 0.5);
	assert.equal(tr.length, 1);
	assert.deepEqual(ranges, [[0,125]]);
});
