require("dotenv").config({ path: __dirname + "/.env" }); // Load environment variables
const express = require("express");
const app = express();
const port = process.env.PORT;
const nodemailer = require("nodemailer");
const SendGrid = require("@sendgrid/mail");
// ========================
// serving static html pages

app.use(express.static("public"));

app.use(express.json()); // this will parse Content-Type: application/jsons
app.use(express.urlencoded({ extended: true })); // this will parse Content-Type:  application/x-www.js-form-urlencoded

// TRUST PROXY IN PRODUCTION
app.set("trust proxy", 1);

app.post("/mail", async (req, res, next) => {
  const { name, phone } = req.body;

  const phoneRegex = new RegExp(
    /^\+?(972|0)(\-)?0?(([23489]{1}\d{7})|([71,72,73,74,75,76,77]{2}\d{7})|[5]{1}\d{8})$/
  );

  if (!phoneRegex.test(phone)) {
    return res.send({
      error: { phone: true, name: false, email: false },
      message: "invalid phone number please provide valid israeli phone",
    });
  }

  if (name.length < 2) {
    return res.send({
      error: { phone: false, name: true, email: false },
      message: "please provide valid name , more then one character",
    });
  }

  // const transporter = nodemailer.createTransport({
  //   service: "gmail",
  //   auth: {
  //     user: process.env.EMAIL,
  //     pass: process.env.PASSWORD,
  //   },
  // });
  SendGrid.setApiKey(process.env.SENDGRID_API_KEY);

  const msg = {
    to: "timofey.official.1@gmail.com",
    from: process.env.EMAIL,
    subject: "website contact",
    html: `<p> שם:${name} </p>
    <p> טלפון: ${phone} </p>
    ישמחו שתיצרו איתם קשר
    `,
  };

  let sendGridResponse = await SendGrid.send(msg);

  if (sendGridResponse[0].statusCode !== 202) {
    console.log(sendGridResponse[0]);
    throw "Error sending email";
  } else {
    return res.send({ error: false, message: "email sent" });
  }

  //   const mailOptions = {
  //     from: process.env.EMAIL,
  //     to: "timofey.official.1@gmail.com",
  //     subject: "website contact",
  //     text: `שם : ${name}
  //   טלפון : ${phone}
  //   ישמחו שיצרו איתם קשר
  // `,
  //   };

  //   transporter.sendMail(mailOptions, function (error, info) {
  //     if (error) {
  // 	    console.log(error);
  //       return res.send({
  //         error: { phone: false, name: false, email: true },
  //         message: "error occurred while sending email ",
  //       });
  //     } else {

  // 	    console.log("Email sent: " + info.response);
  //    	return res.send({ error: false, message: "email sent" });
  //     }
  //   });
});

// 404 handler
app.use(function (req, res) {
  res.sendFile("./public/404.html", { root: __dirname });
});
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
