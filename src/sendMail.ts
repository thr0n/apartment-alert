import { Resend } from "resend";
import { Advertisement } from "../api";

const RESEND_API_KEY = process.env.RESEND_API_KEY;

export const sendMail = async(entries: Advertisement[]) => {
  const resend = new Resend(RESEND_API_KEY);

  const contacts = await resend.contacts.list({
    audienceId: 'aca5f12f-74da-4cb3-b622-d44df8a5f55e',
  });

  const recipients = contacts.data?.data

  const adsToSend = entries.map((newAd) => {
    return `<a href="${newAd.href}">${newAd.title}</a>`;
  });

  const html = `
        <h1>Neue Wohnungsanzeigen:</h1>
        Hallo!
        <br>
        <br>
        Wichern Baugesellschaft mbH hat ${entries.length} neue Wohnungsanzeige(n)!<br>
        <br>
        ${adsToSend}
        <br>
        <br>
        Liebe Grüße!
      `;

  recipients?.forEach(r => { 
    resend.emails.send({
      from: "Neue Wohnungsanzeige <neue-wohnungsanzeige@boelcke.me>",
      to: r.email,
      subject: `Es gibt ${entries.length} neue Wohnungsanzeigen!`,
      html,
    });
  })
};
