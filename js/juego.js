class AudioController {
    constructor() {
        this.fondoMusica = new Audio('operators-match/assets/audios/fondo.ogg');
        this.voltearSonido = new Audio('operators-match/assets/audios/voltear.mp3');
        this.matchSonido = new Audio('operators-match/assets/audios/match.mp3');
        this.gameOverSonido = new Audio('operators-match/assets/audios/gameOver.wav');
        this.fondoMusica.volume = 0.3;
        this.fondoMusica.loop = true;
    }
    empezarMusica() {
        this.fondoMusica.play();
    }
    pararMusica() {
        this.fondoMusica.pause();
        this.fondoMusica.currentTime = 0;
    }
    voltear() {
        this.voltearSonido.play();
    }
    match() {
        this.matchSonido.play();
    }
    victory() {
        this.pararMusica();
        this.victorySound.play();
    }
    gameOver() {
        this.pararMusica();
        this.gameOverSonido.play();
    }
}

class CardsPairs {

    constructor(tiempo, cartas) {
        this.cartasArray = cartas;
        this.tiempo = tiempo;
        this.tiempoRestante = tiempo;
        this.timer = document.getElementById('tiempo-atras')
        this.scoreLabel = document.getElementById('puntuacion');
        this.audioController = new AudioController();
    }

    empezarJuego() {
        this.totalScore = 0;
        this.tiempoAtras = this.tiempo;
        this.cartasCheck = null;
        this.cartasMatched = [];
        this.ocupado = true;
        setTimeout(() => {
            this.audioController.empezarMusica();
            this.barajarCartas(this.cartasArray);
            this.cuentaAtras = this.comenzarCuentaAtras();
            this.ocupado = false;
        }, 500)
        this.esconderCartas();
        this.timer.innerText = this.tiempoRestante;
        this.scoreLabel.innerText = this.totalScore;
    }

    comenzarCuentaAtras() {
        return setInterval(() => {
            this.tiempoRestante--;
            this.timer.innerText = this.tiempoRestante;
            if(this.tiempoRestante === 0)
                this.gameOver();
        }, 1000);
    }

    sendScoreAJAX(score) {
      console.log(score);
       $.ajax({
           type: "POST",
           url: "../score/add",
           data: { "Game": 'Operators Match', "Score" : score },
           success: (response) => {
               if (response.route) window.location.href = response.route;
           },
           error: () => {
               console.log("AJAX JQUERY DOES BRRRR.");
           }
       });
   }

    gameOver() {
        let texto = document.getElementById('game-over-texto');
        texto.classList.add('visible');
        texto.classList.remove('cubrir-texto');
        clearInterval(this.cuentaAtras);
        this.audioController.gameOver();

        setTimeout(this.sendScoreAJAX, 3000, this.totalScore);
    }

    SiguienteRonda() {
        this.cartasCheck = null;
        this.cartasMatched = [];
        this.barajarCartas(this.cartasArray);
        this.ocupado = false;
        this.esconderCartas();

    }

    esconderCartas() {
        this.cartasArray.forEach(carta => {
            carta.classList.remove('visible');
            carta.classList.remove('matched');
        });
    }

    voltearCarta(carta) {
        if(this.puedoVoltearCarta(carta)) {
            this.audioController.voltear();

            carta.classList.add('visible');

            if(this.cartasCheck) {
                this.checkCartaMatch(carta);
            } else {
                this.cartasCheck = carta;
            }
        }
    }

    checkCartaMatch(carta) {
        if(this.getTipoCarta(carta) === this.getTipoCarta(this.cartasCheck)){
            this.cartaMatch(carta, this.cartasCheck);
        }

        else {
            this.cartaNoMatch(carta, this.cartasCheck);
        }

        this.cartasCheck = null;
    }

    cartaMatch(carta1, carta2) {
        let juego;
        this.cartasMatched.push(carta1);
        this.cartasMatched.push(carta2);

        carta1.classList.add('matched');
        carta2.classList.add('matched');
        ///
        this.totalScore += 100;
        this.scoreLabel.innerText = this.totalScore;
        this.audioController.match();
        if(this.cartasMatched.length === this.cartasArray.length){
            this.SiguienteRonda();
        }
    }

    cartaNoMatch(carta1, carta2) {
        this.ocupado = true;
        setTimeout(() => {
            carta1.classList.remove('visible');
            carta2.classList.remove('visible');
            this.ocupado = false;
        }, 1000);
    }

    barajarCartas(cartasArray) {
        for (let i = cartasArray.length - 1; i > 0; i--) {
            let randIndex = Math.floor(Math.random() * (i + 1));
            cartasArray[randIndex].style.order = i;
            cartasArray[i].style.order = randIndex;
        }
    }

    getTipoCarta(carta) {
        return carta.getElementsByClassName('carta-valor')[0].src;
    }

    puedoVoltearCarta(carta) {
        return !this.ocupado && !this.cartasMatched.includes(carta) && carta !== this.cartasCheck;
    }
}

if (document.readyState == 'loading') {
    document.addEventListener('DOMContentLoaded', jugar);
} else {
    jugar();
}

function jugar() {
    let cubiertos = Array.from(document.getElementsByClassName('cubrir-texto'));
    let cartas = Array.from(document.getElementsByClassName('carta'));
    let juego = new CardsPairs(100, cartas);

    cubiertos.forEach(cubierto => {
        cubierto.addEventListener('click', () => {
            cubierto.classList.remove('visible');
            juego.empezarJuego();
        });
    });

    cartas.forEach(carta => {
        carta.addEventListener('click', () => {
            juego.voltearCarta(carta);
        });
    });
}
