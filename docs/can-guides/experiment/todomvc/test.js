var QUnit = require("steal-qunit");
var F = require("funcunit");

F.attach(QUnit);

QUnit.module('todomvc', {
    beforeEach: function (assert) {
    	localStorage.clear();
    }
});

QUnit.test("basics work", function(){
	F('li.todo', 0).size(3, "there are 3 todos");
	F('#new-todo', 0).type("new thing\r");

	F('li.todo', 0).size(4, "new todo added");


	F('label:contains(mow lawn)',0).dblclick(function(){
		QUnit.equal( window.frames[0].document.activeElement.value === "mow lawn", "mow lawn is focused");
	});
});
