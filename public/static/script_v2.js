// --- 核心切换逻辑 ---
function switchTab(sectionId) {
    document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

    document.getElementById(sectionId).classList.add('active');
    const navId = 'nav' + sectionId.replace('sec', '');
    const navItem = document.getElementById(navId);
    if (navItem) navItem.classList.add('active');
}
window.switchTab = switchTab;

// --- 1.1 实验逻辑 (热电子发射) ---
let canvas11, ctx11;
let particles11 = [];
let isMalteseActive = false;

function toggleMaltese() {
    isMalteseActive = !isMalteseActive;
    const cross = document.getElementById('malteseCross');
    if (cross) cross.style.display = isMalteseActive ? 'block' : 'none';
}

function update11() {
    const sec = document.getElementById('sec11');
    if (!sec) return; // Stop loop if DOM is gone
    if (!sec.classList.contains('active')) {
        requestAnimationFrame(update11); return;
    }
    // Add guard clause for robustness
    if (!ctx11) {
        requestAnimationFrame(update11);
        return;
    }
    ctx11.clearRect(0, 0, canvas11.width, canvas11.height);
    const T = parseInt(document.getElementById('tempSlider').value);
    const V = parseInt(document.getElementById('voltSlider').value);

    const vDisp = document.getElementById('vDisplay');
    if (vDisp) vDisp.innerText = (V > 0 ? Math.sqrt((2 * 1.6e-19 * V) / 9.1e-31) : 0).toExponential(2);

    // 绘制阴极 (Cathode)
    ctx11.fillStyle = `rgb(255, ${255 - T * 2}, 50)`;
    ctx11.fillRect(40, 120, 12, 60);

    // 基于温度生成电子
    if (Math.random() < T / 100) {
        particles11.push({ 
            x: 52, 
            y: 125 + Math.random() * 50, 
            vx: Math.sqrt(V) * 0.25 + 0.2 
        });
    }

    particles11.forEach((p, i) => {
        p.x += p.vx;
        // 马耳他十字遮挡逻辑
        if (isMalteseActive && p.x > 260 && p.x < 285 && p.y > 120 && p.y < 180) {
            particles11.splice(i, 1);
            return;
        }
        ctx11.fillStyle = "#ffff00";
        ctx11.beginPath(); ctx11.arc(p.x, p.y, 2, 0, Math.PI * 2); ctx11.fill();
        if (p.x > canvas11.width) particles11.splice(i, 1);
    });
    requestAnimationFrame(update11);
}

// --- 1.2 实验逻辑 (能带理论) ---
let canvas12, ctx12;
let cbElectrons = [];
let vbHoles = []; // Track holes in Valence Band
let gap = 80;

function changeMaterial() {
    const matSelect = document.getElementById('matSelect');
    if (!matSelect) return;
    const val = matSelect.value;
    gap = val === 'metal' ? 0 : (val === 'semi' ? 80 : 160);
    cbElectrons = []; // 切换材料时清空导带
    vbHoles = [];
}

function update12() {
    const section = document.getElementById('sec12');
    if (!section) return;

    if (!section || !section.classList.contains('active')) {
        requestAnimationFrame(update12); 
        return;
    }
    if (!ctx12) {
        requestAnimationFrame(update12);
        return;
    }

    ctx12.clearRect(0, 0, canvas12.width, canvas12.height);
    const heatSlider = document.getElementById('heatSlider');
    const heat = heatSlider ? parseInt(heatSlider.value) : 0;

    // 绘制导带 (CB)
    const cbGrad = ctx12.createLinearGradient(0, 40, 0, 100);
    cbGrad.addColorStop(0, "rgba(88, 166, 255, 0.3)");
    cbGrad.addColorStop(1, "rgba(88, 166, 255, 0.05)");
    ctx12.fillStyle = cbGrad;
    ctx12.fillRect(50, 40, 300, 70);
    ctx12.fillStyle = "#58a6ff";
    ctx12.font = "bold 12px Arial";
    ctx12.fillText("CONDUCTION BAND (CB)", 60, 35);

    // 绘制价带 (VB)
    const vbY = 40 + 60 + gap;
    ctx12.fillStyle = "rgba(255, 255, 255, 0.1)";
    ctx12.fillRect(50, vbY, 300, 60);
    ctx12.fillStyle = "#8b949e";
    ctx12.fillText("VALENCE BAND (VB)", 60, vbY + 75);

    // 绘制禁带宽度 Eg
    if (gap > 0) {
        ctx12.strokeStyle = "#ff7b72";
        ctx12.setLineDash([5, 5]);
        ctx12.beginPath();
        ctx12.moveTo(360, 100);
        ctx12.lineTo(360, vbY);
        ctx12.stroke();
        ctx12.setLineDash([]);
        ctx12.fillStyle = "#ff7b72";
        ctx12.fillText(`Eg (${(gap / 40).toFixed(1)} eV)`, 315, 100 + gap / 2);
    }

    // VB 电子热振动与跃迁 (Lattice Points)
    for (let i = 0; i < 20; i++) {
        const baseX = 70 + i * 15;
        const baseY = vbY + 30;
        
        // Check if there is a hole here
        const hasHole = vbHoles.some(h => Math.abs(h.x - baseX) < 5);

        if (!hasHole) {
            // Draw Electron
            ctx12.fillStyle = "#8b949e";
            ctx12.beginPath();
            let eY = baseY + (Math.random() - 0.5) * (heat / 5); // Vibrate
            ctx12.arc(baseX, eY, 3, 0, Math.PI * 2);
            ctx12.fill();

            // 跃迁概率逻辑 (Jump Logic)
            if (heat > 10 && Math.random() < (heat * 0.002) / (gap / 40 + 1)) {
                if (cbElectrons.length < 40) {
                    cbElectrons.push({ x: baseX, y: eY, targetY: 50 + Math.random() * 40 });
                    vbHoles.push({ x: baseX, life: 100 }); // Create hole
                }
            }
        } else {
            // Draw Hole
            ctx12.strokeStyle = "#8b949e";
            ctx12.beginPath(); ctx12.arc(baseX, baseY, 3, 0, Math.PI*2); ctx12.stroke();
        }
    }

    // CB 电子移动动画
    cbElectrons.forEach((e, i) => {
        if (e.y > e.targetY) {
            e.y -= 3; // 向上跃迁过程
        } else {
            e.x += (Math.random() - 0.5) * 2; // 在导带内自由移动
        }
        
        // Recombination chance
        if (Math.random() < 0.01) {
            cbElectrons.splice(i, 1);
            if(vbHoles.length > 0) vbHoles.shift(); // Remove a hole
        }

        ctx12.fillStyle = "#00d4ff";
        ctx12.shadowBlur = 5; ctx12.shadowColor = "#00d4ff";
        ctx12.beginPath(); ctx12.arc(e.x, e.y, 4, 0, Math.PI * 2); ctx12.fill();
        ctx12.shadowBlur = 0;
    });

    const cbCountDisp = document.getElementById('cbCount');
    if (cbCountDisp) cbCountDisp.innerText = cbElectrons.length;

    requestAnimationFrame(update12);
}

// --- 1.3 实验逻辑 (掺杂) ---
let canvas13, ctx13;
let carriers = [];
let lattice = [];
let dopeType = 'n';

function changeDope() {
    const sel = document.getElementById('dopeSelect');
    if(sel) dopeType = sel.value;
    const carrierDisp = document.getElementById('carrierType');
    if (carrierDisp) carrierDisp.innerText = dopeType === 'n' ? 'Electrons (Negative)' : 'Holes (Positive)';
    initCarriers();
}

function initCarriers() {
    // Initialize Lattice Grid
    lattice = [];
    for(let r=0; r<5; r++) {
        for(let c=0; c<6; c++) {
            lattice.push({
                x: 50 + c * 60,
                y: 50 + r * 50,
                type: 'Si'
            });
        }
    }

    // Randomly replace with Dopants
    let dopantCount = 0;
    while(dopantCount < 4) {
        const idx = Math.floor(Math.random() * lattice.length);
        if(lattice[idx].type === 'Si') {
            lattice[idx].type = dopeType === 'n' ? 'P' : 'B';
            dopantCount++;
        }
    }

    // Initialize Mobile Carriers
    carriers = [];
    const count = dopeType === 'n' ? 20 : 20;
    for (let i = 0; i < count; i++) {
        carriers.push({
            x: Math.random() * 400,
            y: Math.random() * 300,
            vx: (Math.random() - 0.5) * 3,
            vy: (Math.random() - 0.5) * 3
        });
    }
}

function update13() {
    const section = document.getElementById('sec13');
    if (!section) return;

    if (!section || !section.classList.contains('active')) {
        requestAnimationFrame(update13); return;
    }
    if (!ctx13) {
        requestAnimationFrame(update13);
        return;
    }

    ctx13.clearRect(0, 0, canvas13.width, canvas13.height);

    // 1. Draw Lattice (Atoms)
    lattice.forEach(atom => {
        ctx13.beginPath();
        ctx13.arc(atom.x, atom.y, 12, 0, Math.PI*2);
        if (atom.type === 'Si') {
            ctx13.fillStyle = "#1e293b"; ctx13.strokeStyle = "#334155";
        } else if (atom.type === 'P') { // Donor (+)
            ctx13.fillStyle = "#0f172a"; ctx13.strokeStyle = "#3fb950"; // Green for Donor
            ctx13.fillText("+", atom.x-3, atom.y+3);
        } else { // Acceptor (-)
            ctx13.fillStyle = "#0f172a"; ctx13.strokeStyle = "#f85149"; // Red for Acceptor
            ctx13.fillText("-", atom.x-3, atom.y+3);
        }
        ctx13.fill(); ctx13.stroke();
    });

    // 2. Draw Mobile Carriers
    carriers.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > canvas13.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas13.height) p.vy *= -1;

        ctx13.beginPath();
        ctx13.arc(p.x, p.y, 4, 0, Math.PI * 2);
        if (dopeType === 'n') {
            ctx13.fillStyle = "#58a6ff"; // Electron (Blue)
            ctx13.fill();
        } else {
            ctx13.strokeStyle = "#ff7b72"; // Hole (Red Ring)
            ctx13.lineWidth = 2; ctx13.stroke();
        }
    });

    requestAnimationFrame(update13);
}

// --- 2.1 实验逻辑 (PN结与IV曲线) ---
let canvas21, ctx21, canvasIV, ctxIV;
let pnCarriers = []; // Unified carrier array

function update21() {
    const section = document.getElementById('sec21');
    if (!section) return;

    if (!section || !section.classList.contains('active')) {
        requestAnimationFrame(update21); return;
    }
    if (!ctx21 || !ctxIV) {
        requestAnimationFrame(update21);
        return;
    }

    const biasSlider = document.getElementById('biasSlider');
    const bias = biasSlider ? parseInt(biasSlider.value) : 0;
    const voltage = bias / 50;  // 映射范围: -2.0V 到 +2.0V
    const stateDisp = document.getElementById('junctionState');
    const voltDisp = document.getElementById('voltVal');
    if (voltDisp) voltDisp.innerText = voltage.toFixed(2) + "V";

    // --- 1. PN Junction Physical Simulation (Two-Carrier Model) ---
    ctx21.clearRect(0, 0, canvas21.width, canvas21.height);
    
    // Background Regions
    ctx21.fillStyle = "rgba(255, 123, 114, 0.1)"; ctx21.fillRect(0, 0, 200, 180); // P-Type (Left)
    ctx21.fillStyle = "rgba(88, 166, 255, 0.1)"; ctx21.fillRect(200, 0, 200, 180); // N-Type (Right)

    // Depletion Region Calculation
    let depletionW = 60; // Base width
    if (voltage > 0) depletionW = Math.max(5, 60 - voltage * 40); // Shrink
    else depletionW = Math.min(180, 60 + Math.abs(voltage) * 30); // Widen

    const depLeft = 200 - depletionW;
    const depRight = 200 + depletionW;

    // Draw Depletion Zone
    ctx21.fillStyle = "rgba(0, 0, 0, 0.3)";
    ctx21.fillRect(depLeft, 0, depletionW * 2, 180);
    ctx21.strokeStyle = "#fff"; ctx21.setLineDash([2,2]);
    ctx21.beginPath(); ctx21.moveTo(depLeft, 0); ctx21.lineTo(depLeft, 180); ctx21.stroke();
    ctx21.beginPath(); ctx21.moveTo(depRight, 0); ctx21.lineTo(depRight, 180); ctx21.stroke();
    ctx21.setLineDash([]);

    // Spawn Carriers
    if (pnCarriers.length < 50) {
        // Spawn Hole in P-side
        pnCarriers.push({ x: Math.random() * 100, y: Math.random() * 180, type: 'h', vx: 0 });
        // Spawn Electron in N-side
        pnCarriers.push({ x: 300 + Math.random() * 100, y: Math.random() * 180, type: 'e', vx: 0 });
    }

    // Move Carriers
    pnCarriers.forEach((p, i) => {
        // Drift logic based on bias
        if (voltage > 0.5) { // Forward Bias -> Move towards center
            p.vx = (p.type === 'h' ? 1 : -1) * (voltage * 2);
        } else if (voltage < 0) { // Reverse Bias -> Move away
            p.vx = (p.type === 'h' ? -1 : 1) * (Math.abs(voltage) + 0.5);
        } else {
            p.vx = (Math.random() - 0.5); // Random diffusion
        }

        p.x += p.vx;

        // Recombination Logic (Forward Bias)
        if (voltage > 0.5) {
            // If Hole crosses to N or Electron crosses to P
            if ((p.type === 'h' && p.x > 200) || (p.type === 'e' && p.x < 200)) {
                if (Math.random() < 0.1) pnCarriers.splice(i, 1); // Recombine/Disappear
            }
        }

        // Draw
        ctx21.beginPath(); ctx21.arc(p.x, p.y, 4, 0, Math.PI*2);
        ctx21.fillStyle = p.type === 'h' ? "#ff7b72" : "#58a6ff";
        ctx21.fill();
    });

    // --- 2. 彻底修复布局后的 I-V 曲线绘制 (下部分可视化) ---
    ctxIV.clearRect(0, 0, canvasIV.width, canvasIV.height);

    const originX = 180;  
    // 关键修正：将原点上移至 110 (原为130)，给底部标签留出更多像素空间
    const originY = 110;  
    const vScale = 60;    
    const iScale = 35;    

    // A. 绘制坐标轴线 (调整长度确保不溢出)
    ctxIV.strokeStyle = "#8b949e";
    ctxIV.lineWidth = 2;
    ctxIV.beginPath();
    ctxIV.moveTo(20, originY); ctxIV.lineTo(375, originY); // X轴
    ctxIV.moveTo(originX, 10); ctxIV.lineTo(originX, 160); // Y轴底部延伸至160
    ctxIV.stroke();

    // B. 绘制轴箭头
    ctxIV.fillStyle = "#8b949e";
    ctxIV.beginPath(); // X轴箭头
    ctxIV.moveTo(375, originY); ctxIV.lineTo(365, originY - 5); ctxIV.lineTo(365, originY + 5);
    ctxIV.fill();
    ctxIV.beginPath(); // Y轴箭头
    ctxIV.moveTo(originX, 10); ctxIV.lineTo(originX - 5, 20); ctxIV.lineTo(originX + 5, 20);
    ctxIV.fill();

    // C. 绘制轴 Symbol 和单位
    ctxIV.fillStyle = "#c9d1d9"; 
    ctxIV.font = "italic bold 13px Arial";
    // Y 轴标签
    ctxIV.fillText("I (mA)", originX + 15, 20); 
    // X 轴标签：originY(110) + 40 = 150，在 Canvas 180 的高度内非常安全
    ctxIV.fillText("V (Volts)", 310, originY + 40);

    // D. 绘制 0.7V 刻度线
    ctxIV.strokeStyle = "rgba(139, 148, 158, 0.5)";
    ctxIV.lineWidth = 1;
    ctxIV.beginPath();
    let thresholdX = originX + (0.7 * vScale);
    ctxIV.moveTo(thresholdX, originY - 5); ctxIV.lineTo(thresholdX, originY + 5);
    ctxIV.stroke();
    ctxIV.font = "10px Arial";
    ctxIV.fillStyle = "#8b949e";
    ctxIV.fillText("0.7V", thresholdX - 10, originY + 18);

    // E. 绘制静态参考曲线 (虚线延伸至 2.2V)
    ctxIV.setLineDash([3, 3]);
    ctxIV.strokeStyle = "rgba(255, 255, 255, 0.2)";
    ctxIV.beginPath();
    for (let v = -1.5; v <= 2.2; v += 0.1) {
        let px = originX + (v * vScale);
        let py = originY - (v > 0.6 ? Math.pow(v - 0.6, 2.2) * iScale : 0);

        // 边界检查，确保不画出画布范围
        if (px >= 20 && px <= 380 && py >= 10 && py <= 175) {
            if (v === -1.5) ctxIV.moveTo(px, py); else ctxIV.lineTo(px, py);
        }
    }
    ctxIV.stroke();
    ctxIV.setLineDash([]); 

    // F. 绘制动态工作点
    let dotX = originX + (voltage * vScale);
    let dotY = originY - (voltage > 0.6 ? Math.pow(voltage - 0.6, 2.2) * iScale : 0);

    // 限制点不超出绘图区底部
    dotY = Math.max(15, Math.min(170, dotY)); 

    ctxIV.fillStyle = "#f1e05a";
    ctxIV.beginPath(); ctxIV.arc(dotX, dotY, 6, 0, Math.PI * 2); ctxIV.fill();

    // 在点上方显示数值
    ctxIV.font = "bold 11px Consolas";
    ctxIV.fillStyle = "#f1e05a";
    ctxIV.fillText(`${voltage.toFixed(2)}V`, dotX + 8, dotY - 8);

    // 状态文字更新
    if (voltage > 0.6) {
        if(stateDisp) stateDisp.innerText = "Forward Bias (Conducting)";
        stateDisp.style.color = "#3fb950";
    } else {
        if(stateDisp) stateDisp.innerText = (voltage < 0) ? "Reverse Bias (Blocking)" : "Below Knee Voltage";
        stateDisp.style.color = "#8b949e";
    }

    requestAnimationFrame(update21);
}

// --- 2.2 实验逻辑 (Rectification) ---
let canvas22, ctx22;
let rectTime = 0;

function resetRectTime() { rectTime = 0; }

function update22() {
    // 检查当前是否在 2.2 页面
    const sec = document.getElementById('sec22');
    if (!sec) return;
    if (!sec.classList.contains('active')) {
        requestAnimationFrame(update22); return;
    }
    if (!ctx22) {
        requestAnimationFrame(update22);
        return;
    }

    ctx22.clearRect(0, 0, canvas22.width, canvas22.height);
    const mode = document.getElementById('rectMode').value;
    const status = document.getElementById('rectStatus');

    const centerY = 125;
    const amp = 70; // 波形振幅

    // A. 绘制背景网格
    ctx22.strokeStyle = "#161b22";
    ctx22.lineWidth = 1;
    ctx22.beginPath();
    for(let i=0; i<400; i+=40) { ctx22.moveTo(i, 0); ctx22.lineTo(i, 250); }
    for(let i=0; i<250; i+=40) { ctx22.moveTo(0, i); ctx22.lineTo(400, i); }
    ctx22.stroke();

    // B. 绘制坐标轴
    ctx22.strokeStyle = "#8b949e";
    ctx22.beginPath();
    ctx22.moveTo(20, centerY); ctx22.lineTo(380, centerY); // X轴
    ctx22.moveTo(40, 20); ctx22.lineTo(40, 230); // Y轴
    ctx22.stroke();

    // C. 绘制动态波形
    ctx22.beginPath();
    ctx22.lineWidth = 3;

    for (let x = 40; x < 380; x++) {
        let angle = (x + rectTime) * 0.05;
        let sineVal = Math.sin(angle) * amp;
        let yFinal = sineVal;

        if (mode === "half") {
            yFinal = sineVal > 0 ? sineVal : 0; // 负半周归零
            ctx22.strokeStyle = "#58a6ff";
            status.innerText = "Half-Wave: Negative cycles blocked";
            status.style.color = "#58a6ff";
        } else if (mode === "full") {
            yFinal = Math.abs(sineVal); // 负半周翻转
            ctx22.strokeStyle = "#3fb950";
            status.innerText = "Full-Wave: Negative cycles rectified";
            status.style.color = "#3fb950";
        } else {
            ctx22.strokeStyle = "#8b949e";
            status.innerText = "AC Input: Alternating direction";
            status.style.color = "#8b949e";
        }

        let drawY = centerY - yFinal;
        if (x === 40) ctx22.moveTo(x, drawY);
        else ctx22.lineTo(x, drawY);
    }
    ctx22.stroke();

    // D. 标注文字
    ctx22.fillStyle = "#8b949e";
    ctx22.font = "11px Arial";
    ctx22.fillText("Voltage (V)", 45, 30);
    ctx22.fillText("Time (t)", 340, centerY + 15);

    rectTime += 2; // 控制波形移动速度
    requestAnimationFrame(update22);
}

// --- 2.3 实验逻辑 (Smoothing/Filtering) ---
let canvas23, ctx23;
let filterTime = 0;

function update23() {
    const sec = document.getElementById('sec23');
    if (!sec) return;
    if (!sec.classList.contains('active')) {
        requestAnimationFrame(update23); return;
    }
    if (!ctx23) {
        requestAnimationFrame(update23);
        return;
    }

    ctx23.clearRect(0, 0, canvas23.width, canvas23.height);
    const capacitance = parseInt(document.getElementById('filterCap').value);
    const status = document.getElementById('filterStatus');

    // 坐标系参数
    const originX = 40;
    const originY = 115; 
    const amp = 80;

    // 1. 绘制背景网格
    ctx23.strokeStyle = "#161b22";
    ctx23.lineWidth = 1;
    ctx23.beginPath();
    for(let i=0; i<400; i+=40) { ctx23.moveTo(i,0); ctx23.lineTo(i,250); }
    for(let i=0; i<250; i+=40) { ctx23.moveTo(0,i); ctx23.lineTo(400,i); }
    ctx23.stroke();

    // 2. 绘制坐标轴 (含箭头)
    ctx23.strokeStyle = "#8b949e";
    ctx23.fillStyle = "#8b949e"; // 用于填充箭头颜色
    ctx23.lineWidth = 2;
    ctx23.beginPath();

    // --- X 轴 ---
    ctx23.moveTo(20, originY); 
    ctx23.lineTo(385, originY); // 轴线
    ctx23.stroke();
    // X 轴箭头
    ctx23.beginPath();
    ctx23.moveTo(385, originY);
    ctx23.lineTo(375, originY - 5);
    ctx23.lineTo(375, originY + 5);
    ctx23.fill();

    // --- Y 轴 ---
    ctx23.beginPath();
    ctx23.moveTo(originX, 170); 
    ctx23.lineTo(originX, 15); // 轴线
    ctx23.stroke();
    // Y 轴箭头
    ctx23.beginPath();
    ctx23.moveTo(originX, 15);
    ctx23.lineTo(originX - 5, 25);
    ctx23.lineTo(originX + 5, 25);
    ctx23.fill();

    // 3. 计算波形数据点
    let points = [];
    let lastY = 0;
    const dischargeRate = (105 - capacitance) * 0.005;

    for (let x = originX; x < 380; x++) {
        let angle = (x + filterTime) * 0.05;
        let rectY = Math.abs(Math.sin(angle) * amp);

        if (x === originX) {
            lastY = rectY;
        } else {
            if (rectY > lastY) {
                lastY = rectY; // 充电
            } else {
                lastY -= dischargeRate * (lastY / amp); // 放电
            }
        }
        points.push({x: x, y: originY - lastY});
    }

    // 4. 绘制阴影 (Shading)
    ctx23.fillStyle = "rgba(241, 224, 90, 0.15)"; 
    ctx23.beginPath();
    ctx23.moveTo(points[0].x, originY); 
    points.forEach(p => ctx23.lineTo(p.x, p.y));
    ctx23.lineTo(points[points.length - 1].x, originY); 
    ctx23.closePath();
    ctx23.fill();

    // 5. 绘制平滑后的金色波形实线
    ctx23.strokeStyle = "#f1e05a"; 
    ctx23.lineWidth = 3;
    ctx23.beginPath();
    ctx23.moveTo(points[0].x, points[0].y);
    points.forEach(p => ctx23.lineTo(p.x, p.y));
    ctx23.stroke();

    // 6. 标注文字
    ctx23.fillStyle = "#c9d1d9";
    ctx23.font = "italic bold 12px Arial";
    ctx23.fillText("Voltage (V)", 55, 25);
    ctx23.fillText("Time (t)", 340, originY + 30);

    // 更新状态颜色
    status.innerText = `Ripple Factor: ${capacitance > 80 ? 'Low' : capacitance > 30 ? 'Medium' : 'High'}`;
    status.style.color = capacitance > 80 ? "#3fb950" : (capacitance > 30 ? "#f1e05a" : "#f85149");

    filterTime += 2;
    requestAnimationFrame(update23);
}

// --- 3.1 实验逻辑 (晶体管结构与基本原理) ---
let canvas31, ctx31;
let electrons31 = [];

function resetTrans31() {
    electrons31 = [];
}

function drawTransistorSymbol(ctx, x, y, type) {
    ctx.strokeStyle = "#8b949e";
    ctx.lineWidth = 2;

    // 1. 绘制外圆
    ctx.beginPath();
    ctx.arc(x, y, 40, 0, Math.PI * 2);
    ctx.stroke();

    // 2. 绘制基极板 (Base Plate)
    ctx.beginPath();
    ctx.moveTo(x - 15, y - 20);
    ctx.lineTo(x - 15, y + 20);
    ctx.stroke();

    // 3. 绘制接线
    ctx.beginPath();
    ctx.moveTo(x - 40, y); ctx.lineTo(x - 15, y); // Base lead
    ctx.moveTo(x - 15, y - 10); ctx.lineTo(x + 25, y - 35); // Collector lead
    ctx.moveTo(x - 15, y + 10); ctx.lineTo(x + 25, y + 35); // Emitter lead
    ctx.stroke();

    // 4. 绘制箭头
    ctx.fillStyle = (type === 'npn') ? "#58a6ff" : "#ff7b72";
    if (type === 'npn') {
        // NPN: 箭头向外
        drawArrowhead(ctx, x + 10, y + 25, x + 25, y + 35);
    } else {
        // PNP: 箭头向内
        drawArrowhead(ctx, x + 25, y + 35, x + 5, y + 22);
    }

    // 5. 【新增】标注 E, B, C 字母
    ctx.font = "bold 14px Arial";

    // Base 标注
    ctx.fillStyle = "#ffffff";
    ctx.fillText("B", x - 55, y + 5);

    // Collector 标注
    ctx.fillStyle = "#8b949e";
    ctx.fillText("C", x + 30, y - 35);

    // Emitter 标注 (用颜色强调箭头所在的引脚)
    ctx.fillStyle = (type === 'npn') ? "#58a6ff" : "#ff7b72";
    ctx.fillText("E", x + 30, y + 45);
}

function drawArrowhead(ctx, fromx, fromy, tox, toy) {
    const headlen = 10;
    const angle = Math.atan2(toy - fromy, tox - fromx);
    ctx.beginPath();
    ctx.moveTo(tox, toy);
    ctx.lineTo(tox - headlen * Math.cos(angle - Math.PI / 6), toy - headlen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(tox - headlen * Math.cos(angle + Math.PI / 6), toy - headlen * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();
}

function update31() {
    const sec = document.getElementById('sec31');
    if (!sec) return;
    if (!sec.classList.contains('active')) {
        requestAnimationFrame(update31); return;
    }
    if (!ctx31) {
        requestAnimationFrame(update31);
        return;
    }

    ctx31.clearRect(0, 0, canvas31.width, canvas31.height);
    const ibFactor = parseInt(document.getElementById('baseSlider').value) / 100;
    const type = document.getElementById('transType').value;

    const currentIc = (ibFactor * 50).toFixed(1);
    const currentIb = (ibFactor * 100).toFixed(0);

    document.getElementById('ibVal').innerText = currentIb + " µA";
    document.getElementById('icVal').innerText = currentIc + " mA";
    document.getElementById('icVal').style.color = (type === 'npn') ? "#3fb950" : "#ff7b72";

    // 1. 绘制物理结构 (居中偏右)
    const startY = 60, h = 200, w = 100, structX = 230;

    // 绘制三层结构
    ctx31.fillStyle = (type === 'npn') ? "rgba(88, 166, 255, 0.2)" : "rgba(255, 123, 114, 0.2)"; // Collector
    ctx31.fillRect(structX, startY, w, 60);
    ctx31.fillStyle = (type === 'npn') ? "rgba(255, 123, 114, 0.3)" : "rgba(88, 166, 255, 0.3)"; // Base
    ctx31.fillRect(structX, startY + 60, w, 20);
    ctx31.fillStyle = (type === 'npn') ? "rgba(88, 166, 255, 0.2)" : "rgba(255, 123, 114, 0.2)"; // Emitter
    ctx31.fillRect(structX, startY + 80, w, 120);

    // 文字标签
    ctx31.fillStyle = "#8b949e";
    ctx31.font = "bold 12px Arial";
    ctx31.fillText(type === 'npn' ? "N (Collector)" : "P (Collector)", structX + 5, startY + 35);
    ctx31.fillText(type === 'npn' ? "P (Base)" : "N (Base)", structX + 5, startY + 74);
    ctx31.fillText(type === 'npn' ? "N (Emitter)" : "P (Emitter)", structX + 5, startY + 145);

    // 2. 绘制电路符号 (左侧)
    drawTransistorSymbol(ctx31, 100, 160, type);

    // 3. 模拟电荷流动
    if (ibFactor > 0.05) {
        if (Math.random() < ibFactor) {
            electrons31.push({
                x: structX + 20 + Math.random() * (w - 40),
                y: (type === 'npn') ? startY + 200 : startY, // NPN从下往上跑，PNP从上往下跑
                s: (1 + ibFactor * 4) * (type === 'npn' ? -1 : 1),
                color: (type === 'npn') ? "#58a6ff" : "#ff7b72"
            });
        }
    }

    electrons31.forEach((e, i) => {
        e.y += e.s;
        ctx31.fillStyle = e.color;
        ctx31.beginPath();
        ctx31.arc(e.x, e.y, 3, 0, Math.PI * 2);
        ctx31.fill();

        // 边界移除
        if (e.y < startY || e.y > startY + 200) electrons31.splice(i, 1);
    });

    requestAnimationFrame(update31);
}

// --- Module 3.2: Precision Automatic Switch Simulator (Final Adjusted Version) ---
let canvas32, ctx32;

function initSwitchLab() {
    const modeSelect = document.getElementById('sensorMode');
    if (!modeSelect) return;

    const mode = modeSelect.value;
    const label = document.getElementById('inputLabel');
    const low = document.getElementById('lowLabel');
    const high = document.getElementById('highLabel');

    if (mode === 'light') {
        if(label) label.innerText = "Ambient Light Level:";
        if(low) low.innerText = "Dark"; 
        if(high) high.innerText = "Bright";
    } else {
        if(label) label.innerText = "Temperature Level:";
        if(low) low.innerText = "Cold"; 
        if(high) high.innerText = "HOT (Fire)";
    }
}

function update32() {
    const sec32 = document.getElementById('sec32');
    if (!sec32) return;

    if (!sec32.classList.contains('active') || !ctx32) {
        requestAnimationFrame(update32);
        return;
    }

    // --- 1. 画布清理与圆角裁剪 (精确控制高度，不盖住字体) ---
    ctx32.clearRect(0, 0, 400, 320);
    ctx32.save(); 
    ctx32.beginPath();
    // 裁剪区域：x=5, y=10, 宽=390, 高=270, 圆角=12
    // 这样底部留出了空间给文本显示
    ctx32.roundRect(5, 10, 390, 240, 12); 
    ctx32.clip(); 

    const mode = document.getElementById('sensorMode').value;
    const slider = document.getElementById('switchSlider');
    const sliderVal = slider ? parseInt(slider.value) : 50;

    // 物理计算 (保持不动)
    const Vcc = 6.0;
    const R_fixed = 1000; 
    let R_sensor, Vb;

    if (mode === 'light') {
        R_sensor = Math.round(100 + Math.pow((100 - sliderVal), 2) * 0.6);
        Vb = (R_sensor / (R_fixed + R_sensor)) * Vcc;
    } else {
        R_sensor = Math.round(100 + Math.pow((100 - sliderVal), 2) * 0.8);
        Vb = (R_fixed / (R_sensor + R_fixed)) * Vcc;
    }
    const isON = Vb >= 0.7;

    // --- 2. 绘制环境色背景 ---
    if (mode === 'light') {
        const op = ((100 - sliderVal) / 100) * 0.7;
        ctx32.fillStyle = `rgba(20, 20, 60, ${op})`; 
    } else {
        const op = (sliderVal / 100) * 0.6;
        ctx32.fillStyle = `rgba(255, 50, 0, ${op})`;
    }
    // 填充整个区域，但会被 clip 限制在格子里
    ctx32.fillRect(0, 0, 400, 320);

    // --- 3. 紧凑型电路布局 (坐标保持不变) ---
    const leftX = 80;    
    const midX = 200;    
    const rightX = 320;  
    const topY = 40;     
    const botY = 240;    
    const nodeY = 140;   

    ctx32.strokeStyle = "#888"; 
    ctx32.lineWidth = 2;
    ctx32.beginPath();
    ctx32.moveTo(leftX, topY); ctx32.lineTo(rightX, topY); 
    ctx32.moveTo(leftX, botY); ctx32.lineTo(rightX, botY); 
    ctx32.moveTo(leftX, topY); ctx32.lineTo(leftX, botY);  
    ctx32.moveTo(rightX, topY); ctx32.lineTo(rightX, botY); 
    ctx32.stroke();

    ctx32.beginPath();
    ctx32.strokeStyle = isON ? "#58a6ff" : "#888"; 
    ctx32.moveTo(leftX, nodeY);
    ctx32.lineTo(midX - 22, nodeY); 
    ctx32.stroke();

    ctx32.beginPath();
    ctx32.strokeStyle = "#888";
    ctx32.moveTo(midX + 12, topY); ctx32.lineTo(midX + 12, nodeY - 15); 
    ctx32.moveTo(midX + 12, nodeY + 15); ctx32.lineTo(midX + 12, botY); 
    ctx32.stroke();

    if (mode === 'light') {
        drawResistor(ctx32, leftX, 65, "Fixed R");
        drawLDR(ctx32, leftX, 175, R_sensor);
    } else {
        drawThermistor(ctx32, leftX, 65, R_sensor);
        drawResistor(ctx32, leftX, 175, "Fixed R");
    }

    drawTransistorSymbol(ctx32, midX, nodeY, isON);

    if (mode === 'light') drawBulb(ctx32, rightX, 100, isON);
    else drawBuzzer(ctx32, rightX, 100, isON);

    // --- 4. 恢复画布状态 (重要：让下面的文字不受裁剪影响) ---
    ctx32.restore(); 

    // 6. 更新页面上的数字 (完全保持你的原始逻辑)
    const rLabel = document.getElementById('rSensVal');
    const vLabel = document.getElementById('vbVal');
    const sText = document.getElementById('switchStatusText');
    if(rLabel) rLabel.innerText = R_sensor + " Ω";
    if(vLabel) vLabel.innerText = Vb.toFixed(2) + " V";
    if(sText) {
        sText.innerText = isON ? (mode==='light'?"LAMP ON":"FIRE! ALARM ON") : "SYSTEM IDLE";
        sText.style.color = isON ? (mode==='light'?"#f1e05a":"#ff7b72") : "#8b949e";
    }

    requestAnimationFrame(update32);
}

// --- 辅助绘图函数 (完全保持你的原始版本) ---
function drawResistor(ctx, x, y, label) {
    ctx.fillStyle = "#161b22"; ctx.fillRect(x-10, y, 20, 35);
    ctx.strokeStyle = "#8b949e"; ctx.strokeRect(x-10, y, 20, 35);
    ctx.fillStyle = "#8b949e"; ctx.font = "10px Arial";
    ctx.fillText(label, x + 15, y + 20);
}
function drawLDR(ctx, x, y, res) {
    drawResistor(ctx, x, y, `LDR: ${res}Ω`);
    ctx.strokeStyle = "#f1e05a";
    ctx.beginPath(); ctx.arc(x, y+17, 13, 0, Math.PI*2); ctx.stroke();
    ctx.moveTo(x-20, y+5); ctx.lineTo(x-12, y+12); ctx.stroke();
}
function drawThermistor(ctx, x, y, res) {
    drawResistor(ctx, x, y, `TH: ${res}Ω`);
    ctx.strokeStyle = "#ff7b72";
    ctx.beginPath(); ctx.moveTo(x-12, y+30); ctx.lineTo(x+12, y+5); ctx.stroke();
}
function drawTransistorSymbol(ctx, x, y, active) {
    const col = active ? "#3fb950" : "#8b949e";
    ctx.strokeStyle = col;
    ctx.beginPath(); ctx.arc(x, y, 22, 0, Math.PI*2); ctx.stroke();
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(x-10, y-12); ctx.lineTo(x-10, y+12); ctx.stroke();
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x-10, y-5); ctx.lineTo(x+12, y-15);
    ctx.moveTo(x-10, y+5); ctx.lineTo(x+12, y+15);
    ctx.stroke();
}
function drawBulb(ctx, x, y, active) {
    if(active) {
        let g = ctx.createRadialGradient(x, y, 2, x, y, 20);
        g.addColorStop(0, "yellow"); g.addColorStop(1, "transparent");
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 20, 0, Math.PI*2); ctx.fill();
    }
    ctx.strokeStyle = active ? "yellow" : "#444";
    ctx.beginPath(); ctx.arc(x, y, 10, 0, Math.PI*2); ctx.stroke();
}
function drawBuzzer(ctx, x, y, active) {
    ctx.strokeStyle = active ? "#ff7b72" : "#444";
    ctx.strokeRect(x-12, y-8, 24, 16);
    if(active && Math.sin(Date.now()/50)>0) {
        ctx.beginPath(); ctx.moveTo(x+15, y-5); ctx.lineTo(x+25, y-12); ctx.stroke();
    }
}

// --- 3.3 实验逻辑 (Current Amplification) ---

// 初始化 3.3 实验
function initAmplifierLab() {
    const ibSlider = document.getElementById('ibSlider');
    const betaSlider = document.getElementById('betaSlider');

    if (ibSlider && betaSlider) {
        // 绑定事件监听器
        ibSlider.addEventListener('input', updateAmplifier);
        betaSlider.addEventListener('input', updateAmplifier);

        // 执行初始计算
        updateAmplifier();
    }
}

function updateAmplifier() {
    const Ib_uA = parseFloat(document.getElementById('ibSlider').value);
    const beta = parseFloat(document.getElementById('betaSlider').value);

    // 1. 基础计算
    const Ib_mA = Ib_uA / 1000;
    let Ic_mA = beta * Ib_mA;

    // 2. 设定饱和电流 (Saturation Limit) 
    // 在实际电路中，Ic 不能无限大，受限于 Vcc 和负载电阻
    const maxIc = 25.0; 
    let currentRegion = "";
    let statusColor = "";
    let bgColor = "";

    // 3. 判断工作区域 (Operating Regions)
    if (Ib_uA === 0) {
        // --- Cut-off Region ---
        Ic_mA = 0;
        currentRegion = "CUT-OFF REGION (Switch OFF)";
        statusColor = "#8b949e"; // 灰色
        bgColor = "rgba(139, 148, 158, 0.1)";
    } else if (Ic_mA >= maxIc) {
        // --- Saturation Region ---
        Ic_mA = maxIc; // 电流封顶
        currentRegion = "SATURATION REGION (Fully ON)";
        statusColor = "#f1e05a"; // 黄色
        bgColor = "rgba(241, 224, 90, 0.1)";
    } else {
        // --- Active Region ---
        currentRegion = "ACTIVE REGION (Amplifying)";
        statusColor = "#58a6ff"; // 蓝色
        bgColor = "rgba(88, 166, 255, 0.1)";
    }

    const Ie_mA = Ib_mA + Ic_mA;

    // 4. 更新 UI 文字
    document.getElementById('ibDisp').innerText = Ib_uA;
    document.getElementById('betaDisp').innerText = beta;
    document.getElementById('icVal').innerText = Ic_mA.toFixed(2) + " mA";
    document.getElementById('ieVal').innerText = Ie_mA.toFixed(2) + " mA";

    // 5. 更新状态框样式
    const statusBox = document.getElementById('regionStatus');
    if (statusBox) {
        statusBox.innerText = currentRegion;
        statusBox.style.color = statusColor;
        statusBox.style.backgroundColor = bgColor;
        statusBox.style.border = `1px solid ${statusColor}`;
    }

    // 6. 更新视觉能量柱
    const visual = document.getElementById('amplifierVisual');
    if (visual) {
        const heightPx = 20 + (Ic_mA / maxIc) * 200;
        visual.style.height = heightPx + "px";
        visual.style.backgroundColor = statusColor; // 颜色随状态改变
        visual.style.boxShadow = `0 0 15px ${statusColor}`;
    }
}

// --- 4.1 Op-Amp 实验逻辑 ---

function initOpAmpLab() {
    const vinSlider = document.getElementById('opampVinSlider');
    if (vinSlider) {
        vinSlider.addEventListener('input', updateOpAmpLab);
        updateOpAmpLab(); 
    }
}

function updateOpAmpLab() {
    const vin = parseFloat(document.getElementById('opampVinSlider').value);
    const canvas = document.getElementById('opampCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    document.getElementById('vinDisp').innerText = vin.toFixed(1);
    document.getElementById('voutVal').innerText = vin.toFixed(2) + " V";

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const x = canvas.width / 2 - 20;
    const y = canvas.height / 2;

    // 绘制三角形
    ctx.strokeStyle = "#c9d1d9";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x - 40, y - 60);
    ctx.lineTo(x - 40, y + 60);
    ctx.lineTo(x + 60, y);
    ctx.closePath();
    ctx.stroke();

    // 符号
    ctx.font = "bold 24px Arial";
    ctx.fillStyle = "#da3633"; ctx.fillText("+", x - 35, y + 40);
    ctx.fillStyle = "#58a6ff"; ctx.fillText("-", x - 35, y - 25);

    // 连线
    ctx.strokeStyle = "#8b949e";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - 120, y + 35); ctx.lineTo(x - 40, y + 35);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x + 60, y); ctx.lineTo(x + 130, y);
    ctx.stroke();

    // 反馈线
    ctx.beginPath();
    ctx.moveTo(x + 90, y);
    ctx.lineTo(x + 90, y - 90);
    ctx.lineTo(x - 60, y - 90);
    ctx.lineTo(x - 60, y - 35);
    ctx.lineTo(x - 40, y - 35);
    ctx.stroke();

    // 标注
    ctx.font = "italic 14px 'Times New Roman'";
    ctx.fillStyle = "#58a6ff";
    ctx.fillText("V_in: " + vin.toFixed(1) + "V", x - 130, y + 55);
    ctx.fillStyle = "#3fb950";
    ctx.fillText("V_out: " + vin.toFixed(1) + "V", x + 100, y - 10);
}

// --- 4.2 优化版逻辑 ---

function init42Lab() {
    // 确保初次加载时正确渲染
    if (document.getElementById('canvas42')) {
        update42Lab();
    }
}

/* Module 4.2 Lab Logic*/

function update42Lab() {
    const canvas = document.getElementById('canvas42');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const mode = document.getElementById('opampMode').value;
    const rf = parseFloat(document.getElementById('rfSlider').value);
    const rin = parseFloat(document.getElementById('rinSlider').value);
    const vin_amp = parseFloat(document.getElementById('vin42Slider').value);
    const resControls = document.getElementById('resistorControls');

    // 更新 UI 文字
    document.getElementById('rfDisp').innerText = rf;
    document.getElementById('rinDisp').innerText = rin;
    document.getElementById('vin42Disp').innerText = vin_amp.toFixed(1);

    let vout_amp = 0;
    let gainStr = "";
    const Vsat = 12;

    if (mode === 'inverting') {
        resControls.style.opacity = '1';
        const gain = -(rf / rin);
        vout_amp = vin_amp * gain;
        gainStr = gain.toFixed(1) + "x";
    } else if (mode === 'noninverting') {
        resControls.style.opacity = '1';
        const gain = 1 + (rf / rin);
        vout_amp = vin_amp * gain;
        gainStr = gain.toFixed(1) + "x";
    } else {
        resControls.style.opacity = '0.2';
        vout_amp = 15; // 饱和模拟
        gainStr = "Open-Loop";
    }

    document.getElementById('gainVal').innerText = gainStr;
    document.getElementById('vout42Val').innerText = Math.min(Math.abs(vout_amp), Vsat).toFixed(1) + " V";

    // --- 绘图执行 ---
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 绘制电路 (上半部)
    drawOpAmpBox(ctx, 200, 80, mode);

    // 绘制波形 (下半部)
    drawWaveBox(ctx, 50, 250, vin_amp, vout_amp, mode);
}

function drawOpAmpBox(ctx, x, y, mode) {
    ctx.strokeStyle = "#c9d1d9";
    ctx.lineWidth = 2;
    // 三角形
    ctx.beginPath();
    ctx.moveTo(x-30, y-40); ctx.lineTo(x-30, y+40); ctx.lineTo(x+40, y);
    ctx.closePath(); ctx.stroke();

    // 符号
    ctx.font = "bold 18px Arial";
    if (mode === 'inverting') {
        ctx.fillStyle = "#58a6ff"; ctx.fillText("-", x-25, y-15);
        ctx.fillStyle = "#da3633"; ctx.fillText("+", x-25, y+28);
    } else {
        ctx.fillStyle = "#da3633"; ctx.fillText("+", x-25, y-15);
        ctx.fillStyle = "#58a6ff"; ctx.fillText("-", x-25, y+28);
    }

    // 绘制简化的导线
    ctx.strokeStyle = "#444";
    ctx.beginPath();
    ctx.moveTo(x+40, y); ctx.lineTo(x+90, y); // Vout line
    ctx.moveTo(x-30, mode==='inverting'?y-20:y+20); ctx.lineTo(x-80, mode==='inverting'?y-20:y+20); // Vin line
    ctx.stroke();

    ctx.fillStyle = "#8b949e";
    ctx.font = "10px Arial";
    ctx.fillText("SCHEMATIC VIEW", 10, 20);
}

function drawWaveBox(ctx, x, y, vin, vout, mode) {
    const w = 300, h = 100;
    ctx.fillStyle = "#000";
    ctx.fillRect(x, y - h/2, w, h);
    ctx.strokeStyle = "#333";
    ctx.strokeRect(x, y - h/2, w, h);

    // 零位线
    ctx.setLineDash([2, 2]);
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x+w, y); ctx.stroke();
    ctx.setLineDash([]);

    // 绘图
    ctx.lineWidth = 2;
    const timeScale = 0.05, voltScale = 5;

    // Vin Wave (Yellow)
    ctx.strokeStyle = "#f1e05a";
    ctx.beginPath();
    for(let t=0; t<w; t++) {
        const val = Math.sin(t * timeScale) * vin * voltScale;
        t === 0 ? ctx.moveTo(x+t, y-val) : ctx.lineTo(x+t, y-val);
    }
    ctx.stroke();

    // Vout Wave (Blue)
    ctx.strokeStyle = "#58a6ff";
    ctx.beginPath();
    for(let t=0; t<w; t++) {
        let val;
        if(mode === 'comparator') {
            val = Math.sin(t * timeScale) > 0 ? 45 : -45;
        } else {
            val = Math.sin(t * timeScale) * vout * voltScale;
            if(val > 48) val = 48; if(val < -48) val = -48;
        }
        t === 0 ? ctx.moveTo(x+t, y-val) : ctx.lineTo(x+t, y-val);
    }
    ctx.stroke();

    ctx.fillStyle = "#8b949e";
    ctx.fillText("WAVEFORM MONITOR", x-40, y-60);
}

//---5.1 Logic Gate Simulator---
// 全局变量记录输入状态
let state51A = 0;
let state51B = 0;

function toggleInput51(label) {
    if (label === 'A') {
        state51A = state51A === 0 ? 1 : 0;
        document.getElementById('btnInA').innerText = `Input A: ${state51A}`;
        document.getElementById('btnInA').classList.toggle('active', state51A === 1);
    } else {
        state51B = state51B === 0 ? 1 : 0;
        document.getElementById('btnInB').innerText = `Input B: ${state51B}`;
        document.getElementById('btnInB').classList.toggle('active', state51B === 1);
    }
    update51Lab();
}

function update51Lab() {
    const canvas = document.getElementById('canvas51');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const type = document.getElementById('gateType').value;
    const outSpan = document.getElementById('logicOut');

    // UI 处理
    document.getElementById('btnInB').style.display = (type === 'NOT') ? 'none' : 'block';

    let res = 0;
    switch(type) {
        case 'AND': res = state51A & state51B; break;
        case 'OR':  res = state51A | state51B; break;
        case 'NOT': res = state51A ? 0 : 1; break;
        case 'NAND': res = !(state51A & state51B) ? 1 : 0; break;
        case 'NOR':  res = !(state51A | state51B) ? 1 : 0; break;
        case 'XOR':  res = state51A ^ state51B; break;
        case 'XNOR': res = state51A === state51B ? 1 : 0; break;
    }

    outSpan.innerText = res;
    outSpan.style.color = res ? "#58a6ff" : "#3fb950";

    // --- 绘图开始 ---
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const x = 200, y = 120;
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // 1. 计算输入连线的终点 (为了无缝连接)
    let inputEndPointX = x - 40; 
    if (type === 'OR' || type === 'NOR') inputEndPointX = x - 30; // OR门输入端是弯曲的，线要长一点
    if (type === 'XOR' || type === 'XNOR') inputEndPointX = x - 42; // XOR门有双弧线，线要长一点

    // 绘制连线 A
    ctx.strokeStyle = state51A ? "#58a6ff" : "#30363d";
    ctx.beginPath(); ctx.moveTo(x-120, y-25); ctx.lineTo(inputEndPointX, y-25); ctx.stroke();

    // 绘制连线 B
    if(type !== 'NOT') {
        ctx.strokeStyle = state51B ? "#58a6ff" : "#30363d";
        ctx.beginPath(); ctx.moveTo(x-120, y+25); ctx.lineTo(inputEndPointX, y+25); ctx.stroke();
    }

    // 2. 绘制 Gate 形状
    ctx.strokeStyle = "#c9d1d9";
    ctx.fillStyle = "#161b22";
    ctx.beginPath();

    if (type === 'AND' || type === 'NAND') {
        ctx.moveTo(x-40, y-40); ctx.lineTo(x, y-40);
        ctx.arc(x, y, 40, -Math.PI/2, Math.PI/2);
        ctx.lineTo(x-40, y+40); ctx.closePath();
    } 
    else if (type === 'OR' || type === 'NOR' || type === 'XOR' || type === 'XNOR') {
        // 主体弧形
        ctx.moveTo(x-40, y-40);
        ctx.quadraticCurveTo(x-15, y, x-40, y+40); // 输入端弧线
        ctx.quadraticCurveTo(x+20, y+40, x+50, y); // 下方弧线
        ctx.quadraticCurveTo(x+20, y-40, x-40, y-40); // 上方弧线

        if (type === 'XOR' || type === 'XNOR') {
            ctx.stroke(); // 先画主体
            // 绘制 XOR 特有的外侧弧线
            ctx.beginPath();
            ctx.moveTo(x-50, y-40);
            ctx.quadraticCurveTo(x-25, y, x-50, y+40);
        }
    } 
    else if (type === 'NOT') {
        ctx.moveTo(x-40, y-35); ctx.lineTo(x+15, y); ctx.lineTo(x-40, y+35); ctx.closePath();
    }
    ctx.fill(); ctx.stroke();

    // 3. 绘制 Bubble (反相圆圈)
    let outputLineStartX = x + 50; // 默认输出起始位置
    if (['NAND', 'NOR', 'NOT', 'XNOR'].includes(type)) {
        ctx.beginPath();
        let circleX = (type === 'NOT') ? x+21 : (type === 'NAND' ? x+46 : x+56);
        ctx.arc(circleX, y, 6, 0, Math.PI*2);
        ctx.fillStyle = "#161b22"; ctx.fill(); ctx.stroke();
        outputLineStartX = circleX + 6; // 线从圆圈边缘开始
    } else {
        if (type === 'AND') outputLineStartX = x + 40;
    }

    // 绘制输出连线
    ctx.strokeStyle = res ? "#58a6ff" : "#30363d";
    ctx.beginPath(); ctx.moveTo(outputLineStartX, y); ctx.lineTo(x+120, y); ctx.stroke();

    // 4. 文字标注
    ctx.fillStyle = "#8b949e";
    ctx.font = "bold 13px Arial";
    ctx.textAlign = "center";
    ctx.fillText(type + " GATE", x, y + 65);
}

// --- 5.2 Logic Gate Simulator 状态变量 ---
let sA = 0;
let sB = 0;
let currentScenario = 'fire';

function initScenario() {
    const select = document.getElementById('scenarioSelect');
    if (!select) return;
    currentScenario = select.value;

    const btnA = document.getElementById('alarmA');
    const btnB = document.getElementById('alarmB');
    const expr = document.getElementById('logicExpression');

    // 重置输入状态（切换场景时建议重置，避免混乱）
    sA = 0; sB = 0;
    btnA.classList.remove('active');
    btnB.classList.remove('active');

    if (currentScenario === 'fire') {
        btnA.innerText = "Heat Sensor (A)"; 
        btnB.innerText = "Smoke Sensor (B)";
        expr.innerText = "Expression: Y = A · B (AND)";
    } else if (currentScenario === 'vault') {
        btnA.innerText = "Manager Key (A)"; 
        btnB.innerText = "Lockout Switch (B)";
        expr.innerText = "Expression: Y = A · NOT B";
    } else {
        btnA.innerText = "Stop Button 1 (A)"; 
        btnB.innerText = "Stop Button 2 (B)";
        expr.innerText = "Expression: Y = A + B (OR)";
    }
    update52Lab();
}

function toggleAlarmInput(type) {
    if (type === 'A') {
        sA = sA === 0 ? 1 : 0;
        document.getElementById('alarmA').classList.toggle('active', sA === 1);
    } else {
        sB = sB === 0 ? 1 : 0;
        document.getElementById('alarmB').classList.toggle('active', sB === 1);
    }
    update52Lab();
}

function update52Lab() {
    let result = 0;
    const statusText = document.getElementById('alarmStatusText');
    const light = document.getElementById('alarmLight');

    // 逻辑运算核心
    if (currentScenario === 'fire') {
        result = sA && sB; // AND
        statusText.innerText = result ? "!!! FIRE ALARM !!!" : "SYSTEM STANDBY";
        light.style.background = result ? "#da3633" : "#222";
    } else if (currentScenario === 'vault') {
        result = sA && !sB; // AND-NOT
        statusText.innerText = result ? "ACCESS GRANTED" : "VAULT LOCKED";
        light.style.background = result ? "#58a6ff" : "#222";
    } else {
        result = sA || sB; // OR
        statusText.innerText = result ? "EMERGENCY STOP" : "MACHINE RUNNING";
        light.style.background = result ? "#d299ff" : "#238636";
    }

    // 灯光特效
    if (result) {
        const color = currentScenario === 'cutter' ? "#d299ff" : (currentScenario === 'vault' ? "#58a6ff" : "#da3633");
        light.style.boxShadow = `0 0 30px ${color}, inset 0 0 10px white`;
    } else {
        light.style.boxShadow = "inset 0 0 10px rgba(0,0,0,0.5)";
    }

    draw52LogicCanvas(result);
}

function draw52LogicCanvas(out) {
    const canvas = document.getElementById('canvas52');
    if(!canvas) return;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const midX = canvas.width / 2;
    const midY = canvas.height / 2;
    ctx.lineWidth = 3;
    ctx.lineCap = "round";

    // 1. 颜色定义
    const colorA = sA ? "#58a6ff" : "#30363d";
    const colorB = sB ? "#58a6ff" : "#30363d";
    const colorB_inverted = !sB ? "#58a6ff" : "#30363d"; // NOT 门后的颜色
    const colorOut = out ? "#3fb950" : "#30363d";

    // --- 绘制输入 A ---
    ctx.strokeStyle = colorA;
    ctx.beginPath(); ctx.moveTo(40, midY - 40); ctx.lineTo(midX - 50, midY - 40); ctx.stroke();

    // --- 绘制输入 B (含 NOT 门处理) ---
    if (currentScenario === 'vault') {
        // 输入 B 到 NOT 门前
        ctx.strokeStyle = colorB;
        ctx.beginPath(); ctx.moveTo(40, midY + 40); ctx.lineTo(midX - 110, midY + 40); ctx.stroke();

        // 绘制完整的 NOT 门三角形
        ctx.strokeStyle = "#c9d1d9";
        ctx.fillStyle = "#161b22";
        ctx.beginPath();
        ctx.moveTo(midX - 110, midY + 25);
        ctx.lineTo(midX - 110, midY + 55);
        ctx.lineTo(midX - 85, midY + 40);
        ctx.closePath();
        ctx.fill(); ctx.stroke();

        // NOT 门的 Bubble
        ctx.beginPath(); ctx.arc(midX - 79, midY + 40, 6, 0, Math.PI*2);
        ctx.fill(); ctx.stroke();

        // NOT 门后到 AND 门前
        ctx.strokeStyle = colorB_inverted;
        ctx.beginPath(); ctx.moveTo(midX - 73, midY + 40); ctx.lineTo(midX - 50, midY + 40); ctx.stroke();
    } else {
        // 普通模式直接连接
        ctx.strokeStyle = colorB;
        ctx.beginPath(); ctx.moveTo(40, midY + 40); ctx.lineTo(midX - 50, midY + 40); ctx.stroke();
    }

    // --- 绘制主逻辑门 (AND 或 OR) ---
    ctx.strokeStyle = "#c9d1d9";
    ctx.fillStyle = "#161b22";
    ctx.beginPath();
    if (currentScenario === 'fire' || currentScenario === 'vault') {
        // AND Gate
        ctx.moveTo(midX - 50, midY - 60);
        ctx.lineTo(midX, midY - 60);
        ctx.arc(midX, midY, 60, -Math.PI/2, Math.PI/2);
        ctx.lineTo(midX - 50, midY + 60);
        ctx.closePath();
    } else {
        // OR Gate
        ctx.moveTo(midX - 60, midY - 60);
        ctx.quadraticCurveTo(midX - 30, midY, midX - 60, midY + 60);
        ctx.quadraticCurveTo(midX + 10, midY + 60, midX + 60, midY);
        ctx.quadraticCurveTo(midX + 10, midY - 60, midX - 60, midY - 60);
    }
    ctx.fill(); ctx.stroke();

    // --- 绘制输出线 ---
    ctx.strokeStyle = colorOut;
    const outStartX = (currentScenario === 'cutter') ? midX + 60 : midX + 60;
    ctx.beginPath(); ctx.moveTo(outStartX, midY); ctx.lineTo(canvas.width - 40, midY); ctx.stroke();

    // --- 文字标注 ---
    ctx.fillStyle = "#8b949e";
    ctx.font = "11px monospace";
    ctx.textAlign = "center";
    ctx.fillText("A", 70, midY - 55);
    ctx.fillText("B", 70, midY + 55);
    // 新增：在输出线末端上方绘制 Y
    ctx.fillText("Y", canvas.width - 55, midY - 15);

    // 增加一个额外的 NOT 标注
    if (currentScenario === 'vault') {
        ctx.fillStyle = "#f1e05a";
        ctx.fillText("NOT", midX - 95, midY + 70);
    }

    ctx.fillStyle = "#f1e05a";
    ctx.font = "bold 14px Arial";
    let label = (currentScenario === 'fire' || currentScenario === 'vault') ? "AND" : "OR";
    ctx.fillText(label, midX - 5, midY + 5);
}

// --- 6.1 CRO Lab Logic ---
let croSignal61 = { amplitude: 4, frequency: 125 };

function update61() {
    const canvas = document.getElementById('canvas61');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const vDiv = parseFloat(document.getElementById('vDiv61').value);
    const tDiv = parseFloat(document.getElementById('tDiv61').value);

    const w = canvas.width;
    const h = canvas.height;
    const divSize = 40; 

    // 1. 清屏
    ctx.fillStyle = "#041204";
    ctx.fillRect(0, 0, w, h);

    // 2. 绘制网格
    ctx.strokeStyle = "#1a3a1a";
    ctx.lineWidth = 1;
    for (let x = 0; x <= w; x += divSize) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let y = 0; y <= h; y += divSize) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }

    // 3. 绘制中心轴箭头
    ctx.strokeStyle = "#4d8a4d";
    ctx.fillStyle = "#4d8a4d";
    ctx.lineWidth = 2;
    // Y轴箭头
    drawArrow(ctx, w/2, h - 10, w/2, 15); 
    // X轴箭头
    drawArrow(ctx, 10, h/2, w - 15, h/2);

    // 文本标注
    ctx.font = "bold 11px Arial";
    ctx.fillText("Voltage (V)", w/2 + 10, 25);
    ctx.fillText("Time (ms)", w - 65, h/2 - 12);

    // 4. 0.2 div 细分刻度
    ctx.lineWidth = 1;
    for (let i = 0; i <= w; i += divSize/5) {
        ctx.beginPath(); ctx.moveTo(i, h/2-4); ctx.lineTo(i, h/2+4); ctx.stroke();
    }
    for (let i = 0; i <= h; i += divSize/5) {
        ctx.beginPath(); ctx.moveTo(w/2-4, i); ctx.lineTo(w/2+4, i); ctx.stroke();
    }

    // 5. 绘制波形
    ctx.strokeStyle = "#00ff00";
    ctx.lineWidth = 2.5;
    ctx.shadowBlur = 10;
    ctx.shadowColor = "#00ff00";
    ctx.beginPath();

    for (let x = 0; x < w; x++) {
        let t = (x / divSize) * (tDiv / 1000);
        let volt = croSignal61.amplitude * Math.sin(2 * Math.PI * croSignal61.frequency * t);
        let yPx = (h / 2) - (volt / vDiv) * divSize;
        if (x === 0) ctx.moveTo(x, yPx);
        else ctx.lineTo(x, yPx);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;
}

// 箭头绘制函数
function drawArrow(ctx, fromx, fromy, tox, toy) {
    const headlen = 8;
    const angle = Math.atan2(toy - fromy, tox - fromx);
    ctx.beginPath();
    ctx.moveTo(fromx, fromy);
    ctx.lineTo(tox, toy);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(tox, toy);
    ctx.lineTo(tox - headlen * Math.cos(angle - Math.PI / 6), toy - headlen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(tox - headlen * Math.cos(angle + Math.PI / 6), toy - headlen * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();
}

// --- 6.2 Circuit Debugging 完美接线版逻辑 ---
function update62() {
    const canvas = document.getElementById('canvas62');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const scenario = document.getElementById('debugScenario').value;
    const meterDisplay = document.getElementById('meterDisplay');

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // 基础样式
    ctx.strokeStyle = "#c9d1d9";
    ctx.lineWidth = 2;
    ctx.lineCap = "square"; // 使用方头确保连接处无缝隙

    // 1. 绘制电池 (DC Source) - 位于 (55, 100) 中心
    ctx.beginPath();
    ctx.moveTo(45, 100); ctx.lineTo(65, 100); // 电池主体长线 (+)
    ctx.moveTo(50, 110); ctx.lineTo(60, 110); // 电池主体短线 (-)
    ctx.stroke();

    // 标注正负极
    ctx.fillStyle = "#8b949e";
    ctx.font = "bold 14px Arial";
    ctx.fillText("+", 70, 95);
    ctx.fillText("-", 70, 120);

    // 2. 绘制【上半部分】导线 (从正极 60,100 出发)
    ctx.beginPath();
    ctx.strokeStyle = "#c9d1d9";
    ctx.moveTo(55, 100);   // 正极接点
    ctx.lineTo(55, 50);    // 向上
    ctx.lineTo(130, 50);   // 向右连向电阻
    ctx.stroke();

    // --- 绘制电阻 (130,50 到 180,50) ---
    const isBurned = (scenario === 'resistor');
    if (isBurned) {
        ctx.fillStyle = "#30363d";
        ctx.fillRect(130, 45, 15, 10); 
        ctx.fillRect(165, 45, 15, 10);
        ctx.fillStyle = "#da3633";
        ctx.font = "10px Arial";
        ctx.fillText("OPEN", 143, 42);
    } else {
        ctx.fillStyle = "#d29922";
        ctx.fillRect(130, 45, 50, 10);
        // 补全电阻内部连线
        ctx.beginPath();
        ctx.moveTo(130, 50); ctx.lineTo(180, 50);
        ctx.stroke();
    }

    // --- 继续连线 (从电阻到二极管) ---
    ctx.beginPath();
    ctx.moveTo(180, 50);
    ctx.lineTo(260, 50);
    ctx.stroke();

    // --- 绘制二极管 (260,50 到 310,50) ---
    const isBackward = (scenario === 'diode');
    drawPreciseDiode(ctx, 285, 50, isBackward);

    // 3. 绘制【下半部分】导线 (从二极管 310,50 回到负极)
    ctx.beginPath();
    ctx.moveTo(310, 50);
    ctx.lineTo(350, 50);   // 向右到边缘
    ctx.lineTo(350, 150);  // 向下

    if (scenario !== 'ground') {
        ctx.lineTo(55, 150);   // 向左回到电池下方
        ctx.lineTo(55, 110);   // 向上精准对接电池负极短线
    } else {
        // 浮地：线在 200 处断开
        ctx.lineTo(200, 150);
        ctx.strokeStyle = "#da3633";
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(200, 150, 3, 0, Math.PI * 2);
        ctx.fillStyle = "#da3633";
        ctx.fill();
        ctx.fillText("✕ GND BROKEN", 70, 170);
    }
    ctx.stroke();

    // 4. 测量探针虚线
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = "#58a6ff";
    ctx.beginPath();
    ctx.moveTo(260, 50); ctx.lineTo(260, 25); ctx.lineTo(310, 25); ctx.lineTo(310, 50);
    ctx.stroke();
    ctx.setLineDash([]); // 还原实线

    // 5. 更新读数
    updateMeterValues(scenario, meterDisplay);
}

// 极其精准的二极管绘制，带左右触点
function drawPreciseDiode(ctx, x, y, backward) {
    ctx.save();
    ctx.translate(x, y);
    if (backward) ctx.rotate(Math.PI);

    // 绘制引脚线确保接通
    ctx.strokeStyle = "#c9d1d9";
    ctx.beginPath();
    ctx.moveTo(-25, 0); ctx.lineTo(25, 0);
    ctx.stroke();

    // 绘制三角形
    ctx.beginPath();
    ctx.moveTo(-12, -10); ctx.lineTo(-12, 10); ctx.lineTo(12, 0); ctx.closePath();
    ctx.fillStyle = "#58a6ff";
    ctx.fill();

    // 绘制阴极线
    ctx.beginPath();
    ctx.moveTo(12, -10); ctx.lineTo(12, 10);
    ctx.stroke();

    ctx.restore();
}

function updateMeterValues(s, display) {
    const data = {
        'normal': { v: "0.72 V", c: "#3fb950" },
        'diode': { v: "9.00 V", c: "#da3633" },
        'resistor': { v: "0.00 V", c: "#da3633" },
        'ground': { v: "OL.V", c: "#f1e05a" }
    };
    display.innerText = data[s].v;
    display.style.color = data[s].c;
}

// --- 初始化启动 ---
function initAllLabs() {
    // Safely get all canvases and contexts after DOM is loaded
    canvas11 = document.getElementById('mainCanvas');
    if (canvas11) { ctx11 = canvas11.getContext('2d'); canvas11.width = 400; canvas11.height = 300; }

    canvas12 = document.getElementById('bandCanvas');
    if (canvas12) { ctx12 = canvas12.getContext('2d'); canvas12.width = 400; canvas12.height = 300; }

    canvas13 = document.getElementById('dopeCanvas');
    if (canvas13) { ctx13 = canvas13.getContext('2d'); canvas13.width = 400; canvas13.height = 300; }

    canvas21 = document.getElementById('junctionCanvas');
    if (canvas21) { ctx21 = canvas21.getContext('2d'); canvas21.width = 400; canvas21.height = 180; }

    canvasIV = document.getElementById('ivCurveCanvas');
    if (canvasIV) { ctxIV = canvasIV.getContext('2d'); canvasIV.width = 400; canvasIV.height = 200; }

    canvas22 = document.getElementById('rectCanvas');
    if (canvas22) { ctx22 = canvas22.getContext('2d'); canvas22.width = 400; canvas22.height = 250; }

    canvas23 = document.getElementById('filterCanvas');
    if (canvas23) { ctx23 = canvas23.getContext('2d'); canvas23.width = 400; canvas23.height = 250; }

    canvas31 = document.getElementById('transistorCanvas');
    if (canvas31) { ctx31 = canvas31.getContext('2d'); canvas31.width = 400; canvas31.height = 300; }

    canvas32 = document.getElementById('switchCanvas');
    if (canvas32) { ctx32 = canvas32.getContext('2d'); canvas32.width = 400; canvas32.height = 320; }

    // Initialize event-driven labs
    initAmplifierLab();
    initOpAmpLab();
    init42Lab();
    initScenario();

    // Initialize CRO and Debugging labs that are also event-driven on change
    update61();
    update62();
    
    initCarriers();
    update11();
    update12();
    update13();
    update21();
    update22();
    update23();
    update31();
    initSwitchLab();
    update32();

    // 默认激活第一个标签的样式
    // Only activate default if no other tab is currently active
    if (!document.querySelector('.nav-item.active')) {
        const nav11 = document.getElementById('nav11');
        if(nav11) nav11.classList.add('active');
    }
}
window.initAllLabs = initAllLabs; // Expose to window for React to call

// Robust initialization for SPA/Next.js environments
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    initAllLabs();
} else {
    window.addEventListener('DOMContentLoaded', initAllLabs);
}