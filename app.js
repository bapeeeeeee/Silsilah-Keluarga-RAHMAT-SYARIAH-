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
        
        renderStats();
        renderFamily();
    } catch (error) {
        console.error(error);
        document.getElementById("grandparents").innerHTML = `
            <p>Database belum bisa dibaca atau ada kesalahan format JSON.</p>
        `;
    }
}

/* =========================
   HITUNG & RENDER STATISTIK
========================= */
function renderStats() {
    const people = familyData.people;

    let gen1 = 0;
    let gen2 = 0;
    let gen3 = 0;
    let gen4 = 0;
    let inlaws = 0; // Menantu

    people.forEach(person => {
        // Gen 1 (Kakek & Nenek)
        if (person.generation === 1) {
            gen1++;
        }

        // Gen 2 (Anak)
        if (person.generation === 2) {
            gen2++;
            // Menantu Gen 2
            if (person.spouse && person.spouse.name) {
                inlaws++;
            }

            // Gen 3 (Cucu)
            if (person.children && person.children.length > 0) {
                person.children.forEach(child => {
                    gen3++;
                    // Menantu Gen 3
                    if (child.spouse && child.spouse.name) {
                        inlaws++;
                    }

                    // Gen 4 (Cicit)
                    if (child.grandchildren && child.grandchildren.length > 0) {
                        gen4 += child.grandchildren.length;
                    }
                });
            }
        }
    });

    const totalAll = gen1 + gen2 + gen3 + gen4 + inlaws;

    // Tampilkan di UI
    document.getElementById("total-members").textContent = totalAll;
    document.getElementById("count-gen1").textContent = gen1;
    document.getElementById("count-gen2").textContent = gen2;
    document.getElementById("count-gen3").textContent = gen3;
    document.getElementById("count-gen4").textContent = gen4;
    document.getElementById("count-inlaws").textContent = inlaws;
}

/* =========================
   TAMPILKAN KELUARGA
========================= */
function renderFamily() {
    const people = familyData.people;

    const grandparents = people.filter(person => person.generation === 1);
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
        const photo = (person.photo && person.photo !== "" && person.photo !== "-")
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

function createPersonCard(person) {
    const photo = (person.photo && person.photo !== "" && person.photo !== "-")
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

    const spouseName = (person.spouse && person.spouse.name) ? person.spouse.name : "Belum Ada Data";
    
    const spousePhoto = (person.spouse && person.spouse.photo && person.spouse.photo !== "" && person.spouse.photo !== "-") 
        ? `<img src="${person.spouse.photo}" class="couple-photo" alt="${spouseName}">` 
        : `<div class="couple-photo placeholder">👤</div>`;
    
    const mainPhoto = (person.photo && person.photo !== "" && person.photo !== "-") 
        ? `<img src="${person.photo}" class="couple-photo" alt="${person.name}">` 
        : `<div class="couple-photo placeholder">👤</div>`;

    let childrenHTML = "";
    if (person.children && person.children.length > 0) {
        childrenHTML = person.children.map(child => {
            const childPhoto = (child.photo && child.photo !== "" && child.photo !== "-") 
                ? `<img src="${child.photo}" class="child-tree-photo" alt="${child.name}">` 
                : `<div class="child-tree-photo placeholder" style="font-size:20px;">👤</div>`;

            let spouseText = (child.spouse && child.spouse.name) ? ` ❤️ <strong>${child.spouse.name}</strong>` : "";

            let grandchildrenHTML = "";
            if (child.grandchildren && child.grandchildren.length > 0) {
                const gcBadges = child.grandchildren.map(gc => {
                    const gcPhoto = (gc.photo && gc.photo !== "" && gc.photo !== "-") 
                        ? `<img src="${gc.photo}" class="grandchild-photo" alt="${gc.name}">` 
                        : `👤`;
                    return `<div class="grandchild-badge">${gcPhoto} <span>${gc.name}</span></div>`;
                }).join("");

                grandchildrenHTML = `
                    <div class="grandchildren-list">
                        <span style="font-size: 12px; color: var(--muted); align-self: center;">Cicit:</span>
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

    const familyPhotoHTML = (person.familyPhoto && person.familyPhoto !== "" && person.familyPhoto !== "-")
        ? `<img src="${person.familyPhoto}" class="modal-family-photo" alt="Foto Keluarga">`
        : '';

    modalBody.innerHTML = `
        <div class="modal-header">
            <h2>Keluarga ${person.name}</h2>
            ${familyPhotoHTML}
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

        <div class="modal-section-title">Anak (Cucu) & Cicit</div>
        <div class="children-tree">
            ${childrenHTML}
        </div>
    `;

    document.getElementById("family-modal").style.display = "block";
}

function closeModal() {
    document.getElementById("family-modal").style.display = "none";
}

window.onclick = function(event) {
    const modal = document.getElementById("family-modal");
    if (event.target === modal) {
        modal.style.display = "none";
    }
};

loadFamily();
