describe("Bento", function() {
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
      var args, bento = new Bento(function(page, memo) {
        args = [page, memo]
        return page + 'Jizzlebeck'
      });
      expect(args).toEqual([1, undefined])
      bento.setPage(2);        
      expect(args).toEqual([2, '1Jizzlebeck'])
      bento.setPage(3);        
      expect(args).toEqual([3, '2Jizzlebeck'])
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
        })
      })
    });
  });
  describe('.setScrollTop', function() {
    it ('should change the page', function() {
      var bento = new Bento(1000, 500);
      bento.setScrollTop(0)
      expect(bento.page).toBe(1);
      bento.setScrollTop(1)
      expect(bento.page).toBe(2);
      bento.setScrollTop(499)
      expect(bento.page).toBe(2);
      bento.setScrollTop(500)
      expect(bento.page).toBe(2);
      bento.setScrollTop(501)
      expect(bento.page).toBe(3);
      bento.setScrollTop(500)
      expect(bento.page).toBe(2);
    })
  })
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
  });
})