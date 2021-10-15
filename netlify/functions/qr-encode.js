const { encode } = require("upnqr");

exports.handler = async function (event, context) {
  const result = encode({
    slog: "UPNQR",
    polog: false,
    dvig: false,
    ime_placnika: "",
    ulica_placnika: "",
    kraj_placnika: "",
    znesek: 10,
    nujno: true,
    koda_namena: "OTHR",
    namen_placila: "Nekaj drugega",
    rok_placila: new Date(),
    IBAN_prejemnika: "SI56040010047774720",
    referenca_prejemnika: "SI0020211015",
    ime_prejemnika: "Ciril Trček",
    ulica_prejemnika: "Njegoševa cesta 6j",
    kraj_prejemnika: "1000 Ljubljana",
    rezerva: "dodatek do skupaj 411 znakov"
  });
  return {
    statusCode: 200,
    body: JSON.stringify({ result })
  };
};
