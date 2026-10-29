
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const telaInicial = document.getElementById("telaInicial");
const botaoJogar = document.getElementById("botaoJogar");
const botaoReiniciar = document.getElementById("botaoReiniciar");
const pontosTexto = document.getElementById("pontos");
const recordeTexto = document.getElementById("recorde");

const largura = canvas.width;
const altura = canvas.height;

let passarinho;
let canos;
let pontos;
let recorde = 0;
let estado = "inicio";
let ultimoTempo = 0;
let animacao;

const gravidade = 1250;
const forcaPulo = -380;
const velocidadeCanos = 125;
const larguraCano = 48;
const distanciaCanos = 155;
const intervaloCanos = 220;

function reiniciar() {
    cancelAnimationFrame(animacao);

    passarinho = {
        x: 85,
        y: 220,
        raio: 12,
        velocidadeY: 0,
        rotacao: 0
    };

    canos = [];
    pontos = 0;
    estado = "jogando";
    ultimoTempo = 0;

    pontosTexto.textContent = "0";
    recordeTexto.textContent = recorde;

    telaInicial.style.display = "none";

    criarCano(largura + 30);

    animacao = requestAnimationFrame(loop);
}

function criarCano(x) {
    const margem = 65;
    const abertura = 145;

    const topo = margem +
        Math.random() * (altura - abertura - margem * 2 - 45);

    canos.push({
        x: x,
        topo: topo,
        abertura: abertura,
        pontuado: false
    });
}

function pular() {
    if (estado !== "jogando") return;

    passarinho.velocidadeY = forcaPulo;
}

function atualizar(dt) {
    passarinho.velocidadeY += gravidade * dt;
    passarinho.y += passarinho.velocidadeY * dt;

    passarinho.rotacao = Math.min(
        0.8,
        Math.max(-0.5, passarinho.velocidadeY / 500)
    );

    canos.forEach(cano => {
        cano.x -= velocidadeCanos * dt;

        if (!cano.pontuado &&
            cano.x + larguraCano < passarinho.x) {
            cano.pontuado = true;
            pontos++;

            pontosTexto.textContent = pontos;

            if (pontos > recorde) {
                recorde = pontos;
                recordeTexto.textContent = recorde;
            }
        }
    });

    canos = canos.filter(cano => cano.x + larguraCano > -10);

    const ultimoCano = canos[canos.length - 1];

    if (!ultimoCano ||
        ultimoCano.x < largura - intervaloCanos) {
        criarCano(largura + 10);
    }

    verificarColisao();
}

function verificarColisao() {
    const r = passarinho.raio;

    if (passarinho.y - r < 0 ||
        passarinho.y + r > altura - 25) {
        terminarJogo();
        return;
    }

    for (const cano of canos) {
        const dentroHorizontal =
            passarinho.x + r > cano.x &&
            passarinho.x - r < cano.x + larguraCano;

        const foraDaAbertura =
            passarinho.y - r < cano.topo ||
            passarinho.y + r > cano.topo + cano.abertura;

        if (dentroHorizontal && foraDaAbertura) {
            terminarJogo();
            return;
        }
    }
}

function terminarJogo() {
    if (estado !== "jogando") return;

    estado = "fim";

    cancelAnimationFrame(animacao);

    telaInicial.style.display = "flex";
    telaInicial.querySelector("h2").textContent = "Fim de jogo!";
    telaInicial.querySelector("p").textContent =
        `Você fez ${pontos} ponto(s)!`;
    botaoJogar.textContent = "JOGAR NOVAMENTE";
}

function desenharFundo() {
    // Céu
    const ceu = ctx.createLinearGradient(0, 0, 0, altura);
    ceu.addColorStop(0, "#83d8d5");
    ceu.addColorStop(1, "#c7f5d1");

    ctx.fillStyle = ceu;
    ctx.fillRect(0, 0, largura, altura);

    // Nuvens
    ctx.fillStyle = "#ffffff";

    for (let i = 0; i < 4; i++) {
        const x = i * 105 - 20;
        const y = 165 + (i % 2) * 22;

        ctx.beginPath();
        ctx.arc(x, y, 20, 0, Math.PI * 2);
        ctx.arc(x + 22, y - 9, 25, 0, Math.PI * 2);
        ctx.arc(x + 46, y, 20, 0, Math.PI * 2);
        ctx.fill();
    }

    // Cidade ao fundo
    ctx.fillStyle = "#b8e8d5";

    for (let x = 0; x < largura; x += 23) {
        const h = 40 + ((x * 7) % 55);

        ctx.fillRect(x, altura - 70 - h, 18, h);

        ctx.fillStyle = "#d7f4d7";

        for (let y = altura - 60 - h; y < altura - 80; y += 13) {
            ctx.fillRect(x + 5, y, 4, 4);
        }

        ctx.fillStyle = "#b8e8d5";
    }

    // Grama
    ctx.fillStyle = "#8ee66a";
    ctx.fillRect(0, altura - 30, largura, 30);

    ctx.fillStyle = "#54c94a";
    ctx.fillRect(0, altura - 30, largura, 5);

    ctx.fillStyle = "#dcf5a7";

    for (let x = 0; x < largura; x += 12) {
        ctx.fillRect(x, altura - 18, 5, 3);
    }

    // Chão
    ctx.fillStyle = "#e9dca0";
    ctx.fillRect(0, altura - 7, largura, 7);

    ctx.strokeStyle = "#9b873d";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, altura - 7);
    ctx.lineTo(largura, altura - 7);
    ctx.stroke();
}

function desenharCano(cano) {
    const x = cano.x;
    const topo = cano.topo;
    const base = topo + cano.abertura;

    // Corpo superior
    desenharPecaCano(x, 0, larguraCano, topo - 8, false);

    // Corpo inferior
    desenharPecaCano(
        x, base + 8, larguraCano,
        altura - 25 - (base + 8), true
    );
}

function desenharPecaCano(x, y, w, h, tampaEmCima) {
    if (h <= 0) return;

    ctx.fillStyle = "#53dc24";
    ctx.fillRect(x, y, w, h);

    // Sombra lateral
    ctx.fillStyle = "#2b9c20";
    ctx.fillRect(x + w - 8, y, 8, h);

    // Brilho lateral
    ctx.fillStyle = "#a3fa45";
    ctx.fillRect(x + 6, y, 7, h);

    ctx.strokeStyle = "#327b22";
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);

    const alturaTampa = 11;
    const tampaY = tampaEmCima ? y : y + h - alturaTampa;

    ctx.fillStyle = "#62eb2d";
    ctx.fillRect(x - 4, tampaY, w + 8, alturaTampa);

    ctx.strokeStyle = "#327b22";
    ctx.strokeRect(x - 4, tampaY, w + 8, alturaTampa);

    ctx.fillStyle = "#b5ff67";
    ctx.fillRect(x + 3, tampaY + 2, w - 10, 3);
}

function desenharPassarinho() {
    ctx.save();

    ctx.translate(passarinho.x, passarinho.y);
    ctx.rotate(passarinho.rotacao);

    // Asa
    ctx.fillStyle = "#c88724";
    ctx.beginPath();
    ctx.ellipse(-3, 4, 9, 5, -0.4, 0, Math.PI * 2);
    ctx.fill();

    // Corpo
    ctx.fillStyle = "#f5d66d";
    ctx.beginPath();
    ctx.ellipse(0, 0, 12, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#87632a";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Asa clara
    ctx.fillStyle = "#fff0a2";
    ctx.beginPath();
    ctx.ellipse(-4, 3, 6, 3, -0.4, 0, Math.PI * 2);
    ctx.fill();

    // Olho
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(6, -4, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#202020";
    ctx.beginPath();
    ctx.arc(7, -4, 2, 0, Math.PI * 2);
    ctx.fill();

    // Bico
    ctx.fillStyle = "#f08c37";
    ctx.beginPath();
    ctx.moveTo(10, 0);
    ctx.lineTo(17, 2);
    ctx.lineTo(10, 5);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
}

function desenhar() {
    desenharFundo();

    canos.forEach(desenharCano);

    desenharPassarinho();

    if (estado === "jogando") {
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 32px Arial";
        ctx.textAlign = "center";
        ctx.shadowColor = "#00000055";
        ctx.shadowBlur = 4;
        ctx.fillText(pontos, largura / 2, 48);
        ctx.shadowBlur = 0;
    }
}

function loop(tempo) {
    if (estado !== "jogando") return;

    const dt = ultimoTempo
        ? Math.min((tempo - ultimoTempo) / 1000, 0.03)
        : 0.016;

    ultimoTempo = tempo;

    atualizar(dt);
    desenhar();

    if (estado === "jogando") {
        animacao = requestAnimationFrame(loop);
    }
}

botaoJogar.addEventListener("click", reiniciar);
botaoReiniciar.addEventListener("click", reiniciar);

canvas.addEventListener("pointerdown", () => {
    if (estado === "jogando") {
        pular();
    }
});

document.addEventListener("keydown", (evento) => {
    if (evento.code === "Space" || evento.code === "ArrowUp") {
        evento.preventDefault();

        if (estado === "jogando") {
            pular();
        } else {
            reiniciar();
        }
    }
});

// Desenha a tela inicial
passarinho = {
    x: 85,
    y: 220,
    raio: 12,
    velocidadeY: 0,
    rotacao: 0
};

canos = [];
pontos = 0;
desenhar();
