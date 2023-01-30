
const Directions = {
    PREV: 'previous',
    NEXT: 'next'
}

/**
 * Set initial index for image positions 
 */
document.querySelectorAll('.crs-list').forEach(carousel => {
    const images = carousel.querySelectorAll('.crs-img-wrp');

    images.forEach((img, i) => {
        img.setAttribute('data-crs-curr-index', i);
    })

    createPlaceHolders(carousel, images.length);
})

// Add event listener on next and previous buttons
document.querySelectorAll('.js-crs-ctrl').forEach(btn => {
    btn.addEventListener('click', () => {
        const direction = btn.getAttribute('data-crs-direction')
        const containerId = btn.getAttribute('aria-controls')
        const carouselContainer = document.getElementById(containerId)

        const positions = carouselContainer.querySelectorAll('.crs-position')
        const images = carouselContainer.querySelectorAll('.crs-img-wrp')

        animateSlides(direction, positions, images)
    })
})

/** Create placeholder positions for each element */
function createPlaceHolders(container, n) {
    const placeHoldersWrapper = document.createElement('div');

    for (let i = 0; i < n; i++) {
        placeHoldersWrapper.innerHTML += `<div class="crs-position"> <div class="crs-position__inner"></div></div>`;
    }

    placeHoldersWrapper.className = 'crs-place-holders-wrp';
    container.insertAdjacentElement('afterend', placeHoldersWrapper)
}

function arrangePlaceHolders(){
    
}

/**
 * Determine the direction;
 * Calculate next dimensions and positions of images;
 * Calculate and set new z-index on images;
 * Transform element with new values;
 */
function animateSlides(direction, positions, images) {
    const n = positions.length;

    for (let image of images) {
        const currIndex = Number(image.getAttribute('data-crs-curr-index'));
        let nextIndex;

        if (direction === Directions.NEXT) {
            nextIndex = (currIndex - 1 + n) % n;
        } else if (direction === Directions.PREV) {
            nextIndex = (currIndex + 1) % n;
        }

        // Using parent element to get it's wrapper that is always fixed, 
        // to calculate translate values relative to that fixed position
        const imageRect = image.parentElement.getBoundingClientRect();
        const nextPosRect = positions[nextIndex].getBoundingClientRect();

        //Set new width and height dimensions
        image.style.width = nextPosRect.width + 'px';
        image.style.height = nextPosRect.height + 'px';

        // Treanslate to new axis
        const newX = nextPosRect.left - imageRect.left;
        const newY = nextPosRect.top - imageRect.top;
        image.style.transform = `translateX(${newX}px) translateY(${newY}px)`

        // Update index attribute
        image.setAttribute('data-crs-curr-index', nextIndex)
    }
}