import serverlessExpress from '@vendia/serverless-express';

const app = require('../app');

export default serverlessExpress({ app });
