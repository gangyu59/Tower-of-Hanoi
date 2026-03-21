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

    // Rainbow color palette for disks (index 0 = largest disk)
    const DISK_COLORS = [
        { main: '#ff4757', glow: 'rgba(255,71,87,0.7)' },
        { main: '#ff6b35', glow: 'rgba(255,107,53,0.7)' },
        { main: '#ffd93d', glow: 'rgba(255,217,61,0.7)' },
        { main: '#6bcb77', glow: 'rgba(107,203,119,0.7)' },
        { main: '#4d96ff', glow: 'rgba(77,150,255,0.7)' },
        { main: '#a29bfe', glow: 'rgba(162,155,254,0.7)' },
        { main: '#fd79a8', glow: 'rgba(253,121,168,0.7)' },
    ];

    difficultySlider.addEventListener('input', (event) => {
        difficultyLabel.textContent = difficulties[event.target.value - 1];
        numDisks = parseInt(event.target.value) + 2;
    });

    startButton.addEventListener('click', () => {
        messageDiv.textContent = '';
        messageDiv.className = '';
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
                draw();
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

    function drawRoundedRect(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
    }

    function draw() {
        context.clearRect(0, 0, canvas.width, canvas.height);

        const towerWidth = canvas.width / 3;
        const diskH = Math.min(28, (canvas.height * 0.7) / (numDisks + 1));
        const baseY = canvas.height - 20;
        const baseH = 14;
        const poleW = 10;
        const poleH = diskH * (numDisks + 1.2);
        const towerLabels = ['A', 'B', 'C'];

        towers.forEach((tower, i) => {
            const centerX = i * towerWidth + towerWidth / 2;

            // Base platform
            const baseW = towerWidth * 0.72;
            const baseX = centerX - baseW / 2;
            const baseGrad = context.createLinearGradient(baseX, baseY, baseX, baseY + baseH);
            baseGrad.addColorStop(0, '#4a5568');
            baseGrad.addColorStop(0.5, '#718096');
            baseGrad.addColorStop(1, '#2d3748');
            context.fillStyle = baseGrad;
            drawRoundedRect(context, baseX, baseY, baseW, baseH, 5);
            context.fill();
            context.strokeStyle = 'rgba(160,180,220,0.4)';
            context.lineWidth = 1;
            context.stroke();

            // Pole
            const poleX = centerX - poleW / 2;
            const poleTopY = baseY - poleH;
            const poleGrad = context.createLinearGradient(poleX, 0, poleX + poleW, 0);
            poleGrad.addColorStop(0, '#2d3748');
            poleGrad.addColorStop(0.3, '#a0aec0');
            poleGrad.addColorStop(0.7, '#e2e8f0');
            poleGrad.addColorStop(1, '#4a5568');
            context.fillStyle = poleGrad;
            drawRoundedRect(context, poleX, poleTopY, poleW, poleH, 4);
            context.fill();
            context.strokeStyle = 'rgba(160,180,220,0.3)';
            context.lineWidth = 1;
            context.stroke();

            // Tower label
            context.font = `bold ${Math.max(14, diskH * 0.6)}px Arial`;
            context.textAlign = 'center';
            context.fillStyle = i === selectedTower
                ? '#ffd93d'
                : 'rgba(160, 196, 255, 0.7)';
            if (i === selectedTower) {
                context.shadowColor = '#ffd93d';
                context.shadowBlur = 10;
            } else {
                context.shadowBlur = 0;
            }
            context.fillText(towerLabels[i], centerX, baseY + baseH + 16);
            context.shadowBlur = 0;

            // Disks
            tower.forEach((diskSize, j) => {
                const colorIdx = diskSize - 1; // disk 1 = smallest, uses last color
                const colorEntry = DISK_COLORS[colorIdx % DISK_COLORS.length];
                const maxDiskW = towerWidth * 0.88;
                const minDiskW = towerWidth * 0.2;
                const diskW = minDiskW + (maxDiskW - minDiskW) * (diskSize / numDisks);
                const diskX = centerX - diskW / 2;
                const diskY = baseY - (j + 1) * diskH - 2;
                const radius = diskH * 0.45;

                // Glow effect for selected tower
                if (i === selectedTower) {
                    context.shadowColor = colorEntry.glow;
                    context.shadowBlur = 18;
                }

                // Main disk gradient
                const diskGrad = context.createLinearGradient(diskX, diskY, diskX, diskY + diskH - 4);
                const lighterColor = lightenColor(colorEntry.main, 40);
                const darkerColor = lightenColor(colorEntry.main, -30);
                diskGrad.addColorStop(0, lighterColor);
                diskGrad.addColorStop(0.5, colorEntry.main);
                diskGrad.addColorStop(1, darkerColor);

                context.fillStyle = diskGrad;
                drawRoundedRect(context, diskX, diskY, diskW, diskH - 4, radius);
                context.fill();

                // Shine highlight
                context.shadowBlur = 0;
                const shineGrad = context.createLinearGradient(diskX, diskY, diskX, diskY + (diskH - 4) * 0.5);
                shineGrad.addColorStop(0, 'rgba(255,255,255,0.35)');
                shineGrad.addColorStop(1, 'rgba(255,255,255,0)');
                context.fillStyle = shineGrad;
                drawRoundedRect(context, diskX + 2, diskY + 2, diskW - 4, (diskH - 4) * 0.5, radius * 0.8);
                context.fill();

                // Border
                context.strokeStyle = 'rgba(255,255,255,0.25)';
                context.lineWidth = 1;
                drawRoundedRect(context, diskX, diskY, diskW, diskH - 4, radius);
                context.stroke();
            });

            // Selection indicator arrow above top disk
            if (i === selectedTower && tower.length > 0) {
                const topDisk = tower[tower.length - 1];
                const colorEntry = DISK_COLORS[(topDisk - 1) % DISK_COLORS.length];
                const arrowY = baseY - tower.length * diskH - diskH * 0.1;
                context.fillStyle = '#ffd93d';
                context.shadowColor = '#ffd93d';
                context.shadowBlur = 12;
                context.beginPath();
                context.moveTo(centerX, arrowY - 10);
                context.lineTo(centerX - 8, arrowY - 22);
                context.lineTo(centerX + 8, arrowY - 22);
                context.closePath();
                context.fill();
                context.shadowBlur = 0;
            }
        });

        if (isSolved()) {
            messageDiv.className = 'message-success';
            messageDiv.textContent = `🎉 恭喜成功！一共用了 ${moves} 步！`;
        }
    }

    function lightenColor(hex, amount) {
        const num = parseInt(hex.replace('#', ''), 16);
        const r = Math.min(255, Math.max(0, (num >> 16) + amount));
        const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + amount));
        const b = Math.min(255, Math.max(0, (num & 0xff) + amount));
        return `rgb(${r},${g},${b})`;
    }

    function moveDisk(fromTower, toTower) {
        if (towers[fromTower].length === 0) return false;
        const top = towers[fromTower][towers[fromTower].length - 1];
        if (towers[toTower].length === 0 || towers[toTower][towers[toTower].length - 1] > top) {
            towers[toTower].push(towers[fromTower].pop());
            return true;
        }
        return false;
    }

    function isSolved() {
        return towers[2].length === numDisks;
    }

    // Initialize
    canvas.width = Math.min(window.innerWidth * 0.92, 720);
    canvas.height = Math.min(window.innerHeight * 0.52, 360);

    towers = [Array.from({ length: numDisks }, (_, i) => numDisks - i), [], []];
    draw();

    // Rules modal
    rulesButton.addEventListener('click', () => { modal.style.display = 'block'; });
    closeButton.addEventListener('click', () => { modal.style.display = 'none'; });
    window.addEventListener('click', (event) => {
        if (event.target === modal) modal.style.display = 'none';
    });
});
