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
        if (arg.push) {
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
          } else if (arg.nodeType) 
            this.setElement(arg);
          else
            this.setSize(arg.width, arg.height); 
        }
        break;
      case 'function':
        if (!request) 
          var request = this.request = arg;
        else
          this.scaler = arg;
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
    this.items[i].setColumn()
};
Bento.prototype.setElement = function(element) {
  this.element = element;
  if (this.onElementSet) this.onElementSet(element);
};
Bento.prototype.onElementSet = function(element) {
  this.setWidth(element);
  this.setHeight(element);
}
Bento.prototype.getColumn = function(item, prepend) {
  if (!this.columns) return;
/*
  When an item doesnt fit any column, it gets downscaled. 
  Portait-oriented items are scaled to fit the most narrow
  column, while landscape oriented items are scaled to fit 
  in the widest column.
*/
  if (item.width > this.maxWidth) {
    var ratio = item.width / item.height;
    var base = ((ratio > 1) ? this.maxWidth - (this.maxWidth - this.minWidth) / 2 : this.minWidth)
    var threshold = this.threshold * (ratio > 1 ? 1.5 : 1);
    var width = base;
    var height = base * ratio;
  } else {
    var width = item.width;
  }
  for (var i = 0, j, min, column; column = this.columns[i++];) {
    if (column.width != null) {
      var proportion = Math.abs(column.width / width);
      if (proportion >= 1
        ? proportion - 1 <= (threshold || this.threshold) || (column.width == item.bento.maxWidth && ratio > 1)
        : 1 - proportion <= (threshold || this.threshold) ) {
        if (!min || column.height < min.height) {
          j = i;
          min = column;
        }
      }
    }
  }
  return min;
};
Bento.prototype.push = function() {
  for (var i = 0, j = arguments.length, position; i < j; i++) 
    this.items.push(Bento.Item(arguments[i], this));
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
    item.setColumn(this)
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
          this.setColumn(arg);
        else if (arg instanceof Bento.Item)
          continue
        else if (arg.nodeType)
          this.setElement(arg);
        else
          this.setContent(arg);
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
  this.setColumn()
}
Bento.Item.prototype.setBento = function(bento) {
  this.bento = bento;
  if (!this.column) this.setColumn()
};
Bento.Item.prototype.setScale = function(scale) {
  return this.scale = scale;
};
Bento.Item.prototype.setColumn = function(column, prepend, reset) {
  if (!column) {
    if (!this.bento) return;
    column = this.bento.getColumn(this, prepend);
  }
  if (!column) return;
  if (column.items.indexOf(this) == -1) {
    column.setHeight(column.height + this.height);
    this.column = column;
    column.push(this);
  }
  if (this.element && column.element)
    column.element.insertBefore(this.element, prepend && column.element.firstChild);
};
Bento.Item.prototype.setContent = function(content) {
  var scale = content.scale || this.bento && this.bento.scaler && this.bento.scaler(content, this);
  if (scale) this.setScale(scale)
  if (content.width != null) {
    this.setSize(content.width, content.height);
  }
  this.render();
};
Bento.Item.prototype.render = function() {
  
};
Bento.Item.prototype.stretch = function() {
  
};
Bento.Item.prototype.stretch = function() {
  
};