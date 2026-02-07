// 1️⃣ Import Firebase (CHỈ 1 LẦN)
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  onValue,
  remove,
  update
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-database.js";

// 2️⃣ Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAL1UB5vtocLLYdiYQUzBK8sA5ZfF9whuM",
  authDomain: "thiep-191b3.firebaseapp.com",
  databaseURL: "https://thiep-191b3-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "thiep-191b3",
  storageBucket: "thiep-191b3.firebasestorage.app",
  messagingSenderId: "829855546235",
  appId: "1:829855546235:web:26e8fe83cc80d36cc25bde"
};

// 3️⃣ Init
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const wishesRef = ref(db, "wishes");

// 4️⃣ DOM
const wishForm = document.getElementById("wishForm");
const guestName = document.getElementById("guestName");
const guestWish = document.getElementById("guestWish");
const wishList = document.getElementById("wishList");

let isAdmin = false;

// 5️⃣ Admin login
// ===== ADMIN ẨN 100% =====
const ADMIN_PASSWORD = "admin1998";
const wishTitle = document.getElementById("wishTitle");

if (wishTitle) {
  wishTitle.addEventListener("click", (e) => {
    // chỉ admin mới biết: Ctrl + Click
    if (!e.ctrlKey) return;

    const pass = prompt("🔑 Nhập mật khẩu Admin:");
    if (pass === null) return;

    if (pass === ADMIN_PASSWORD) {
      isAdmin = true;
      alert("✅ Admin đã đăng nhập");
      renderWishes(); // render lại để hiện nút ✏️ 🗑️
    } else {
      alert("❌ Sai mật khẩu");
    }
  });
}
wishList.addEventListener("click", e => {
  if (!isAdmin) return; // 🔒 khóa tuyệt đối

  if (e.target.dataset.delete) {
    if (confirm("Xóa lời chúc này?")) {
      remove(ref(db, "wishes/" + e.target.dataset.delete));
    }
  }

  if (e.target.dataset.edit) {
    const key = e.target.dataset.edit;
    const newWish = prompt("Nhập lời chúc mới:");
    if (newWish) {
      update(ref(db, "wishes/" + key), { wish: newWish });
    }
  }
});


// 6️⃣ Gửi lời chúc
wishForm.addEventListener("submit", e => {
  e.preventDefault();

  const name = guestName.value.trim();
  const wish = guestWish.value.trim();

  if (!name || !wish) {
    alert("Vui lòng nhập đầy đủ thông tin");
    return;
  }

  push(wishesRef, {
    name,
    wish,
    timestamp: Date.now()
  });

  guestName.value = "";
  guestWish.value = "";
});

// 7️⃣ Render realtime
function renderWishes() {
  onValue(wishesRef, snapshot => {
    wishList.innerHTML = "";
    const data = snapshot.val();
    if (!data) return;

    Object.entries(data)
      .sort((a, b) => a[1].timestamp - b[1].timestamp)
      .forEach(([key, value]) => {
        const div = document.createElement("div");
        div.className = "wish-item";
       
        div.innerHTML = `
        <div class="wish-name">❣️ ${value.name}</div>
        <div class="wish-text">☎︎ : ${value.wish}</div>
`;
        if (isAdmin) {
          const controls = document.createElement("div");
          controls.className = "admin-controls";
          controls.innerHTML = `
            <button data-edit="${key}">✏️</button>
            <button data-delete="${key}">🗑️</button>
          `;
          div.appendChild(controls);
        }

        wishList.appendChild(div);
      });
  });
}

renderWishes();

// 8️⃣ Xóa
wishList.addEventListener("click", e => {
  if (e.target.dataset.delete) {
    if (confirm("Xóa lời chúc này?")) {
      remove(ref(db, "wishes/" + e.target.dataset.delete));
    }
  }

  if (e.target.dataset.edit) {
    const key = e.target.dataset.edit;
    const newWish = prompt("Nhập lời chúc mới:");
    if (newWish) {
      update(ref(db, "wishes/" + key), { wish: newWish });
    }
  }
});
// ===== RSVP =====
const rsvpForm = document.getElementById('rsvpForm');

rsvpForm.addEventListener('submit', (e) => {
  e.preventDefault(); // ⛔ chặn reload trang

  const name = rsvpForm.querySelector('input[type="text"]').value.trim();
  const attendance = rsvpForm.querySelector('input[name="attendance"]:checked');

  if (!name || !attendance) {
    alert("Vui lòng nhập tên và chọn tham dự hoặc không tham dự");
    return;
  }

  // Gửi lên Firebase
  push(ref(db, 'rsvp'), {
    name: name,
    attendance: attendance.value, // yes / no
    time: Date.now()
  })
  .then(() => {
    alert("💖 Cảm ơn bạn đã xác nhận!");
    rsvpForm.reset();
  })
  .catch(err => {
    console.error(err);
    alert("❌ Gửi xác nhận thất bại");
  });
});
