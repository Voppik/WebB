// ---------- KONFIGURACE SUPABASE ----------
const SUPABASE_URL = 'https://empyrofcsvuvcitjljiz.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtcHlyb2Zjc3Z1dmNpdGpsaml6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3NDQ1MjksImV4cCI6MjA4NTMyMDUyOX0.tSK20tp2eKId6imTRP4xfq-03yPEX0pdvk7GFsRu2mw';

const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const tableBody = document.querySelector('#data-table tbody');
let selectedRow = null;

// ---------- UTILS (Pomocné funkce) ----------
const formatDate = (value) => {
    if (!value) return '-';
    // Převede ISO formát z databáze na hezký český čas
    return new Date(value).toLocaleString('cs-CZ', { dateStyle: 'short', timeStyle: 'short' });
};

const fillRow = (row, item) => {
    row.dataset.id = item.id;
    row.innerHTML = `
        <td>${item.pojem ?? ''}</td>
        <td>${item.kategorie ?? ''}</td>
        <td>${item.vysvetleni ?? ''}</td>
        <td>${item.poznamka ?? ''}</td>
        <td>${item.autor ?? ''}</td>
        <td>${formatDate(item.created_at)}</td>
        <td>${formatDate(item.updated_at)}</td> 
    `;
};

// ---------- NAČÍTÁNÍ A VYHLEDÁVÁNÍ ----------
const loadData = async (searchTerm = '') => {
    tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center;">Načítání…</td></tr>`;

    let query = db
        .from('pojmy')
        .select('*')
        .order('created_at', { ascending: true });

    // Pokud uživatel zadal hledaný text, přidáme SQL filtr
    if (searchTerm.trim() !== '') {
        // Hledá searchTerm v pojmu NEBO v kategorii (ignoruje velikost písmen)
        query = query.or(`pojem.ilike.%${searchTerm}%,kategorie.ilike.%${searchTerm}%,vysvetleni.ilike.%${searchTerm}%,poznamka.ilike.%${searchTerm}%,autor.ilike.%${searchTerm}%`);
    }

    const { data, error } = await query;

    if (error) {
        console.error("Chyba ze Supabase:", error);
        tableBody.innerHTML = `<tr><td colspan="6" style="color:red; text-align:center;">Chyba načítání: ${error.message}</td></tr>`;
        return;
    }

    tableBody.innerHTML = '';

    if (data.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center;">Žádné výsledky neodpovídají hledání.</td></tr>`;
        return;
    }

    data.forEach(item => {
        const row = tableBody.insertRow();
        fillRow(row, item);
    });
};

// --- Logika vyhledávání s opožděním (Debounce) ---
let searchTimeout;
const searchInput = document.getElementById('search-input');

// Podmínka, aby to neházelo chybu, pokud v HTML ještě nemáš input s id="search-input"
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        const value = e.target.value;

        // Zrušíme předchozí plánované hledání
        clearTimeout(searchTimeout);

        // Naplánujeme nové hledání za 300ms
        searchTimeout = setTimeout(() => {
            loadData(value);
        }, 300);
    });
}

// ---------- VÝBĚR ŘÁDKU ----------
tableBody.addEventListener('click', e => {
    const row = e.target.closest('tr');
    if (!row || row.parentElement.tagName === 'THEAD') return;

    if (selectedRow) selectedRow.classList.remove('selected');

    if (selectedRow === row) {
        selectedRow = null;
    } else {
        selectedRow = row;
        selectedRow.classList.add('selected');
    }
});

// ---------- CRUD (Přidat, Upravit, Smazat) ----------
document.getElementById('btn-add').onclick = async () => {
    const p = prompt('Pojem:');
    const k = prompt('Kategorie:');
    const v = prompt('Vysvětlení:');
    const n = prompt('Poznámka:');
    const a = prompt('Autor:');

    if (!p?.trim()) return;

    const { data, error } = await db
        .from('pojmy')
        .insert([{
            pojem: p,
            kategorie: k,
            vysvetleni: v,
            poznamka: n,
            autor: a
        }])
        .select()
        .single();

    if (error) return alert("Chyba při přidávání: " + error.message);

    const row = tableBody.insertRow();
    fillRow(row, data);
};

document.getElementById('btn-edit').onclick = async () => {
    if (!selectedRow) return alert('Vyber řádek kliknutím v tabulce');

    const id = selectedRow.dataset.id;
    const p = prompt('Upravit pojem:', selectedRow.cells[0].innerText);
    const k = prompt('Upravit kategorii:', selectedRow.cells[1].innerText);
    const v = prompt('Upravit vysvětlení:', selectedRow.cells[2].innerText);
    const n = prompt('Upravit poznámku:', selectedRow.cells[3].innerText);

    if (!p?.trim()) return;

    const { data, error } = await db
        .from('pojmy')
        .update({
            pojem: p,
            kategorie: k,
            vysvetleni: v,
            poznamka: n,
            autor: a,
            updated_at: new Date()
        })
        .eq('id', id)
        .select()
        .single();

    if (error) return alert("Chyba při úpravě: " + error.message);

    fillRow(selectedRow, data);
};

document.getElementById('btn-remove').onclick = async () => {
    if (!selectedRow) return alert('Vyber řádek');

    const id = selectedRow.dataset.id;
    if (!confirm('Opravdu smazat z databáze?')) return;

    const { error } = await db
        .from('pojmy')
        .delete()
        .eq('id', id);

    if (error) return alert("Chyba při mazání: " + error.message);

    selectedRow.remove();
    selectedRow = null;
};

// ---------- INICIALIZACE ----------
// Načte data hned po spuštění stránky
loadData();