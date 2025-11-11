import Repository from '#repository/repository.js';
const repo = new Repository();
console.log('constructor:', repo.constructor && repo.constructor.name);
console.log('has _withTransaction:', typeof repo._withTransaction);
console.log(
  'methods:',
  Object.getOwnPropertyNames(Object.getPrototypeOf(repo)).filter(
    (n) => typeof repo[n] === 'function'
  )
);
