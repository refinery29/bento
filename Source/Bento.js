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
              self.onScroll(e)
            }
          } else if (arg.width) {
            this.setSize(arg.width, arg.height); 
          } else {
            this.patterns = arg;
          }
        }
        break;
      case 'function':
        if (!request) 
          var request = this.request = arg;
        else
          this.renderer = arg;
      case 'number':
        if (arg < 1 && arg >= 0) this.setThreshold(arg);
        else if (width == null) var width = this.setWidth(arg);
        else this.setHeight(arg);
    }
  }
  this.setPage(1);
};
Bento.prototype.threshold = 0.25
Bento.prototype.setColumns = function(settings) {
  if (arguments.length > 1 || (typeof settings != 'object' && typeof settings.item != 'function')) 
    settings = arguments;
  for (var i = 0, j = settings.length, columns = []; i < j; i++)
    columns.push(Bento.Column(this.columns && this.columns[i], settings[i]))
  if (this.columns) 
    for (var i = columns.length, j = this.columns.length; i < j; i++)
      delete this.columns[i].width;
  delete this.maxWidth
  delete this.minWidth;
  for (var i = 0, column; column = columns[i++];) {
    column.items.length = 0
    column.height = 0;
    if (this.maxWidth == null || column.width < this.minWidth) this.minWidth = column.width;
    if (this.maxWidth == null || column.width > this.maxWidth) this.maxWidth = column.width;
  }
  this.columns = columns;
  this.update();
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
  this.setSize(e.width, e.height);
};
Bento.prototype.onResize = function(e) {
  this.setScrollTop(window.scrollTop);
};
Bento.prototype.setSize = function(width, height) {
  this.setWidth(width);
  this.setHeight(height);
  if (this.update) this.update()
};
Bento.prototype.setHeight = function(height) {
  if (height.nodeType) height = height.offsetHeight || parseInt(height.style.height)
  return this.height = height;
};
Bento.prototype.setWidth = function(width) {
  if (width.nodeType) width = width.offsetWidth || parseInt(width.style.width)
  return this.width = width;
};
Bento.prototype.setThreshold = function(threshold) {
  this.threshold = threshold;
}
Bento.prototype.update = function() {
  for (var i = 0, j = this.items.length; i < j; i++)
    this.items[i].setPosition()
};
Bento.prototype.setElement = function(element) {
  this.element = element;
  if (this.onElementSet) this.onElementSet(element);
};
Bento.prototype.onElementSet = function(element) {
  this.setWidth(element);
  this.setHeight(element);
}
Bento.prototype.ratingWeight = 1;
Bento.prototype.distanceWeight = 1;
Bento.prototype.visibilityWeight = 1;
Bento.prototype.getPosition = function(item, prepend, span) {
  if (!this.columns) return;
  var width = item.width
  var height = item.height
  var ratio = width / height;
  var rating = 1 - (item.rating || 0);
  var bento = item.bento;
  var ratingWeight = this.ratingWeight;
  var visibilityWeight = this.visibilityWeight;
  var distanceWeight = this.distanceWeight;
  var size = 0;
  if (span == null) span = 1;
  if (this.patterns) for (var property in this.patterns) {
    var pattern = this.patterns[property];
    if (pattern) {
      if (pattern.ratio == null || (pattern.ratio[0] <= ratio && ratio <= pattern.ratio[1]))
      if (pattern.probability == null || (Math.random() <= pattern.probability))
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
      }
    }
  }
  if (this.subpatterns) {
    
  }
  for (var i = 0, min, max, column; column = this.columns[i++];) {
    if (!min || min.height > column.height) min = column;
    if (!max || max.height < column.height) max = column;
  }
  
  for (var i = 0, intermediate = 0, match; column = this.columns[i]; i++) {
    var above = max.height - column.height;
    var below = max.height - min.height;
    var distance = max.height ? below ? 1 - (column.height - min.height) / below : 0 : 0
    var visibility = max.height ? above ? above >= height ? 1 : 1 - above / height: 1 : 1
    var wideness = Math.min(ratio * (column.width / min.width), 4) / 4;
    var score = (rating     * ratingWeight
              + visibility  * visibilityWeight
              + distance    * distanceWeight
              + wideness    * size) / 4;
    if (span > 1) {
      if (i + span - 1 >= this.columns.length) {
        score = 0
      } else {
        for (var j = i + 1, k = i + Math.ceil(span); j < k; j++) {
          var next = this.columns[j];
          if (!next || next.height > column.height) {
            score = 0;
            break;
          }
        }
      }
    }
    if (intermediate < score) {
      intermediate = score;
      match = column;
    }
  }
  if (span > 1 && match) {
    var matches = [match];
    for (var j = this.columns.indexOf(match) + 1, k = j + Math.ceil(span) - 1; j < k; j++) 
      matches.push(this.columns[j])
    return matches;
  }
  return match;
};
var delay = 0;
Bento.prototype.push = function() {
  var self = this;
  for (var i = 0, j = arguments.length, position; i < j; i++) 
        self.items.push(Bento.Item(self, self.renderer, arguments[i]))
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
Bento.Column.prototype.setThreshold = Bento.prototype.setThreshold;
Bento.Column.prototype.setSize      = Bento.prototype.setSize;
Bento.Column.prototype.setHeight    = Bento.prototype.setHeight;
Bento.Column.prototype.setWidth     = Bento.prototype.setWidth;
Bento.Column.prototype.concat       = Bento.prototype.concat;
Bento.Column.prototype.setElement   = Bento.prototype.setElement;
Bento.Column.prototype.onElementSet = Bento.prototype.onElementSet;
Bento.Column.prototype.push = function() {
  for (var i = 0, j = arguments.length, position; i < j; i++) {
    var item = Bento.Item(arguments[i], this.bento);
    this.items.push(item);
    item.setPosition(this)
  }
};
Bento.Column.prototype.setBento = function(bento) {
  this.bento = bento;
};
/*
  Bento item is a wrapper over a content object. It knows its
  size and thus it helps bento to choose a right column.
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
Bento.Item.prototype.setPosition = function(position, prepend, reset) {
  if (!position) {
    if (!this.bento) return;
    position = this.bento.getPosition(this, prepend);
  }
  if (!position) return;
  if (position.push && position.map) {
    var span = position.splice(1);
    position = position[0];
  }
  if (position.items.indexOf(this) == -1) {
    var bento = this.bento;
    if (bento) var columns = bento.columns;
    var base = position.width;
    if (span && bento) {
      this.span = span;
      var index = columns.indexOf(position);
      for (var i = index + 1, j = i + span.length; i < j; i++)
        base += columns[i].width;
    } 
    var height = (base / this.width) * this.height;
    if (base) {
      this.setWidth(base);
      this.setHeight(height)
    }
    position.setHeight(position.height + height);
    if (span && bento) for (var i = index + 1, j = i + span.length; i < j; i++) {
      var col = columns[i];
      col.whitespace = (col.whitespace || 0) + position.height - col.height;
      col.setHeight(position.height)
    }
    this.column = position;
    position.push(this);
  }
};
Bento.Item.prototype.setContent = function(content) {
  if (content.scale) this.setScale(content.scale)
  if (content.width != null) {
    this.setSize(content.width, content.height);
  }
  this.setElement(this.render(content, this.rendered));
  if (this.column && this.column.element) {
    this.column.element.appendChild(this.element)
  }
};
Bento.Item.prototype.render = function(content, element) {
  if (this.onRender) element = this.onRender(content, element)
  return element
};
Bento.Item.prototype.stretch = function() {
  
};
Bento.Item.prototype.stretch = function() {
  
};