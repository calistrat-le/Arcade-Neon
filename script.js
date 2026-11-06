const games = [
    ["tic","❎","Jogo da Velha","Estratégia"],
    ["memory","🪄","Memória Mágica","Memória"],
    ["simon","🔮","Sequência dos Feitiços","Memória"],
    ["lines","✨","Caminho Encantado","Lógica"],
    ["reaction","⚡","Reflexos de Auror","Reflexo"],
    ["guess","🔢","O Número Secreto","Lógica"],
    ["rps","⚔️","Duelo de Bruxos","Casual"],
    ["whack","👾","Caça às Criaturas","Reflexo"],
    ["typing","📜","Pergaminhos Mágicos","Reflexo"],
    ["math","⚗️","Laboratório de Poções","Lógica"],
    ["color","🌈","Oráculo das Cores","Reflexo"],
    ["lights","🕯️","As Luzes do Castelo","Lógica"],
    ["hangman","🦉","A Palavra Proibida","Casual"],
    ["slide","🗝️","O Enigma das Portas","Lógica"],
    ["target","🎯","Treinamento de Feitiços","Reflexo"]
];

let points = Number(localStorage.getItem("wizardPoints") || 0);
document.getElementById("points").textContent = points;

const grid = document.getElementById("gameGrid");
const modal = document.getElementById("modal");
const area = document.getElementById("gameArea");

function earn(n) {
    points += n;
    localStorage.setItem("wizardPoints", points);
    document.getElementById("points").textContent = points;
}

function renderGames() {
    games.forEach(g => {
        const card = document.createElement("div");
        card.className = "game-card";

        card.innerHTML = `
            <span class="icon">${g[1]}</span>
            <h3>${g[2]}</h3>
            <p>Um desafio espera por você.</p>
            <span class="category">${g[3]}</span>
        `;

        card.onclick = () => openGame(g);

        grid.appendChild(card);
    });
}

renderGames();

function openGame(g) {
    document.getElementById("gameTitle").textContent = g[2];
    modal.classList.add("show");
    area.innerHTML = "";
    launch[g[0]]();
}

function closeGame() {
    modal.classList.remove("show");
}

modal.addEventListener("click", e => {
    if (e.target === modal) closeGame();
});

document.addEventListener("keydown", e => {
    if (e.key === "Escape") closeGame();
});

function result(text) {
    let p = document.createElement("p");
    p.className = "result";
    p.textContent = text;
    area.appendChild(p);
}

function button(text, action) {
    let b = document.createElement("button");
    b.textContent = text;
    b.onclick = action;
    area.appendChild(b);
    return b;
}

function input(placeholder = "Digite aqui") {
    let i = document.createElement("input");
    i.placeholder = placeholder;
    area.appendChild(i);
    return i;
}

const launch = {

    // 1. JOGO DA VELHA
    tic() {
        let board = Array(9).fill("");
        let finished = false;

        area.innerHTML = `
            <p>Você é X. O computador é O.</p>
            <div class="board" id="ticBoard"
            style="grid-template-columns:repeat(3,65px)"></div>
            <p class="result" id="ticResult">Sua vez!</p>
        `;

        const el = document.getElementById("ticBoard");

        const combos = [
            [0,1,2],[3,4,5],[6,7,8],
            [0,3,6],[1,4,7],[2,5,8],
            [0,4,8],[2,4,6]
        ];

        function winner(p) {
            return combos.some(c => c.every(i => board[i] === p));
        }

        function draw() {
            el.innerHTML = "";

            board.forEach((v,i) => {
                let b = document.createElement("button");
                b.textContent = v || "✧";
                b.onclick = () => play(i);
                el.appendChild(b);
            });
        }

        function finish() {
            if (winner("X")) {
                finished = true;
                document.getElementById("ticResult").textContent =
                    "Você venceu! +20 galeões!";
                earn(20);
            } else if (winner("O")) {
                finished = true;
                document.getElementById("ticResult").textContent =
                    "O computador venceu!";
            } else if (board.every(Boolean)) {
                finished = true;
                document.getElementById("ticResult").textContent = "Empate!";
            }
        }

        function play(i) {
            if (finished || board[i]) return;

            board[i] = "X";
            draw();
            finish();

            if (finished) return;

            let empty = board.map((v,i) => v ? null : i)
                .filter(i => i !== null);

            let move = empty.find(i => {
                let copy = [...board];
                copy[i] = "O";
                return combos.some(c => c.every(n => copy[n] === "O"));
            });

            if (move === undefined) {
                move = empty.find(i => {
                    let copy = [...board];
                    copy[i] = "X";
                    return combos.some(c => c.every(n => copy[n] === "X"));
                });
            }

            if (move === undefined) {
                move = empty[Math.floor(Math.random() * empty.length)];
            }

            board[move] = "O";
            draw();
            finish();
        }

        function reset() {
            board = Array(9).fill("");
            finished = false;
            document.getElementById("ticResult").textContent = "Sua vez!";
            draw();
        }

        draw();
        button("RECOMEÇAR", reset);
    },

    // 2. JOGO DA MEMÓRIA
    memory() {
        const symbols = ["🦉","🪄","⚡","🧙","🧪","🗝️","🐈‍⬛","📜"];
        let cards = [...symbols,...symbols].sort(() => Math.random()-.5);
        let open = [];
        let matched = [];
        let tries = 0;

        area.innerHTML = `
            <p>Tente encontrar todos os pares mágicos!</p>
            <p class="result" id="memoryResult">Tentativas: 0</p>
            <div class="board" id="memoryBoard"
            style="grid-template-columns:repeat(4,60px)"></div>
        `;

        const el = document.getElementById("memoryBoard");

        function draw() {
            el.innerHTML = "";

            cards.forEach((symbol,i) => {
                let b = document.createElement("button");
                b.style.width = "60px";
                b.style.height = "55px";
                b.textContent = matched.includes(i) || open.includes(i)
                    ? symbol : "✧";
                b.onclick = () => flip(i);
                el.appendChild(b);
            });
        }

        function flip(i) {
            if (open.length === 2 ||
                open.includes(i) ||
                matched.includes(i)) return;

            open.push(i);
            draw();

            if (open.length === 2) {
                tries++;

                if (cards[open[0]] === cards[open[1]]) {
                    matched.push(...open);
                    open = [];

                    if (matched.length === 16) {
                        result("Todos os pares encontrados! +25 galeões!");
                        earn(25);
                    }
                    draw();
                } else {
                    setTimeout(() => {
                        open = [];
                        draw();
                    }, 800);
                }

                document.getElementById("memoryResult").textContent =
                    "Tentativas: " + tries;
            }
        }

        draw();
    },

    // 3. SEQUÊNCIA DOS FEITIÇOS
    simon() {
        let sequence = [];
        let position = 0;
        let playing = false;
        let round = 0;

        area.innerHTML = `
            <p>Observe a sequência e repita!</p>
            <div class="board" style="grid-template-columns:repeat(2,90px)"
            id="simonBoard"></div>
            <p class="result" id="simonResult">Comece o desafio!</p>
        `;

        const el = document.getElementById("simonBoard");
        const symbols = ["🪄","⚡","🔮","✨"];

        symbols.forEach((s,i) => {
            let b = document.createElement("button");
            b.textContent = s;
            b.style.height = "75px";
            b.onclick = () => choose(i);
            el.appendChild(b);
        });

        function flash(i) {
            let b = el.children[i];
            b.style.background = "#b18b4f";
            setTimeout(() => b.style.background = "", 350);
        }

        function next() {
            playing = false;
            position = 0;
            round++;
            sequence.push(Math.floor(Math.random()*4));

            sequence.forEach((n,i) => {
                setTimeout(() => flash(n), 650*i + 400);
            });

            setTimeout(() => {
                playing = true;
                document.getElementById("simonResult").textContent =
                    "Sua vez! Rodada " + round;
            }, sequence.length*650 + 500);
        }

        function choose(i) {
            if (!playing) return;

            flash(i);

            if (sequence[position] !== i) {
                playing = false;
                result("Fim do desafio! Você chegou à rodada " + round);
                earn(round * 3);
                return;
            }

            position++;

            if (position === sequence.length) {
                playing = false;
                setTimeout(next,700);
            }
        }

        button("COMEÇAR", () => {
            sequence = [];
            round = 0;
            next();
        });
    },

    // 4. CAMINHO ENCANTADO
    lines() {
        let route = Array.from({length:6},
            () => Math.floor(Math.random()*9));
        let step = 0;
        let ready = false;

        area.innerHTML = `
            <p>Memorize os símbolos iluminados e repita a ordem!</p>
            <div class="board" id="lineBoard"
            style="grid-template-columns:repeat(3,65px)"></div>
            <p class="result" id="lineResult">Observe...</p>
        `;

        const el = document.getElementById("lineBoard");

        for(let i=0;i<9;i++) {
            let b = document.createElement("button");
            b.textContent = "✧";
            b.onclick = () => {
                if(!ready) return;

                if(i === route[step]) {
                    b.textContent = "✦";
                    step++;

                    if(step === route.length) {
                        ready = false;
                        result("Caminho descoberto! +15 galeões!");
                        earn(15);
                    }
                } else {
                    ready = false;
                    result("Você perdeu o caminho! Tente novamente.");
                }
            };
            el.appendChild(b);
        }

        route.forEach((n,i) => {
            setTimeout(() => {
                el.children[n].style.background = "#b18b4f";
                setTimeout(() => el.children[n].style.background = "",400);
            },i*650+500);
        });

        setTimeout(() => {
            ready = true;
            document.getElementById("lineResult").textContent =
                "Agora repita!";
        },route.length*650+700);
    },

    // 5. REFLEXOS DE AUROR
    reaction() {
        area.innerHTML = `
            <p>Espere o momento certo para lançar seu feitiço!</p>
            <button id="reactionBtn">COMEÇAR</button>
            <p class="result" id="reactionResult"></p>
        `;

        let b = document.getElementById("reactionBtn");
        let state = "start";
        let start;
        let timer;

        b.onclick = () => {
            if(state === "start") {
                state = "wait";
                b.textContent = "ESPERE...";
                b.style.background = "#6d2026";

                timer = setTimeout(() => {
                    state = "go";
                    start = Date.now();
                    b.textContent = "LANÇAR FEITIÇO!";
                    b.style.background = "#477143";
                },1000 + Math.random()*3000);

            } else if(state === "wait") {
                clearTimeout(timer);
                state = "start";
                b.textContent = "TENTE NOVAMENTE";
                document.getElementById("reactionResult").textContent =
                    "Muito cedo! Você perdeu o momento.";

            } else {
                let time = Date.now()-start;
                state = "start";
                b.textContent = "JOGAR NOVAMENTE";

                document.getElementById("reactionResult").textContent =
                    "Seu tempo: " + time + " ms";

                if(time < 450) earn(10);
            }
        };
    },

    // 6. NÚMERO SECRETO
    guess() {
        let answer = Math.floor(Math.random()*100)+1;
        let tries = 0;

        area.innerHTML = `
            <p>O chapéu selecionou um número entre 1 e 100.</p>
            <input type="number" id="guessInput" placeholder="Seu palpite">
            <button id="guessBtn">ADIVINHAR</button>
            <p class="result" id="guessResult"></p>
        `;

        document.getElementById("guessBtn").onclick = () => {
            let n = Number(document.getElementById("guessInput").value);
            if(n<1 || n>100) return;

            tries++;

            let r = document.getElementById("guessResult");

            if(n === answer) {
                r.textContent = "Você descobriu! +15 galeões!";
                earn(15);
            } else {
                r.textContent = n<answer
                    ? "Muito baixo! Tente um número maior."
                    : "Muito alto! Tente um número menor.";
            }
        };
    },

    // 7. DUELO DE BRUXOS
    rps() {
        area.innerHTML = `
            <p>Escolha seu símbolo para o duelo!</p>
            <div id="rpsButtons"></div>
            <p class="result" id="rpsResult"></p>
        `;

        ["🪨 Pedra","📜 Papel","✂️ Tesoura"].forEach((s,i) => {
            let b = button(s, () => {
                let bot = Math.floor(Math.random()*3);
                let you = i;

                if(you === bot) {
                    document.getElementById("rpsResult").textContent =
                        "Empate! Os dois bruxos têm a mesma força.";
                } else if((you-bot+3)%3 === 1) {
                    document.getElementById("rpsResult").textContent =
                        "Você venceu o duelo! +5 galeões!";
                    earn(5);
                } else {
                    document.getElementById("rpsResult").textContent =
                        "O outro bruxo venceu!";
                }
            });

            document.getElementById("rpsButtons").appendChild(b);
        });
    },

    // 8. CAÇA ÀS CRIATURAS
    whack() {
        let hits = 0;
        let time = 20;
        let timer;
        let active = false;

        area.innerHTML = `
            <p>Tempo: <span id="whTime">20</span> |
            Pontos: <span id="whHits">0</span></p>
            <div class="board" id="whBoard"
            style="grid-template-columns:repeat(3,65px)"></div>
            <p class="result" id="whResult"></p>
        `;

        const el = document.getElementById("whBoard");

        for(let i=0;i<9;i++) {
            let b = document.createElement("button");
            b.textContent = "✧";
            b.onclick = () => {
                if(active && b.textContent === "👾") {
                    hits++;
                    document.getElementById("whHits").textContent = hits;
                    b.textContent = "✦";
                }
            };
            el.appendChild(b);
        }

        function spawn() {
            el.querySelectorAll("button").forEach(b => b.textContent="✧");
            el.children[Math.floor(Math.random()*9)].textContent="👾";
        }

        button("COMEÇAR", () => {
            clearInterval(timer);
            hits = 0;
            time = 20;
            active = true;
            document.getElementById("whHits").textContent = 0;

            spawn();

            timer = setInterval(() => {
                time--;
                document.getElementById("whTime").textContent = time;
                spawn();

                if(time<=0) {
                    clearInterval(timer);
                    active = false;
                    document.getElementById("whResult").textContent =
                        "Desafio terminado! Você fez "+hits+" pontos.";
                    earn(hits);
                }
            },1000);
        });
    },

    // 9. PERGAMINHOS MÁGICOS
    typing() {
        let words = ["FEITICO","DRAGAO","CASTELO","MAGIA",
                     "VARINHA","CORUJA","POCAO","PORTAL"];
        let current;
        let points = 0;
        let time = 30;
        let timer;

        area.innerHTML = `
            <p>Digite a palavra que aparece no pergaminho!</p>
            <h2 id="typeWord"></h2>
            <input id="typeInput" placeholder="Digite aqui">
            <p class="result" id="typeResult">Tempo: 30 segundos</p>
        `;

        function next() {
            current = words[Math.floor(Math.random()*words.length)];
            document.getElementById("typeWord").textContent = current;
            document.getElementById("typeInput").value = "";
        }

        let field = document.getElementById("typeInput");

        field.addEventListener("keydown",e => {
            if(e.key === "Enter" && field.value.trim().toUpperCase() === current) {
                points++;
                next();
            }
        });

        button("COMEÇAR", () => {
            clearInterval(timer);
            points = 0;
            time = 30;
            field.disabled = false;
            next();

            timer = setInterval(() => {
                time--;
                document.getElementById("typeResult").textContent =
                    "Tempo: "+time+" segundos | Acertos: "+points;

                if(time<=0) {
                    clearInterval(timer);
                    field.disabled = true;
                    result("Fim! Você acertou "+points+" palavras.");
                    earn(points*2);
                }
            },1000);
        });
    },

    // 10. LABORATÓRIO DE POÇÕES
    math() {
        let a,b,answer,points=0,time=30,timer;

        area.innerHTML = `
            <p>Resolva as operações para preparar a poção!</p>
            <h2 id="mathQuestion"></h2>
            <input type="number" id="mathInput" placeholder="Resposta">
            <p class="result" id="mathResult"></p>
        `;

        function next() {
            a = Math.ceil(Math.random()*12);
            b = Math.ceil(Math.random()*12);
            answer = a+b;
            document.getElementById("mathQuestion").textContent =
                a+" + "+b+" = ?";
            document.getElementById("mathInput").value = "";
        }

        button("COMEÇAR", () => {
            clearInterval(timer);
            points = 0;
            time = 30;
            next();

            timer = setInterval(() => {
                time--;
                if(time<=0) {
                    clearInterval(timer);
                    result("Poção preparada! Acertos: "+points);
                    earn(points*2);
                }
            },1000);
        });

        document.getElementById("mathInput").addEventListener("keydown",e => {
            if(e.key==="Enter" &&
               Number(e.target.value)===answer) {
                points++;
                next();
            }
        });
    },

    // 11. ORÁCULO DAS CORES
    color() {
        const colors = [
            ["VERMELHO","#b52b35"],
            ["AZUL","#3675aa"],
            ["VERDE","#56824c"],
            ["ROXO","#9a64a8"],
            ["DOURADO","#d5a83e"]
        ];

        let correct = 0;
        let time = 20;
        let timer;
        let index = 0;

        area.innerHTML = `
            <p>Escolha a cor escrita, não a cor da tinta!</p>
            <h2 id="colorWord"></h2>
            <div id="colorOptions"></div>
            <p class="result" id="colorResult">Acertos: 0</p>
        `;

        function next() {
            index = Math.floor(Math.random()*5);
            let ink = Math.floor(Math.random()*5);

            let word = document.getElementById("colorWord");
            word.textContent = colors[index][0];
            word.style.color = colors[ink][1];
        }

        colors.forEach((c,i) => {
            button(c[0], () => {
                if(i===index) {
                    correct++;
                    document.getElementById("colorResult").textContent =
                        "Acertos: "+correct;
                    next();
                } else {
                    document.getElementById("colorResult").textContent =
                        "Concentre-se na palavra!";
                }
            });
        });

        next();

        button("COMEÇAR", () => {
            clearInterval(timer);
            correct = 0;
            time = 20;
            next();

            timer = setInterval(() => {
                time--;
                if(time<=0) {
                    clearInterval(timer);
                    result("Fim do oráculo! Acertos: "+correct);
                    earn(correct*2);
                }
            },1000);
        });
    },

    // 12. AS LUZES DO CASTELO
    lights() {
        let cells = Array(9).fill(false);

        function toggle(i) {
            [i,i-3,i+3,
             i%3 ? i-1 : -1,
             i%3!==2 ? i+1 : -1].forEach(n => {
                if(n>=0 && n<9) cells[n] = !cells[n];
            });
        }

        for(let i=0;i<9;i++) {
            if(Math.random()>.5) toggle(i);
        }

        area.innerHTML = `
            <p>Apague todas as luzes do castelo!</p>
            <div class="board" id="lightBoard"
            style="grid-template-columns:repeat(3,65px)"></div>
        `;

        const el = document.getElementById("lightBoard");

        function draw() {
            el.innerHTML = "";

            cells.forEach((v,i) => {
                let b = document.createElement("button");
                b.textContent = v ? "🕯️" : "·";
                b.onclick = () => {
                    toggle(i);
                    draw();

                    if(cells.every(x=>!x)) {
                        result("Todas as luzes apagadas! +20 galeões!");
                        earn(20);
                    }
                };
                el.appendChild(b);
            });
        }

        draw();
    },

    // 13. A PALAVRA PROIBIDA
    hangman() {
        let words = ["VARINHA","CORUJA","CASTELO",
                     "POCAO","DRAGAO","MISTERIO"];

        let word = words[Math.floor(Math.random()*words.length)];
        let used = [];
        let errors = 0;
        let finished = false;

        area.innerHTML = `
            <p>Descubra a palavra secreta!</p>
            <h2 id="hangWord"></h2>
            <p class="result" id="hangErrors">Erros: 0/6</p>
            <div id="hangKeys"></div>
        `;

        function draw() {
            document.getElementById("hangWord").textContent =
                word.split("").map(c => used.includes(c) ? c : "_").join(" ");

            document.getElementById("hangErrors").textContent =
                "Erros: "+errors+"/6";

            let keys = document.getElementById("hangKeys");
            keys.innerHTML = "";

            "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").forEach(c => {
                let b = document.createElement("button");
                b.textContent = c;
                b.disabled = used.includes(c) || finished;
                b.onclick = () => play(c);
                keys.appendChild(b);
            });
        }

        function play(c) {
            if(finished) return;

            used.push(c);

            if(!word.includes(c)) errors++;

            if(errors>=6) {
                finished = true;
                result("A palavra era "+word+".");
            } else if(word.split("").every(c=>used.includes(c))) {
                finished = true;
                result("Palavra descoberta! +15 galeões!");
                earn(15);
            }

            draw();
        }

        draw();
    },

    // 14. O ENIGMA DAS PORTAS
    slide() {
        let nums = [1,2,3,4,5,6,7,8,0];
        let moves = 0;

        function shuffle() {
            do {
                nums = [1,2,3,4,5,6,7,8,0];

                for(let i=8;i>0;i--) {
                    let j=Math.floor(Math.random()*(i+1));
                    [nums[i],nums[j]]=[nums[j],nums[i]];
                }

            } while(!solvable());

            moves=0;
            draw();
        }

        function solvable() {
            let inv=0;
            for(let i=0;i<8;i++) {
                for(let j=i+1;j<9;j++) {
                    if(nums[i] && nums[j] && nums[i]>nums[j]) inv++;
                }
            }
            return inv%2===0;
        }

        area.innerHTML = `
            <p>Organize os números de 1 a 8.</p>
            <div class="board" id="slideBoard"
            style="grid-template-columns:repeat(3,65px)"></div>
            <p class="result" id="slideResult">Movimentos: 0</p>
        `;

        const el = document.getElementById("slideBoard");

        function draw() {
            el.innerHTML = "";

            nums.forEach((n,i) => {
                let b = document.createElement("button");
                b.textContent = n || "";
                b.onclick = () => move(i);
                el.appendChild(b);
            });
        }

        function move(i) {
            let z=nums.indexOf(0);

            let adjacent = [z-3,z+3];

            if(z%3!==0) adjacent.push(z-1);
            if(z%3!==2) adjacent.push(z+1);

            if(!adjacent.includes(i)) return;

            [nums[z],nums[i]]=[nums[i],nums[z]];
            moves++;
            draw();

            document.getElementById("slideResult").textContent =
                "Movimentos: "+moves;

            if(nums.join(",")==="1,2,3,4,5,6,7,8,0") {
                result("Portas organizadas! +30 galeões!");
                earn(30);
            }
        }

        button("EMBARALHAR",shuffle);
        shuffle();
    },

    // 15. TREINAMENTO DE FEITIÇOS
    target() {
        let hits=0;
        let time=20;
        let timer;

        area.innerHTML = `
            <p>Acerte o alvo mágico o máximo de vezes!</p>
            <p class="result" id="targetInfo">20 segundos</p>
            <div id="targetZone" style="height:120px;position:relative"></div>
        `;

        const zone = document.getElementById("targetZone");

        let target = document.createElement("button");
        target.textContent = "🎯";
        target.style.position = "absolute";
        zone.appendChild(target);

        function moveTarget() {
            target.style.left = Math.random()*65+"%";
            target.style.top = Math.random()*55+"px";
        }

        target.onclick = () => {
            if(time<=0) return;
            hits++;
            moveTarget();
            document.getElementById("targetInfo").textContent =
                "Acertos: "+hits+" | Tempo: "+time;
        };

        button("COMEÇAR TREINAMENTO", () => {
            clearInterval(timer);
            hits=0;
            time=20;
            moveTarget();

            timer=setInterval(() => {
                time--;

                document.getElementById("targetInfo").textContent =
                    "Acertos: "+hits+" | Tempo: "+time;

                if(time<=0) {
                    clearInterval(timer);
                    target.disabled=true;
                    result("Treinamento concluído! "+hits+" acertos.");
                    earn(hits*2);
                }
            },1000);
        });
    }

};
