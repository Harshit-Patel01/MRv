// Constants
const loadingScreen = document.getElementById('loadingScreen');
const mainContent = document.getElementById('mainContent');
const nextBtn = document.querySelector('.arrows').lastElementChild;
const prevBtn = document.querySelector('.arrows').firstElementChild;
const carousel = document.querySelector('.carousel');
const Home = document.querySelector('.Home');
const runningTime = document.querySelector('.carousel .timeRunning');

// Store Netflix genre URLs in an array
const netflixUrls = [
    'https://www.netflix.com/browse/genre/34399',      // Home
    'https://www.netflix.com/browse/genre/9744',    // Fantasy
    'https://www.netflix.com/browse/genre/8711',    // Horror
    'https://www.netflix.com/browse/genre/3276033', // Sci-Fi
    'https://www.netflix.com/browse/genre/8883',    // Romance
    'https://www.netflix.com/browse/genre/5763',    // Drama
    'https://www.netflix.com/browse/genre/1365',    // Action
    'https://www.netflix.com/browse/genre/8933',    // Thriller
    'https://www.netflix.com/browse/genre/6548'     // Comedy
];

// State management
let currentIndex = 10;
let isLoading = false;
let hasMoreItems = true;
let timeRunning = 3000;
let timeAutoNext = 30000;
let runTimeOut;
let runNextAuto;
let currentNetflixUrl = netflixUrls[0]; // Initialize with Home URL

// Initialize the application
async function initializeApp() {
    showLoadingScreen();
    try {
        await fetchInitialMovies();
        hideLoadingScreen();
        initializeCarousel();
    } catch (error) {
        handleError(error);
    }
}

// Loading screen functions
function showLoadingScreen() {
    loadingScreen.style.display = 'flex';
    mainContent.style.display = 'none';
    loadingScreen.style.opacity=1;
}

function hideLoadingScreen() {
    loadingScreen.style.opacity = '0';
    loadingScreen.style.transition = 'opacity 0.5s ease-out';
    setTimeout(() => {
        loadingScreen.style.display = 'none';
        mainContent.style.display = 'block';
        mainContent.style.opacity = '0';
        setTimeout(() => {
            mainContent.style.opacity = '1';
            mainContent.style.transition = 'opacity 0.5s ease-in';
        }, 50);
    }, 500);
}

// Fetch functions
async function fetchInitialMovies() {
    try {
        const response = await fetch(`https://mrv-delpoy-p7t55s729-harshit-patel01s-projects.vercel.app/initial?url=${encodeURIComponent(currentNetflixUrl)}`);
        if (!response.ok) throw new Error(`HTTP error ${response.status}`);
        
        const data = await response.json();
        hasMoreItems = data.hasMore;
        
        // Clear existing content before adding new movies
        Home.innerHTML = '';
        
        displayMovies(data.movies);
        return data;
    } catch (error) {
        console.error("Error fetching initial movies:", error);
        throw error;
    }
}

async function fetchMoreMovies() {
    if (isLoading || !hasMoreItems) return;
    
    isLoading = true;
    try {
        const response = await fetch(`https://mrv-delpoy-p7t55s729-harshit-patel01s-projects.vercel.app/more?count=2`);
        if (!response.ok) throw new Error(`HTTP error ${response.status}`);
        
        const data = await response.json();
        hasMoreItems = data.hasMore;
        
        if (data.movies.length > 0) {
            displayMovies(data.movies);
            currentIndex += data.movies.length;
        }
    } catch (error) {
        console.error("Error fetching more movies:", error);
    } finally {
        isLoading = false;
    }
}

// Display functions
function displayMovies(movies) {
    movies.forEach(movie => {
        if (movie.error) {
            console.error(`Error for ${movie.link || 'unknown link'}: ${movie.error}`);
            return;
        }

        const item = document.createElement('div');
        item.className = 'item';
        
        if (movie.images && movie.images.length > 0) {
            item.style.backgroundImage = `url(${movie.images[0]})`;
        }
        
        const details = document.createElement('div');
        details.className = 'content';
        if (movie.textData) {
            details.innerHTML = movie.textData.join('');
        }
        
        item.appendChild(details);
        Home.appendChild(item);
    });
}

// Carousel functions
function initializeCarousel() {
    if (Home.children.length > 0) {
        handleNext();
    }
    startAutoRotation();
}

function startAutoRotation() {
    clearTimeout(runNextAuto);
    runNextAuto = setTimeout(() => {
        handleNext();
    }, timeAutoNext);
}

function resetTimeAnimation() {
    runningTime.style.animation = 'none';
    runningTime.offsetHeight;
    runningTime.style.animation = 'runningTime 30s linear 1 forwards';
}

function showSlider(type, tab) {
    const sliderItemsDom = tab.querySelectorAll('.item');
    if (sliderItemsDom.length === 0) return;

    if (type === 'next') {
        tab.appendChild(sliderItemsDom[0]);
        carousel.classList.add('next');
    } else {
        tab.prepend(sliderItemsDom[sliderItemsDom.length - 1]);
        carousel.classList.add('prev');
    }

    clearTimeout(runTimeOut);
    runTimeOut = setTimeout(() => {
        carousel.classList.remove('next');
        carousel.classList.remove('prev');
    }, timeRunning);

    startAutoRotation();
    resetTimeAnimation();
}

// Error handling
function handleError(error) {
    console.error("Application error:", error);
    const loadingContent = loadingScreen.querySelector('.loading-content');
    if (loadingContent) {
        loadingContent.innerHTML = `
            <div class="loading-logo">MRv</div>
            <div class="loading-text">Failed to load content...</div>
        `;
    }
}

// Handler functions for next/prev
async function handleNext() {
    showSlider('next', Home);
    
    const items = Home.querySelectorAll('.item');
    if ((items.length - currentIndex < 2) && hasMoreItems) {
        await fetchMoreMovies();
    }
}

function handlePrev() {
    showSlider('prev', Home);
}

// Event listeners
nextBtn.addEventListener('click', handleNext);
prevBtn.addEventListener('click', handlePrev);
document.body.addEventListener('keyup',(ev) => {
    if(ev.key=='ArrowRight'){
        handleNext();
    }
    if(ev.key=='ArrowLeft'){
        handlePrev();
    }
})

// Navigation handling
const links = document.querySelectorAll('nav a');
links.forEach((link, index) => {
    link.addEventListener('click', async function(e) {
        e.preventDefault();
        
        // Remove active class from current active link
        document.querySelector('nav a.active')?.classList.remove('active');
        
        // Add active class to clicked link
        this.classList.add('active');
        
        // Update current URL and reset state
        if (index < netflixUrls.length) {
            currentNetflixUrl = netflixUrls[index];
            currentIndex = 10;
            isLoading = false;
            hasMoreItems = true;
            
            // Show loading screen while fetching new content
            showLoadingScreen();
            
            try {
                await fetchInitialMovies();
                initializeCarousel();
                hideLoadingScreen();
            } catch (error) {
                handleError(error);
            }
        }
    });
});

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApp);
