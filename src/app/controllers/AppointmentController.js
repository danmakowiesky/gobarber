import * as Yup from 'yup';
import { startOfHour, parseISO, isBefore } from 'date-fns';

// Importando models
import Appointment from '../models/Appointments';
import User from '../models/User';

class AppointmentController {
  async store(req, res) {
    // Validando os dados de entrada
    const schema = Yup.object().shape({
      provider_id: Yup.number()
        .integer()
        .required(),
      date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(401).json({ error: 'Validation fails' });
    }

    const { provider_id, date } = req.body;

    // Check if provider_id is a provider

    const isProvider = await User.findOne({
      where: { id: provider_id, provider: true },
    });

    if (!isProvider) {
      return res
        .status(401)
        .json({ error: 'You can only create appointments with providers' });
    }

    // Check date
    const hourStart = startOfHour(parseISO(date)); // Transforma o horário em um objetoe e pega apenas a hora

    if (isBefore(hourStart, new Date())) {
      // Verificando se já passou da data atual
      return res.status(400).json({ error: 'Past dates are not permited' });
    }

    // Verificando se o horário do prestador já está ocupado
    const checkAvailability = await Appointment.findOne({
      where: { provider_id, canceled_at: null, date: hourStart },
    });

    if (checkAvailability) {
      // O horário não está vago
      return res
        .status(400)
        .json({ error: 'Appointment date is not availability' });
    }

    const appointment = await Appointment.create({
      user_id: req.userId,
      provider_id,
      date: hourStart,
    });

    return res.json(appointment);
  }
}

export default new AppointmentController();