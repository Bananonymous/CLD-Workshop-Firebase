// Firebase Configuration and Application Logic
import { initializeApp } from 'firebase/app';
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from 'firebase/auth';
import {
    getFirestore,
    collection,
    addDoc,
    onSnapshot,
    query,
    orderBy,
    deleteDoc,
    doc,
    updateDoc,
    serverTimestamp
} from 'firebase/firestore';

// Firebase configuration (replace with your actual config)
const firebaseConfig = {
    // NOTE: Replace these with your actual Firebase project credentials
    apiKey: "demo-api-key",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "demo-app-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// DOM Elements
const authSection = document.getElementById('auth-section');
const appSection = document.getElementById('app-section');
const loginBtn = document.getElementById('login-btn');
const registerBtn = document.getElementById('register-btn');
const logoutBtn = document.getElementById('logout-btn');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const authError = document.getElementById('auth-error');
const userName = document.getElementById('user-name');
const userEmail = document.getElementById('user-email');
const connectionStatus = document.getElementById('connection-status');
const taskTitle = document.getElementById('task-title');
const taskDescription = document.getElementById('task-description');
const addTaskBtn = document.getElementById('add-task-btn');
const tasksContainer = document.getElementById('tasks-container');
const totalTasksElement = document.getElementById('total-tasks');
const completedTasksElement = document.getElementById('completed-tasks');
const pendingTasksElement = document.getElementById('pending-tasks');

// Application State
let currentUser = null;
let tasksUnsubscribe = null;
let isOnline = navigator.onLine;

// Initialize the application
document.addEventListener('DOMContentLoaded', initializeApp);

function initializeApp() {
    setupEventListeners();
    setupConnectionMonitoring();

    // Monitor authentication state
    onAuthStateChanged(auth, (user) => {
        if (user) {
            currentUser = user;
            showMainApp();
            setupTasksListener();
        } else {
            currentUser = null;
            showAuthSection();
            if (tasksUnsubscribe) {
                tasksUnsubscribe();
                tasksUnsubscribe = null;
            }
        }
    });
}

function setupEventListeners() {
    // Authentication
    loginBtn.addEventListener('click', handleLogin);
    registerBtn.addEventListener('click', handleRegister);
    logoutBtn.addEventListener('click', handleLogout);

    // Tasks
    addTaskBtn.addEventListener('click', handleAddTask);

    // Enter key support
    emailInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleLogin();
    });
    passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleLogin();
    });
    taskTitle.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleAddTask();
    });
    taskDescription.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleAddTask();
    });
}

function setupConnectionMonitoring() {
    // Monitor online/offline status
    window.addEventListener('online', () => {
        isOnline = true;
        updateConnectionStatus();
    });

    window.addEventListener('offline', () => {
        isOnline = false;
        updateConnectionStatus();
    });

    updateConnectionStatus();
}

function updateConnectionStatus() {
    if (isOnline) {
        connectionStatus.classList.remove('offline-indicator');
        connectionStatus.classList.add('online-indicator');
    } else {
        connectionStatus.classList.remove('online-indicator');
        connectionStatus.classList.add('offline-indicator');
    }
}

// Authentication Functions
async function handleLogin() {
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
        showAuthError('Please enter both email and password');
        return;
    }

    try {
        setAuthButtonsLoading(true);
        await signInWithEmailAndPassword(auth, email, password);
        clearAuthInputs();
        clearAuthError();
    } catch (error) {
        console.error('Login error:', error);
        showAuthError(getAuthErrorMessage(error.code));
    } finally {
        setAuthButtonsLoading(false);
    }
}

async function handleRegister() {
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
        showAuthError('Please enter both email and password');
        return;
    }

    if (password.length < 6) {
        showAuthError('Password must be at least 6 characters long');
        return;
    }

    try {
        setAuthButtonsLoading(true);
        await createUserWithEmailAndPassword(auth, email, password);
        clearAuthInputs();
        clearAuthError();
        showAuthSuccess('Account created successfully!');
    } catch (error) {
        console.error('Registration error:', error);
        showAuthError(getAuthErrorMessage(error.code));
    } finally {
        setAuthButtonsLoading(false);
    }
}

async function handleLogout() {
    try {
        await signOut(auth);
    } catch (error) {
        console.error('Logout error:', error);
    }
}

function getAuthErrorMessage(errorCode) {
    switch (errorCode) {
        case 'auth/user-not-found':
            return 'No account found with this email address';
        case 'auth/wrong-password':
            return 'Incorrect password';
        case 'auth/email-already-in-use':
            return 'An account with this email already exists';
        case 'auth/weak-password':
            return 'Password is too weak';
        case 'auth/invalid-email':
            return 'Invalid email address';
        case 'auth/too-many-requests':
            return 'Too many failed attempts. Please try again later';
        default:
            return 'Authentication failed. Please try again.';
    }
}

function setAuthButtonsLoading(loading) {
    loginBtn.disabled = loading;
    registerBtn.disabled = loading;
    loginBtn.textContent = loading ? 'Signing in...' : 'Sign In';
    registerBtn.textContent = loading ? 'Creating...' : 'Create Account';
}

function clearAuthInputs() {
    emailInput.value = '';
    passwordInput.value = '';
}

function showAuthError(message) {
    authError.innerHTML = `<div class="error">${message}</div>`;
}

function showAuthSuccess(message) {
    authError.innerHTML = `<div class="success">${message}</div>`;
}

function clearAuthError() {
    authError.innerHTML = '';
}

// UI Navigation
function showAuthSection() {
    authSection.style.display = 'block';
    appSection.classList.remove('active');
}

function showMainApp() {
    authSection.style.display = 'none';
    appSection.classList.add('active');

    // Update user info
    userName.textContent = currentUser.email.split('@')[0];
    userEmail.textContent = currentUser.email;
}

// Task Management Functions
function setupTasksListener() {
    if (!currentUser) return;

    const tasksQuery = query(
        collection(db, 'tasks'),
        orderBy('createdAt', 'desc')
    );

    tasksUnsubscribe = onSnapshot(tasksQuery, (snapshot) => {
        const tasks = [];
        snapshot.forEach((doc) => {
            tasks.push({ id: doc.id, ...doc.data() });
        });

        renderTasks(tasks);
        updateTaskStats(tasks);
    }, (error) => {
        console.error('Error listening to tasks:', error);
        tasksContainer.innerHTML = `
            <div class="error">
                <p>Failed to load tasks. Please check your connection and try again.</p>
            </div>
        `;
    });
}

async function handleAddTask() {
    const title = taskTitle.value.trim();
    const description = taskDescription.value.trim();

    if (!title) {
        taskTitle.focus();
        return;
    }

    try {
        addTaskBtn.disabled = true;
        addTaskBtn.textContent = 'Adding...';

        await addDoc(collection(db, 'tasks'), {
            title,
            description: description || '',
            completed: false,
            createdAt: serverTimestamp(),
            createdBy: currentUser.uid,
            createdByEmail: currentUser.email
        });

        // Clear form
        taskTitle.value = '';
        taskDescription.value = '';
        taskTitle.focus();

    } catch (error) {
        console.error('Error adding task:', error);
        alert('Failed to add task. Please try again.');
    } finally {
        addTaskBtn.disabled = false;
        addTaskBtn.textContent = 'Add Task';
    }
}

async function toggleTaskCompletion(taskId, currentStatus) {
    try {
        await updateDoc(doc(db, 'tasks', taskId), {
            completed: !currentStatus,
            completedAt: !currentStatus ? serverTimestamp() : null
        });
    } catch (error) {
        console.error('Error updating task:', error);
        alert('Failed to update task. Please try again.');
    }
}

async function deleteTask(taskId) {
    if (!confirm('Are you sure you want to delete this task?')) {
        return;
    }

    try {
        await deleteDoc(doc(db, 'tasks', taskId));
    } catch (error) {
        console.error('Error deleting task:', error);
        alert('Failed to delete task. Please try again.');
    }
}

function renderTasks(tasks) {
    if (tasks.length === 0) {
        tasksContainer.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #666;">
                <h3>No tasks yet</h3>
                <p>Create your first task to get started!</p>
            </div>
        `;
        return;
    }

    const tasksHTML = tasks.map(task => {
        const createdDate = task.createdAt ?
            new Date(task.createdAt.toDate()).toLocaleDateString() :
            'Just now';

        return `
            <div class="task-item ${task.completed ? 'completed' : ''}">
                <div class="task-title ${task.completed ? 'completed' : ''}">${escapeHtml(task.title)}</div>
                ${task.description ? `<div class="task-description">${escapeHtml(task.description)}</div>` : ''}
                <div class="task-meta">
                    <div>
                        <small>Created by ${task.createdByEmail || 'Unknown'} on ${createdDate}</small>
                    </div>
                    <div class="task-actions">
                        <button class="btn-complete" onclick="toggleTaskCompletion('${task.id}', ${task.completed})">
                            ${task.completed ? 'Undo' : 'Complete'}
                        </button>
                        <button class="btn-delete" onclick="deleteTask('${task.id}')">Delete</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    tasksContainer.innerHTML = `<div class="tasks-grid">${tasksHTML}</div>`;
}

function updateTaskStats(tasks) {
    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;
    const pending = total - completed;

    totalTasksElement.textContent = total;
    completedTasksElement.textContent = completed;
    pendingTasksElement.textContent = pending;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Make functions available globally for onclick handlers
window.toggleTaskCompletion = toggleTaskCompletion;
window.deleteTask = deleteTask;

// Demo data creation (for presentation purposes)
function createDemoTasks() {
    if (!currentUser) return;

    const demoTasks = [
        {
            title: "Setup Firebase Project",
            description: "Initialize Firebase configuration and install dependencies",
            completed: true
        },
        {
            title: "Implement User Authentication",
            description: "Add login and registration functionality",
            completed: true
        },
        {
            title: "Create Real-time Task Manager",
            description: "Build the main application with Firestore integration",
            completed: false
        },
        {
            title: "Deploy to Firebase Hosting",
            description: "Build and deploy the application to production",
            completed: false
        }
    ];

    demoTasks.forEach(async (task) => {
        await addDoc(collection(db, 'tasks'), {
            ...task,
            createdAt: serverTimestamp(),
            createdBy: currentUser.uid,
            createdByEmail: currentUser.email
        });
    });
}

// Add demo button for presentations
if (window.location.hostname === 'localhost') {
    setTimeout(() => {
        if (currentUser) {
            const demoButton = document.createElement('button');
            demoButton.textContent = 'Add Demo Tasks';
            demoButton.style.background = '#ff9800';
            demoButton.onclick = createDemoTasks;
            document.querySelector('.user-info').appendChild(demoButton);
        }
    }, 2000);
}
