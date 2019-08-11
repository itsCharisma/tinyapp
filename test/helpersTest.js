const { assert } = require('chai');

const { checkEmail } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  }
};

describe('checkEmail', function() {
  it('should return a user with valid email', function() {
    const user = checkEmail("user@example.com", testUsers)
    const expectedOutput = "userRandomID";
    assert.equal(user, expectedOutput)
  });
  it('return false if user is not found', function() {
    const user = checkEmail("Deez@nuts.com", testUsers)
    const expectedOutput = false;
    assert.equal(user, expectedOutput)
  });
});