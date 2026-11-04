// Navegação entre os menus e jogos
function switchGame(gameId) {
    document.getElementById('gameSelector').style.display = 'none';
    document.getElementById('backBtn').style.display = 'inline-block';
    
    // Esconde todos os jogos e mostra apenas o escolhido
    document.querySelectorAll('.game-box').forEach(box => box.style.display = 'none');
    document.getElementById(gameId).style.display = 'block';

    if (gameId === 'memory') {
        resetMemory();
    } else if (gameId === 'tictactoe') {
        resetTTT();
    }
}

function returnToMenu() {
    document.getElementById('gameSelector').style.display = 'grid';
    document.getElementById('backBtn').style.display = 'none';
    document.querySelectorAll('.game-box').forEach(box => box.style.display = 'none');
}

/* --- LÓGICA DO JOGO DA VELHA --- */
let tttBoardState = ['', '', '', '', '', '', '', '', ''];
let tttCurrentPlayer = 'X';
let tttIsActive = true;

function makeMove(index) {
    if (tttBoardState[index] === '' && tttIsActive) {
        tttBoardState[index] = tttCurrentPlayer;
        document.getElementsByClassName('ttt-cell')[index].innerText = tttCurrentPlayer;
        
        // Cores personalizadas para X e O
        document.getElementsByClassName('ttt-cell')[index].style.color = tttCurrentPlayer === 'X' ? '#ff007f' : '#00f2fe';

        checkTTTWinner();
    }
}

function checkTTTWinner() {
    const winningConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Linhas
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Colunas
        [0, 4, 8], [2, 4, 6]              // Diagonais
    ];

    let roundWon = false;
    for (let condition of winningConditions) {
        let a = tttBoardState[condition[0]];
        let b = tttBoardState[condition[1]];
        let c = tttBoardState[condition[2]];

        if (a === '' || b === '' || c === '') continue;
        if (a === b && b === c) {
            roundWon = true;
            break;
        }
    }

    if (roundWon) {
        document.getElementById('tttStatus').innerText = `🎉 Jogador ${tttCurrentPlayer} Venceu!`;
        tttIsActive = false;
        return;
    }

    if (!tttBoardState.includes('')) {
        document.getElementById('tttStatus').innerText = `Empate!`;
        tttIsActive = false;
        return;
    }

    tttCurrentPlayer = tttCurrentPlayer === 'X' ? 'O' : 'X';
    document.getElementById('tttStatus').innerText = `Vez do Jogador ${tttCurrentPlayer}`;
}

function resetTTT() {
    tttBoardState = ['', '', '', '', '', '', '', '', ''];
    tttCurrentPlayer = 'X';
    tttIsActive = true;
    document.getElementById('tttStatus').innerText = `Vez do Jogador X`;
    let cells = document.getElementsByClassName('ttt-cell');
    for (let cell of cells) {
        cell.innerText = '';
    }
}

/* --- LÓGICA DO JOGO DA MEMÓRIA --- */
const emojis = ['🚀', '🚀', '🐱', '🐱', '🍕', '🍕', '💎', '💎'];
let flippedCards = [];
let matchedPairs = 0;
let lockBoard = false;

function resetMemory() {
    const grid = document.getElementById('memoryGrid');
    grid.innerHTML = '';
    flippedCards = [];
    matchedPairs = 0;
    lockBoard = false;

    // Embaralha os emojis
    let shuffledEmojis = [...emojis].sort(() => Math.random() - 0.5);

    shuffledEmojis.forEach((emoji) => {
        const card = document.createElement('div');
        card.classList.add('memory-card');
        card.dataset.emoji = emoji;
        card.addEventListener('click', flipCard);
        grid.appendChild(card);
    });
}

function flipCard() {
    if (lockBoard) return;
    if (this === flippedCards[0]) return;

    this.classList.add('flipped');
    this.innerText = this.dataset.emoji;

    if (!flippedCards.length) {
        flippedCards.push(this);
        return;
    }

    flippedCards.push(this);
    checkForMatch();
}

function checkForMatch() {
    let isMatch = flippedCards[0].dataset.emoji === flippedCards[1].dataset.emoji;

    if (isMatch) {
        disableCards();
    } else {
        unflipCards();
    }
}

function disableCards() {
    flippedCards.forEach(card => card.removeEventListener('click', flipCard));
    matchedPairs++;
    flippedCards = [];

    if (matchedPairs === emojis.length / 2) {
        setTimeout(() => alert('🏆 Parabéns! Você encontrou todos os pares!'), 300);
    }
}

function unflipCards() {
    lockBoard = true;
    setTimeout(() => {
        flippedCards.forEach(card => {
            card.classList.remove('flipped');
            card.innerText = '';
        });
        resetBoard();
    }, 900);
}

function resetBoard() {
    [flippedCards, lockBoard] = [[], false];
}