
const Directions = {
    PREV: 'previous',
    NEXT: 'next'
}

// Set initial position index on images
document.querySelectorAll('.crs-list').forEach(carousel => {
    carousel.querySelectorAll('.crs-img-wrp').forEach((img, i) => {
        img.setAttribute('data-crs-curr-index', i)
        img.setAttribute('data-crs-org-index', i)
    })
})

// Add event listener on next and previous buttons
document.querySelectorAll('.js-crs-ctrl').forEach(btn => {
    btn.addEventListener('click', () => {
        const direction = btn.getAttribute('data-crs-direction')
        const containerId = btn.getAttribute('aria-controls')
        const slidesContainer = document.getElementById(containerId)

        const positions = slidesContainer.querySelectorAll('.crs-position')
        const images = slidesContainer.querySelectorAll('.crs-img-wrp')

        animateSlides(direction, positions, images)
    })
})

// Animate stuff
/**
 * ---Going right
 * Move the 1 to n-1 to +1 position;
 * Items before mid scale up;
 * Items after mid scale down
 * Move the last item to the first place
 * z-index
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


        
        const orgPos = positions[originalIndex].getBoundingClientRect();
        const nextPosRect = positions[nextIndex].getBoundingClientRect();
        
        const x = nextPosRect.left - orgPos.left;
        image.style.transform = 'translateX(' + x + 'px)'
        image.setAttribute('data-crs-curr-index', nextIndex)

        if(originalIndex == 0){
            console.log({nextIndex, currIndex, originalIndex});

        }
    }
}