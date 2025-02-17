import { Resend } from "resend";
import { Advertisement } from "..";

const RESEND_API_KEY = process.env.RESEND_API_KEY;

export const sendMail = (entries: Advertisement[]) => {
  const resend = new Resend(RESEND_API_KEY);

  const adsToSend = entries.map((newAd) => {
    return `<a href="${newAd.href}">${newAd.title}</a>`;
  });

  const html = `
        <h1>Neue Wohnungsanzeigen:</h1>
        Hallo!
        <br>
        <br>
        Wichern Baugesellschaft mbH hat ${entries.length} neue Wohnungsanzeige!<br>
        <br>
        ${adsToSend}
        <br>
        <br>
        Liebe Grüße!
      `;

  resend.emails.send({
    from: "Neue Wohnungsanzeige <neue-wohnungsanzeige@boelcke.me>",
    to: "hendrikthorun@gmail.com",
    subject: `Es gibt ${entries.length} neue Wohnungsanzeigen!`,
    html,
  });
};
