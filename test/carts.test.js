const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app'); 
const expect = chai.expect;

chai.use(chaiHttp);

describe('Cart Router', () => {
  let authToken; 

  before((done) => {
    chai.request(app)
      .post('/api/login')
      .send({ username: 'usuario', password: 'contraseña' }) 
      .end((err, res) => {
        authToken = res.body.token;
        done();
      });
  });

  it('debería obtener el carrito de un usuario', (done) => {
    chai.request(app)
      .get('/api/cart')
      .set('Authorization', `Bearer ${authToken}`)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('object');
        done();
      });
  });

  it('debería agregar un producto al carrito', (done) => {
    chai.request(app)
      .post('/api/cart/add')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ productId: 'product_id', quantity: 1 }) 
      .end((err, res) => {
        expect(res).to.have.status(201);
        expect(res.body).to.be.an('object');
        done();
      });
  });

  it('debería eliminar un producto del carrito', (done) => {
    chai.request(app)
      .delete('/api/cart/remove')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ productId: 'product_id' }) 
      .end((err, res) => {
        expect(res).to.have.status(204); 
        done();
      });
  });
});
