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
          if (!columns) {
            var columns = arg;
            this.setColumns(columns);
          } else {
            this.concat(arg);
          }
        } else {
          if (arg === window) {
            var self = this;
            window.onresize = function() {
              self.onResize(e)
            }
          } else if (arg.nodeType) this.setElement(arg);
        }
        break;
      case 'function':
        this.request = arg;
      case 'number':
        if (arg < 1 && arg >= 0) this.setThreshold(arg);
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
      delete this.columns[i].width
  this.columns = columns;
  this.update()
};
Bento.prototype.setPage = function(page) {
  if (this.request) this.requested = this.request(page, this.requested)
  return this.page = page;
};
Bento.prototype.scrollTo = function(x, y) {
  this.setScrollTop(y)
};
Bento.prototype.setScrollTop = function(top) {
  return this.scrollTop = top;
};
Bento.prototype.onResize = function(e) {
  this.setSize(e.width, e.height);
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
  if (this.columns) for (var i = 0, j, min, column; column = this.columns[i++];)
    if (column.width != null) {
      var ratio = Math.abs(column.width / item.width);
      if ((ratio >= 1 ? ratio - 1 : 1 - ratio) <= this.threshold)
        if (!min || column.height < min.height) {
          j = i;
          min = column;
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
        if (arg instanceof Bento.Column)
          delete arg.height;
        else if (arg instanceof Bento)
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
  for (var i = 0, j = arguments.length, position; i < j; i++) 
    this.items.push(Bento.Item(arguments[i], this.bento, this));
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
        if (arg == null) continue;
        if (arg instanceof Bento)
          this.setBento(arg);
        else if (arg instanceof Bento.Column)
          this.setColumn(arg);
        else if (arg instanceof Bento.Item)
          continue
        else if (arg.nodeType)
          this.setElement(arg);
        else
          this.setSize(arg.width, arg.height);
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
Bento.Item.prototype.setColumn = function(column, prepend, reset) {
  if (!column) {
    if (!this.bento) return;
    column = this.bento.getColumn(this, prepend);
  }
  if (column) column.setHeight(column.height + this.height);
  if (this.column != column) {
    this.column = column;
    column.push(this);
  }
  if (this.element && column.element)
    column.element.insertBefore(this.element, prepend && column.element.firstChild);
}
var Bento = Bento;