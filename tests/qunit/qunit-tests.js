test('Does the canvas id increment when we add a canvas?', function () {
  
  var nextCanvasId_before = next_canvas_id;
  var nextCanvasId_after;

  Cardsy.incrementNextCanvasId();

  nextCanvasId_after = next_canvas_id;

  ok(nextCanvasId_after - nextCanvasId_before == 1, 'The new next_canvas_id is incremented by one.');

});

