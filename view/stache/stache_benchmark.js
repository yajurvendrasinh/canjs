steal('can/view/stache', 'can/list', 'can/test/benchmarks.js', function (can, list, benchmarks) {
	/* jshint ignore:start */
	module('can/view/stache');
	test('updating elements', function() {
		expect(0);

		benchmarks.add(
		"can/view/stache updating elements",
		function () {

			var template = can.view.stache(
				"{{#each boxes}}" +
				"<div class='box-view'>" +
				"<div class='box' id='box-{{number}}'  style='top: {{top}}px; left: {{left}}px; background: rgb(0,0,{{color}});'>" +
				"{{content}}" +
				"</div>" +
				"</div>" +
				"{{/each}}");

			var boxes = [],
				Box = can.Map.extend({
					count: 0,
					content: 0,
					left: 0,
					top: 0,
					color: 0,
					tick: function () {
						var count = this.attr("count") + 1;
						this.attr({
							count: count,
							left: Math.cos(count / 10) * 10,
							top: Math.sin(count / 10) * 10,
							color: count % 255,
							content: count
						});
					}
				});

			for (var i = 0; i < 100; i++) {
				boxes.push(new Box({
					number: i
				}));
			}

			var frag = template({
				boxes: boxes
			});
			var div = document.createElement("div");
			document.body.appendChild(div);
			div.appendChild(frag);
		},
		function () {
			for (var j = 0; j < 2; j++) {
				for (var n = 0; n < boxes.length; n++) {
					boxes[n].tick();
				}
			}
		},
		function () {
			document.body.removeChild(div);
		});
	});

	test('initial render', function() {
		expect(0);

		benchmarks.add('can/view/stache initial render', function() {
			var template = can.stache(
				'{{#each items}}{{#each boxes}}<div>' +
				'{{#check}}<div>Big box</div>{{/check}}' +
				'{{^check}}<div>Little box</div>{{/check}}</div>' +
				'{{/each}}{{/each}}');

			var items = new can.List(),
				Box = can.Map.extend({
					foo: 'baz',
					bar: 'bar'
				});

			for(var i = 0; i < 100; i++) {
				items.push({
					boxes: []
				});

				for(var j = 0; j < 10; j++) {
					items[i].boxes.push(new Box());
				}
			}
		}, function() {
			var frag = template({
				items: items
			}, {
				check: function(options) {
					var box = options.context;
					if(box.attr('foo') === 'foo' || box.attr('bar') === 'bar') {
						return options.fn();
					}

					return options.inverse();
				}
			});
		}, function() {});
	});
	/* jshint ignore:end */
});
