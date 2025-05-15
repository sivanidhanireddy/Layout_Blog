function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Tab Switching
function showTab(tabName) {
    try {
        document.querySelectorAll('.blog-section, .categories-section, .info-section, .contact-section, .profile-section').forEach(section => {
            section.classList.remove('active');
        });
        document.querySelectorAll('.tab-button').forEach(button => {
            button.classList.remove('active');
        });
        document.querySelector(`.${tabName}-section`).classList.add('active');
        document.querySelector(`.tab-button[onclick="showTab('${tabName}')"]`).classList.add('active');
        if (tabName === 'blog') {
            filterPosts();
        }
    } catch (error) {
        showError();
    }
}

// Comment System
function addComment(postId, parentCommentId) {
    try {
        const article = document.querySelector(`.article[data-id="${postId}"]`);
        const authorInput = article.querySelector('.comment-author');
        const contentInput = article.querySelector('.comment-content');
        const author = authorInput.value.trim();
        const content = contentInput.value.trim();

        if (author && content) {
            const commentDiv = document.createElement('div');
            commentDiv.className = parentCommentId ? 'comment reply' : 'comment';
            commentDiv.dataset.commentId = Date.now();
            commentDiv.innerHTML = `
                <strong>${author}</strong>: ${content}
                <span class="reply-btn" onclick="showReplyForm(${postId}, ${commentDiv.dataset.commentId})">Reply</span>
            `;
            const commentsContainer = document.getElementById(`comments-${postId}`);
            if (parentCommentId) {
                const parentComment = commentsContainer.querySelector(`[data-comment-id="${parentCommentId}"]`);
                parentComment.appendChild(commentDiv);
            } else {
                commentsContainer.appendChild(commentDiv);
            }
            authorInput.value = '';
            contentInput.value = '';
        } else {
            alert('Please fill in both name and comment fields.');
        }
    } catch (error) {
        showError();
    }
}

function showReplyForm(postId, commentId) {
    const article = document.querySelector(`.article[data-id="${postId}"]`);
    const existingForm = article.querySelector('.reply-form');
    if (existingForm) existingForm.remove();

    const replyForm = document.createElement('div');
    replyForm.className = 'reply-form comment-form';
    replyForm.innerHTML = `
        <h4>Reply to Comment</h4>
        <input type="text" class="comment-author" placeholder="Your Name" aria-label="Reply author">
        <textarea class="comment-content" placeholder="Your Reply" rows="3" aria-label="Reply content"></textarea>
        <button onclick="addComment(${postId}, ${commentId})">Submit</button>
        <button onclick="this.parentElement.remove()">Cancel</button>
    `;
    const comment = document.querySelector(`[data-comment-id="${commentId}"]`);
    comment.appendChild(replyForm);
}

// Social Sharing
function sharePost(title, postId, platform) {
    try {
        const url = `${window.location.href}#post-${postId}`;
        const text = `Check out "${title}" on Vibrant Blog!`;
        let shareUrl;

        if (platform === 'Twitter') {
            shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        } else if (platform === 'Facebook') {
            shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        } else if (platform === 'LinkedIn') {
            shareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`;
        }

        window.open(shareUrl, '_blank');
    } catch (error) {
        showError();
    }
}

// Search Functionality
const searchPosts = debounce(() => {
    try {
        const query = document.getElementById('search-input').value.toLowerCase();
        const articles = document.querySelectorAll('.article');
        articles.forEach(article => {
            const title = article.querySelector('h2').textContent.toLowerCase();
            const content = Array.from(article.querySelectorAll('p:not(.meta)')).map(p => p.textContent.toLowerCase()).join(' ');
            article.style.display = title.includes(query) || content.includes(query) ? 'block' : 'none';
        });
        currentPage = 1;
        updatePagination();
    } catch (error) {
        showError();
    }
}, 300);

// Filter by Category and Tags
function filterPosts() {
    try {
        showLoading();
        const category = document.getElementById('category-filter').value;
        const sort = document.getElementById('sort-filter').value;
        let articles = Array.from(document.querySelectorAll('.article'));

        // Category Filter
        articles = articles.filter(article => {
            const articleCategory = article.dataset.category;
            return category === 'all' || articleCategory === category;
        });

        // Sort
        articles.sort((a, b) => {
            if (sort === 'date-desc') {
                return new Date(b.dataset.date) - new Date(a.dataset.date);
            } else if (sort === 'date-asc') {
                return new Date(a.dataset.date) - new Date(b.dataset.date);
            } else if (sort === 'likes-desc') {
                const likesA = parseInt(localStorage.getItem(`likes-${a.dataset.id}`) || 0);
                const likesB = parseInt(localStorage.getItem(`likes-${b.dataset.id}`) || 0);
                return likesB - likesA;
            }
        });

        // Display
        articles.forEach(article => {
            article.style.display = 'none';
        });
        articles.forEach((article, index) => {
            const page = Math.floor(index / postsPerPage) + 1;
            article.style.display = page === currentPage ? 'block' : 'none';
        });

        updatePagination();
        hideLoading();
    } catch (error) {
        showError();
    }
}

function filterByCategory(category) {
    document.getElementById('category-filter').value = category;
    showTab('blog');
    filterPosts();
}

function filterByTag(tag) {
    document.getElementById('search-input').value = tag;
    searchPosts();
}

// Pagination
let currentPage = 1;
const postsPerPage = 3;

function updatePagination() {
    try {
        const visibleArticles = Array.from(document.querySelectorAll('.article')).filter(article => article.style.display !== 'none');
        const totalPages = Math.ceil(visibleArticles.length / postsPerPage);
        document.getElementById('page-info').textContent = `Page ${currentPage} of ${totalPages}`;
        document.querySelector('.pagination button[onclick="prevPage()"]').disabled = currentPage === 1;
        document.querySelector('.pagination button[onclick="nextPage()"]').disabled = currentPage === totalPages;
    } catch (error) {
        showError();
    }
}

function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        filterPosts();
    }
}

function nextPage() {
    const visibleArticles = Array.from(document.querySelectorAll('.article')).filter(article => article.style.display !== 'none');
    const totalPages = Math.ceil(visibleArticles.length / postsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        filterPosts();
    }
}

// Likes
function toggleLike(postId) {
    try {
        const likeBtn = document.querySelector(`.article[data-id="${postId}"] .like-btn`);
        const likeCountSpan = document.getElementById(`likes-${postId}`);
        let likes = parseInt(localStorage.getItem(`likes-${postId}`) || 0);
        const isLiked = localStorage.getItem(`liked-${postId}`);

        if (isLiked) {
            likes--;
            localStorage.removeItem(`liked-${postId}`);
            likeBtn.classList.remove('liked');
        } else {
            likes++;
            localStorage.setItem(`liked-${postId}`, 'true');
            likeBtn.classList.add('liked');
        }

        localStorage.setItem(`likes-${postId}`, likes);
        likeCountSpan.textContent = likes;
    } catch (error) {
        showError();
    }
}

// Copy Post Link
function copyPostLink(postId) {
    try {
        const url = `${window.location.href}#post-${postId}`;
        navigator.clipboard.write(url).then(() => {
            alert('Link copied to clipboard!');
        });
    } catch (error) {
        showError();
    }
}

// Dark Mode Toggle
function toggleTheme() {
    try {
        document.body.classList.toggle('dark-mode');
        const button = document.querySelector('.theme-toggle');
        button.textContent = document.body.classList.contains('dark-mode') ? '☀️ Light Mode' : '🌙 Dark Mode';
    } catch (error) {
        showError();
    }
}

// Contact Form Submission
function submitContact(event) {
    try {
        event.preventDefault();
        const name = document.getElementById('contact-name').value.trim();
        const email = document.getElementById('contact-email').value.trim();
        const message = document.getElementById('contact-message').value.trim();

        if (name && email && message) {
            document.getElementById('contact-response').textContent = 'Thank you for your message! We\'ll get back to you soon.';
            document.getElementById('contact-name').value = '';
            document.getElementById('contact-email').value = '';
            document.getElementById('contact-message').value = '';
        } else {
            document.getElementById('contact-response').textContent = 'Please fill in all fields.';
        }
    } catch (error) {
        showError();
    }
}

// Newsletter Subscription
function subscribeNewsletter(event) {
    try {
        event.preventDefault();
        const email = document.getElementById('newsletter-email').value.trim();
        if (email) {
            document.getElementById('newsletter-response').textContent = 'Thank you for subscribing!';
            document.getElementById('newsletter-email').value = '';
        } else {
            document.getElementById('newsletter-response').textContent = 'Please enter a valid email.';
        }
    } catch (error) {
        showError();
    }
}

// User Authentication (Simulated)
function loginUser(event) {
    try {
        event.preventDefault();
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();

        if (username && password) {
            localStorage.setItem('username', username);
            updateUserStatus();
            document.getElementById('profile-content').innerHTML = `
                <h3>Welcome, ${username}!</h3>
                <p>Your liked posts and comments are saved locally.</p>
                <button onclick="logoutUser()">Logout</button>
            `;
        } else {
            alert('Please enter both username and password.');
        }
    } catch (error) {
        showError();
    }
}

function logoutUser() {
    try {
        localStorage.removeItem('username');
        updateUserStatus();
        document.getElementById('profile-content').innerHTML = `
            <p>Please log in to view your profile.</p>
            <form id="login-form" onsubmit="loginUser(event)">
                <input type="text" id="username" placeholder="Username" required aria-label="Username">
                <input type="password" id="password" placeholder="Password" required aria-label="Password">
                <button type="submit">Login</button>
            </form>
        `;
    } catch (error) {
        showError();
    }
}

function updateUserStatus() {
    try {
        const username = localStorage.getItem('username');
        const userStatus = document.getElementById('user-status');
        if (username) {
            userStatus.innerHTML = `${username} | <a href="#" onclick="logoutUser()">Logout</a>`;
        } else {
            userStatus.innerHTML = `Guest | <a href="#" onclick="toggleAuth()">Login</a>`;
        }
    } catch (error) {
        showError();
    }
}

function toggleAuth() {
    showTab('profile');
}

// Scroll to Top
function scrollToTop() {
    try {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
        showError();
    }
}

// Related Posts
function loadRelatedPosts() {
    try {
        const articles = document.querySelectorAll('.article');
        articles.forEach(article => {
            const postId = article.dataset.id;
            const category = article.dataset.category;
            const tags = article.dataset.tags.split(',');
            const relatedList = document.getElementById(`related-${postId}`);
            const relatedArticles = Array.from(articles).filter(a => {
                if (a.dataset.id === postId) return false;
                const aTags = a.dataset.tags.split(',');
                return a.dataset.category === category || tags.some(tag => aTags.includes(tag));
            }).slice(0, 2);

            relatedList.innerHTML = relatedArticles.map(a => `<li><a href="#post-${a.dataset.id}">${a.querySelector('h2').textContent}</a></li>`).join('');
        });
    } catch (error) {
        showError();
    }
}

// Loading and Error Handling
function showLoading() {
    document.getElementById('loading').classList.add('active');
}

function hideLoading() {
    document.getElementById('loading').classList.remove('active');
}

function showError() {
    document.getElementById('error-boundary').style.display = 'block';
    hideLoading();
}

// Initialize
window.onload = function() {
    console.time('Page Load');
    try {
        // Sample Comments
        const sampleComments = [
            { postId: 1, author: 'Alice', content: 'Amazing insights about the universe!' },
            { postId: 1, author: 'Bob', content: 'Love this post!', parentId: Date.now() - 1 },
            { postId: 2, author: 'Charlie', content: 'Minimalism has changed my life!' },
            { postId: 3, author: 'Dana', content: 'These recipes are amazing!' },
            { postId: 4, author: 'Eve', content: 'Tech is moving so fast!' },
            { postId: 5, author: 'Frank', content: 'I need to visit these places!' }
        ];

        sampleComments.forEach(comment => {
            const commentDiv = document.createElement('div');
            commentDiv.className = comment.parentId ? 'comment reply' : 'comment';
            commentDiv.dataset.commentId = comment.parentId || Date.now();
            commentDiv.innerHTML = `
                <strong>${comment.author}</strong>: ${comment.content}
                <span class="reply-btn" onclick="showReplyForm(${comment.postId}, ${commentDiv.dataset.commentId})">Reply</span>
            `;
            const commentsContainer = document.getElementById(`comments-${comment.postId}`);
            if (comment.parentId) {
                const parentComment = commentsContainer.querySelector(`[data-comment-id="${comment.parentId}"]`);
                if (parentComment) parentComment.appendChild(commentDiv);
            } else {
                commentsContainer.appendChild(commentDiv);
            }
        });

        // Load Likes
        document.querySelectorAll('.article').forEach(article => {
            const postId = article.dataset.id;
            const likes = parseInt(localStorage.getItem(`likes-${postId}`) || 0);
            const isLiked = localStorage.getItem(`liked-${postId}`);
            const likeCountSpan = document.getElementById(`likes-${postId}`);
            const likeBtn = article.querySelector('.like-btn');
            likeCountSpan.textContent = likes;
            if (isLiked) likeBtn.classList.add('liked');
        });

        // Search Listener
        document.getElementById('search-input').addEventListener('input', searchPosts);

        // Scroll Listener for Back to Top
        window.addEventListener('scroll', () => {
            const backToTop = document.querySelector('.back-to-top');
            backToTop.classList.toggle('show', window.scrollY > 300);
        });

        // Load Related Posts
        loadRelatedPosts();

        // Update User Status
        updateUserStatus();

        // Initial Pagination
        filterPosts();

        console.timeEnd('Page Load');
    } catch (error) {
        showError();
    }
};
