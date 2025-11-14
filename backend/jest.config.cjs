module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.js$': ['babel-jest', { configFile: './.babelrc' }],
  },
  testTimeout: 20000,
};

// Map Node imports aliases used in the project (package.json "imports")
module.exports.moduleNameMapper = {
  '^#config\\/(.*)$': '<rootDir>/config/$1',
  '^#src\\/(.*)$': '<rootDir>/src/$1',
  '^#repository\\/(.*)$': '<rootDir>/src/repository/$1',
  '^#utils\\/(.*)$': '<rootDir>/src/utils/$1',
  '^#dbms\\/(.*)$': '<rootDir>/src/dbms/$1',
  '^#formatter\\/(.*)$': '<rootDir>/src/formatter/$1',
  '^#atx\\/(.*)$': '<rootDir>/src/business/atx/$1',
  '^#debugger\\/(.*)$': '<rootDir>/src/debugger/$1',
  '^#mailer\\/(.*)$': '<rootDir>/src/mailer/$1',
  '^#tokenizer\\/(.*)$': '<rootDir>/src/tokenizer/$1',
  '^#validator\\/(.*)$': '<rootDir>/src/validator/$1',
  '^#services\\/(.*)$': '<rootDir>/src/services/$1',
  '^#dispatcher\\/(.*)$': '<rootDir>/src/dispatcher/$1',
  '^#formatter\\/(.*)$': '<rootDir>/src/formatter/$1',
};
