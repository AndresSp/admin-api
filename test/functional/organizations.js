'use strict';
require('../testHelpers');
const _ = require('lodash');

exports.lab = Lab.script();

const server = Server.server;

let Organization;

describe('Organizations resources', () => {
  let firstOrganization, secondOrganization;
  let superUser, userWithMultipleRoles, userWithNoRoles, userWithOneRole;

  before(async () => {
    await Server.initialize();
    const setup = await createTestSetup();
    ({Organization} = server.models);
    [userWithOneRole, superUser, userWithMultipleRoles, userWithNoRoles] = setup.users;
    [firstOrganization, secondOrganization] = setup.organizations;
  });

  after(() => {
    return resetTestSetup();
  });

  describe('GET /permissions', () => {
    let multiRoleToken, noRoleToken, regularToken, superToken;

    before(async () => {
      [superToken, regularToken, multiRoleToken, noRoleToken] = await Promise.all([
        logIn(superUser),
        logIn(userWithOneRole),
        logIn(userWithMultipleRoles),
        logIn(userWithNoRoles)
      ]);
    });

    function callServer(token, test) {
      return runTest({
        method: 'GET',
        url: '/organizations',
        headers: {
          'Authorization': token,
          'Device': 'client'
        }
      }, test);
    }

    it('should return all organizations to a super user', () => {
      return callServer(superToken, ({ statusCode, result }) => {
        expect(statusCode).to.equal(200);
        const organizations = result.map(({id, name, description, twitter, facebook, instagram}) => {
          return {id, name, description, twitter, facebook, instagram};
        });
        expect(organizations).to.equal([{
          id: firstOrganization.id,
          name: 'First Organization',
          description: 'First',
          twitter: 'https://twitter.com/firstorganization',
          facebook: 'https://facebook.com/firstorganization',
          instagram: 'https://instagram.com/firstorganization'
        }, {
          id: secondOrganization.id,
          name: 'Second Organization',
          description: 'Second',
          twitter: 'https://twitter.com/secondorganization',
          facebook: 'https://facebook.com/secondorganization',
          instagram: 'https://instagram.com/secondorganization'
        }]);
      });
    });

  });
});