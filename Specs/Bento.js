describe("Bento", function() {
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
        bento.setColumns([ 100, 100, 100, 100 ])
        expect(bento.items[0].column).toBe(bento.columns[0]);
        expect(bento.items[1].column).toBe(bento.columns[1]);
        expect(bento.items[2].column).toBe(bento.columns[2]);
        expect(bento.items[3].column).toBe(bento.columns[3]);
        expect(bento.items[4].column).toBe(bento.columns[1]);
        bento.setColumns([ 100, 100, 100])
        expect(bento.items[0].column).toBe(bento.columns[0]);
        expect(bento.items[1].column).toBe(bento.columns[1]);
        expect(bento.items[2].column).toBe(bento.columns[2]);
        expect(bento.items[3].column).toBe(bento.columns[1]);
        expect(bento.items[4].column).toBe(bento.columns[0]);
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
  })
  describe('.Column', function() {
    describe('when given a number', function() {
      it ('should treat it as width', function() {
        expect(Bento.Column(123).width).toBe(123)
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