console.log("SCRIPT.JS BERHASIL JALAN");

// =====================================================
// HELPER ESCAPE & SUPABASE
// =====================================================
function escapeHTML(value) {
    if (value === null || value === undefined) return "";
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function escapeFavoriteText(text) {
    if (!text) return "";
    return String(text)
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'")
        .replace(/"/g, '\\"');
}

function hasSupabaseClient() {
    return (
        typeof window.supabaseClient !== "undefined" &&
        window.supabaseClient !== null
    );
}

async function getCurrentAuthUser() {
    if (!hasSupabaseClient()) {
        console.warn("Supabase client tidak tersedia.");
        return null;
    }
    try {
        const { data, error } = await window.supabaseClient.auth.getUser();
        if (error) {
            console.error("Gagal mengambil user:", error);
            return null;
        }
        return data?.user || null;
    } catch (error) {
        console.error("Supabase error:", error);
        return null;
    }
}

// =====================================================
// PILIH USER & LOGIN
// =====================================================
function selectUser(user) {
    if (user === "Tamu") {
        localStorage.removeItem("loggedIn");
        localStorage.setItem("selectedUser", "Tamu");
        window.location.href = "dashboard.html";
        return;
    }
    localStorage.setItem("selectedUser", user);
    localStorage.removeItem("loggedIn");
    window.location.href = "login.html";
}

const loginForm = document.getElementById("login-form");
if (loginForm) {
    const user = localStorage.getItem("selectedUser");
    const title = document.getElementById("login-title");
    if (title && user) {
        title.textContent = `Hello, ${user}!`;
    }
    loginForm.addEventListener("submit", async function(event) {
        event.preventDefault();
        const password = document.getElementById("password").value;
        const message = document.getElementById("login-message");
        const emailMap = {
            Ella: "elfishasatya@gmail.com",
            Arka: "naufalkenz@gmail.com"
        };
        const email = emailMap[user];
        if (!email) {
            message.textContent = "User tidak ditemukan ♡";
            return;
        }
        if (!hasSupabaseClient()) {
            message.textContent = "Koneksi database belum tersedia ♡";
            return;
        }
        const { error } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password
        });
        if (error) {
            message.textContent = "Password salah ♡";
            console.error(error);
            return;
        }
        localStorage.setItem("loggedIn", "true");
        window.location.href = "dashboard.html";
    });
}

// =====================================================
// FORGOT PASSWORD
// =====================================================
const forgotPasswordButton = document.getElementById("forgot-password-button");
if (forgotPasswordButton) {
    forgotPasswordButton.addEventListener("click", async function() {
        const user = localStorage.getItem("selectedUser");
        const message = document.getElementById("login-message");
        const emailMap = {
            Ella: "elfishasatya@gmail.com",
            Arka: "naufalkenz@gmail.com"
        };
        const email = emailMap[user];
        if (!email) {
            message.textContent = "User tidak ditemukan ♡";
            return;
        }
        if (!hasSupabaseClient()) {
            message.textContent = "Koneksi database belum tersedia ♡";
            return;
        }
        const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin + "/reset-password.html"
        });
        if (error) {
            console.error(error);
            message.textContent = "Gagal mengirim email reset password ♡";
            return;
        }
        message.textContent = "Email reset password sudah dikirim ♡";
    });
}

// =====================================================
// LOAD RESTAURANTS & RATING
// =====================================================
async function loadRestaurants() {
    if (!hasSupabaseClient()) return [];
    const { data, error } = await supabaseClient
        .from("restaurants")
        .select("*")
        .order("created_at", { ascending: false });
    if (error) {
        console.error("Gagal mengambil restoran:", error);
        return [];
    }
    return data || [];
}

async function getRestaurantRating(restaurantId) {
    if (!hasSupabaseClient()) return 0;
    const { data: reviews, error } = await supabaseClient
        .from("reviews")
        .select("rating")
        .eq("restaurant_id", restaurantId);
    if (error || !reviews || reviews.length === 0) return 0;
    const total = reviews.reduce((sum, r) => sum + Number(r.rating || 0), 0);
    return Number((total / reviews.length).toFixed(1));
}

// =====================================================
// DASHBOARD LOGIC
// =====================================================
async function displayRestaurants(restaurants) {
    const restaurantList = document.getElementById("restaurant-list");
    if (!restaurantList) return;
    
    restaurantList.innerHTML = "";
    const restaurantCount = document.getElementById("restaurant-count");
    if (restaurantCount) {
        restaurantCount.textContent = `${restaurants.length} places`;
    }
    if (restaurants.length === 0) {
        restaurantList.innerHTML = `
            <div class="empty-result">
                <p>Belum ada restoran ♡</p>
                <span>Tambahkan restoran pertama untuk memulai.</span>
            </div>
        `;
        return;
    }
    for (const restaurant of restaurants) {
        const card = document.createElement("div");
        card.className = "restaurant-card";
        card.onclick = function() {
            localStorage.setItem("selectedRestaurant", JSON.stringify(restaurant));
            localStorage.setItem("selectedRestaurantId", restaurant.id);
            window.location.href = "restaurant.html";
        };
        const overallRating = await getRestaurantRating(restaurant.id);
        card.innerHTML = `
            <img class="restaurant-image" src="${restaurant.image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4'}" alt="${escapeHTML(restaurant.name)}">
            <div class="restaurant-info">
                <h3 class="restaurant-name">${escapeHTML(restaurant.name)}</h3>
                <p class="restaurant-location">📍 ${escapeHTML(restaurant.location || "Lokasi belum ditambahkan")}</p>
                <p class="restaurant-rating">${overallRating > 0 ? `⭐ ${overallRating}` : "☆ Belum ada rating"}</p>
            </div>
        `;
        restaurantList.appendChild(card);
    }
}

async function initializeDashboardUI() {
    const selectedUser = localStorage.getItem("selectedUser");
    const welcomeTitle = document.getElementById("welcome-title");
    const ownerActions = document.getElementById("owner-actions");

    if (welcomeTitle) {
        if (selectedUser === "Tamu" || !selectedUser) {
            welcomeTitle.textContent = "Hi, There! ♡";
        } else {
            welcomeTitle.textContent = `Hai, ${selectedUser}! ♡`;
        }
    }

    if (ownerActions) {
        if (selectedUser === "Ella") {
            ownerActions.style.display = "block";
        } else {
            ownerActions.style.display = "none";
        }
    }

    const restaurants = await loadRestaurants();
    await displayRestaurants(restaurants);
}

// =====================================================
// DETAIL RESTORAN & REVIEWS
// =====================================================
async function loadRestaurantDetail(restaurantId) {
    if (!hasSupabaseClient()) return;
    const { data: restaurant, error } = await supabaseClient
        .from("restaurants")
        .select("id, name, location, image_url")
        .eq("id", restaurantId)
        .single();
    if (error || !restaurant) return;

    const detailName = document.getElementById("detail-name");
    if (detailName) detailName.textContent = restaurant.name;

    const detailLocation = document.getElementById("detail-location");
    if (detailLocation) detailLocation.textContent = `📍 ${restaurant.location || "Lokasi belum ditambahkan"}`;

    const detailImage = document.getElementById("detail-image");
    if (detailImage) {
        detailImage.src = restaurant.image_url || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4";
        detailImage.alt = restaurant.name;
    }

    const detailRating = document.getElementById("detail-rating");
    if (detailRating) {
        const rating = await getRestaurantRating(restaurant.id);
        detailRating.textContent = rating > 0 ? `⭐ ${rating}` : "☆ Belum ada rating";
    }
}

async function loadRestaurantReviews(restaurantId) {
    const reviewsContainer = document.getElementById("saved-reviews");
    if (!reviewsContainer || !hasSupabaseClient()) return;

    reviewsContainer.innerHTML = "<p>Memuat review...</p>";
    const authUser = await getCurrentAuthUser();

    const { data: reviews, error } = await supabaseClient
        .from("reviews")
        .select(`
            id,
            user_id,
            user_name,
            rating,
            review_text,
            created_at,
            review_photos (
                id,
                photo_url
            )
        `)
        .eq("restaurant_id", restaurantId)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Gagal mengambil review:", error);
        reviewsContainer.innerHTML = `<div class="review-card"><p class="review-text">Gagal memuat review.</p></div>`;
        return;
    }

    if (!reviews || reviews.length === 0) {
        reviewsContainer.innerHTML = `<div class="review-card"><p class="review-text">Belum ada review untuk restoran ini.</p></div>`;
        return;
    }

    reviewsContainer.innerHTML = "";
    for (const review of reviews) {
        const card = document.createElement("div");
        card.className = "review-card";
        const rating = Number(review.rating || 0);
        const stars = "⭐".repeat(rating);
        const date = new Date(review.created_at);
        const formattedDate = date.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

        let photosHTML = "";
        if (review.review_photos && review.review_photos.length > 0) {
            const photoURLs = [];
            for (const photo of review.review_photos) {
                let photoURL = photo.photo_url;
                if (photoURL && !photoURL.startsWith("http")) {
                    const { data: signedData } = await supabaseClient.storage.from("review-photos").createSignedUrl(photoURL, 86400);
                    photoURL = signedData?.signedUrl;
                }
                if (photoURL) photoURLs.push(photoURL);
            }
            if (photoURLs.length > 0) {
                photosHTML = `<div class="review-photo-gallery">`;
                photoURLs.forEach(url => {
                    photosHTML += `<img src="${escapeHTML(url)}" class="review-photo" alt="Foto review" onclick="openReviewPhoto('${escapeFavoriteText(url)}')">`;
                });
                photosHTML += `</div>`;
            }
        }

        let reviewActions = "";
        if (authUser && review.user_id === authUser.id) {
            reviewActions = `
                <div class="review-actions">
                    <button type="button" class="edit-review-button" onclick="editReview('${review.id}')">✏️ Edit</button>
                    <button type="button" class="delete-review-button" onclick="deleteReview('${review.id}')">🗑️ Hapus</button>
                </div>
            `;
        }

        card.innerHTML = `
            <div class="review-header">
                <div>
                    <h3>${escapeHTML(review.user_name || "Someone")} ♡</h3>
                    <p class="review-stars">${stars}</p>
                </div>
            </div>
            <p class="review-text">${escapeHTML(review.review_text || "")}</p>
            <p class="review-date">${formattedDate}</p>
            ${photosHTML}
            ${reviewActions}
        `;
        reviewsContainer.appendChild(card);
    }
}

// =====================================================
// EDIT / HAPUS REVIEW
// =====================================================
window.editReview = async function(reviewId) {
    if (!hasSupabaseClient()) return;
    const authUser = await getCurrentAuthUser();
    if (!authUser) {
        alert("Kamu belum login ♡");
        return;
    }

    const { data: review, error } = await supabaseClient.from("reviews").select("id, user_id, review_text").eq("id", reviewId).single();
    if (error || !review || review.user_id !== authUser.id) {
        alert("Akses ditolak atau review tidak ditemukan.");
        return;
    }

    const newText = prompt("Edit review kamu:", review.review_text || "");
    if (newText === null) return;
    if (newText.trim() === "") {
        alert("Review tidak boleh kosong.");
        return;
    }

    const { error: updateError } = await supabaseClient.from("reviews").update({ review_text: newText.trim() }).eq("id", reviewId);
    if (updateError) {
        alert("Review gagal diperbarui ♡");
        return;
    }
    alert("Review berhasil diperbarui ♡");
    location.reload();
};

window.deleteReview = async function(reviewId) {
    if (!hasSupabaseClient()) return;
    const authUser = await getCurrentAuthUser();
    if (!authUser) {
        alert("Kamu belum login ♡");
        return;
    }

    if (!confirm("Yakin mau menghapus review ini?")) return;

    await supabaseClient.from("review_photos").delete().eq("review_id", reviewId);
    const { error: deleteError } = await supabaseClient.from("reviews").delete().eq("id", reviewId).eq("user_id", authUser.id);

    if (deleteError) {
        alert("Review gagal dihapus ♡");
        return;
    }
    alert("Review berhasil dihapus ♡");
    location.reload();
};

// =====================================================
// FOOD JOURNEY & FAVORITES
// =====================================================
let currentJourneyFilter = 'all';

window.filterFoodJourney = function(filter, btn) {
    currentJourneyFilter = filter;
    const buttons = document.querySelectorAll('.journey-filter button');
    buttons.forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    renderFoodJourney();
};

async function renderFoodJourney() {
    const placeCount = document.getElementById("journey-place-count");
    const reviewCount = document.getElementById("journey-review-count");
    const averageRating = document.getElementById("journey-average-rating");
    const journeyList = document.getElementById("food-journey-list");

    if (!placeCount || !reviewCount || !averageRating || !journeyList) return;
    if (!hasSupabaseClient()) return;

    try {
        const { data: restaurants } = await supabaseClient.from("restaurants").select("id, name");
        let query = supabaseClient.from("reviews").select(`
            id,
            restaurant_id,
            user_name,
            rating,
            review_text,
            created_at,
            restaurants (
                name
            )
        `).order("created_at", { ascending: false });

        if (currentJourneyFilter !== 'all') {
            query = query.ilike('user_name', `%${currentJourneyFilter}%`);
        }

        const { data: reviews, error } = await query;
        if (error) return;

        const restaurantData = restaurants || [];
        const reviewData = reviews || [];

        placeCount.textContent = restaurantData.length;
        reviewCount.textContent = reviewData.length;

        if (reviewData.length > 0) {
            const totalRating = reviewData.reduce((total, r) => total + Number(r.rating || 0), 0);
            averageRating.textContent = (totalRating / reviewData.length).toFixed(1);
        } else {
            averageRating.textContent = "0.0";
        }

        if (reviewData.length === 0) {
            journeyList.innerHTML = `
                <div class="journey-empty">
                    <p>Belum ada cerita di sini ♡</p>
                    <small>Tambahkan review pertama kalian untuk mulai food journey.</small>
                </div>
            `;
            return;
        }

        journeyList.innerHTML = reviewData.map(review => {
            const date = new Date(review.created_at || Date.now());
            const formattedDate = date.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
            const stars = "★".repeat(Number(review.rating || 0));
            const user = review.user_name || "Someone";
            const restaurant = review.restaurants?.name || "Restaurant";
            const reviewText = review.review_text || "Tidak ada cerita untuk review ini.";

            return `
                <div class="journey-item">
                    <div class="journey-date">${formattedDate}</div>
                    <div class="journey-card" onclick="openRestaurantById('${review.restaurant_id}')">
                        <div class="journey-card-header">
                            <div>
                                <div class="journey-restaurant">${escapeHTML(restaurant)}</div>
                                <div class="journey-user">${escapeHTML(user)}</div>
                            </div>
                            <div class="journey-rating">${stars}</div>
                        </div>
                        <div class="journey-review">${escapeHTML(reviewText)}</div>
                    </div>
                </div>
            `;
        }).join("");
    } catch (error) {
        console.error("Error Food Journey:", error);
    }
}

function openRestaurantById(id) {
    if (!id) return;
    localStorage.setItem("selectedRestaurantId", id);
    window.location.href = "restaurant.html";
}

async function renderFavoritePlaces() {
    const container = document.getElementById("favorite-places-list");
    const favoritePlaceCount = document.getElementById("favorite-place-count");
    if (!container || !hasSupabaseClient()) return;

    try {
        const { data: restaurants } = await supabaseClient.from("restaurants").select("id, name, location, image_url");
        const { data: reviews } = await supabaseClient.from("reviews").select("id, restaurant_id, rating");

        const restaurantData = restaurants || [];
        const reviewData = reviews || [];

        const favoriteRestaurants = restaurantData
            .map(restaurant => {
                const restaurantReviews = reviewData.filter(r => r.restaurant_id === restaurant.id);
                const reviewCount = restaurantReviews.length;
                let averageRating = 0;
                if (reviewCount > 0) {
                    const total = restaurantReviews.reduce((sum, r) => sum + Number(r.rating || 0), 0);
                    averageRating = total / reviewCount;
                }
                return { ...restaurant, reviewCount, averageRating };
            })
            .filter(r => r.reviewCount > 0)
            .sort((a, b) => b.averageRating !== a.averageRating ? b.averageRating - a.averageRating : b.reviewCount - a.reviewCount)
            .slice(0, 3);

        if (favoritePlaceCount) {
            favoritePlaceCount.textContent = `${favoriteRestaurants.length} places`;
        }

        if (favoriteRestaurants.length === 0) {
            container.innerHTML = `
                <div class="favorite-place-empty">
                    <p>Belum ada tempat favorit ♡</p>
                    <small>Tambahkan review untuk melihat tempat favorit kalian.</small>
                </div>
            `;
            return;
        }

        container.innerHTML = favoriteRestaurants.map(restaurant => {
            const rating = restaurant.averageRating.toFixed(1);
            const stars = "★".repeat(Math.round(restaurant.averageRating));
            return `
                <div class="favorite-place-card" onclick="openRestaurantById('${restaurant.id}')">
                    <div class="favorite-image-wrapper">
                        <img src="${restaurant.image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4'}" alt="${escapeHTML(restaurant.name)}" class="favorite-place-image">
                    </div>
                    <div class="favorite-place-content">
                        <h3 class="favorite-place-name">${escapeHTML(restaurant.name)}</h3>
                        <p class="favorite-place-location">📍 ${escapeHTML(restaurant.location || "Lokasi tidak tersedia")}</p>
                        <div class="favorite-place-rating">
                            <span class="favorite-place-stars">${stars}</span>
                            <strong class="favorite-place-score">${rating}</strong>
                        </div>
                        <div class="favorite-place-reviews">${restaurant.reviewCount} ${restaurant.reviewCount === 1 ? 'review' : 'reviews'}</div>
                    </div>
                </div>
            `;
        }).join("");
    } catch (error) {
        console.error("Error Favorite Places:", error);
    }
}

// =====================================================
// LITTLE THINGS & NOTES
// =====================================================
const littleNotes = [
    "Meals always taste better together ♡",
    "One table, countless stories.",
    "Every place holds a story of its own.",
    "May there always be new places for us to discover.",
    "Food first, memories forever.",
    "Sometimes, a meal becomes a memory."
];

function showRandomLittleNote() {
    const noteText = document.getElementById("little-note-text");
    if (!noteText) return;
    const randomIndex = Math.floor(Math.random() * littleNotes.length);
    noteText.textContent = littleNotes[randomIndex];
}

async function renderLittleThings() {
    const mostVisitedElement = document.getElementById("most-visited-place");
    const ellaCountElement = document.getElementById("ella-review-count");
    const arkaCountElement = document.getElementById("arka-review-count");
    const totalMemoryElement = document.getElementById("total-memory-count");

    if (!mostVisitedElement && !ellaCountElement && !arkaCountElement && !totalMemoryElement) return;
    if (!hasSupabaseClient()) return;

    try {
        const { data: reviews } = await supabaseClient.from("reviews").select("id, restaurant_id, user_name");
        const { data: restaurants } = await supabaseClient.from("restaurants").select("id, name");
        const allReviews = reviews || [];

        if (totalMemoryElement) totalMemoryElement.textContent = allReviews.length;

        const ellaReviews = allReviews.filter(r => String(r.user_name || "").trim().toLowerCase() === "ella");
        if (ellaCountElement) ellaCountElement.textContent = ellaReviews.length;

        const arkaReviews = allReviews.filter(r => String(r.user_name || "").trim().toLowerCase() === "arka");
        if (arkaCountElement) arkaCountElement.textContent = arkaReviews.length;

        const counts = {};
        allReviews.forEach(r => {
            if (r.restaurant_id) {
                counts[r.restaurant_id] = (counts[r.restaurant_id] || 0) + 1;
            }
        });

        const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
        if (sorted.length > 0 && mostVisitedElement) {
            const topId = sorted[0][0];
            const topResto = (restaurants || []).find(r => r.id === topId);
            mostVisitedElement.textContent = topResto ? topResto.name : "—";
        } else if (mostVisitedElement) {
            mostVisitedElement.textContent = "—";
        }
    } catch (e) {
        console.error("Error Little Things:", e);
    }
}

// =====================================================
// UTILITY FUNCTIONS
// =====================================================
function addRestaurant() {
    const user = localStorage.getItem("selectedUser");
    if (user !== "Ella") {
        alert("Kamu tidak memiliki akses untuk menambah restoran.");
        return;
    }
    window.location.href = "add-restaurant.html";
}

function goToDashboard() {
    window.location.href = "dashboard.html";
}

async function logout() {
    if (hasSupabaseClient()) {
        try { await supabaseClient.auth.signOut(); } catch (e) {}
    }
    localStorage.clear();
    window.location.href = "index.html";
}

// LIGHTBOX
let currentPhotos = [];
let currentPhotoIndex = 0;

function openReviewPhoto(photoURL) {
    currentPhotos = [photoURL];
    currentPhotoIndex = 0;
    const lightbox = document.getElementById("photo-lightbox");
    if (!lightbox) {
        window.open(photoURL, "_blank");
        return;
    }
    updateLightbox();
    lightbox.classList.add("active");
    document.body.style.overflow = "hidden";
}

function closePhotoViewer(event) {
    if (event && event.target && (event.target.id === "lightbox-image" || event.target.classList.contains("lightbox-nav"))) return;
    const lightbox = document.getElementById("photo-lightbox");
    if (lightbox) {
        lightbox.classList.remove("active");
        document.body.style.overflow = "";
    }
}

function updateLightbox() {
    const image = document.getElementById("lightbox-image");
    const counter = document.getElementById("lightbox-counter");
    if (image && currentPhotos[currentPhotoIndex]) {
        image.src = currentPhotos[currentPhotoIndex];
        if (counter) counter.textContent = `${currentPhotoIndex + 1} / ${currentPhotos.length}`;
    }
}

// =====================================================
// INITIALIZATION ON DOM LOAD
// =====================================================
document.addEventListener("DOMContentLoaded", async function() {
    if (document.getElementById("restaurant-list")) {
        await initializeDashboardUI();
        await renderFoodJourney();
        await renderFavoritePlaces();
        showRandomLittleNote();
        renderLittleThings();

        const searchInput = document.getElementById("search-input");
        if (searchInput) {
            searchInput.addEventListener("input", async function() {
                const keyword = searchInput.value.toLowerCase().trim();
                const restaurants = await loadRestaurants();
                const filtered = restaurants.filter(r => (r.name || "").toLowerCase().includes(keyword) || (r.location || "").toLowerCase().includes(keyword));
                await displayRestaurants(filtered);
            });
        }
    }

    if (document.getElementById("restaurant-detail")) {
        const restaurantId = localStorage.getItem("selectedRestaurantId");
        if (restaurantId) {
            await loadRestaurantDetail(restaurantId);
            await loadRestaurantReviews(restaurantId);
        }
        
        const actions = document.getElementById("restaurant-actions");
        if (actions) {
            const user = localStorage.getItem("selectedUser");
            actions.style.display = (user === "Ella") ? "flex" : "none";
        }
    }
});