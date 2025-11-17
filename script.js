/* VoyageFlow Core Logic */

// --- DOM ELEMENTS ---
const pages = document.querySelectorAll('.page-section');
const modal = document.getElementById('custom-modal');
const modalTitle = document.getElementById('modal-title');
const modalMessage = document.getElementById('modal-message');
const modalBtn = document.getElementById('modal-btn');

// --- STATE MANAGEMENT ---
let appState = {
    currentUser: {},
    currentPrice: 0
};

// --- NAVIGATION FUNCTION ---
function navigateTo(pageId) {
    // 1. Hide all pages first
    pages.forEach(page => {
        page.classList.add('hidden');
    });

    // 2. Find the target page
    const targetPage = document.getElementById(pageId);
    
    // 3. Show the target page
    if (targetPage) {
        targetPage.classList.remove('hidden');
        
        // UX Polish: Scroll the content area back to top
        const scrollContainer = targetPage.querySelector('.overflow-y-auto');
        if (scrollContainer) {
            scrollContainer.scrollTop = 0;
        }
    } else {
        console.error(`Page ID "${pageId}" not found.`);
    }
}

// --- CUSTOM MODAL SYSTEM ---
let onModalClose = null; 

function showModal(title, message, callback = null) {
    modalTitle.textContent = title;
    modalMessage.textContent = message;
    onModalClose = callback;
    modal.classList.remove('hidden');
}

function closeModal() {
    modal.classList.add('hidden');
    if (onModalClose) {
        onModalClose();
        onModalClose = null; 
    }
}

// --- EVENT LISTENERS (GLOBAL) ---
modalBtn.addEventListener('click', closeModal);
modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
});

// --- PAGE 1 LOGIC: REGISTRATION & VALIDATION ---
const regForm = document.getElementById('registration-form');

// Helper function to show/hide errors
const toggleError = (input, show, msgElementId) => {
    const msgEl = document.getElementById(msgElementId);
    if (show) {
        input.classList.add('border-[#964734]', 'bg-red-50'); // Error Styles
        input.classList.remove('border-gray-200');
        msgEl.classList.remove('hidden');
    } else {
        input.classList.remove('border-[#964734]', 'bg-red-50');
        input.classList.add('border-gray-200');
        msgEl.classList.add('hidden');
    }
};

// Regex Patterns
const patterns = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,  // Standard email format
    phone: /^\d{10}$/,                    // Exactly 10 digits
    pincode: /^\d{6}$/                    // Exactly 6 digits
};

if(regForm) {
    regForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Stop page reload
        
        let isValid = true;
        
        // 1. Validate Name
        const nameInput = document.getElementById('full-name');
        if (nameInput.value.trim() === "") {
            nameInput.classList.add('border-[#964734]', 'bg-red-50');
            isValid = false;
        } else {
            nameInput.classList.remove('border-[#964734]', 'bg-red-50');
        }
    
        // 2. Validate Email
        const emailInput = document.getElementById('email');
        if (!patterns.email.test(emailInput.value)) {
            toggleError(emailInput, true, 'error-email');
            isValid = false;
        } else {
            toggleError(emailInput, false, 'error-email');
        }
    
        // 3. Validate Phone
        const phoneInput = document.getElementById('phone');
        if (!patterns.phone.test(phoneInput.value)) {
            toggleError(phoneInput, true, 'error-phone');
            isValid = false;
        } else {
            toggleError(phoneInput, false, 'error-phone');
        }
    
        // 4. Validate PIN
        const pinInput = document.getElementById('pincode');
        if (!patterns.pincode.test(pinInput.value)) {
            toggleError(pinInput, true, 'error-pincode');
            isValid = false;
        } else {
            toggleError(pinInput, false, 'error-pincode');
        }
    
        // FINAL CHECK
        if (isValid) {
            appState.currentUser = {
                name: nameInput.value,
                email: emailInput.value
            };
    
            showModal(
                "Registration Successful!", 
                `Welcome aboard, ${nameInput.value}. Let's find your destination.`, 
                () => navigateTo('page-2')
            );
        }
    });
}

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    console.log("VoyageFlow System Loaded");
    navigateTo('page-1');
});

/* =========================================
   PAGE 2 LOGIC: BLOG NAVIGATION
   ========================================= */

// Select ALL "Plan Trip" buttons (there are 5 now)
const planButtons = document.querySelectorAll('.btn-plan-trip');

// Loop through each button and add the click listener
planButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Optional: In a real app, we would grab the city name here
        // const city = button.parentElement.querySelector('h3').innerText;
        // console.log("Planning trip to:", city);

        // Navigate to the calculator
        navigateTo('page-3');
    });
});


/* =========================================
   PAGE 3 LOGIC: PRICE CALCULATOR & INVOICE
   ========================================= */

const checkboxes = document.querySelectorAll('.calc-option');
// Invoice Elements
const invoiceList = document.getElementById('invoice-list');
const invoiceSubtotal = document.getElementById('invoice-subtotal');
const invoiceTravelers = document.getElementById('invoice-travelers');
const invoiceFinalTotal = document.getElementById('invoice-final-total');
const mobileTotalDisplay = document.getElementById('mobile-total-display'); // For mobile bar

// Confirm Buttons (Desktop & Mobile)
const btnConfirm = document.getElementById('btn-confirm-booking');
const btnConfirmMobile = document.getElementById('btn-confirm-mobile');

// Traveler Input
const travelerInput = document.getElementById('traveler-count');
const btnPlus = document.getElementById('btn-plus');
const btnMinus = document.getElementById('btn-minus');

function calculateTotal() {
    let basePrice = 0;
    let htmlList = ""; // We will build the HTML string for the list here
    
    // 1. Loop through all options to find checked ones
    let hasSelection = false;
    checkboxes.forEach(box => {
        if (box.checked) {
            hasSelection = true;
            const price = parseInt(box.dataset.price);
            const name = box.dataset.name || "Option"; // Fallback name
            
            basePrice += price;
            
            // Add line item to invoice HTML
            htmlList += `
                <li class="flex justify-between items-center">
                    <span>${name}</span>
                    <span class="font-semibold text-[#024950]">$${price}</span>
                </li>
            `;
        }
    });

    // Default text if nothing selected
    if (!hasSelection) {
        htmlList = `<li class="italic text-gray-400">Select flight & hotel to begin...</li>`;
    }

    // 2. Get Traveler Count
    let people = parseInt(travelerInput.value);
    if (isNaN(people) || people < 1) people = 1;

    // 3. Math
    const finalTotal = basePrice * people;

    // 4. Update State
    appState.currentPrice = finalTotal;

    // 5. Render to DOM
    invoiceList.innerHTML = htmlList;
    invoiceSubtotal.textContent = `$${basePrice.toLocaleString()}`;
    invoiceTravelers.textContent = `x ${people}`;
    
    // Update Main Total
    const formattedTotal = `$${finalTotal.toLocaleString()}`;
    invoiceFinalTotal.textContent = formattedTotal;
    
    if(mobileTotalDisplay) mobileTotalDisplay.textContent = formattedTotal; // Update mobile bar too
}

// --- EVENT LISTENERS ---

// 1. Option Changes
checkboxes.forEach(box => {
    box.addEventListener('change', calculateTotal);
});

// 2. Traveler Counter
if(btnPlus && btnMinus && travelerInput) {
    btnPlus.addEventListener('click', () => {
        if (parseInt(travelerInput.value) < 20) {
            travelerInput.value = parseInt(travelerInput.value) + 1;
            calculateTotal();
        }
    });
    btnMinus.addEventListener('click', () => {
        if (parseInt(travelerInput.value) > 1) {
            travelerInput.value = parseInt(travelerInput.value) - 1;
            calculateTotal();
        }
    });
}

// 3. Confirmation Logic (Shared Function)
const handleConfirm = (btnElement) => {
    if (appState.currentPrice === 0) {
        showModal('Selection Required', 'Please select at least one travel option to proceed.');
        return;
    }

    const people = travelerInput.value;
    showModal(
        'Confirm Booking', 
        `Total for ${people} traveler${people > 1 ? 's' : ''}: $${appState.currentPrice.toLocaleString()}. Ready to finalize?`,
        () => {
            const originalText = btnElement.textContent;
            btnElement.textContent = "Processing...";
            setTimeout(() => {
                btnElement.textContent = originalText;
                navigateTo('page-4');
                initializePage4(); 
            }, 1000);
        }
    );
};

if(btnConfirm) btnConfirm.addEventListener('click', () => handleConfirm(btnConfirm));
if(btnConfirmMobile) btnConfirmMobile.addEventListener('click', () => handleConfirm(btnConfirmMobile));

/* =========================================
   PAGE 4 LOGIC: CONFIRMATION & RESET
   ========================================= */

function initializePage4() {
    // 1. Get elements
    const nameEl = document.getElementById('conf-name');
    const priceEl = document.getElementById('conf-price');
    const dateEl = document.getElementById('conf-date');
    const refEl = document.getElementById('conf-ref');

    // 2. Inject Data from State
    // Default to "Traveler" if name is missing
    nameEl.textContent = appState.currentUser.name || "Traveler"; 
    priceEl.textContent = `$${appState.currentPrice.toLocaleString()}`;
    
    // 3. Generate dynamic date (Today)
    const today = new Date();
    dateEl.textContent = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    // 4. Generate random Reference ID
    const randomRef = Math.floor(1000 + Math.random() * 9000);
    refEl.textContent = `#VF-${randomRef}`;
}

// Restart Application Logic
const btnRestart = document.getElementById('btn-restart');

if(btnRestart) {
    btnRestart.addEventListener('click', () => {
        // 1. Reset State
        appState = {
            currentUser: {},
            currentPrice: 0
        };

        // 2. Reset Form Inputs (Page 1)
        regForm.reset();
        // Remove success/error styles
        document.querySelectorAll('.form-group input').forEach(input => {
            input.classList.remove('border-[#964734]', 'bg-red-50');
            input.classList.add('border-gray-200');
        });
        document.querySelectorAll('.error-msg').forEach(msg => msg.classList.add('hidden'));

        // 3. Uncheck all options (Page 3)
        checkboxes.forEach(box => box.checked = false);
        document.getElementById('total-price-display').textContent = "$0";

        // 4. Go back to start
        navigateTo('page-1');
    });
}