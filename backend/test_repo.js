import Repository from '@repository/repository.js';
(async () => {
  const r = new Repository();
  console.log('has getTxTransaction?', typeof r.getTxTransaction);
})();
