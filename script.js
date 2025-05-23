const symbols = ["🍒","🍇","🔔", "🍉", "7️⃣"];
const reels = [document.getElementById("reel1"), document.getElementById("reel2"), document.getElementById("reel3")];
let isSpinning = false;
let credits = parseInt(localStorage.getItem("credits"), 10); if (isNaN(credits)) {credits = 100;}
let dept = parseInt(localStorage.getItem("dept"), 10);if (isNaN(dept)) {dept = 0;}
let odd = 0;
let isDevMode = false;

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("credits").textContent = credits.toFixed(2);
    document.getElementById("debt").textContent = dept.toFixed(2);
});

Object.defineProperty(window, "odd", { // window.odd = value;
    set(value) {
        if (value >= 0 && value <= 1) {
            odd = value;
            console.log(`Odd value set to ${odd}`);
        } else {
            console.error("Invalid odd value. It must be between 0 and 1.");
        }
    },
    get() {
        return odd;
    }
});

function findMoney(value) {
    credits += value;
    localStorage.setItem("credits", credits); 
    document.getElementById("credits").textContent = credits.toFixed(2); 
}

function takeLoan() {
    if (credits > 99) {
        alert("You can only take a loan when you have less than 100 credits!");
        return;
    }

    dept += 100;
    credits += 100;

    localStorage.setItem("dept", dept);
    localStorage.setItem("credits", credits);

    document.getElementById("credits").textContent = credits.toFixed(2);
    document.getElementById("debt").textContent = dept.toFixed(2);
}

function payLoan() {
    const paymentAmount = parseFloat(document.getElementById("payment-amount").value);
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
        alert("Invalid payment amount!");
        return;
    }

    if (paymentAmount > credits) {
        alert("You don't have enough credits to make this payment!");
        return;
    }

    if (paymentAmount > dept) {
        alert("You are trying to pay more than your debt!");
        return;
    }

    credits -= paymentAmount;
    dept -= paymentAmount;

    localStorage.setItem("dept", dept);
    localStorage.setItem("credits", credits);

    document.getElementById("credits").textContent = credits.toFixed(2);
    document.getElementById("debt").textContent = dept.toFixed(2);

    alert(`You successfully paid $${paymentAmount.toFixed(2)} towards your loan.`);
}

function payLoanAutomatically(winnings) {
    if (dept > 0) {
        const payment = Math.min(winnings * 0.5, dept);
        dept -= payment;
        winnings -= payment;

        localStorage.setItem("dept", dept);

        document.getElementById("debt").textContent = dept.toFixed(2);
    }

    return winnings; 
}

let baseFontSize = 16; 

const savedFontSize = localStorage.getItem("fontSize");
if (savedFontSize) {
    document.body.style.fontSize = savedFontSize + "px";
    baseFontSize = parseInt(savedFontSize, 10);
}

function adjustFontSize(value) {
    const newSize = baseFontSize + parseInt(value, 10);
    document.body.style.fontSize = newSize + "px";
    localStorage.setItem("fontSize", newSize);
    baseFontSize = newSize;
}

function resetFontSize() {
    const defaultFontSize = 16; 
    document.body.style.fontSize = defaultFontSize + "px";
    localStorage.setItem("fontSize", defaultFontSize);
    baseFontSize = defaultFontSize;

    document.getElementById("font-size").value = 0;
}

function updateCreditsDisplay() {
    const decimalPlaces = parseInt(document.getElementById("decimal").value, 0);
    localStorage.setItem("decimalPlaces", decimalPlaces);
    const formattedCredits = credits.toFixed(decimalPlaces);
    document.getElementById("credits").textContent = formattedCredits;
}

function updateCredits(amount) {
    credits += amount;
    credits = parseFloat(credits.toFixed(2)); 
    localStorage.setItem("credits", credits.toFixed(2)); 
    const decimalPlaces = parseInt(localStorage.getItem("decimalPlaces"), 10) || 2;
    document.getElementById("credits").textContent = credits.toFixed(decimalPlaces);
}

document.addEventListener("DOMContentLoaded", () => {
    const savedCredits = localStorage.getItem("credits");
    if (savedCredits !== null) {
        credits = parseFloat(savedCredits);
    }

    updateCreditsDisplay();
});

function fillSymbols(reelDiv) {
    const symbolsDiv = reelDiv.querySelector(".symbols");
    symbolsDiv.innerHTML = "";
    
    for (let i = 0; i < 4; i++) {
        const randSymbol = symbols[Math.floor(Math.random() * symbols.length)];
        const el = document.createElement("div");
        el.textContent = randSymbol;
        el.style.height = "80px";
        symbolsDiv.appendChild(el);
    }
}

function startSpin() {
    if (isSpinning) return;
    const betAmount = parseInt(document.getElementById("bet").value, 10);
    if (betAmount > credits || betAmount <= 0) {
        alert("Invalid bet amount!");
        return;
    }

    isSpinning = true;
    updateCredits(-betAmount);

    const results = [];
    reels.forEach((reel, i) => {
        const symbolsDiv = reel.querySelector(".symbols");
        symbolsDiv.style.animation = "spin 0.3s linear infinite";
        fillSymbols(reel);

        setTimeout(() => {
            symbolsDiv.style.animation = "none";
            let finalSymbol = "";
            if (odd === 0) {
                finalSymbol = symbols[Math.floor(Math.random() * symbols.length)];
            } else if (odd > 0 && odd < 1) {
                if (i === 0) {
                    const randomIndex = Math.floor(Math.random() * 10) < odd * 10 ? symbols.indexOf("7️⃣") : Math.floor(Math.random() * symbols.length);
                    finalSymbol = symbols[randomIndex];
                } else {
                    finalSymbol = results[0] === "7️⃣" ? "7️⃣" : symbols[Math.floor(Math.random() * symbols.length)];
                }
            } else if (odd === 1) {
                finalSymbol = "7️⃣";
            }
            symbolsDiv.innerHTML = `<div style="height:80px">${finalSymbol}</div>`;
            results[i] = finalSymbol;

            if (i === reels.length - 1) {
                calculateWinnings(results, betAmount);
                isSpinning = false;
            }
        }, 1000 + i * 500);
    });
}

function calculateWinnings(results, betAmount) {
    const [r1, r2, r3] = results;
    let multiplier = 0;

    if (r1 === r2 && r2 === r3) {
        if (r1 === "🍒") multiplier = 10;
        else if (r1 === "🍇") multiplier = 10;
        else if (r1 === "🍉") multiplier = 10;
        else if (r1 === "🔔") multiplier = 25;
        else if (r1 === "7️⃣") multiplier = 100;
    }else {
      if  (["🍒", "🍇", "🍉"].includes(r1)) {
            if  (["🍒", "🍇", "🍉"].includes(r2)) {
                if  (["🍒", "🍇", "🍉"].includes(r3)) {
                    multiplier = 1.5;
                }
            }
        }
    }

    let winnings = betAmount * multiplier;

    winnings = payLoanAutomatically(winnings);

    updateCredits(winnings);
    document.getElementById("win").textContent = "x" + multiplier;
}

function toggleSidebar() {
    document.querySelector(".sidebar").classList.toggle("collapsed");
}

function saveCurrentSection(section) {
    localStorage.setItem("currentSection", section);
}

function loadLastSection() {
    const lastSection = localStorage.getItem("currentSection");
    if (lastSection) {
        if (lastSection === "slot") showSlotGame();
        else if (lastSection === "chicken") showChickenGame();
        else if (lastSection === "help") showHelp();
        else if (lastSection === "settings") showSettings();
        else if (lastSection === "home") showHome();
        else if (lastSection === "loan") showLoan();
        else if (lastSection === "update") showUpdate();
        else if (lastSection === "help") showHelp();
        else showHome();
    } else {
        showHome();
    }
}

function showSlotGame() {
    saveCurrentSection("slot");
    document.getElementById("games-section").style.display = "none";
    document.getElementById("slot-section").style.display = "block";
    document.getElementById("help-section").style.display = "none";
    document.getElementById("chicken-section").style.display = "none";
    document.getElementById("settings-section").style.display = "none";
    document.getElementById("loan-section").style.display = "none";
    document.getElementById("update-section").style.display = "none";
}

function showChickenGame() {
    saveCurrentSection("chicken");
    document.getElementById("games-section").style.display = "none";
    document.getElementById("slot-section").style.display = "none";
    document.getElementById("help-section").style.display = "none";
    document.getElementById("chicken-section").style.display = "block";
    document.getElementById("settings-section").style.display = "none";
    document.getElementById("loan-section").style.display = "none";
    document.getElementById("update-section").style.display = "none";
}

function showHome() {
    saveCurrentSection("home");
    document.getElementById("games-section").style.display = "block";
    document.getElementById("slot-section").style.display = "none";
    document.getElementById("help-section").style.display = "none";
    document.getElementById("chicken-section").style.display = "none";
    document.getElementById("settings-section").style.display = "none";
    document.getElementById("loan-section").style.display = "none";
    document.getElementById("update-section").style.display = "none";
}

function showHelp() {
    saveCurrentSection("help");
    document.getElementById("games-section").style.display = "none";
    document.getElementById("slot-section").style.display = "none";
    document.getElementById("help-section").style.display = "block";
    document.getElementById("chicken-section").style.display = "none";
    document.getElementById("settings-section").style.display = "none";
    document.getElementById("loan-section").style.display = "none";
    document.getElementById("update-section").style.display = "none";
}

function showSettings() {
    saveCurrentSection("settings");
    document.getElementById("games-section").style.display = "none";
    document.getElementById("slot-section").style.display = "none";
    document.getElementById("help-section").style.display = "none";
    document.getElementById("chicken-section").style.display = "none";
    document.getElementById("settings-section").style.display = "block";
    document.getElementById("loan-section").style.display = "none";
    document.getElementById("update-section").style.display = "none";
}

function showLoan() {
    saveCurrentSection("loan");
    document.getElementById("games-section").style.display = "none";
    document.getElementById("slot-section").style.display = "none";
    document.getElementById("help-section").style.display = "none";
    document.getElementById("chicken-section").style.display = "none";
    document.getElementById("settings-section").style.display = "none";
    document.getElementById("loan-section").style.display = "block";
    document.getElementById("update-section").style.display = "none";
}

function showUpdate() {
    saveCurrentSection("update");
    document.getElementById("games-section").style.display = "none";
    document.getElementById("slot-section").style.display = "none";
    document.getElementById("help-section").style.display = "none";
    document.getElementById("chicken-section").style.display = "none";
    document.getElementById("settings-section").style.display = "none";
    document.getElementById("loan-section").style.display = "none"
    document.getElementById("update-section").style.display = "block";
}

document.addEventListener("DOMContentLoaded", loadLastSection);

const road = document.getElementById("road");
const line = document.getElementById("line");
const betInput = document.getElementById("bet-input");
const playButton = document.getElementById("play-button");
const cashoutButton = document.getElementById("cashout-button");
const goButton = document.getElementById("go-button");
const inGameButtons = document.getElementById("in-game-buttons");
const message = document.getElementById("message");

let chicken = document.createElement("div");
chicken.classList.add("chicken");
road.appendChild(chicken);

let stepIndex = -1;
let currentMultiplier = 1.00;
let bet = 0;
let playing = false;
let difficulty = "easy";
const multipliersByDiff = {
    easy: 0.06,
    medium: 0.12,
    hard: 0.2,
    hardcore: 0.35
};

let deathStep = -1;

let multipliers = [];

document.getElementById('min-bet-button').addEventListener('click', () => {
    document.getElementById('bet-input').value = 0.01;
});

document.getElementById('max-bet-button').addEventListener('click', () => {
    const credits = parseFloat(document.getElementById('credits').textContent) || 0;
    document.getElementById('bet-input').value = credits.toFixed(2);
});

function generateSteps(count = 10) {
    road.innerHTML = "";
    multipliers = [];
    for (let i = 0; i < count; i++) {
        const step = document.createElement("div");
        step.classList.add("step");

        let baseMultiplier = 1.1; 
        let growthFactor = multipliersByDiff[difficulty];
        let multi = (baseMultiplier * Math.pow(1 + growthFactor, i)).toFixed(2);
        multipliers.push(parseFloat(multi));

        step.innerHTML = `
        <div class="multiplier">${multi}x</div>
        <div class="potential">$0.00</div>
        `;
        road.appendChild(step);

        const line = document.createElement("div");
        line.classList.add("line");
        road.appendChild(line);

        if (i === 0) {
            const startLine = document.createElement("div");
            startLine.classList.add("line");
            road.insertBefore(startLine, road.firstChild);
        }
    }
    road.appendChild(chicken);
}

function adjustRoadVisibility() {
    const roadWidth = road.offsetWidth;
    const windowWidth = window.innerWidth;

    if (roadWidth > windowWidth) {
        road.style.maxWidth = `${windowWidth}px`;
        road.style.overflowX = "hidden";
    } else {
        road.style.maxWidth = "100%";
        road.style.overflowX = "visible";
    }
}

function updateChickenPosition() {
    const steps = document.querySelectorAll(".step");
    const roadWidth = road.offsetWidth;
    const windowWidth = window.innerWidth;

    if (stepIndex === -1) {

        chicken.style.left = `${Math.min(-80, -roadWidth / 10)}px`;
    } else if (stepIndex >= steps.length) {
        
        chicken.style.left = `${Math.min(roadWidth - chicken.offsetWidth, windowWidth - chicken.offsetWidth - 20)}px`;

    } else {
        const step = steps[stepIndex];
        const offsetLeft = step.offsetLeft + step.offsetWidth / 2 - chicken.offsetWidth / 2;
        chicken.style.left = `${Math.min(offsetLeft, roadWidth - chicken.offsetWidth)}px`;

    }
}

window.addEventListener("resize", () => {
    adjustRoadVisibility();
});

document.addEventListener("DOMContentLoaded", () => {
    adjustRoadVisibility();
    loadLastSection();
});

function updatePotentials() {
    const steps = document.querySelectorAll(".step");
    steps.forEach((step, i) => {
        const multi = multipliers[i];
        const pot = (multi * bet).toFixed(2);
        step.querySelector(".potential").innerText = `$${pot}`;
    });
}

function startGame() {
    bet = parseFloat(betInput.value);
    if (isNaN(bet) || bet <= 0 || bet > credits) {
        alert("Invalid bet amount or insufficient credits!");
        return;
    }

    updateCredits(-bet);

    document.querySelectorAll(".difficulty").forEach(btn => btn.classList.remove("selected"));
    document.querySelector(`.difficulty[data-diff="${difficulty}"]`).classList.add("selected");

    document.querySelectorAll(".difficulty").forEach(btn => btn.setAttribute("disabled", "true"));

    playButton.style.display = "none";
    inGameButtons.style.display = "flex";
    stepIndex = -1; 
    playing = true;
    generateSteps();
    updatePotentials();
    message.innerText = "";

    setDefaultChickenPosition(); 
}

function stepForward() {
    if (!playing || stepIndex >= multipliers.length) return;

    if (stepIndex === -1) {
        setDefaultChickenPosition();
        stepIndex = 0;
    } else {
        stepIndex++;
    }

    if (stepIndex >= multipliers.length) {
        if (stepIndex > 0 && stepIndex <= multipliers.length) {
            const winnings = (bet * multipliers[stepIndex - 1]).toFixed(2);
            message.innerText = `🏁 You safely crossed the road and won $${winnings}!`;
            document.querySelectorAll(".difficulty").forEach(btn => btn.removeAttribute("disabled"));
        }
        cashOut();
        return;
    }

    if (Math.random() < multipliersByDiff[difficulty]) {
        triggerCrash();
        return;
    }

    if (stepIndex >= 0 && stepIndex < multipliers.length) {
        const barrier = document.createElement("div");
        barrier.classList.add("barrier");
        document.querySelectorAll(".step")[stepIndex].appendChild(barrier);
    }

    updateChickenPosition();
}

function triggerCrash() {
    if (stepIndex >= 0 && stepIndex < multipliers.length) {

        const step = document.querySelectorAll(".step")[stepIndex];
        const offsetLeft = step.offsetLeft + step.offsetWidth / 2 - chicken.offsetWidth / 2;
        chicken.style.left = `${offsetLeft}px`;
        chicken.style.bottom = "20px"; 
    }

    playing = false;

    const car = document.createElement("div");
    car.classList.add("car");
    road.appendChild(car);
    car.style.left = chicken.style.left;

    setTimeout(() => {
        car.style.top = "30px";
    }, 50);

    setTimeout(() => {
        message.innerText = `💥 You lost $${bet.toFixed(2)}. The chicken got hit!`;
        inGameButtons.style.display = "none";
        playButton.style.display = "inline-block";

        document.querySelectorAll(".difficulty").forEach(btn => btn.removeAttribute("disabled"));

        stepIndex = -1;
        resetCHickenPosition();
        
        car.remove();
    }, 1000);
}

function setDefaultChickenPosition() {
    const roadHeight = road.offsetHeight;
    const chickenHeight = chicken.offsetHeight;
    chicken.style.left = "-80px"; 
    chicken.style.bottom = `${(roadHeight - chickenHeight) / 2 + 40}px`;
}

document.addEventListener("DOMContentLoaded", () => {
    setDefaultChickenPosition();
    adjustRoadVisibility();
    loadLastSection();
});

function cashOut() {
    if (!playing) return;

    let winnings = 0;
    if (stepIndex < 0) {
        winnings = bet; 
        message.innerText = `💰 You cashed out without taking any steps. Your bet of $${winnings.toFixed(2)} has been refunded!`;
    } else if (stepIndex > 0 && stepIndex <= multipliers.length) {
        winnings = (bet * multipliers[stepIndex - 1]).toFixed(2);
        message.innerText = `💰 You cashed out with $${winnings}!`;
    } else {
        winnings = (bet * multipliers[stepIndex - 1]).toFixed(2);
        message.innerText = `🏁 You safely reached the sideline and won $${winnings}!`;
    }

    document.querySelectorAll(".difficulty").forEach(btn => btn.removeAttribute("disabled"));

    winnings = payLoanAutomatically(parseFloat(winnings) || 0);

    updateCredits(winnings); 

    inGameButtons.style.display = "none";
    playButton.style.display = "inline-block";
    stepIndex = -1;
    playing = false;
    resetCHickenPosition();
}

betInput.addEventListener("input", () => {
    bet = parseFloat(betInput.value);
    updatePotentials();
});
betInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        bet = parseFloat(betInput.value);
        updatePotentials();
    }
});

playButton.onclick = startGame;
goButton.onclick = stepForward;
cashoutButton.onclick = cashOut;

document.querySelectorAll(".difficulty").forEach(button => {
    button.onclick = () => {
        difficulty = button.dataset.diff;
        document.querySelectorAll(".difficulty").forEach(btn => btn.classList.remove("selected"));
        button.classList.add("selected");
        generateSteps();
        updatePotentials();
    };
});

document.addEventListener("DOMContentLoaded", () => {
    loadLastSection();

    document.querySelectorAll(".difficulty").forEach(btn => btn.classList.remove("selected"));
    document.querySelector(`.difficulty[data-diff="${difficulty}"]`).classList.add("selected");
});



generateSteps();

