import { Router } from 'express';

// Importando Models
import User from './app/models/User';

// Pegando apenas o router de express
const routes = new Router();

routes.get('/', async (req, res) => {
  const user = await User.create({
    name: 'Miro',
    email: 'miroswd@email.com',
    password_hash: 'senha1234',
  });
  return res.json(user);
});

export default routes; // Será importado em app.js como global
