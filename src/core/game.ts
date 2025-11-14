import { Timer } from "./timer.ts";

/**
 * Defines the options available for configuring a game.
 */
export type GameOptions = {
    initContext? (ctx: GameContext): GameContext | Promise<GameContext>;
    isValidPick? (ctx: GameContext): boolean;
    isGameEnded? (ctx: GameContext): boolean;

    handleRight? (ctx: GameContext): void;
    handleWrong? (ctx: GameContext): void;
    handleEnded? (ctx: GameContext): void;

    updateScore? (g: Game): void;
    updateClock? (t: Timer): void;
};

/**
 * The context structure to use for the check function.
 */
export type GameContext = {
    game: Game;
    event: Event;
}

export class Game {
    /**
     * The timer instance for the game.
     */
    public timer = new Timer();

    /**
     * Indicates if the game is over.
     */
    public gameOver = true;

    /**
     * The number of incorrect picks made.
     */
    public missCount = 0;

    /**
     * The number of correct picks made.
     */
    public hitCount = 0;

    /**
     * The store for general game data.
     */
    public data: Record<string, unknown>;

    /**
     * The options for the game.
     */
    private opts: Required<GameOptions> = {
        initContext: (ctx) => ctx,
        isValidPick: () => false,
        isGameEnded: () => false,
        handleRight: () => {},
        handleWrong: () => {},
        handleEnded: () => {},
        updateScore: () => {},
        updateClock: () => {},
    };

    /**
     * Creates a new instance of the Game class.
     * @param options     Optional configuration for the game.
     * @param initialData The initial data for the game.
     */
    constructor(options: GameOptions = {}, initialData: Record<string, unknown> = {}) {
        
        // Overrwrite the default no-op ones with the ones passed
        Object.assign(this.opts, options);
        this.data = initialData;

        this.timer.setOnTick(this.opts.updateClock.bind(this));
    }
    
    /**
     * Checks the provided event using the configured options.
     * @param event The event to check.
     */
    // NOTE: this is implemented as an arrow function to avoid the need for bind()
    public check = async (event: Event) => {

        // Ignore if the game is over
        if (this.gameOver) return;

        // Prepare the context to pass to the options
        const ctx = await this.opts.initContext({
            game: this,
            event,
        });

        if (this.opts.isValidPick(ctx)) 
            this.opts.handleRight(ctx);
        else
            this.opts.handleWrong(ctx);


        if (this.opts.isGameEnded(ctx)) {
            
            this.stop();
            this.opts.handleEnded(ctx);
        }

        this.opts.updateScore(this);
    }

    /**
     * Starts a new game.
     */
    public start() {
        this.gameOver  = false;
        this.missCount = 0;
        this.hitCount  = 0;

        this.timer.reset();
        this.timer.start();

        // Initial UI update
        this.opts.updateScore(this);
    }

    /**
     * Stops the current game.
     */
    public stop() {
        this.gameOver = true;
        this.timer.stop();
    }

    /**
     * Converts the game data to a JSON object.
     * @returns The game data as a JSON object.
     */
	public toJSON() {
        return {
            miss: this.missCount,
            hit : this.hitCount,
            time: this.timer.getElapsed(),
        }
    }
}
