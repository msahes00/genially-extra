// Load the json mapping
import mapping from "../assets/mapping.json" with { type: "json" };

// Extract the type information from the json
type GameData = typeof mapping;
export type Category = keyof GameData;
export type Item = GameData[Category][number];


/**
 * Shuffle an array using the Fisher-Yates algorithm.
 * @param array   The array to shuffle.
 * @param inplace If true, the shuffle is done in place, otherwise a new array is returned.
 * @returns The shuffled array.
 */
const shuffle = <T>(array: T[], inplace = false) => {

    const data = inplace ? array : [...array];

    for (let i = data.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [data[i], data[j]] = [data[j], data[i]];
    }

    return data;
};

/**
 * Sample a category.
 * @param category The category name
 * @param opts     Options for sampling:
 * - `count`: The number of items to sample (default: 1).
 * - `include`: An array of items to include in the sample.
 * - `lockIncluded`: If true, included items are not sampled again (default: true).
 * @returns An array of sampled items
 */
export const sampleCategory = (category: Category, opts: {
    count?: number,
    include?: Item[],
    lockIncluded?: boolean,
} = {}) => {

    const {
        count = 1,
        include = [],
        lockIncluded = true,
    } = opts;

    const items = mapping[category];
    if (!items)
        throw new Error(`Category "${category}" not found`);

    // Filter out items that do not match the requested category
    const included = include.filter(item => items.includes(item));

    let pool = shuffle(items);

    // Prevent adding an extra copy of an included element
    if (lockIncluded)
        pool = pool.filter(item => !included.includes(item));

    // Determine how many items to take from the pool
    const remainingCount = Math.max(count - included.length, 0);

    // Extend the pool if needed (and possible)
    while (pool.length < remainingCount && pool.length != 0)
        pool.push(...pool);

    const sampled = pool.slice(0, remainingCount);

    // Combine required + sampled items and shuffle them inplace
    return shuffle([...included, ...sampled], true);
};

/**
 * Generate a random integer in a given range, biased towards a value.
 * @param start   The start of the range (inclusive).
 * @param end     The end of the range (inclusive).
 * @param bias    The bias (0=start, 0.5=center, 1=end).
 * @param samples The number of uniform samples to average. Higher values reduce the variability.
 */
export const biasedInt = (start: number, end: number, bias = 0.5, samples = 3) => {

    // Generate a bell distribution by sampling random numbers
    let sum = 0;
    for (let i = 0; i < samples; i++)
      sum += Math.random();
    
    const bell = sum / samples;
  
    // Shift the peak according to bias
    const biased = (bell + bias) / 2;
  
    // Scale to the range and return as integer
    const scaled = start + biased * (end - start);
    return Math.round(scaled);
};
