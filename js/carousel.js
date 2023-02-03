/**
 * So the whole trick is having placeholder elements that represents the carousel layout 
 * and transforming the semantic(real images) images to the coordinates of the corresponding 
 * placeholder positions
 * 
 * Of course, the placeholders appear behind the images
 * 
 * Checkout the Figma designed prototype
 * https://www.figma.com/file/8FXO9BkiIYR4BHTU2FAc5K/100-days-of-design?node-id=9%3A208&t=2R9nNsLrbqYz0Ab1-0
 * 
 * Designed by Twitter @Design_Baddie
 */

const CrsTransitionDuration = 320;

const Directions = {
    PREV: 'previous',
    NEXT: 'next',
    STATIC: null,
}

// Heard getBoundingClientRect() is an expensive call to the layout engine so?
const carouselsDimensionsCache = {};

/**
 * 1 - Set initial index for image positions.
 * 2 - Create placeholder divs (rectangles) for each image.
 * 3 - Call to calculate and cache placeholder dimensions.
 * 4 - Do initial arrangement on placeholders.
 */
function initializeCarousels() {
    const carousels = document.querySelectorAll('.crs-layout-container');

    for (let crs of carousels) {
        const images = crs.querySelectorAll('.crs-img-wrp');
        const slideList = crs.querySelector('.crs-list')
        const n = images.length;

        /** Set initial indexes on images */
        images.forEach((img, i) => {
            img.setAttribute('data-crs-curr-index', i);
            img.setAttribute('data-crs-original-index', i);
            img.style.transitionDuration = CrsTransitionDuration + 'ms';
        })

        /**Make and append placeholders */
        const placeholdersWrapper = document.createElement('div');
        const placeholderMarkup = `<div class="crs-position"> <div class="crs-position__inner"></div></div>`

        placeholdersWrapper.className = 'crs-placeholders-wrp';
        placeholdersWrapper.setAttribute('role', 'presentation')
        placeholdersWrapper.innerHTML += placeholderMarkup.repeat(n)
        slideList.insertAdjacentElement('afterend', placeholdersWrapper)
    }

    /** Cache placeholders dimensions */
    calcAndCacheDimensions(carousels)

}

/** Calculate and cache the dimension properties of each placeholder element */
/** Animate slides after each calculation */
function calcAndCacheDimensions(carousels) {
    if (!carousels) {
        carousels = document.querySelectorAll('.crs-layout-container');
    }

    for (let carousel of carousels) {
        const carouselId = carousel.getAttribute('id')
        const placeholders = carousel.querySelectorAll('.crs-position');
        const images = carousel.querySelectorAll('.crs-img-wrp');
        const placeholderDimensionsArray = [];
        const imagesDimensionsArray = [];

        for (let i = 0; i < placeholders.length; i++) {

            placeholderDimensionsArray.push(placeholders[i].getBoundingClientRect())

            /** Using parent element of image to get it's wrapper that is always in a fixed position, 
             *  as translate values will be relative to that fixed position */
            imagesDimensionsArray.push(images[i].parentElement.getBoundingClientRect())
        }

        carouselsDimensionsCache[carouselId] = {
            images: imagesDimensionsArray,
            placeholders: placeholderDimensionsArray
        };

        animateSlides(Directions.STATIC, carouselId)
    }
}

/**
 * Determine the direction;
 * Calculate and set new z-index on images;
 * Get the dimension values of it's next position and calculate transform values; 
 * Transform element with new values;
 * Update image index var
 */
function animateSlides(direction, containerId) {
    const container = document.getElementById(containerId);
    const images = container.querySelectorAll('.crs-img-wrp')
    const n = images.length;
    const midIndex = Math.ceil(n / 2) - 1;

    for (let image of images) {
        const currIndex = Number(image.getAttribute('data-crs-curr-index'));
        const originalIndex = Number(image.getAttribute('data-crs-original-index'));
        let nextIndex;

        if (direction === Directions.STATIC) {
            nextIndex = currIndex
        }
        else if (direction === Directions.NEXT) {
            nextIndex = (currIndex - 1 + n) % n;
        } else if (direction === Directions.PREV) {
            nextIndex = (currIndex + 1) % n;
        }

        // Update live region text for screen readers (middle side is current active slide)
        const liveReg = container.querySelector('.js-live-region');
        if (liveReg && nextIndex === midIndex) {
            let i;
            if (originalIndex >= midIndex) {
                i = originalIndex - midIndex + 1;
            } else {
                i = n + originalIndex - 1;
            }
            liveReg.textContent = `Slide ${i} of ${n}`
        }

        /**
         * SETTING Z-INDEX
         * Middle z-index is higher than every other
         * Overflowing element has the lowest z-index (because it translates behind all others)
         */
        const isLastElementGoingRight = nextIndex === 0 && direction == Directions.NEXT;
        const isLastElementGoingLeft = nextIndex === n - 1 && direction == Directions.PREV

        if (isLastElementGoingLeft || isLastElementGoingRight) {
            image.style.zIndex = "0"
        } else {
            image.style.zIndex = midIndex - Math.abs(midIndex - nextIndex);
        }


        const imageRect = carouselsDimensionsCache[containerId].images[originalIndex];
        const nextPosRect = carouselsDimensionsCache[containerId].placeholders[nextIndex];

        // Treanslate to new axis
        const newX = nextPosRect.left - imageRect.left;
        const newY = nextPosRect.top - imageRect.top;
        image.style.transform = `translateX(${newX}px) translateY(${newY}px)`

        //Set new width and height dimensions
        image.style.width = nextPosRect.width + 'px';
        image.style.height = nextPosRect.height + 'px';

        // Update attributes, accessibility focus too
        image.setAttribute('data-crs-curr-index', nextIndex)
    }
}

const windowResizeEventHandler = debounce(function () {
    calcAndCacheDimensions();
}, 35)

window.addEventListener('resize', windowResizeEventHandler);

const animateWithThrottle = throttle(function (...args) {
    animateSlides(...args)
}, 0.9 * CrsTransitionDuration)

// Add event listener on next and previous buttons
document.querySelectorAll('.js-crs-ctrl').forEach(btn => {
    btn.addEventListener('click', () => {
        const direction = btn.getAttribute('data-crs-direction');
        const containerId = btn.getAttribute('aria-controls');
        animateWithThrottle(direction, containerId)
    })
})

// Register swipe event listener for touch devices
function checkXSwipeDirection(startX, endX) {

    // No direction for taps
    if(Math.abs(endX - startX) < 10){
        return Directions.STATIC;
    }

    if (startX < endX) return Directions.PREV;
    else if (startX > endX) return Directions.NEXT;
    else return Directions.STATIC
}

document.querySelectorAll('.crs-wrp').forEach(function (wrp) {

    const carouselId = wrp.getAttribute('data-crs-id');


    wrp.addEventListener('touchstart', function (e) {
        const touchstartX = e.changedTouches[0].screenX;

        function touchEndFunc(e) {
            const touchendX = e.changedTouches[0].screenX
            const direction = checkXSwipeDirection(touchstartX, touchendX);

            animateSlides(direction, carouselId)
            wrp.removeEventListener('touchend', touchEndFunc)
        }

        wrp.addEventListener('touchend', touchEndFunc)
    })
})


initializeCarousels();
