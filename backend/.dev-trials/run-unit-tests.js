import assert from 'assert';
import _q from '#repository/methods/_q.js';
import _isMenusStructureShape from '#repository/methods/_isMenusStructureShape.js';
import _requireConfirmJoin from '#repository/methods/_requireConfirmJoin.js';
import _forEachJsonMethod from '#repository/methods/_forEachJsonMethod.js';
import parseMOPWrapper from '#atx/methods/parse-mop.js';
import Repository from '#repository/repository.js';

// Some Repository methods expect ERROR_CODES to be present on the instance/prototype.
// Provide a minimal constants object so unit tests for pure methods can run.
Repository.prototype.ERROR_CODES = {
  BAD_REQUEST: 'BAD_REQUEST',
  DB_ERROR: 'DB_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
};

async function run() {
  console.log('Running unit tests (custom runner)');
  // _q
  assert.strictEqual(_q('name'), '"name"');
  assert.strictEqual(_q('id'), '"id"');
  console.log('✓ _q tests passed');

  // _isMenusStructureShape
  const valid = { A: { options: {} } };
  const valid2 = { A: { some: { options: {} } } };
  const invalid = { foo: 'bar' };
  assert.strictEqual(_isMenusStructureShape(valid), true);
  assert.strictEqual(_isMenusStructureShape(valid2), true);
  assert.strictEqual(_isMenusStructureShape(invalid), false);
  console.log('✓ _isMenusStructureShape tests passed');

  // _requireConfirmJoin (valid token)
  assert.strictEqual(
    _requireConfirmJoin('DELETE_USER_PROFILE', 'user_profile'),
    true
  );
  console.log('✓ _requireConfirmJoin valid token passed');

  // _requireConfirmJoin (invalid token -> should throw)
  let threw = false;
  try {
    _requireConfirmJoin('WRONG', 'user_profile');
  } catch (e) {
    threw = true;
    if (!e.message.includes('Confirmación inválida')) {
      throw e;
    }
  }
  assert.strictEqual(threw, true);
  console.log('✓ _requireConfirmJoin invalid token test passed');

  // _forEachJsonMethod
  const data = { a: 1, b: 2, c: 3 };
  const res = await _forEachJsonMethod({
    data,
    filter: (k, v) => v % 2 === 1,
    onEach: async ({ key, value }) => ({ key, value }),
  });
  assert.ok(res && Array.isArray(res.data));
  assert.strictEqual(res.data.length, 2);
  console.log('✓ _forEachJsonMethod tests passed');

  // parseMOP wrapper existence
  assert.strictEqual(typeof parseMOPWrapper, 'function');
  console.log('✓ parseMOP wrapper existence test passed');

  console.log('\nAll custom unit tests passed');
}

run().catch((e) => {
  console.error('Unit tests failed:', e);
  process.exit(1);
});
