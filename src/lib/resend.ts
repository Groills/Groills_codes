import { Resend } from 'resend';

export const resend = new Resend(process.env.NEXT_RESENDEMAIL_API_KEY);
