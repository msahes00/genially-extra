import * as finder from "./helpers/finder.ts";
import * as highlighter from "./helpers/highlighter.ts";


// Some configurable settings
const settings = {
    colors : {
        correct: "green",
        wrong:   "red"
    },
    animation : {
        time: 1000
    }
};

// Prepare some global variables
let answer: string | null = null;
let hitMax: number | null = null;
let nextElement: HTMLElement | null = null;
let hasHandler = false;


// Store the current game state
let missCount = 0;
let hitCount  = 0;


// Toggle logic to attach to each cell
const handler = (event: Event, table: HTMLTableElement) => {
    
    // Find the cell that was clicked
    const target = event.target as HTMLElement | null;
    const cell = target?.closest("td");

    // Check if the cell is valid
    if (!cell || !table.contains(cell)) return;
    
    // Get the correct answer
    const correct = getAnswer();

    // Check if the cell is the correct answer
    if (cell.innerText === correct) 
        handleCorrect(cell)
    else 
        handleWrong(cell);

    // Check if the game has been won
    handleWin(table);
};

// Handler for a correct answer click
const handleCorrect = (cell: HTMLTableCellElement) => {

    // Prevent multiple clicks on the same cell
    if (cell.style.backgroundColor === settings.colors.correct) return;
    
    // Set the cell color
    cell.style.backgroundColor = settings.colors.correct;

    // Increment the correct count
    hitCount++;
};

// Handler for a wrong answer click
const handleWrong = (cell: HTMLTableCellElement) => {

    // Increment the incorrect count
    missCount++;

    // Get the original color of the cell
    const original = cell.style.backgroundColor;

    // Skip the animation if it has not finished
    if (original === settings.colors.wrong) return;

    // Change the cell color and reset it after some time
    cell.style.backgroundColor = settings.colors.wrong;

    setTimeout(() => {
        cell.style.backgroundColor = original;
    }, settings.animation.time);
};

// Check if all the correct answers have been marked and show the next button
const handleWin = (table: HTMLTableElement) => {

    // If the number of correct answers has not been computed, do it now
    if (!hitMax) {
   
        // Get all the cells in the table and the correct answer
        const cells = table.querySelectorAll("td");
        const answer = getAnswer();
        
        // Find the cells that are correct
        const correctCells = Array.from(cells)
        .filter(cell => cell.innerText === answer);
        
        hitMax = correctCells.length;
    }

    // Check if the game is completed, exiting if not
    if (hitCount !== hitMax) return;

    // Show the next button
    showNext();

    console.log("WON");
};

const showNext = () => {

    // Ensure the helper element exists
    if (!nextElement) return;

    // Just click the helper element
    nextElement.click();
};

// Get the correct answer from the URL
const getAnswer = () => {

    // Return the cached answer if it exists
    if (answer) return answer;
    
    // Find the script element, exiting if not found
    const script = finder.getScript();
    if (!script) return null;
    
    // Get the answer from the URL parameters
    const value = new URL(script.src)
        .searchParams.get("answer");

    // Store the answer and return it
    answer = value;
    return answer;
};


// Create a Mutation Observer to watch for changes in the document
const observer = new MutationObserver((_mutations, observer) => {

    // Check if the table is present
    const table = document.getElementsByTagName('table')[0];
    if (!table) return;

    // Add the table listener only once
    if (!hasHandler) {
        table.addEventListener("click", (e) => handler(e, table));
        hasHandler = true;
    }

    // Check if the next helper element is present and hide the button
    nextElement = document.querySelector('div.genially-tricks-next');
    if (!nextElement) return;
    
    // Highlight the script tag and the next button element
    highlighter.highlightScript("Table Script");
    highlighter.highlight(nextElement, "Next Button");

    observer.disconnect();
});

// Start observing the entire document for any changes
observer.observe(document.documentElement, { childList: true, subtree: true });
