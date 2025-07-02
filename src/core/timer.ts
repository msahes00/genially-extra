/**
 * A high-precision timer that uses the browser requestAnimationFrame loop
 * to update its elapsed time with sub-millisecond accuracy.
 */
export class Timer {
    /**
     * Timestamp when the timer was last started (in milliseconds since navigation start).
     */
    private startTime: number = 0;

    /**
     * Accumulated elapsed time from previous start/stop cycles (in milliseconds).
     */
    private accumulated: number = 0;

    /**
     * The most recent elapsed time, updated each animation frame (in milliseconds).
     */
    private elapsed: number = 0;

    /**
     * Whether the timer is currently running.
     */
    private running: boolean = false;

    /**
     * An optional callback function to be called on each animation frame tick.
     */
    private onTick?: (timer: Timer) => void;

    /**
     * The ID returned by requestAnimationFrame, used to cancel the loop.
     */
    private rafId: number = 0;

    /**
     * The internal callback executed on each animation frame.
     * Updates the elapsed time and schedules the next frame.
     * @param timestamp The current high-resolution time provided by rAF.
     */
    // NOTE: this is an arrow function so it has access to this without bind()
    private tick = (timestamp: DOMHighResTimeStamp) => {

        this.elapsed = (timestamp - this.startTime) + this.accumulated;
        this.rafId = requestAnimationFrame(this.tick);
        
        if (this.onTick) this.onTick(this);
    };

    /**
     * Starts or resumes the timer. If the timer is already running, this is a no-op.
     */
    public start() {
        if (this.running) return;

        this.running = true;
        this.startTime = performance.now();
        this.rafId = requestAnimationFrame(this.tick);
    }

    /**
     * Pauses the timer. If the timer is not running, this is a no-op.
     * Cancels the rAF loop and snapshots the current elapsed time.
     */
    public stop() {

        if (!this.running) return;

        this.running = false;
        cancelAnimationFrame(this.rafId);
        this.accumulated = this.elapsed;
    }

    /**
     * Resets the timer to zero and stops it if currently running.
     */
    public reset() {
        
        if (this.running) this.stop();

        this.startTime = 0;
        this.accumulated = 0;
        this.elapsed = 0;
        this.rafId = 0;
    }

    /**
     * Retrieves the current elapsed time in milliseconds, with fractional precision.
     * @returns The elapsed time in milliseconds.
     */
    public getElapsed(): number {
        return this.elapsed;
    }

    /**
     * Retrieves the current elapsed time in seconds, with fractional precision.
     * @returns The elapsed time in seconds.
     */
    public getElapsedSeconds(): number {
        return this.elapsed / 1000;
    }

    /**
     * Sets a callback function to be called on each animation frame tick.
     * @param callback The function to call, receiving the elapsed time in milliseconds.
     */
    public setOnTick(callback: (timer: Timer) => void) {
        this.onTick = callback;
    }

    /**
     * Removes the callback function set with setOnTick.
     */
    public resetOnTick() {
        this.onTick = undefined;
    }
}
