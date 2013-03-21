import "../core/identity";
import "../core/noop";
import "geo";
import "stream";

d3.geo.bounds = d3_geo_bounds(d3_identity);

function d3_geo_bounds(projectStream) {
  var x0, y0, x1, y1, // bounds
      x_, // previous x-coordinate
      invert; // x1 < x0

  var bound = {
    point: boundPoint,
    lineStart: d3_noop,
    lineEnd: d3_noop,

    // While inside a polygon, ignore points in holes.
    // TODO if area > hemisphere then bounds are whole sphere?
    polygonStart: function() { bound.lineEnd = boundPolygonLineEnd; },
    polygonEnd: function() { bound.point = boundPoint; }
  };

  function boundPoint(x, y) {
    if (!invert && (invert = Math.abs(x - x_) > 180)) {
      if (x < x0) x1 = x;
      else x0 = x;
    } else if (invert) {
      if (x1 < x && x < x0) {
        if (x - x1 > x - x0) x1 = x;
        else x0 = x;
      }
    } else {
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
    }
    if (y < y0) y0 = y;
    if (y > y1) y1 = y;
    x_ = x;
  }

  function boundPolygonLineEnd() {
    bound.point = bound.lineEnd = d3_noop;
  }

  return function(feature) {
    y1 = x1 = -(x0 = y0 = Infinity);
    x_ = NaN;
    invert = false;
    d3.geo.stream(feature, projectStream(bound));
    return [[x0, y0], [x1, y1]];
  };
}
