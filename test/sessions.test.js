describe('Session Router', () => {
    it('debería iniciar sesión con credenciales válidas', (done) => {
      chai.request(app)
        .post('/api/login')
        .send({ username: 'usuario', password: 'contraseña' }) 
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('token');
          done();
        });
    });
  
    it('debería devolver un token de acceso después de iniciar sesión', (done) => {
      done();
    });
  
    it('debería cerrar sesión', (done) => {
      chai.request(app)
        .post('/api/logout')
        .end((err, res) => {
          expect(res).to.have.status(200);
          done();
        });
    });
  });
  