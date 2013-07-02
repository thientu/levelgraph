
var levelgraph = require("../");
var level = require("level-test")();

describe("live join algorithm", function() {

  var db;

  beforeEach(function(done) {
    db = levelgraph(level());
    db.put(require("./fixture/foaf"), done);
  });

  afterEach(function(done) {
    db.close(done);
  });

  it("should match triples coming from db changes", function(done) {
    var contexts = [{ activity: "code" }]
        stream = db.joinStream([{ 
            subject: "matteo"
          , predicate: "does"
          , object: db.v("activity")
          , live: true
        }]);

    stream.on("data", function(data) {
      expect(data).to.eql(contexts.shift());
      stream.end();
    });

    stream.on("end", function() {
      expect(contexts.length).to.equal(0);
      done();
    });

    stream.on("pipe", function() {
      db.put({
          subject: "matteo"
        , predicate: "does"
        , object: "code"
      });
    });
  });
});
