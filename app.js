import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

const firebaseConfig = { /* PASTE YOUR CONFIG FROM FIREBASE CONSOLE HERE */ };
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

let cart = [];
let currentUser = null;

// ROUTING LOGIC
window.route = (viewId) => {
    document.querySelectorAll('.view').forEach(v => v.style.display = 'none');
    document.getElementById(`view-${viewId}`).style.display = 'block';
};

// AUTHENTICATION
const authBtn = document.getElementById('authBtn');
authBtn.onclick = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider);
};

onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        authBtn.innerText = "Sign Out";
        document.getElementById('nav-dash').style.display = 'block';
        document.getElementById('user-display-name').innerText = user.displayName;
        if(user.email === "your-admin-email@gmail.com") document.getElementById('nav-admin').style.display = 'block';
    } else {
        currentUser = null;
        authBtn.innerText = "Login";
    }
});

// ADMIN: UPLOAD ASSET
document.getElementById('upload-btn').onclick = async () => {
    const title = document.getElementById('asset-title').value;
    const price = document.getElementById('asset-price').value;
    const previewImg = document.getElementById('asset-preview').files[0];
    const masterFile = document.getElementById('asset-master').files[0];

    const previewRef = ref(storage, `previews/${previewImg.name}`);
    const masterRef = ref(storage, `vault/${masterFile.name}`);

    await uploadBytes(previewRef, previewImg);
    const previewUrl = await getDownloadURL(previewRef);

    await uploadBytes(masterRef, masterFile);
    const masterUrl = await getDownloadURL(masterRef);

    await addDoc(collection(db, "assets"), {
        title, price: Number(price), previewUrl, masterUrl, category: document.getElementById('asset-cat').value
    });
    alert("Asset Live!");
};

// SHOP: LOAD ASSETS
async function loadShop() {
    const snap = await getDocs(collection(db, "assets"));
    const list = document.getElementById('product-list');
    list.innerHTML = "";
    snap.forEach(doc => {
        const item = doc.data();
        list.innerHTML += `
            <div class="card">
                <img src="${item.previewUrl}">
                <h3>${item.title}</h3>
                <p>Rs. ${item.price}</p>
                <button class="btn-orange" onclick="addToCart('${item.title}', ${item.price})">Add to Cart</button>
            </div>`;
    });
}
loadShop();
