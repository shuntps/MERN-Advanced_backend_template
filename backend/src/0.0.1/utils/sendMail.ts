import resend from '../config/resend';

import { APP_NAME, NODE_ENV, RESEND_EMAIL_SENDER } from '../constants/env';

type Params = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

const getFromEmail = () =>
  NODE_ENV === 'development'
    ? 'onboarding@resend.dev'
    : `${APP_NAME} - ${RESEND_EMAIL_SENDER}`;

const getToEmail = (to: string) =>
  NODE_ENV === 'development' ? 'delivered@resend.dev' : to;

export const sendMail = async ({ to, subject, text, html }: Params) =>
  await resend.emails.send({
    from: getFromEmail(),
    to: getToEmail(to),
    subject,
    text,
    html,
  });
