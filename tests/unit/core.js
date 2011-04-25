module("Core");

test("Requirements", function() {
  expect(2);

  ok(jQuery, "jQuery exists");
  ok($, "$ exists");
});

