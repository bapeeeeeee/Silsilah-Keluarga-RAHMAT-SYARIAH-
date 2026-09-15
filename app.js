let familyData = null;

/* =========================
   LOAD DATABASE
========================= */
async function loadFamily() {
    try {
        const response = await fetch("data/family.json");
        if (!response.ok) {
            throw new Error("Database tidak ditemukan");
        }
        familyData = await response.json();
        renderFamily();
    } catch (error) {
        console.error(error);
        document.getElementById("grandparents").innerHTML = `
            <p>Database belum bisa dibaca.</p>
        `;
    }
}

/* =========================
   TAMPILKAN KELUARGA
========================= */
function renderFamily() {
    const people = familyData.people;

    // Generasi 1: Kakek & Nenek
    const grandparents = people.filter(person => person.generation === 1);
    
    // Generasi 2: Anak-anak
    const children = people.filter(person => person.generation === 2);

    renderGrandparents(grandparents);
    renderChildren(children);

    document.getElementById("child-count").textContent = `${children.length} Anak`;
}

/* =========================
   KAKEK & NENEK
========================= */
function renderGrandparents(grandparents) {
    const container = document.getElementById("grandparents");
    container.innerHTML = "";

    grandparents.forEach(person => {
        container.innerHTML += createPersonCard(person);
    });
}

/* =========================
   ANAK-ANAK
========================= */
function renderChildren(children) {
    const container = document.getElementById("children");
    container.innerHTML = "";

    children.forEach(person => {
        const photo = person.photo
            ? `<img class="child-photo" src="${person.photo}" alt="${person.name}">`
            : `<div class="child-photo placeholder">👤</div>`;

        container.innerHTML += `
            <div class="child-card">
                ${photo}
                <h3 class="person-name">${person.name || "Nama Anak"}</h3>
            </div>
        `;
    });
}

/* =========================
   CARD KAKEK/NENEK
========================= */
function createPersonCard(person) {
    const photo = person.photo
        ? `<img class="photo" src="${person.photo}" alt="${person.name}">`
        : `<div class="photo placeholder">👤</div>`;

    return `
        <div class="person-card">
            ${photo}
            <h3 class="person-name">${person.name || "Nama Belum Diisi"}</h3>
        </div>
    `;
}

loadFamily();
