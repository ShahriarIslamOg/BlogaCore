const API_KEY = "API_KEY";
const BLOG_ID = "BLOG_ID"; // Replace with your blog's ID
const POSTS_PER_PAGE = 10;

let posts = [];
let currentPage = 1;

// Fetch blog posts using Blogger API v3
$(document).ready(() => {
    fetchPosts();

    // Handle back button click
    $("#back-btn").on("click", () => {
        $("#homepage").removeClass("hidden");
        $("#full-post").addClass("hidden");
    });
});

// Fetch posts from Blogger API
function fetchPosts() {
    const startIndex = (currentPage - 1) * POSTS_PER_PAGE + 1;
    const API_URL = `https://www.googleapis.com/blogger/v3/blogs/${BLOG_ID}/posts?key=${API_KEY}&maxResults=${POSTS_PER_PAGE}&startIndex=${startIndex}`;

    fetch(API_URL)
        .then(response => response.json())
        .then(data => {
            posts = data.items || [];
            displayPosts();
            setupPagination(data);
        })
        .catch(err => console.error("Error fetching posts:", err));
}

// Display posts on the homepage
function displayPosts() {
    const postList = $("#post-list");
    postList.empty();

    posts.forEach(post => {
        const postItem = $(`
            <div class="post-item">
                <img src="${getPostImage(post)}" alt="${post.title}">
                <h2>${post.title}</h2>
                <p>${stripHtml(post.content).substring(0, 100)}...</p>
            </div>
        `);

        postItem.on("click", () => showFullPost(post));
        postList.append(postItem);
    });
}

// Show the full post
function showFullPost(post) {
    $("#post-content").html(`
        <h1>${post.title}</h1>
        ${post.content}
    `);

    $("#homepage").addClass("hidden");
    $("#full-post").removeClass("hidden");
}

// Setup pagination buttons
function setupPagination(data) {
    const pagination = $("#pagination");
    pagination.empty();

    const totalPages = Math.ceil(data.totalItems / POSTS_PER_PAGE);

    for (let i = 1; i <= totalPages; i++) {
        const button = $(`<button>${i}</button>`);

        if (i === currentPage) {
            button.addClass("active");
        }

        button.on("click", () => {
            currentPage = i;
            fetchPosts();
        });

        pagination.append(button);
    }
}

// Extract the first image from the post content or use a placeholder
function getPostImage(post) {
    const regex = /<img.*?src="(.*?)"/;
    const match = regex.exec(post.content);
    return match ? match[1] : "placeholder.jpg";
}

// Strip HTML tags from content
function stripHtml(html) {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
}