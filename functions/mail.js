export async function onRequestPost(context) {
  try {
    const formData = await context.request.formData();

    const fromUser = formData.get("from");
    const subject = formData.get("subj");
    const body = formData.get("body");
    const mode = formData.get("mode");
    const mlist = formData.get("mlist");
    const contType = formData.get("ctype");
    const domain = "zofoss.org";
    const fromName = "ZoFoss";
    const dkimKey = context.env.Z_DKIM;

    const isListMode = mode === "list";

    const responses = [];

    const sendEmail = async (toEmail) => {
      const send_request = new Request("https://api.mailchannels.net/tx/v1/send", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          personalizations: [
            {
              to: [{ email: toEmail }],
              dkim_domain: domain,
              dkim_selector: "mailchannels",
              dkim_private_key: dkimKey,
            },
          ],
          from: { name: fromName, email: fromUser + "@" + domain },
          subject: subject,
          content: [{ type: contType, value: body }],
        }),
      });

      const resp = await fetch(send_request);
      const respText = await resp.text();
      const respContent = resp.status + " " + resp.statusText + "\n\n" + respText;
      responses.push(respContent, { status: resp.status });
    };

    if (isListMode) {
      const emailList = mlist.split(',').map(email => email.trim());
      await Promise.all(emailList.map(sendEmail));
    } else {
      const receiverEmail = formData.get("email");
      await sendEmail(receiverEmail);
    }

    return new Response(responses.join('\n\n'), {
      headers: {
        "content-type": "text/plain"
      },
    });
  } catch (error) {
    return new Response('Error processing the request: ' + error.message, { status: 500 });
  }
}
