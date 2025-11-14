import { Game, GameContext } from "../core/game.ts";

/**
 * A small game alias for changing the data type.
 */
export type GameWith<Data> = Game & {
    data: Data;
};

/**
 * A small game context alias for changing the game type.
 */
export type ContextWith<Game> = GameContext & {
    game: Game;
};

/**
 * 
 */
export type GameContextWith<Data> = ContextWith<GameWith<Data>>;


/**
 * A type with the telemetry field for the game.data store.
 */
export type GameTelemetry = GameWith<{
    telemetry: string;
}>;

/**
 * A type with the answer field for the game.data store.
 */
export type GameAnswer = GameWith<{
    answer: string;
}>;

/**
 * A type with the hitmax field for the game.data store.
 */
export type GameHitmax = GameWith<{
    hitMax: number;
}>;