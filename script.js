const canvas = document.getElementById('neuronCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const logo = document.getElementById('logo'); // Referência à logo
let logoVisible = false; // Controle da visibilidade da logo

let neurons = [];
const numNeurons = 80;
const maxDistance = 150;
let mouse = { x: null, y: null };
const attractionRadius = 150; // Raio de atração suave do mouse
const attractionStrength = 0.02; // A força com que as bolinhas são atraídas pelo mouse (mais suave)
const speedReductionFactor = 0.2; // Redução da velocidade de movimento

// Cores que as bolinhas irão alternar
const colors = ['#29FA10', '#37617A', '#f23839', '#f2ca50', '#378c4b'];

class Neuron {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 5;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.dx = (Math.random() - 0.5) * 2 * speedReductionFactor;
        this.dy = (Math.random() - 0.5) * 2 * speedReductionFactor;
        this.connectedColors = new Set(); // Para armazenar cores já utilizadas
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }

    move() {
        // Lógica para empurrar as bolinhas quando a logo estiver visível
        if (logoVisible) {
            const logoX = canvas.width / 2;
            const logoY = canvas.height / 2;
            const distanceToLogo = Math.sqrt((this.x - logoX) ** 2 + (this.y - logoY) ** 2);

            // Se a bolinha estiver perto da logo, mova-a para longe
            if (distanceToLogo < 100) { // 100 pode ser ajustado
                const angle = Math.atan2(this.y - logoY, this.x - logoX);
                const force = 0.5; // Ajuste a força conforme necessário
                this.dx += Math.cos(angle) * force; // Empurrar para longe da logo
                this.dy += Math.sin(angle) * force; // Empurrar para longe da logo
            }
        }

        this.x += this.dx;
        this.y += this.dy;

        // Contorno das bordas do canvas
        if (this.x + this.radius > canvas.width || this.x - this.radius < 0) {
            this.dx = -this.dx;
        }
        if (this.y + this.radius > canvas.height || this.y - this.radius < 0) {
            this.dy = -this.dy;
        }
    }

    connect(neuron) {
        const distance = Math.sqrt((this.x - neuron.x) ** 2 + (this.y - neuron.y) ** 2);
        if (distance < maxDistance) {
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(neuron.x, neuron.y);
            ctx.strokeStyle = 'rgba(0, 128, 0, 0.3)';
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.closePath();

            // A bolinha que recebeu a conexão muda para uma nova cor fixa
            if (!this.connectedColors.has(neuron.color)) {
                this.connectedColors.add(neuron.color);
                this.color = neuron.color;
            }
        }
    }

    attractToMouse() {
        const distanceToMouse = Math.sqrt((this.x - mouse.x) ** 2 + (this.y - mouse.y) ** 2);

        if (distanceToMouse < attractionRadius) {
            const angle = Math.atan2(mouse.y - this.y, mouse.x - this.x);
            const attractionForceX = Math.cos(angle) * attractionStrength;
            const attractionForceY = Math.sin(angle) * attractionStrength;

            this.dx += attractionForceX;
            this.dy += attractionForceY;
        }
    }
}

function initNeurons() {
    for (let i = 0; i < numNeurons; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        neurons.push(new Neuron(x, y));
    }
}

function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    neurons.forEach(neuron => {
        neuron.attractToMouse(); // A bolinha é atraída suavemente para o mouse
        neuron.move();
        neuron.draw();
        neurons.forEach(otherNeuron => {
            if (neuron !== otherNeuron) {
                neuron.connect(otherNeuron); // Muda de cor ao fazer uma nova conexão
            }
        });
    });

    // Se a logo estiver visível, desenhe-a
    if (logoVisible) {
        ctx.drawImage(logo, canvas.width / 2 - 50, canvas.height / 2 - 50, 100, 100); // Ajuste o tamanho conforme necessário
    }
}

// Atualiza a posição do mouse
window.addEventListener('mousemove', (event) => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
});

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

// Mostrar a logo após 10 segundos
setTimeout(() => {
    logo.style.display = 'block'; // Exibe a logo
    logoVisible = true; // Define a logo como visível
}, 10000);

initNeurons();
animate();
