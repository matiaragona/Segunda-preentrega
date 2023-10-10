const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app'); 
const expect = chai.expect;

chai.use(chaiHttp);

describe('Product Router', () => {
  it('debería obtener una lista de productos', (done) => {
    chai.request(app)
      .get('/api/products')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('array');
        done();
      });
  });

  it('debería crear un nuevo producto', (done) => {
    chai.request(app)
      .post('/api/products')
      .send({ name: 'Nuevo Producto', price: 10.99 })
      .end((err, res) => {
        expect(res).to.have.status(201);
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.property('name', 'Nuevo Producto');
        done();
      });
  });

  it('debería obtener un producto por ID', (done) => {
    chai.request(app)
      .get('/api/products/product_id')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('object');
        done();
      });
  });
});
