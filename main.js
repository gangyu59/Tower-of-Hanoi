document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('game-canvas');
    const context = canvas.getContext('2d');
    const startButton = document.getElementById('start-button');
    const difficultySlider = document.getElementById('difficulty-slider');
    const difficultyLabel = document.getElementById('difficulty-label');
    const messageDiv = document.getElementById('message');
    const moveCounter = document.getElementById('move-counter');
    const rulesButton = document.getElementById('rules-button');
    const modal = document.getElementById('rules-modal');
    const closeButton = document.querySelector('.close-button');

    let numDisks = 3;
    let towers = [];
    let selectedTower = null;
    let moves = 0;

    const difficulties = ['超易', '较易', '中等', '较难', '超难'];

    difficultySlider.addEventListener('input', (event) => {
        difficultyLabel.textContent = difficulties[event.target.value - 1];
        numDisks = parseInt(event.target.value) + 2;  // Adjust number of disks based on difficulty
    });

    startButton.addEventListener('click', () => {
        messageDiv.textContent = '';
        towers = [Array.from({ length: numDisks }, (_, i) => numDisks - i), [], []];
        selectedTower = null;
        moves = 0;
        moveCounter.textContent = `移动次数 = ${moves}`;
        draw();
    });

    canvas.addEventListener('click', (event) => {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const towerWidth = canvas.width / 3;
        const clickedTower = Math.floor(x / towerWidth);

        if (selectedTower === null) {
            if (towers[clickedTower].length > 0) {
                selectedTower = clickedTower;
            }
        } else {
            if (moveDisk(selectedTower, clickedTower)) {
                moves++;
                moveCounter.textContent = `移动次数 = ${moves}`;
            }
            selectedTower = null;
            draw();
        }
    });

    function draw() {
        context.clearRect(0, 0, canvas.width, canvas.height);
        const towerWidth = canvas.width / 3;
        const diskHeight = canvas.height / (numDisks + 1);

        towers.forEach((tower, i) => {
            const towerX = i * towerWidth;
            tower.forEach((disk, j) => {
                const diskWidth = (disk / numDisks) * (towerWidth - 20);
                const diskX = towerX + (towerWidth - diskWidth) / 2;
                const diskY = canvas.height - (j + 1) * diskHeight;
                context.fillStyle = i === selectedTower ? 'lightblue' : 'gray';
                context.fillRect(diskX, diskY, diskWidth, diskHeight - 2);
            });
        });

        if (isSolved()) {
            messageDiv.style.color = 'green';
						messageDiv.textContent = `恭喜成功！一共用了${moves}步。`;
        }
    }

    function moveDisk(fromTower, toTower) {
        if (towers[fromTower].length === 0) {
            return false;
        }
        if (towers[toTower].length === 0 || towers[toTower][towers[toTower].length - 1] > towers[fromTower][towers[fromTower].length - 1]) {
            towers[toTower].push(towers[fromTower].pop());
            return true;
        }
        return false;
    }

    function isSolved() {
        return towers[2].length === numDisks;
    }

    // Initialize game
    canvas.width = window.innerWidth * 0.8;
    canvas.height = window.innerHeight * 0.6;
    draw();

    // Rules modal
    rulesButton.addEventListener('click', () => {
        modal.style.display = 'block';
    });

    closeButton.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
});