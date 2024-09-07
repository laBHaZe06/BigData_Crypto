const request = require('supertest');
const app = require('../server'); 
const { expect } = require('chai');

describe('API tests', () => {
  it('should get data from the API', async () => {
    const response = await request(app).get('/');
    expect(response.status).to.equal(200);
    expect(response.type).to.equal('application/json');
    // Ajoutez des assertions en fonction de la structure de vos réponses
    expect(response.body).to.have.property('message');
    expect(response.body).to.have.property('data');
    expect(response.body).to.have.property('status');
    expect(response.body).to.have.property('error');
    expect(response.body.status).to.equal(200);
    expect(response.body.error).to.equal(null);
    
  });

  it('should handle errors gracefully', async () => {
    const response = await request(app).get('/invalid-route');
    expect(response.status).to.equal(500);
    expect(response.body).to.have.property('error');
  });
});