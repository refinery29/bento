describe("Bento", function() {
  var indexer = function(i) { 
    return i.bento.items.indexOf(i);
  }
  describe('when given an element', function() {
    it ('should read & assign width and height of an element', function() {
      var el = document.createElement('div');
      el.style.height = '768px';
      el.style.width = '1024px';
      var bento = new Bento(el);
      expect(bento.height).toBe(768);
      expect(bento.width).toBe(1024);
    })
  })
  describe('when given a function', function() {
    it ('should call that function to fetch data', function() {
      var times = 0;
      var bento = new Bento(function(page, memo) {
        times++;
      });
      expect(times).toEqual(1)
      bento.load(1);        
      expect(times).toEqual(2)
      bento.load(2);        
      expect(times).toEqual(3)
    })
  })
  describe('when given an array of columns', function() {
    it ('should set columns', function() {
      var bento = new Bento([1, 2, 3]);
      expect(bento.columns).toEqual([Bento.Column(1), Bento.Column(2), Bento.Column(3)])
    })
    describe('and given an array of items', function() {
      it ('should position them in columns', function() {
        var items = [{width: 100, height: 150}, {width: 100, height: 125}, {width: 100, height: 200}, {width: 100, height: 100}, {width: 100, height: 100}];
        var bento = new Bento([ 100, 100, 100 ], items);
        expect(bento.items[0].column).toBe(bento.columns[0]);
        expect(bento.items[1].column).toBe(bento.columns[1]);
        expect(bento.items[2].column).toBe(bento.columns[2]);
        expect(bento.items[3].column).toBe(bento.columns[1]);
        expect(bento.items[4].column).toBe(bento.columns[0]);
        expect(bento.columns[0].height).toEqual(250)
        expect(bento.columns[1].height).toEqual(225)
        expect(bento.columns[2].height).toEqual(200)
        bento.setColumns([ 100, 100, 100, 100 ])
        expect(bento.columns[0].height).toEqual(150)
        expect(bento.columns[1].height).toEqual(125)
        expect(bento.columns[2].height).toEqual(200)
        expect(bento.columns[2].height).toEqual(200)
        expect(bento.items[0].column).toBe(bento.columns[0]);
        expect(bento.items[1].column).toBe(bento.columns[1]);
        expect(bento.items[2].column).toBe(bento.columns[2]);
        expect(bento.items[3].column).toBe(bento.columns[3]);
        expect(bento.items[4].column).toBe(bento.columns[3]);
        bento.setColumns([ 100, 100, 100])
        expect(bento.items[0].column).toBe(bento.columns[0]);
        expect(bento.items[1].column).toBe(bento.columns[1]);
        expect(bento.items[2].column).toBe(bento.columns[2]);
        expect(bento.items[3].column).toBe(bento.columns[1]);
        expect(bento.items[4].column).toBe(bento.columns[0]);
        bento.push({width: 100, height: 100})
        expect(bento.items[5].column).toBe(bento.columns[2]);
        bento.push({width: 100, height: 100})
        expect(bento.items[6].column).toBe(bento.columns[1]);
      })
      
      describe('and some items only fit wide columns', function() {
        it ('should position them in right columns', function() {
          var items = [{width: 100, height: 150}, {width: 100, height: 125}, {width: 150, height: 200}, 
                       {width: 140, height: 100}, {width: 100, height: 100}, {width: 100, height: 100}];
          var bento = new Bento(0.25, [ 100, 150, 100 ]             , {
            'move_wide_images_to_biggest_column': {
              ratio: [1, 3],
              size: 2
            },
            'move_narrow_images_to_smallest_column': {
              ratio: [0, 1],
              size: -.1
            },
          }, items);
          expect(bento.maxWidth).toBe(150);
          expect(bento.minWidth).toBe(100);
          expect(bento.items[0].column).toBe(bento.columns[0]);
          expect(bento.items[1].column).toBe(bento.columns[2]);
          expect(bento.items[2].column).toBe(bento.columns[1]);
        })
      })
      
      describe('and items are overly large sized', function() {
        it ('should downscale items: portait items take smallest columns, landspace take widest', function() {
          var items = [{width: 768, height: 1024}, {width: 1024, height: 768}, {width: 512, height: 384},
                       {width: 768, height: 1024}, {width: 1024, height: 768}, {width: 512, height: 384}];
          var bento = new Bento([300, 200, 100], {
            'move_wide_images_to_biggest_column': {
              ratio: [1, 3],
              size: 2
            },
            'move_narrow_images_to_smallest_column': {
              ratio: [0, 1],
              size: -.1
            },
          }, items);
          expect(bento.items[0].column).toBe(bento.columns[2]);
          expect(bento.items[1].column).toBe(bento.columns[0]);
          expect(bento.items[2].column).toBe(bento.columns[1]);
          expect(bento.items[3].column).toBe(bento.columns[2]);
          expect(bento.items[4].column).toBe(bento.columns[1]);
          expect(bento.items[5].column).toBe(bento.columns[0]);
        })
      })
    });
    describe('when a composition creates long holes that a single image cant fill', function() {
      it ('should fill hole with multiple images', function() {
        var items = [{width: 200, height: 800}, {rating: 0.9, width: 400, height: 200}, {width: 200, height: 200}, {width: 200, height: 200}, {width: 200, height: 200}, {width: 200, height: 200}]
        var bento = new Bento([200, 200], {
          'span_popular_images': {
            rating: [0.5, 1],
            span: 2
          }
        }, items);
        expect(bento.columns[0].height).toBe(1000);
        expect(bento.columns[1].height).toBe(1000);
        expect(bento.items[0].column).toBe(bento.columns[0]);
        expect(bento.items[1].column).toBe(bento.columns[0]);
        expect(bento.items[2].column).toBe(bento.columns[1]);
        expect(bento.items[3].column).toBe(bento.columns[1]);
        expect(bento.items[4].column).toBe(bento.columns[1]);
        expect(bento.items[5].column).toBe(bento.columns[1]);
        expect(bento.items.map(function(item) { 
          return item.offsetTop;
        })).toEqual([0, 0, 0, 0, 0, 0])
      })
      describe('and a hole is after another image that spans', function() {
        it ('should fill hole with multiple images', function() {
          var items = [{rating: 0.9, width: 400, height: 200}, {width: 200, height: 800}, {rating: 0.9, width: 400, height: 200}, {width: 200, height: 200}, {width: 200, height: 200}, {width: 200, height: 200}, {width: 200, height: 200}]
          var bento = new Bento([200, 200], {
            'span_popular_images': {
              rating: [0.5, 1],
              span: 2
            }
          }, items);
          expect(bento.columns[0].height).toBe(1200);
          expect(bento.columns[1].height).toBe(1200);
          expect(bento.items[0].column).toBe(bento.columns[0]);
          expect(bento.items[1].column).toBe(bento.columns[0]);
          expect(bento.items[2].column).toBe(bento.columns[0]);
          expect(bento.items[3].column).toBe(bento.columns[1]);
          expect(bento.items[4].column).toBe(bento.columns[1]);
          expect(bento.items[5].column).toBe(bento.columns[1]);
          expect(bento.items[6].column).toBe(bento.columns[1]);
          expect(bento.items.map(function(item) { 
            return item.offsetTop;
          })).toEqual([0, 0, 0, 200, 0, 0, 0])
          //expect(bento.items[0].getDependent()).toEqual([bento.items[1], bento.items[3]])
        });
      })
    })
    describe('when item is set to span between multiple columns', function() {
      it ('should take space in both columns and fill holes', function() {
        var items = [{width: 200, height: 750},  {width: 1024, height: 768}, {width: 200, height: 300}, 
                     {width: 800, height: 600}, {width: 1024, height: 768}, {width: 100, height: 200}, 
                     {width: 100, height: 200}, {width: 50, height: 100}];
        var bento = new Bento([200, 300, 200], {
          'span_wide_images': {
            ratio: [1, 3],
            span: 2
          }
        }, items);
        expect(bento.items[0].column).toBe(bento.columns[0]);
        expect(bento.items[1].column).toBe(bento.columns[1]);
        expect(bento.items[1].width * bento.items[1].scale).toBe(500);
        expect(bento.items[1].height * bento.items[1].scale).toBe(375)
        expect(bento.items[2].column).toBe(bento.columns[1]);
        expect(bento.items[2].width * bento.items[2].scale).toBe(300);
        expect(bento.items[2].height * bento.items[2].scale).toBe(450)
        expect(bento.items[3].column).toBe(bento.columns[1]);
        expect(bento.items[4].column).toBe(bento.columns[1]);
        expect(bento.items[5].column).toBe(bento.columns[2]);
        expect(bento.items[5].width * bento.items[5].scale).toBe(200)
        expect(bento.items[5].height * bento.items[5].scale).toBe(400)
        expect(bento.items[6].column).toBe(bento.columns[0])
        expect(bento.items[6].height * bento.items[6].scale).toBe(400)
        expect(bento.items[6].width * bento.items[6].scale).toBe(200)
        expect(bento.items[7].column).toBe(bento.columns[0])
        expect(bento.columns.map(function(c) {
          return !c.holes || !c.holes.length
        })).toEqual([true, true, true])
        expect(bento.columns.map(function(c) {
          return c.height
        })).toEqual([1550, 1575, 1575])
      })
    })
    
    describe('and there is no space on the right to span', function() {
      it ('should span to the left and then fill holes', function() {
        var items = [{width: 50, height: 100}, {width: 50, height: 150}, {width: 50, height: 200}, 
                     {width: 200, height: 50}, {width: 50, height: 60}, {width: 200, height: 50}];
        var bento = new Bento([100, 100, 100], {
          'span_wide_images': {
            ratio: [1, 5],
            span: 2
          }
        }, items);
        expect(bento.items[0].column).toBe(bento.columns[0])
        expect(bento.items[1].column).toBe(bento.columns[1])
        expect(bento.items[2].column).toBe(bento.columns[2])
        expect(bento.items[3].column).toBe(bento.columns[1])
        expect(bento.items[4].column).toBe(bento.columns[0])
        expect(bento.items[5].column).toBe(bento.columns[0])
        expect(Math.floor(bento.items[4].height * bento.items[4].scale)).toBe(100)
        expect(Math.floor(bento.items[4].width * bento.items[4].scale)).toBe(83)
        expect(bento.columns.map(function(c) {
          return c.height
        })).toEqual([400, 400, 400])
        expect(bento.columns.map(function(c) {
          return !c.holes || !c.holes.length
        })).toEqual([true, true, true])
      })
    })
    
    describe('and column height is limited', function() {
      it ('should not let column overflow', function() {
        var items = [{width: 100, height: 100}, {width: 100, height: 100}, {width: 100, height: 100}
                     ,{width: 100, height: 200}, {width: 100, height: 100}, {width: 100, height: 100}
                     , {width: 100, height: 100}, {width: 100, height: 100}
                     ];
        var bento = new Bento([[100, 250], [100, 300], [100, 200]], {
          
        }, items)
        expect(bento.items[0].column).toBe(bento.columns[0])
        expect(bento.items[1].column).toBe(bento.columns[1])
        expect(bento.items[2].column).toBe(bento.columns[2])
        expect(bento.items[3].column).toBe(bento.columns[1])
        expect(bento.items[4].column).toBe(bento.columns[2])
        expect(bento.items[5].column).toBe(bento.columns[0])
        expect(bento.items[6].column).toBe(bento.columns[0])
        expect(bento.items[7].column).toBeUndefined()
      })
    });
  });
  describe('.setColumns', function() {
    it ('should set & update columns', function() {
      var bento = new Bento;
      bento.setColumns([1, 2, 3])
      var copy = bento.columns.slice();
      expect(bento.columns).toEqual([Bento.Column(1), Bento.Column(2), Bento.Column(3)])
      bento.setColumns([4, 5, 6])
      expect(bento.columns[0]).toBe(copy[0])
      expect(bento.columns[1]).toBe(copy[1])
      expect(bento.columns[2]).toBe(copy[2])
      expect(bento.columns).toEqual([Bento.Column(4), Bento.Column(5), Bento.Column(6)])
    })
    
    describe('when given node list', function() {
      it ('should read widths from elements', function() {
        var parent = document.createElement('div');
        var a = document.createElement('div');
        var b = document.createElement('div');
        var c = document.createElement('div');
        a.style.width = '100px'
        b.style.width = '200px'
        c.style.width = '300px'
        parent.appendChild(a)
        parent.appendChild(b)
        parent.appendChild(c)
        var bento = new Bento;
        bento.setColumns(parent.childNodes);
        expect(bento.columns[0].width).toBe(100)
        expect(bento.columns[1].width).toBe(200)
        expect(bento.columns[2].width).toBe(300)
        parent.removeChild(b)
        bento.setColumns(parent.childNodes);
        expect(bento.columns[0].width).toBe(100)
        expect(bento.columns[1].width).toBe(300)
        expect(bento.columns[2]).toBeUndefined()
      })
    })
  })
  describe('.Column', function() {
    describe('when given a number', function() {
      it ('should treat it as width', function() {
        expect(Bento.Column(123).width).toBe(123)
      })
    })
    describe('when given an element', function() {
      it ('should treat it as width', function() {
        var el = document.createElement('div');
        el.style.width = '130px';
        var col = Bento.Column(el);
        expect(col.width).toBe(130)
        el.style.width = '150px';
        expect(Bento.Column(col, el).width).toBe(150)
      })
    })
    describe('when given a bento object', function() {
      it ('should assign bento to a column', function() {
        var bento = new Bento;
        var column = new Bento.Column(bento);
        expect(column.bento).toBe(bento)
      })
    })
    describe('when given a bento object', function() {
      it ('should update the column without creating a new object', function() {
        var bento = new Bento;
        var old = new Bento.Column(123);
        var updated = Bento.Column(old, bento)
        expect(old).toBe(updated)
        expect(updated.width).toBe(123);
        expect(updated.bento).toBe(bento);
      })
    })
    describe('#getItemAt', function() {
      describe('at the top edge of a column', function() {
        it ('should return that item', function() {
          var bento = new Bento([100]);
          bento.push({width: 100, height: 100})
          expect(bento.columns[0].getItemAt(-1)).toBeUndefined()
          expect(bento.columns[0].getItemAt(0)).toBe(bento.columns[0].items[0])
          expect(bento.columns[0].getItemAt(1)).toBe(bento.columns[0].items[0])
        })
      })
      describe('in the middle of a column', function() {
        it ('should return that item', function() {
          var bento = new Bento([100]);
          bento.push({width: 100, height: 100}, {width: 100, height: 200})
          expect(bento.columns[0].getItemAt(50)).toBe(bento.columns[0].items[0])
          expect(bento.columns[0].getItemAt(99)).toBe(bento.columns[0].items[0])
          expect(bento.columns[0].getItemAt(100)).toBe(bento.columns[0].items[0])
          expect(bento.columns[0].getItemAt(101)).toBe(bento.columns[0].items[1])
          expect(bento.columns[0].getItemAt(150)).toBe(bento.columns[0].items[1])
        })
      })
      describe('at the bottom edge of an item', function() {
        it ('should return that item', function() {
          var bento = new Bento([100]);
          bento.push({width: 100, height: 100}, {width: 100, height: 200})
          expect(bento.columns[0].getItemAt(250)).toBe(bento.columns[0].items[1])
          expect(bento.columns[0].getItemAt(299)).toBe(bento.columns[0].items[1])
          expect(bento.columns[0].getItemAt(300)).toBe(bento.columns[0].items[1])
          expect(bento.columns[0].getItemAt(301)).toBeUndefined()
        })
      })
    })
  });
  describe('.Item', function() {
    describe('when given an object', function() {
      it ('should extract dimensions', function() {
        var item = Bento.Item({width: 100, height: 200})
        expect(item.width).toBe(100);
        expect(item.height).toBe(200);
      })
    })
    describe('when given a bento object', function() {
      it ('should assign a bento to a column', function() {
        var bento = new Bento()
        var item = Bento.Item(bento);
        expect(item.bento).toBe(bento)
      })
    })
    describe('when given a column object', function() {
      it ('should assign a column to an item', function() {
        var column = new Bento.Column()
        var item = Bento.Item(column);
        expect(item.column).toBe(column)
      })
    })
    describe('when given a bento object', function() {
      it ('should update the column without creating a new object', function() {
        var bento = new Bento;
        var old = new Bento.Column(123);
        var updated = Bento.Column(old, bento)
        expect(old).toBe(updated)
        expect(updated.width).toBe(123);
        expect(updated.bento).toBe(bento);
      })
    })
    describe('when gutter is set', function() {
      it ('should resize images accordingly', function() {
        var items = [{width: 100, height: 100}, {width: 100, height: 200}];
        var bento = new Bento(5, [100, 200], items);
        expect(bento.columns[0].height).toEqual(100);
        expect(bento.columns[1].height).toEqual(395);
      })
    })
    describe('#getDependent', function() {
      describe('in a simple layout without spans', function() {
        it ('should return immediately next element in column', function() {
          var items = [{width: 100, height: 100}, {width: 100, height: 100}];
          var bento = new Bento([100], items);
          expect(bento.items[0].getDependent()).toEqual([bento.items[1]])
        })
      })
      describe('in a layout with an item spanning through multiple columns', function() {
        it ('should return spanning item', function() {
          var items = [{width: 100, height: 100}, {width: 100, height: 100}, {width: 100, height: 100}, 
                       {rating: 0.6, width: 300, height: 100                                         }, 
                       {width: 100, height: 100}, {rating: 0.4, width: 200, height: 100              }];
          var bento = new Bento([100, 100, 100], {
            'span_popular_images': {
              rating: [0.01, 0.5],
              span: 2
            },
            'span_very_popular_images': {
              rating: [0.5, 1],
              span: 3
            }
          }, items);
          expect(bento.items[0].getDependent(1).map(indexer)).toEqual([3, 5])
          expect(bento.items[0].getDependent(2).map(indexer)).toEqual([3, 1])
          expect(bento.items[0].getDependent(3).map(indexer)).toEqual([3, 1, 2])
          expect(bento.items[1].getDependent(1).map(indexer)).toEqual([3, 5])
          expect(bento.items[1].getDependent(2).map(indexer)).toEqual([3, 5, 2])
          expect(bento.items[1].getDependent(3).map(indexer)).toEqual([0, 5, 2])
          expect(bento.items[2].getDependent(1).map(indexer)).toEqual([3, 5])
          expect(bento.items[2].getDependent(2).map(indexer)).toEqual([3, 1])
          expect(bento.items[2].getDependent(3).map(indexer)).toEqual([0, 1])
          expect(bento.items[3].getDependent(1).map(indexer)).toEqual([4, 5])
          expect(bento.items[3].getDependent(2).map(indexer)).toEqual([4, 5])
          expect(bento.items[3].getDependent(3).map(indexer)).toEqual([4, 5])
          expect(bento.items[4].getDependent(1).map(indexer)).toEqual([])
          expect(bento.items[4].getDependent(2).map(indexer)).toEqual([5])
          expect(bento.items[4].getDependent(3).map(indexer)).toEqual([5])
          expect(bento.items[5].getDependent(1).map(indexer)).toEqual([])
          expect(bento.items[5].getDependent(2).map(indexer)).toEqual([])
          expect(bento.items[5].getDependent(3).map(indexer)).toEqual([4])
        });
        
        it ('should return items after spanning item', function() {
          var items = [{width: 100, height: 100}, {width: 100, height: 100}, 
                       {width: 100, height: 100}, {width: 100, height: 100}, 
                       {width: 200, height: 100, rating: 0.25             }, 
                       {width: 100, height: 100}, {width: 100, height: 100}];
          var bento = new Bento([100, 100], {
            'span_popular_images': {
              rating: [0.01, 1],
              span: 2
            }
          }, items)
          expect(bento.items[0].getDependent(1).map(indexer)).toEqual([2, 6])
          expect(bento.items[0].getDependent(2).map(indexer)).toEqual([2, 1])
          expect(bento.items[1].getDependent(1).map(indexer)).toEqual([4, 3])
          expect(bento.items[1].getDependent(2).map(indexer)).toEqual([0, 3])
          expect(bento.items[2].getDependent(1).map(indexer)).toEqual([4, 6])
          expect(bento.items[2].getDependent(2).map(indexer)).toEqual([4, 3])
          expect(bento.items[3].getDependent(1).map(indexer)).toEqual([4, 6])
          expect(bento.items[3].getDependent(2).map(indexer)).toEqual([2, 6])
          expect(bento.items[4].getDependent(1).map(indexer)).toEqual([5, 6])
          expect(bento.items[4].getDependent(2).map(indexer)).toEqual([5, 6])
          expect(bento.items[5].getDependent(1).map(indexer)).toEqual([])
          expect(bento.items[5].getDependent(2).map(indexer)).toEqual([6])
          expect(bento.items[6].getDependent(1).map(indexer)).toEqual([])
          expect(bento.items[6].getDependent(2).map(indexer)).toEqual([5])
        })
        
        it ('should return items after multiple spanning items', function() {
          var items = [{rating: 0.4, width: 200, height: 200              }, {width: 100, height: 100}, 
                                                                             {width: 100, height: 100}, 
                       {rating: 0.6, width: 300, height: 100                                         }, 
                       {width: 100, height: 100}, {width: 100, height: 100}, {width: 100, height: 100}];
          var bento = new Bento([100, 100, 100], {
            'span_popular_images': {
              rating: [0.01, 0.5],
              span: 2
            },
            'span_very_popular_images': {
              rating: [0.5, 1],
              span: 3
            }
          }, items);
          expect(bento.items[0].getDependent(1).map(indexer)).toEqual([3, 5, 6])
          expect(bento.items[0].getDependent(2).map(indexer)).toEqual([3, 5, 6])
          expect(bento.items[0].getDependent(3).map(indexer)).toEqual([3, 5, 1])
          expect(bento.items[1].getDependent(1).map(indexer)).toEqual([3, 5, 2])
          expect(bento.items[1].getDependent(2).map(indexer)).toEqual([0, 5, 2])
          expect(bento.items[1].getDependent(3).map(indexer)).toEqual([0, 5, 2])
          expect(bento.items[2].getDependent(1).map(indexer)).toEqual([3, 5, 6])
          expect(bento.items[2].getDependent(2).map(indexer)).toEqual([0, 5, 6])
          expect(bento.items[2].getDependent(3).map(indexer)).toEqual([0, 5, 6])
          expect(bento.items[3].getDependent(1).map(indexer)).toEqual([4, 5, 6])
          expect(bento.items[3].getDependent(2).map(indexer)).toEqual([4, 5, 6])
          expect(bento.items[3].getDependent(3).map(indexer)).toEqual([4, 5, 6])
          expect(bento.items[4].getDependent(1).map(indexer)).toEqual([])
          expect(bento.items[4].getDependent(2).map(indexer)).toEqual([5])
          expect(bento.items[4].getDependent(3).map(indexer)).toEqual([5, 6])
          expect(bento.items[5].getDependent(1).map(indexer)).toEqual([])
          expect(bento.items[5].getDependent(2).map(indexer)).toEqual([6])
          expect(bento.items[5].getDependent(3).map(indexer)).toEqual([4, 6])
          expect(bento.items[6].getDependent(1).map(indexer)).toEqual([])
          expect(bento.items[6].getDependent(2).map(indexer)).toEqual([5])
          expect(bento.items[6].getDependent(3).map(indexer)).toEqual([4, 5])
        })
        
        it ('should return items after multiple spanning items in a reverse setup', function() {
          var items = [{width: 100, height: 100}, {rating: 0.4, width: 200, height: 200              },
                       {width: 100, height: 100}, 
                       {rating: 0.6, width: 300, height: 100                                         }, 
                       {width: 100, height: 100}, {width: 100, height: 100}, {width: 100, height: 100}];
          var bento = new Bento([100, 100, 100], {
            'span_popular_images': {
              rating: [0.01, 0.5],
              span: 2
            },
            'span_very_popular_images': {
              rating: [0.5, 1],
              span: 3
            }
          }, items);
          expect(bento.items[0].getDependent(1).map(indexer)).toEqual([2, 5, 6])
          expect(bento.items[0].getDependent(2).map(indexer)).toEqual([2, 1, 6])
          expect(bento.items[0].getDependent(3).map(indexer)).toEqual([2, 1, 6])
          expect(bento.items[1].getDependent(1).map(indexer)).toEqual([3, 5, 6])
          expect(bento.items[1].getDependent(2).map(indexer)).toEqual([3, 5, 6])
          expect(bento.items[1].getDependent(3).map(indexer)).toEqual([0, 5, 6])
          expect(bento.items[2].getDependent(1).map(indexer)).toEqual([3, 5, 6])
          expect(bento.items[2].getDependent(2).map(indexer)).toEqual([3, 1, 6])
          expect(bento.items[2].getDependent(3).map(indexer)).toEqual([3, 1, 6])
          expect(bento.items[3].getDependent(1).map(indexer)).toEqual([4, 5, 6])
          expect(bento.items[3].getDependent(2).map(indexer)).toEqual([4, 5, 6])
          expect(bento.items[3].getDependent(3).map(indexer)).toEqual([4, 5, 6])
          expect(bento.items[4].getDependent(1).map(indexer)).toEqual([])
          expect(bento.items[4].getDependent(2).map(indexer)).toEqual([5])
          expect(bento.items[4].getDependent(3).map(indexer)).toEqual([5, 6])
          expect(bento.items[5].getDependent(1).map(indexer)).toEqual([])
          expect(bento.items[5].getDependent(2).map(indexer)).toEqual([6])
          expect(bento.items[5].getDependent(3).map(indexer)).toEqual([4, 6])
          expect(bento.items[6].getDependent(1).map(indexer)).toEqual([])
          expect(bento.items[6].getDependent(2).map(indexer)).toEqual([5])
          expect(bento.items[6].getDependent(3).map(indexer)).toEqual([4, 5])
        })
        
        it ('should return items after multiple spanning items in a cascade setup', function() {
          var items = [{width: 100, height: 100}, {rating: 0.4, width: 200, height: 100              },
                       {rating: 0.4, width: 200, height: 100              }, {width: 100, height: 100}, 
                       {width: 100, height: 100}, {rating: 0.4, width: 200, height: 100              },
                       {rating: 0.4, width: 200, height: 100              }, {width: 100, height: 100},
                       {width: 100, height: 100}, {rating: 0.4, width: 200, height: 100              },
                       {rating: 0.4, width: 200, height: 100              }, {width: 100, height: 100}];
          var bento = new Bento([100, 100, 100], {
            'span_popular_images': {
              rating: [0.01, 0.5],
              span: 2
            }
          }, items);
          var indexer = function(i) { 
            return bento.items.indexOf(i);
          }
          expect(bento.items[0].getDependent(1).map(indexer)).toEqual([2, 5, 7])
          expect(bento.items[0].getDependent(2).map(indexer)).toEqual([2, 1, 3])
          expect(bento.items[0].getDependent(3).map(indexer)).toEqual([2, 1, 3])
          expect(bento.items[1].getDependent(1).map(indexer)).toEqual([2, 5, 3])
          expect(bento.items[1].getDependent(2).map(indexer)).toEqual([2, 5, 3])
          expect(bento.items[1].getDependent(3).map(indexer)).toEqual([0, 5, 3])
          expect(bento.items[2].getDependent(1).map(indexer)).toEqual([4, 5, 7])
          expect(bento.items[2].getDependent(2).map(indexer)).toEqual([4, 5, 7])
          expect(bento.items[2].getDependent(3).map(indexer)).toEqual([4, 5, 3])
          expect(bento.items[3].getDependent(1).map(indexer)).toEqual([6, 5, 7])
          expect(bento.items[3].getDependent(2).map(indexer)).toEqual([2, 5, 7])
          expect(bento.items[3].getDependent(3).map(indexer)).toEqual([2, 5, 7])
          expect(bento.items[4].getDependent(1).map(indexer)).toEqual([6, 9, 11])
          expect(bento.items[4].getDependent(2).map(indexer)).toEqual([6, 5, 7])
          expect(bento.items[4].getDependent(3).map(indexer)).toEqual([6, 5, 7])
          expect(bento.items[5].getDependent(1).map(indexer)).toEqual([6, 9, 7])
          expect(bento.items[5].getDependent(2).map(indexer)).toEqual([6, 9, 7])
          expect(bento.items[5].getDependent(3).map(indexer)).toEqual([4, 9, 7])
          expect(bento.items[6].getDependent(1).map(indexer)).toEqual([8, 9, 11])
          expect(bento.items[6].getDependent(2).map(indexer)).toEqual([8, 9, 11])
          expect(bento.items[6].getDependent(3).map(indexer)).toEqual([8, 9, 7])
          expect(bento.items[7].getDependent(1).map(indexer)).toEqual([10, 9, 11])
          expect(bento.items[7].getDependent(2).map(indexer)).toEqual([6, 9, 11])
          expect(bento.items[7].getDependent(3).map(indexer)).toEqual([6, 9, 11])
          expect(bento.items[8].getDependent(1).map(indexer)).toEqual([10])
          expect(bento.items[8].getDependent(2).map(indexer)).toEqual([10, 9, 11])
          expect(bento.items[8].getDependent(3).map(indexer)).toEqual([10, 9, 11])
          expect(bento.items[9].getDependent(1).map(indexer)).toEqual([10, 11])
          expect(bento.items[9].getDependent(2).map(indexer)).toEqual([10, 11])
          expect(bento.items[9].getDependent(3).map(indexer)).toEqual([8, 11])
          expect(bento.items[10].getDependent(1).map(indexer)).toEqual([])
          expect(bento.items[10].getDependent(2).map(indexer)).toEqual([])
          expect(bento.items[10].getDependent(3).map(indexer)).toEqual([11])
          expect(bento.items[11].getDependent(1).map(indexer)).toEqual([])
          expect(bento.items[11].getDependent(2).map(indexer)).toEqual([10])
          expect(bento.items[11].getDependent(3).map(indexer)).toEqual([10])
        })
      })
      
      it ('should return items after a spanning images side-by-side', function() {
        var items = [{rating: 0.5, width: 200, height: 250           }, {width: 100, height: 100}, {width: 100, height: 100},
                                                                        {rating: 0.5, width: 200, height: 100              },
                                                                        {width: 100, height: 150}, {width: 100, height: 150},
                     {rating: 0.5, width: 200, height: 100           },
                     {rating: 0.5, width: 200, height: 100           }, {rating: 0.5, width: 200, height: 100           }
                    ];
        var bento = new Bento([100, 100, 100, 100], {
          'span_popular_images': {
            rating: [0.01, 0.5],
            span: 2
          }
        }, items);
        var indexer = function(i) { 
          return bento.items.indexOf(i);
        }
        expect(bento.items[0].getDependent(1).map(indexer)).toEqual([6])
        expect(bento.items[0].getDependent(2).map(indexer)).toEqual([6])
        expect(bento.items[0].getDependent(3).map(indexer)).toEqual([6, 1, 5])
        expect(bento.items[0].getDependent(4).map(indexer)).toEqual([6, 1, 2])
        expect(bento.items[1].getDependent(1).map(indexer)).toEqual([3, 5]);
        expect(bento.items[1].getDependent(2).map(indexer)).toEqual([3, 2]);
        expect(bento.items[1].getDependent(3).map(indexer)).toEqual([0, 3, 2]);
        expect(bento.items[1].getDependent(4).map(indexer)).toEqual([0, 3, 2]);
        expect(bento.items[2].getDependent(1).map(indexer)).toEqual([3, 5]);
        expect(bento.items[2].getDependent(2).map(indexer)).toEqual([1, 5]);
        expect(bento.items[2].getDependent(3).map(indexer)).toEqual([0, 1, 5]);
        expect(bento.items[2].getDependent(4).map(indexer)).toEqual([0, 1, 5]);
        expect(bento.items[3].getDependent(1).map(indexer)).toEqual([4, 5]);
        expect(bento.items[3].getDependent(2).map(indexer)).toEqual([4, 5]);
        expect(bento.items[3].getDependent(3).map(indexer)).toEqual([0, 4, 5]);
        expect(bento.items[3].getDependent(4).map(indexer)).toEqual([0, 4, 5]);
        expect(bento.items[4].getDependent(1).map(indexer)).toEqual([8]);
        expect(bento.items[4].getDependent(2).map(indexer)).toEqual([8, 5]);
        expect(bento.items[4].getDependent(3).map(indexer)).toEqual([0, 8, 5]);
        expect(bento.items[4].getDependent(4).map(indexer)).toEqual([0, 8, 5]);
        expect(bento.items[5].getDependent(1).map(indexer)).toEqual([8]);
        expect(bento.items[5].getDependent(2).map(indexer)).toEqual([4]);
        expect(bento.items[5].getDependent(3).map(indexer)).toEqual([0, 4]);
        expect(bento.items[5].getDependent(4).map(indexer)).toEqual([0, 4]);
        expect(bento.items[6].getDependent(1).map(indexer)).toEqual([7]);
        expect(bento.items[6].getDependent(2).map(indexer)).toEqual([7]);
        expect(bento.items[6].getDependent(3).map(indexer)).toEqual([7, 4]);
        expect(bento.items[6].getDependent(4).map(indexer)).toEqual([7, 4, 5]);
      })
      
      describe('when given span', function() {
        it ('should return items that will be overflown by the new span', function() {
          var items = [{width: 100, height: 100}, {width: 100, height: 100}, {width: 100, height: 100}, 
                       {rating: 0.5, width: 200, height: 100           }, {width: 100, height: 100},
                       {width: 100, height: 100}, {rating: 0.5, width: 200, height: 100           },
                       {width: 100, height: 100}, {width: 100, height: 100}, {width: 100, height: 100}
                      ];
          var bento = new Bento([100, 100, 100], {
            'span_popular_images': {
              rating: [0.01, 0.5],
              span: 2
            }
          }, items);
          expect(bento.items[0].getDependent(1).map(indexer)).toEqual([3, 6, 9])
          expect(bento.items[0].getDependent(2).map(indexer)).toEqual([3, 1, 9])
          expect(bento.items[0].getDependent(3).map(indexer)).toEqual([3, 1, 2])
          expect(bento.items[1].getDependent(1).map(indexer)).toEqual([3, 6, 9])
          expect(bento.items[1].getDependent(2).map(indexer)).toEqual([3, 6, 2])
          expect(bento.items[1].getDependent(3).map(indexer)).toEqual([0, 6, 2])
          expect(bento.items[2].getDependent(1).map(indexer)).toEqual([6, 4])
          expect(bento.items[2].getDependent(2).map(indexer)).toEqual([3, 1, 4])
          expect(bento.items[2].getDependent(3).map(indexer)).toEqual([0, 1, 4])
          expect(bento.items[3].getDependent(1).map(indexer)).toEqual([5, 6, 9])
          expect(bento.items[3].getDependent(2).map(indexer)).toEqual([5, 6, 9])
          expect(bento.items[3].getDependent(3).map(indexer)).toEqual([5, 6, 4])
          expect(bento.items[4].getDependent(1).map(indexer)).toEqual([6, 9])
          expect(bento.items[4].getDependent(2).map(indexer)).toEqual([3, 6, 9])
          expect(bento.items[4].getDependent(3).map(indexer)).toEqual([3, 6, 9])
          expect(bento.items[5].getDependent(1).map(indexer)).toEqual([7])
          expect(bento.items[5].getDependent(2).map(indexer)).toEqual([7, 6, 9])
          expect(bento.items[5].getDependent(3).map(indexer)).toEqual([7, 6, 9])
          expect(bento.items[6].getDependent(1).map(indexer)).toEqual([8, 9])
          expect(bento.items[6].getDependent(2).map(indexer)).toEqual([8, 9])
          expect(bento.items[6].getDependent(3).map(indexer)).toEqual([5, 8, 9])
          expect(bento.items[6].getDependent(1).map(indexer)).toEqual([8, 9])
          expect(bento.items[6].getDependent(2).map(indexer)).toEqual([8, 9])
          expect(bento.items[6].getDependent(3).map(indexer)).toEqual([5, 8, 9])
          expect(bento.items[7].getDependent(1).map(indexer)).toEqual([])
          expect(bento.items[7].getDependent(2).map(indexer)).toEqual([8])
          expect(bento.items[7].getDependent(3).map(indexer)).toEqual([8, 9])
          expect(bento.items[8].getDependent(1).map(indexer)).toEqual([])
          expect(bento.items[8].getDependent(2).map(indexer)).toEqual([9])
          expect(bento.items[8].getDependent(3).map(indexer)).toEqual([7, 9])
          expect(bento.items[9].getDependent(1).map(indexer)).toEqual([])
          expect(bento.items[9].getDependent(2).map(indexer)).toEqual([8])
          expect(bento.items[9].getDependent(3).map(indexer)).toEqual([7, 8])
        })
      })
      describe('when images have different heights', function() {
        it ('should return dependent items', function() {
          var items = [{width: 100, height: 100}, {width: 100, height: 200}, {width: 100, height: 180}, 
                       {width: 100, height: 150}, {rating: 0.5, width: 200, height: 100              }, 
                       {width: 100, height: 100}
                      ];
          var bento = new Bento([100, 100, 100], {
            'span_popular_images': {
              rating: [0.01, 0.5],
              span: 2
            }
          }, items);
          expect(bento.items[0].getDependent(1).map(indexer)).toEqual([3])
          expect(bento.items[0].getDependent(2).map(indexer)).toEqual([3, 1])
          expect(bento.items[0].getDependent(3).map(indexer)).toEqual([3, 1, 2])
          expect(bento.items[1].getDependent(1).map(indexer)).toEqual([4])
          expect(bento.items[1].getDependent(2).map(indexer)).toEqual([4, 2])
          expect(bento.items[1].getDependent(3).map(indexer)).toEqual([0, 4, 2])
          expect(bento.items[2].getDependent(1).map(indexer)).toEqual([4])
          expect(bento.items[2].getDependent(2).map(indexer)).toEqual([1])
          expect(bento.items[2].getDependent(3).map(indexer)).toEqual([0, 1])
          expect(bento.items[3].getDependent(1).map(indexer)).toEqual([5])
          expect(bento.items[3].getDependent(2).map(indexer)).toEqual([5, 1])
          expect(bento.items[3].getDependent(3).map(indexer)).toEqual([5, 1, 2])
          expect(bento.items[4].getDependent(1).map(indexer)).toEqual([])
          expect(bento.items[4].getDependent(2).map(indexer)).toEqual([])
          expect(bento.items[4].getDependent(3).map(indexer)).toEqual([3])
          expect(bento.items[5].getDependent(1).map(indexer)).toEqual([])
          expect(bento.items[5].getDependent(2).map(indexer)).toEqual([4])
          expect(bento.items[5].getDependent(3).map(indexer)).toEqual([4])
        })
      })
      describe('when some images are left-oriented', function() {
        it ('should return dependent items', function() {
          var items = [{width: 100, height: 100}, {width: 100, height: 50}, {width: 100, height: 75}, {width: 100, height: 100},
                       {width: 200, height: 200, rating: 0.5             }, {width: 200, height: 200, rating: 0.5             }];
          var bento = new Bento([100, 100, 100, 100], {
            'span_popular_images': {
              rating: [0.01, 0.5],
              span: 2
            }
          }, items);  
          expect(bento.items[0].getDependent(1).map(indexer)).toEqual([4])
          expect(bento.items[0].getDependent(2).map(indexer)).toEqual([4, 1])
          expect(bento.items[0].getDependent(3).map(indexer)).toEqual([4, 1, 2, 5])
          expect(bento.items[0].getDependent(4).map(indexer)).toEqual([4, 1, 2, 3])
          expect(bento.items[1].getDependent(1).map(indexer)).toEqual([4])
          expect(bento.items[1].getDependent(2).map(indexer)).toEqual([4, 2, 5])
          expect(bento.items[1].getDependent(3).map(indexer)).toEqual([4, 2, 3])
          expect(bento.items[1].getDependent(4).map(indexer)).toEqual([0, 2, 3])
          expect(bento.items[2].getDependent(1).map(indexer)).toEqual([5])
          expect(bento.items[2].getDependent(2).map(indexer)).toEqual([3])
          expect(bento.items[2].getDependent(3).map(indexer)).toEqual([4, 1, 3])
          expect(bento.items[2].getDependent(4).map(indexer)).toEqual([0, 1, 3])
          expect(bento.items[3].getDependent(1).map(indexer)).toEqual([5])
          expect(bento.items[3].getDependent(2).map(indexer)).toEqual([2, 5])
          expect(bento.items[3].getDependent(3).map(indexer)).toEqual([4, 1, 2, 5])
          expect(bento.items[3].getDependent(4).map(indexer)).toEqual([0, 1, 2, 5])
          expect(bento.items[4].getDependent(1).map(indexer)).toEqual([])
          expect(bento.items[4].getDependent(2).map(indexer)).toEqual([])
          expect(bento.items[4].getDependent(3).map(indexer)).toEqual([5])
          expect(bento.items[4].getDependent(4).map(indexer)).toEqual([5])
          expect(bento.items[5].getDependent(1).map(indexer)).toEqual([])
          expect(bento.items[5].getDependent(2).map(indexer)).toEqual([])
          expect(bento.items[5].getDependent(3).map(indexer)).toEqual([4])
          expect(bento.items[5].getDependent(4).map(indexer)).toEqual([4])
        })
        describe('and they are on the left', function() {
          it ('should return dependent items', function() {
            var items = [{width: 100, height: 90}, {width: 100, height: 100}, {width: 100, height: 200},
                         {width: 200, height: 100, rating: 0.5              }]
            var bento = new Bento([100, 100, 100], {
              'span_popular_images': {
                rating: [0.01, 0.5],
                span: 2
              }
            }, items);
            expect(bento.items[0].getDependent(1).map(indexer)).toEqual([3])
            expect(bento.items[0].getDependent(2).map(indexer)).toEqual([1])
            expect(bento.items[0].getDependent(3).map(indexer)).toEqual([1, 2])
            expect(bento.items[1].getDependent(1).map(indexer)).toEqual([3])
            expect(bento.items[1].getDependent(2).map(indexer)).toEqual([3, 2])
            expect(bento.items[1].getDependent(3).map(indexer)).toEqual([0, 3, 2])
            expect(bento.items[2].getDependent(1).map(indexer)).toEqual([])
            expect(bento.items[2].getDependent(2).map(indexer)).toEqual([1])
            expect(bento.items[2].getDependent(3).map(indexer)).toEqual([0, 1])
            expect(bento.items[3].getDependent(1).map(indexer)).toEqual([])
            expect(bento.items[3].getDependent(2).map(indexer)).toEqual([])
            expect(bento.items[3].getDependent(3).map(indexer)).toEqual([2])
          })
        })
      })
    })
  });
})