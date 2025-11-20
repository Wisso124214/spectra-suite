import Repository from "./src/repository/repository.js";
(async () => {
  const r = new Repository();
  console.log('has getTxTransaction?', typeof r.getTxTransaction);
})();
