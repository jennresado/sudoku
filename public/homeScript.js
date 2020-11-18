/* Find all divs to scroll through */
const pages = document.getElementsByClassName('carousel');

/* Initialize index to 0 */
let carouselIndex = 0;

/* Function to scroll through divs every 10 seconds */
const scrollDivs = function() {
    for (let p=0; p < pages.length; p++) {
        pages[p].style.display = "none";
    }

    // Increment index
    carouselIndex++;

    // Reset to 1 if index is greater than the number of divs
    if (carouselIndex > pages.length) {
        carouselIndex = 1;
    }

    // Display current div by index - 1
    pages[carouselIndex - 1].style.display = "block";

    // Repeat every 10 seconds
    setTimeout(scrollDivs, 15000);
};

/* Function to force div back to previous div */
function prev() {
    for (let p=0; p < pages.length; p++) {
        pages[p].style.display = "none";
    }

    // Decrement index
    carouselIndex--;

    // Reset to 1 if index is greater than the number of divs
    if (carouselIndex > pages.length) {
        carouselIndex = 1;
    }

    // Reset to last div if index is less than 1
    if (carouselIndex < 1) {
        carouselIndex = pages.length;
    }

    // Display current div by index - 1
    pages[carouselIndex - 1].style.display = "block";
}

/* Function to force div back to previous div */
function next() {
    for (let p=0; p < pages.length; p++) {
        pages[p].style.display = "none";
    }

    // Increment index
    carouselIndex++;
    
    // Reset to 1 if index is greater than the number of divs
    if (carouselIndex > pages.length) {
        carouselIndex = 1;
    }

    // Display current divs by index - 1
    pages[carouselIndex - 1].style.display = "block";
}

/* Start automatic scroll function */
scrollDivs();
