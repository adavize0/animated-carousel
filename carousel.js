
const Directions = {
    PREV: 'previous',
    NEXT: 'next'
}

/**
 * Set initial position index on images 
 * Create placeholder positions for each element
 */ 
document.querySelectorAll('.crs-list').forEach(carousel => {
    
    const images = carousel.querySelectorAll('.crs-img-wrp');
    const placeHoldersWrapper = document.createElement('div');
    placeHoldersWrapper.className = 'crs-place-holders-wrp';
    placeHoldersWrapper.style.display = 'flex';

    images.forEach((img, i) => {
        img.setAttribute('data-crs-curr-index', i)
        img.setAttribute('data-crs-org-index', i)
        placeHoldersWrapper.innerHTML += `<div class="crs-position"> <div class="crs-position__inner"></div></div>`;
    })

    carousel.insertAdjacentElement('afterend', placeHoldersWrapper)
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


/**
 * Determine the direction;
 * Calculate new positions of images;
 * Calculate new scale of images;
 * Calculate and set new z-index on images;
 * Transform element to new values;
 */
function animateSlides(direction, positions, images) {
    const n = positions.length;

    for(let image of images){
        const currIndex = Number(image.getAttribute('data-crs-curr-index'));
        const originalIndex = Number(image.getAttribute('data-crs-org-index'));
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
                      
     
        image.style.width = nextPosRect.width + 'px';
        image.style.height = nextPosRect.height + 'px';

        
        const newX = nextPosRect.left - imageRect.left;
        const newY = nextPosRect.top - imageRect.top;
        image.style.transform = `translateX(${newX}px) translateY(${newY}px)`

        image.setAttribute('data-crs-curr-index', nextIndex)
    }
}