
# Euchre

## What is this Project?
This project simulates the euchre card game under Australian rules -- 32-card deck; player opposite the dealer must bid alone.

## Getting Started
The easiest way to get started is to run the `interface.ipynb` notebook. The arguments to `play_euchre()` are:
- `winning_score`: 11 is customary.
- `player_strategies`: A 4-item list of strategy names adopted by each player. Can be `scorecard_simple`, `scorecard_complex`, `user_input` or `random`. Create your own strategy in `strategy.py` and try to beat them.
- `player_names`: a 4-item list of player names. Leave blank for defaults.
- `verbose`: set to True to print the output to the notebook.

## Key Modules:
- `deck.py` defines classes for suits and cards.
- `participants.py` defines classes for players and teams.
- `gameplay.py` defines classes for tricks, hands, and games.
- `strategy.py` contains functions for bidding and playing.
- `euchre.py` contains functions for playing the game, including `play_euchre()`.

## Dependencies
- [colorama](https://pypi.org/project/colorama/) for printing colourful output to the log

## Future Work
- Supporting a user-input game, either in the command line or web interface. This can already be partly achieved by setting a player's strategy to `user_input`, but they are able to see all of their opponent's cards (!).
- Supporting other variations of euchre.
- Build a ML model to predict the optimal bidding and playing strategy, based on a large number of simulations.
