var proxyquire = require('proxyquire');
var bodyParser = require('body-parser');
var sinon = require('sinon');
var supertest = require('supertest');
var expressValidator = require('express-validator');
var expect = require('chai').expect;

var express = require('express');

describe('POST /listar', function () {
  var app, fileFindStub,fileFindOneStub,dagExeFindStub, request, route;

  beforeEach(function () {
    app = express();
    fileFindStub = sinon.stub();
    fileFindOneStub = sinon.stub();
    dagExeFindStub = sinon.stub();
    route = proxyquire('../../routes/vfs/file-list.js', {
      '../../utils/login.js': function(req, res, next){
        req.user = {_id : "carlos"};
        return next();
      },
      "../../models/file.js": {
        find: fileFindStub,
        findOne: fileFindOneStub
      },
      "../../models/dagExe.js" : {
        find: dagExeFindStub
      },
      "../../models/logger.js": {
        err: sinon.stub(),
        findOne: sinon.stub()
      },
    });
    app.use(expressValidator());
    app.use(bodyParser.json({
        limit: '50mb'
    }));
    app.use(bodyParser.urlencoded({
        limit: '50mb',
        extended: true
    }));
    route(app);
    request = supertest(app);
  });

  it('should respond with 200 and Invalid filename', function (done) {
    fileFindOneStub.yields(new Error(), []);
    request
      .post('/listar')
      .expect('Content-Type', /json/)
      .expect(200, function (err, res) {
          expect(res.body).to.deep.equal({"result": []});
        done();
      });
  });

  it.skip('should respond with 200 and error db conn', function (done) {
    fileFindStub.yields(new Error(), []);

    request
      .post('/buscar')
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .set({
        'Accept' : 'application/json'
      })
      .send({
          filename: 'crearArchivo-test.js'
      })
      .expect(200)
      .end(function (err, res) {
        expect(res.body).to.deep.equal({
          "code": 2,
          "message": "Error"
        });
        done();
      });
  });

  it.skip('should respond with 200 and the files', function (done) {
    fileFindStub.yields(null, []);

    request
      .post('/buscar')
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .set({
        'Accept' : 'application/json'
      })
      .send({
          filename: 'crearArchivo-test.js'
      })
      .expect(200)
      .end(function (err, res) {
        expect(res.body).to.deep.equal({files :[]});
        done();
      });
  });
});
