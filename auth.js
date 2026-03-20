// Auth State Management
let isLoginMode = true;

// DOM Elements
const authForm = document.getElementById('auth-form');
const toggleModeBtn = document.getElementById('toggle-mode');
const authSubtitle = document.getElementById('auth-subtitle');
const toggleText = document.getElementById('toggle-text');
const submitBtn = document.getElementById('submit-btn');
const errorMessage = document.getElementById('error-message');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');

// Check if already logged in
if (localStorage.getItem('currentUser')) {
    window.location.href = 'index.html';
}

// Event Listeners
function attachToggleListener() {
    document.getElementById('toggle-mode').addEventListener('click', (e) => {
        e.preventDefault();
        isLoginMode = !isLoginMode;
        
        // Update UI based on mode
        if (isLoginMode) {
            authSubtitle.textContent = 'Sign in to your account';
            submitBtn.textContent = 'Sign In';
            toggleText.innerHTML = `Don't have an account? <a href="#" id="toggle-mode">Sign up</a>`;
        } else {
            authSubtitle.textContent = 'Create a new account';
            submitBtn.textContent = 'Sign Up';
            toggleText.innerHTML = `Already have an account? <a href="#" id="toggle-mode">Sign in</a>`;
        }
        
        attachToggleListener();
        errorMessage.classList.add('hidden');
    });
}
attachToggleListener();

authForm.addEventListener('submit', (e) => {
    e.preventDefault();
    errorMessage.classList.add('hidden');
    
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    
    // Simple basic validation
    if (!email || !password) {
        showError('Please fill in all fields');
        return;
    }
    
    // Fetch users array
    const users = JSON.parse(localStorage.getItem('noted_users')) || [];
    
    if (isLoginMode) {
        // Handle Login
        const user = users.find(u => u.email === email && u.password === password);
        if (user) {
            loginUser(email);
        } else {
            showError('Invalid email or password');
        }
    } else {
        // Handle Signup
        const userExists = users.some(u => u.email === email);
        if (userExists) {
            showError('User already exists. Please sign in.');
        } else {
            users.push({ email, password });
            localStorage.setItem('noted_users', JSON.stringify(users));
            loginUser(email);
        }
    }
});

function showError(msg) {
    errorMessage.textContent = msg;
    errorMessage.classList.remove('hidden');
}

function loginUser(email) {
    localStorage.setItem('currentUser', email);
    window.location.href = 'index.html';
}
