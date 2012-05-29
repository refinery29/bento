/*
  Bento is a stateful object that distrubutes content between columns.
  It's a table with columns and cells, but without rows. Bento is 
  recalculated when window size is changed.
*/
var Bento = function() {
  if (!this.setSize) {
    var bento = new Bento
    Bento.apply(bento, arguments);
    return bento;
  }
  if (this.items == null) this.items = [];
  for (var i = 0, j = arguments.length, arg; i < j; i++) {
    switch (typeof (arg = arguments[i])) {
      case 'object':
        if (arg == null) continue;
        if (arg.nodeType) {
          this.setElement(arg);
        } else if (arg.push || typeof arg.item == 'function') {
          if (!columns) 
            var columns = this.setColumns(arg);
          else
            this.concat(arg);
        } else {
          if (arg === window) {
            var self = this;
            window.onresize = function(e) {
              self.onResize(e)
            }
            window.onscroll = function(e) {
              //self.onScroll(e)
            }
          } else if (arg.width) {
            this.setSize(arg.width, arg.height); 
          } else {
            this.patterns = arg;
          }
        }
        break;
      case 'function':
        if (arg.item) {
          if (!columns) columns = this.setColumns(arg);
          else this.concat(arg)
        } else if (!request) 
          var request = this.request = arg;
        else
          this.renderer = arg;
        break;
      case 'number':
        if (arg < 100 && arg >= 0) this.gutter = arg;
        else if (width == null) var width = this.setWidth(arg);
        else this.setHeight(arg);
    }
  }
  this.setPage(1);
};
Bento.prototype.setColumns = function(settings) {
  if (!settings && this.allColumns) {
    var columns = this.allColumns;
  } else {
    if (arguments.length > 1 || (typeof settings != 'object' && typeof settings.item != 'function')) 
      settings = arguments;
    for (var i = 0, j = settings.length, columns = []; i < j; i++)
      columns.push(Bento.Column(this.columns && this.columns[i], settings[i]))
    delete this.maxWidth
    delete this.minWidth;
  }   
  var that = this, diff;
  if (!this.allColumns) this.allColumns = columns;
  columns = columns.filter(function(column, i) {
    if (column.element) column.setWidth(column.element)
    if (that.columns) {
      if (column.width && that.columns[i] != column) 
        diff = true;
    } else diff = true;
    return column.width;
  });
  if (this.columns) 
    for (var i = columns.length, j = this.columns.length; i < j; i++) {
      diff = true;
      delete this.columns[i].width;
    }
  if (!diff) return;
  for (var i = 0, column; column = this.allColumns[i]; i++) {
    for (var j = 0, item; item = column.items[j]; j++)
      item.reset();
    if (column.element) while (column.element.lastChild)
      column.element.removeChild(column.element.lastChild)
  }
  for (var i = 0, column; column = columns[i]; i++) {
    column.items.length = 0
    column.height = 0;
    if (column.holes) column.holes.length = 0;
    if (this.maxWidth == null || column.width < this.minWidth) this.minWidth = column.width;
    if (this.maxWidth == null || column.width > this.maxWidth) this.maxWidth = column.width;
  }
  this.columns = columns
  if (diff) this.update();
  return this.columns;
};
Bento.prototype.setPage = function(page) {
  if (this.request) {
    var result = this.request(page, this.requested);
    if (result != null && result.push) this.push.apply(this, result);
    else this.requested = result;
  }
  return this.page = page;
};
Bento.prototype.scrollTo = function(x, y) {
  this.setScrollTop(y)
};
Bento.prototype.setScrollTop = function(top) {
  var page = Math.ceil(top / this.height) + 1;
  if (page != this.page) this.setPage(page)
  return this.scrollTop = top;
};
Bento.prototype.onResize = function(e) {
  if (this.resized) return;
  //this.resized = true;
  this.setHeight(e.target.innerWidth)
  this.setWidth(e.target.innerHeight);
  if (this.columns) this.setColumns();
};
Bento.prototype.onScroll = function(e) {
  this.setScrollTop(window.scrollTop);
};
Bento.prototype.setSize = function(width, height, quiet) {
  this.setWidth(width);
  this.setHeight(height);
  if (this.update && !quiet) this.update()
};
Bento.prototype.setHeight = function(height) {
  if (height.nodeType) height = height.offsetHeight || parseInt(height.style.height || 0)
  return this.height = Math.floor(height);
};
Bento.prototype.setWidth = function(width) {
  if (width.nodeType) width = width.offsetWidth || parseInt(width.style.width || 0)
  return this.width = Math.floor(width);
};
Bento.prototype.update = function() {
  for (var i = 0, j = this.items.length; i < j; i++) {
    this.items[i].setPosition()
  }
};
Bento.prototype.setElement = function(element) {
  this.element = element;
  if (this.onElementSet) this.onElementSet(element);
};
Bento.prototype.onElementSet = function(element) {
  this.setWidth(element);
  this.setHeight(element);
}
Bento.prototype.gutter = 0;
Bento.prototype.ratingWeight = 1;
Bento.prototype.distanceWeight = 1;
Bento.prototype.visibilityWeight = 1;
Bento.prototype.holeFillWeight = 1;
Bento.prototype.holeDistanceWeight = 1;
Bento.prototype.holeMaximumRatio = 4;
Bento.prototype.getPosition = function(item, prepend, span) {
  if (!this.columns) return;
  var width = item.width
  var height = item.height
  var ratio = width / height;
  var rating = item.rating || 0;
  var bento = item.bento;
  var ratingWeight = this.ratingWeight;
  var visibilityWeight = this.visibilityWeight;
  var distanceWeight = this.distanceWeight;
  var holeFillWeight = this.holeFillWeight;
  var holeDistanceWeight = this.holeDistanceWeight;
  var size = 0;
  if (span == null) span = 1;
  if (item.seed == null) item.seed = Math.random();
  
  // Check against all registered patterns and collect modifiers
  if (this.patterns) for (var property in this.patterns) {
    var pattern = this.patterns[property];
    if (pattern) {
      if (pattern.ratio == null || (pattern.ratio[0] <= ratio && ratio <= pattern.ratio[1]))
      if (pattern.probability == null || (item.seed <= pattern.probability))
      if (pattern.rating == null || (pattern.rating[0] <= rating && rating <= pattern.rating[1])) {
        if (pattern.size != null) 
          size = pattern.size;
        if (pattern.span != null)
          span = pattern.span;
        if (pattern.ratingWeight != null)
          ratingWeight = pattern.ratingWeight;
        if (pattern.visibilityWeight != null)
          visibilityWeight = pattern.visibilityWeight;
        if (pattern.distanceWeight != null)
          distanceWeight = pattern.distanceWeight;
        if (pattern.holeFillWeight != null)
          holeFillWeight = pattern.holeFillWeight;
        if (pattern.holeDistanceWeight != null)
          holeDistanceWeight = pattern.holeDistanceWeight;
      }
    }
  }
  
  // Calculate columns with min and max heights
  for (var i = 0, min, max, column; column = this.columns[i++];) {
    if (!min || min.height > column.height) min = column;
    if (!max || max.height < column.height) max = column;
  }
  var bestHoleScore = 0;
  var intermediate = 0;
  for (var i = 0, match, reversed, direction; column = this.columns[i]; i++) {
    var fullWidth = column.width;
    if (span > 1) {
      // try spanning to the right
      if (i + span - 1 <= this.columns.length) {
        for (var j = i + 1, k = i + Math.ceil(span); j < k; j++) {
          var next = this.columns[j];
          if (!next || next.height > column.height)
            break;
          else fullWidth += next.width;
        }
        if (j == k) reversed = false;
      }
      // try spanning to the left
      if (reversed == null && i - span + 1 > -1) {
        fullWidth = column.width;
        for (var j = i - 1, k = i - Math.ceil(span); j > k; j--) {
          var previous = this.columns[j];
          if (!previous || previous.height > column.height)
            break;
          else fullWidth += previous.width;
        }
        if (j == k) reversed = true;
      }
      if (reversed == null) continue;
    }  
    var ratio = item.width / item.height;
    
    // Find out hole that an item may fill
    if (column.holes) for (var l = 0, hole, bestHole; hole = column.holes[l++];) {
      var width = hole[1] * ratio;
      var holeFill = width / column.width;
      if (holeFill > 1) holeFill = 1 / holeFill;
      var holeDistance = Math.max(1 - hole[0] / max.height, 0)
      var holeScore = (holeFill    * holeFillWeight
                    + holeDistance * holeDistanceWeight) / 2;
      if (holeScore > bestHoleScore) {
        bestHoleScore = holeScore;
        bestHole = hole;
      }
    }
      
    // Find out a column where an item fits best
    var above      = max.height - column.height;
    var below      = max.height - min.height;
    var distance   = max.height ? below ? 1 - (column.height - min.height) / below : 1 : 1
    var visibility = max.height ? above ? above >= height ? 1 : above / height : 1 : 1
    var wideness   = Math.min(ratio * (fullWidth / min.width), 4) / 4;
    var score      = (rating    * ratingWeight
                   + visibility * visibilityWeight
                   + distance   * distanceWeight
                   + wideness   * size) / 4;
    if (intermediate < score) {
      intermediate = score;
      match = column;
      direction = !reversed;
    }  
    reversed = null;
  }
  
  // Fill a hole, if it's score higher than the best column score
  if (span == 1 && bestHoleScore >= score)
    return bestHole;

  // Collect columns affected by spanning
  if (span > 1 && match) {
    var matches = [match];
    if (direction) {
      for (var j = this.columns.indexOf(match) + 1, k = j + Math.ceil(span) - 1; j < k; j++)
        matches.push(this.columns[j])
    } else {
      for (var j = this.columns.indexOf(match) - 1, k = j - Math.ceil(span) + 1; j > k; j--) 
        matches.push(this.columns[j])
    }
    return matches;
  }
  return match;
};
var delay = 0;
Bento.prototype.push = function() {
  for (var i = 0, j = arguments.length, items = this.items, position; i < j; i++)
    items.push(Bento.Item(this, this.renderer, arguments[i]))
};
Bento.prototype.concat = function(enumerable) {
  for (var i = 0, j = enumerable.length; i < j; i++)
    this.push(enumerable[i]);
};
/*
  Bento column holds multiple items. When new item is added to bento,
  it figures out which column item fits best and appends item there.  
*/
Bento.Column = function(first) {
  if (!this.setSize) {
    var column = first instanceof Bento.Column ? first : new Bento.Column;
    Bento.Column.apply(column, arguments);
    return column;
  }
  for (var i = 0, j = arguments.length, arg; i < j; i++) {
    switch (typeof (arg = arguments[i])) {
      case 'object':
        if (arg != null)
        if (arg instanceof Bento)
          this.setBento(arg);
        else if (arg.nodeType)
          this.setElement(arg);
        break;
      case 'number':
        if (width == null) var width = this.setWidth(arg);
    }
  }
  this.items = [];
};
Bento.Column.prototype.height       = 0;
Bento.Column.prototype.setSize      = Bento.prototype.setSize;
Bento.Column.prototype.setHeight    = Bento.prototype.setHeight;
Bento.Column.prototype.setWidth     = Bento.prototype.setWidth;
Bento.Column.prototype.concat       = Bento.prototype.concat;
Bento.Column.prototype.setElement   = Bento.prototype.setElement;
Bento.Column.prototype.onElementSet = Bento.prototype.onElementSet;
Bento.Column.prototype.push = function() {
  for (var i = 0, j = arguments.length, position; i < j; i++) {
    var item = Bento.Item(arguments[i], this.bento);
    for (var k = 0, other; other = this.items[k]; k++)
      if (other.top > item.top) break;
    this.items.splice(k, 0, item);
    item.setPosition(this)
  }
};
Bento.Column.prototype.setBento = function(bento) {
  this.bento = bento;
};
/*
  Bento item is a wrapper over a content object. It knows its
  size and thus it helps bento to choose the right column.
  `Bento.Item` function may be used as a constructor and a simple
  function. When a function receives a constructed `Bento.Item` object
  it repurposes it to work with given bento and column.
*/
Bento.Item = function(first) {
  if (!this.setSize) {
    var item = first instanceof Bento.Item ? first : new Bento.Item
    Bento.Item.apply(item, arguments);
    return item;
  }
  for (var i = 0, j = arguments.length, arg; i < j; i++) {
    switch (typeof (arg = arguments[i])) {
      case 'object':
        if (arg == null) break;
        if (arg instanceof Bento)
          this.setBento(arg);
        else if (arg instanceof Bento.Column)
          this.setPosition(arg);
        else if (arg instanceof Bento.Item)
          continue
        else if (arg.nodeType)
          this.setElement(arg);
        else
          this.setContent(arg);
        break;
      case 'function':
        this.onRender = arg;
        break;
      case 'undefined':
        break;
      default:
        this.setContent(arg);
    }
  }
};
Bento.Item.prototype.setSize    = Bento.prototype.setSize;
Bento.Item.prototype.setHeight  = Bento.prototype.setHeight;
Bento.Item.prototype.setWidth   = Bento.prototype.setWidth;
Bento.Item.prototype.setElement = Bento.prototype.setElement;
Bento.Item.prototype.scale      = 1;
Bento.Item.prototype.update = function() {
  this.setPosition()
}
Bento.Item.prototype.setBento = function(bento) {
  this.bento = bento;
  if (!this.column && this.width) this.setPosition()
};
Bento.Item.prototype.setScale = function(scale) {
  return this.scale = scale;
};
Bento.Item.prototype.setPosition = function(position, prepend) {
  if (!position) {
    if (!this.bento) return;
    position = this.bento.getPosition(this, prepend);
  }
  if (!position) return;
  if (position.push && position.map) {
    if (typeof position[0] == 'number') {
      var hole = position;
      position = position[2];
    } else {  
      var span = position.slice(1);
      position = position[0];
    }
  }
  if (position.items.indexOf(this) > -1) return;
  var offsetTop = 0;
  var gutter = this.bento ? this.bento.gutter : 0;
  if (hole) {
    // Fill a hole and reduce offset for the next item
    this.hole = hole;
    var ratio = this.width / this.height;
    var width = Math.min((hole[1] - gutter) * ratio, position.width - gutter);
    var height = width / ratio;
    for (var i = 0, previous, next, other; other = position.items[i++];)
      if (other.top < hole[0] && (!previous || previous.top < other.top))
        previous = other;
    var next = position.items[position.items.indexOf(previous) + 1];
    if (!previous) {
      offsetTop = hole[0];
    } else if (previous.hole) {
      offsetTop = hole[0] - previous.hole[0] - previous.height * previous.scale - gutter;
    } else
      offsetTop = hole[0] - previous.top - previous.height * previous.scale - gutter
    if (next && next.offsetTop) 
      next.setOffsetTop(next.offsetTop - height - offsetTop - gutter);
  } else
    previous = position.items[position.items.length - 1];
  var subject = previous || position;
  if (subject.whitespace) {
    if (!hole) 
      offsetTop = subject.whitespace;
    else {
      if (previous) offsetTop = hole[0] - previous.top - previous.height * previous.scale - gutter;
      this.whitespace = subject.whitespace - hole[1] - offsetTop
    }
    delete subject.whitespace;
  }
  // Add top offset to the item if applicable
  this.top = offsetTop + (previous ? previous.top + previous.height * previous.scale + gutter : 0);
  this.previous = previous;
  
  var bento = this.bento;
  if (bento) 
    var columns = bento.columns;
  if (width == null)
    width = position.width - gutter;
    
  // Calculate width for spanning item
  if (span && bento) {
    this.span = span;
    for (var i = 0, j = span.length; i < j; i++)
      width += span[i].width
  } else delete this.span;
  
  // Update item dimensions
  this.scale = width / this.width;
  var height = Math.round(this.scale * this.height);
  if (hole && hole[1] > height) this.whitespace += hole[1] - height - gutter;
  
  // Update filled hole
  if (hole) if ((position.width / (hole[1] - height)) >= this.bento.holeMaximumRatio) {
    position.holes.splice(position.holes.indexOf(hole), 1);
  } else {
    position.holes.splice(position.holes.indexOf(hole), 1, [hole[0] + height + gutter, hole[1] - height - gutter, position]);
  }
  // Register holes created by an multi column spanning item
  if (span && bento) for (var i = 0, j = span.length; i < j; i++) {
    var col = span[i];
    var holes = col.holes;
    if (!holes) holes = col.holes = [];
    var subject = col.items[col.items.length - 1] || col;
    if (position.height + height >= col.height) {
      subject.whitespace = (subject.whitespace || 0) + (position.height + height - col.height) + gutter;
    }
    var holeHeight = position.height - col.height;
    if (holeHeight && col.width / holeHeight <= bento.holeMaximumRatio) 
      holes.push([col.height, holeHeight, col]);
    col.setHeight(position.height + height + gutter)
  }
  // Register item in the column
  this.column = position;
  this.setOffsetTop(offsetTop);
  if (!hole) position.setHeight(position.height + height + gutter);
  position.push(this);
  if (this.element && this.content) this.setContent(this.content);
};
Bento.Item.prototype.setOffsetTop = function(offsetTop) {
  if (this.element) this.element.style.marginTop = offsetTop / (this.column.width) * 100 + '%';
  return this.offsetTop = offsetTop;
}
Bento.Item.prototype.setContent = function(content) {
  if (content != this.content) {
    if (content.rating) this.rating = content.rating;
    if (content.scale) this.setScale(content.scale)
    if (content.width != null) {
      this.setSize(content.width, content.height);
    }
  }
  this.setElement(this.render(content, this.element));
  this.content = content;
  if (!this.column) return;
  if (this.span && this.element) {
    if (this.bento.columns.indexOf(this.span[0]) < this.bento.columns.indexOf(this.column)) {
      var margin = this.column.width - this.width * this.scale - this.bento.gutter;
      this.element.style.marginLeft = margin / this.column.width * 100 + '%';
    }
  }  
  if (this.column.element) this.inject();
};
Bento.Item.prototype.inject = function() {
  var prev = this.hole && this.previous && this.previous.element;
  var after = prev ? prev.nextSibling : this.hole && this.column.element.firstChild
  if (this.offsetTop) this.setOffsetTop(this.offsetTop);
  this.column.element.insertBefore(this.element, after)
}
Bento.Item.prototype.reset = function() {
  delete this.previous;
  delete this.hole;
  delete this.top;
  delete this.span;
  delete this.whitespace;
  delete this.offsetTop;
  delete this.column;
}
Bento.Item.prototype.render = function(content, element) {
  if (this.onRender) element = this.onRender(content, element)
  return element
};