//Here you will import route files and export them as used in previous labs
import reportRoutes from './reports.js';

const constructorMethod = (app) => {
  app.use('/', reportRoutes);

  app.use('*', (req, res) => {
    res.status(404).json({error: 'Route Not found'});
  });
};

export default constructorMethod;