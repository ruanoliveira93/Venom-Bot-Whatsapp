const venom = require("venom-bot");
const fs = require("fs");
const path = require("path");

function registrarLog(numero, mensagem, descricao) {
  const caminho = path.join(__dirname, "logs.json");

  let logs = [];
  if (fs.existsSync(caminho)) {
    try {
      const data = fs.readFileSync(caminho, "utf8");
      logs = JSON.parse(data);
    } catch (err) {
      console.error("Erro ao ler arquivo de log:", err);
    }
  }

  logs.push({
    numero,
    mensagem,
    descricao,
    data: new Date().toISOString(),
  });

  try {
    fs.writeFileSync(caminho, JSON.stringify(logs, null, 2), "utf8");
  } catch (err) {
    console.error("Erro ao escrever no log:", err);
  }
}

venom
  .create({
    session: "session-name",
    browserArgs: ["--headless=new"],
  })
  .then((client) => start(client))
  .catch((erro) => {
    console.log(erro);
  });

function start(client) {
  const estados = {};

  function horarioDia() {
    const hora = new Date().getHours();
    if (hora >= 0 && hora <= 11) return "Bom dia!";
    if (hora >= 12 && hora <= 17) return "Boa tarde!";
    return "Boa noite!";
  }

  function msgBoasVindas(contato) {
    return (
      `Olá, ${horarioDia()}\n` +
      `Eu sou o Message Text Send Bot 🤖.\n` +
      `Fui criado para responder automaticamente mensagens de texto.\n\n` +
      `Seja bem-vindo(a), ${contato}!\n\n` +
      `SOBRE O QUE DESEJA FALAR?\n` +
      `(Escolha uma das opções abaixo, enviando o número como mensagem)\n\n` +
      `1 - Falar com proprietário. 🗣\n` +
      `2 - Falar sobre trabalho. 💼\n` +
      `3 - Redes sociais. 📱\n` +
      `4 - Deixar recado. 📬\n` +
      `5 - Ajuda. 🆘\n`
    );
  }

  const respostas = {
    1: "Você escolheu: Falar com proprietário. 🗣",
    2: "Você escolheu: Falar sobre trabalho. 💼",
    3: "Você escolheu: Redes sociais. 📱",
    4: "Você escolheu: Deixar recado. 📬",
    5: "Você escolheu: Ajuda. 🆘",
  };

  const subTrabalho = {
    1: "Você escolheu: Entrevista.",
    2: "Você escolheu: Oportunidade.",
    3: "Voltando ao menu principal...",
  };

  function falarSobreTrabalho() {
    return (
      `Escolha uma das opções abaixo: \n\n` +
      `1 - Entrevista.\n` +
      `2 - Obter currículo.\n` +
      `3 - Voltar para o início.\n`
    );
  }

  function redesSociais() {
    return (
      `SEGUE ABAIXO O LINK DAS REDES SOCIAIS: \n\n` +
      `LinkedIn: https://www.linkedin.com/in/ruanoliveira93/ \n` +
      `Github: https://github.com/ruanoliveira93 \n` +
      `Discord: https://www.discord.com/channels/@ruanoliveira93 \n` +
      `Instagram: https://www.instagram.com/ruanw93/ \n` +
      `Facebook: https://www.facebook.com/ruanwoliveira \n`
    );
  }

  function responderComAtraso(client, numero, texto, delay = 3000) {
    setTimeout(() => {
      client.sendText(numero, texto);
    }, delay);
  }

  client.onMessage((message) => {
    if (message.isGroupMsg) return;

    const numero = message.from;
    const entrada = message.body.trim();
    const estadoAtual = estados[numero] || "menu";

    if (estadoAtual === "menu") {
      if (respostas[entrada]) {
        client.sendText(numero, respostas[entrada]);
        registrarLog(numero, entrada, respostas[entrada]);

        if (entrada === "2") {
          estados[numero] = "trabalho";
          responderComAtraso(client, numero, falarSobreTrabalho());
        } else if (entrada === "3") {
          responderComAtraso(client, numero, redesSociais());
        } else if (entrada === "4") {
          responderComAtraso(client, numero, 'Deixe seu recado. Em breve sua mensagem será respondida.');
        } else {
          responderComAtraso(
            client,
            numero,
            "Aguarde. Em breve você será respondido(a)."
          );
        }
      } else {
        client.sendText(numero, msgBoasVindas(message.sender.pushname));
      }
    }

    else if (estadoAtual === "trabalho") {
      if (subTrabalho[entrada]) {
        if (entrada === "1") {
          estados[numero] = "1";
          responderComAtraso(
            client,
            numero,
            "Deixe uma mensagem com endereço, data e horário da entrevista. Se for online, apenas deixe as informações necessárias da data e hora da entrevista. " +
              `Atenciosamente, Ruan Oliveira.`
          );
        } else if (entrada === "2") {
          estados[numero] = "2";
          client
            .sendFile(
              numero,
              "./CURRÍCULO RUAN OLIVEIRA.pdf",
              "Currículo Ruan Oliveira",
              "Segue em anexo o currículo de Ruan Oliveira."
            )
            .catch((err) => console.error("Erro ao enviar arquivo:", err));
        } else if (entrada === "3") {
          estados[numero] = "menu";
          responderComAtraso(
            client,
            numero,
            msgBoasVindas(message.sender?.pushname)
          );
        }
      } else {
        client.sendText(numero, "Opção inválida. Digite 1, 2 ou 3.");
      }
    }
  });
}
