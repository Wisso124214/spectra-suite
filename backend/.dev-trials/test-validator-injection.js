import Validator from '../src/validator/validator.js';
import DBMS from '../src/dbms/dbms.js';

const v1 = new Validator();
console.log('Has DBMS before injection?', !!v1.dbms);
try {
  const msg = v1.validateUsername('foobar');
  console.log('validateUsername (pre-injection) returned:', msg);
} catch (e) {
  console.error('validateUsername threw (pre-injection):', e?.message || e);
}

const dbms = new DBMS();
const v2 = new Validator(dbms);
console.log('Has DBMS after injection?', !!v2.dbms);
try {
  const msg2 = v2.validateUsername('foobar');
  console.log('validateUsername (post-injection) returned:', msg2);
} catch (e) {
  console.error('validateUsername threw (post-injection):', e?.message || e);
}
