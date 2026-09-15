let familyData = null;

/* =========================
   LOAD DATABASE
========================= */
async function loadFamily() {
    try {
        const response = await fetch("family.json");
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

    children.forEach((person, index) => {
        const photo = person.photo
            ? `<img class="child-photo" src="${person.photo}" alt="${person.name}">`
            : `<div class="child-photo placeholder">👤</div>`;

        container.innerHTML += `
            <div class="child-card" onclick="openModal(${index})">
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

/* =========================
   MODAL DETAIL KELUARGA
========================= */
function openModal(index) {
    const children = familyData.people.filter(person => person.generation === 2);
    const person = children[index];
    const modalBody = document.getElementById("modal-body");

    // Render Pasangan
    const spouseName = person.spouse ? person.spouse.name : "Belum Ada Data";
    const spousePhoto = person.spouse && person.spouse.photo 
        ? `<img src="${person.spouse.photo}" class="couple-photo" alt="${spouseName}">` 
        : `<div class="couple-photo placeholder">👤</div>`;
    
    const mainPhoto = person.photo 
        ? `<img src="${person.photo}" class="couple-photo" alt="${person.name}">` 
        : `<div class="couple-photo placeholder">👤</div>`;

    // Render Anak-anak & Cucu
    let childrenHTML = "";
    if (person.children && person.children.length > 0) {
        childrenHTML = person.children.map(child => {
            const childPhoto = child.photo 
                ? `<img src="${child.photo}" class="child-tree-photo" alt="${child.name}">` 
                : `<div class="child-tree-photo placeholder" style="font-size:20px;">👤</div>`;

            let spouseText = child.spouse ? ` ❤️ ${child.spouse.name}` : "";

            // Render Cucu
            let grandchildrenHTML = "";
            if (child.grandchildren && child.grandchildren.length > 0) {
                const gcBadges = child.grandchildren.map(gc => {
                    const gcPhoto = gc.photo 
                        ? `<img src="${gc.photo}" class="grandchild-photo" alt="${gc.name}">` 
                        : `👤`;
                    return `<div class="grandchild-badge">${gcPhoto} <span>${gc.name}</span></div>`;
                }).join("");

                grandchildrenHTML = `
                    <div class="grandchildren-list">
                        <span style="font-size: 12px; color: var(--muted); align-self: center;">Cucu:</span>
                        ${gcBadges}
                    </div>
                `;
            }

            return `
                <div class="child-tree-card">
                    <div class="child-info">
                        ${childPhoto}
                        <div>
                            <strong>${child.name}</strong>${spouseText}
                        </div>
                    </div>
                    ${grandchildrenHTML}
                </div>
            `;
        }).join("");
    } else {
        childrenHTML = "<p style='color: var(--muted);'>Belum ada data anak/cucu.</p>";
    }

    // Render Isi Modal
    modalBody.innerHTML = `
        <div class="modal-header">
            <h2>Keluarga ${person.name}</h2>
            ${person.familyPhoto ? `<img src="${person.familyPhoto}" class="modal-family-photo" alt="Foto Keluarga">` : ''}
        </div>

        <div class="couple-container">
            <div class="couple-person">
                ${mainPhoto}
                <div><strong>${person.name}</strong></div>
            </div>
            <div class="heart-icon">❤️</div>
            <div class="couple-person">
                ${spousePhoto}
                <div><strong>${spouseName}</strong></div>
            </div>
        </div>

        <div class="modal-section-title">Anak & Cucu</div>
        <div class="children-tree">
            ${childrenHTML}
        </div>
    `;

    document.getElementById("family-modal").style.display = "block";
}

function closeModal() {
    document.getElementById("family-modal").style.display = "none";
}

// Tutup modal jika klik di luar box
window.onclick = function(event) {
    const modal = document.getElementById("family-modal");
    if (event.target === modal) {
        modal.style.display = "none";
    }
};

/* =========================
   START
========================= */
loadFamily();
