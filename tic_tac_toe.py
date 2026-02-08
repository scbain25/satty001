"""
Tic Tac Toe - You vs Computer
You play as X, the computer plays as O.
"""

import random

# Board: index 0-8 for positions 1-9 (user sees 1-9)
# X = human, O = computer
EMPTY = " "
HUMAN = "X"
COMPUTER = "O"


def print_board(board):
    """Display the current board."""
    print("\n")
    print(f" {board[0]} | {board[1]} | {board[2]} ")
    print("---+---+---")
    print(f" {board[3]} | {board[4]} | {board[5]} ")
    print("---+---+---")
    print(f" {board[6]} | {board[7]} | {board[8]} ")
    print("\n")
    print("Positions: 1-2-3, 4-5-6, 7-8-9")
    print()


def get_winner(board):
    """Return the winner (HUMAN or COMPUTER), 'tie', or None if game continues."""
    lines = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],  # rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8],  # columns
        [0, 4, 8], [2, 4, 6],             # diagonals
    ]
    for a, b, c in lines:
        if board[a] == board[b] == board[c] != EMPTY:
            return board[a]
    if EMPTY not in board:
        return "tie"
    return None


def get_empty_indices(board):
    """Return list of indices where board is empty."""
    return [i for i in range(9) if board[i] == EMPTY]


def minimax(board, depth, is_maximizing, alpha=-float("inf"), beta=float("inf")):
    """
    Minimax with alpha-beta pruning. Computer (O) maximizes, human (X) minimizes.
    Returns (best_score, best_move_index).
    """
    winner = get_winner(board)
    if winner == COMPUTER:
        return 10 - depth, None
    if winner == HUMAN:
        return -10 + depth, None
    if winner == "tie":
        return 0, None

    empty = get_empty_indices(board)
    if not empty:
        return 0, None

    if is_maximizing:
        best_score = -float("inf")
        best_move = None
        for idx in empty:
            board[idx] = COMPUTER
            score, _ = minimax(board, depth + 1, False, alpha, beta)
            board[idx] = EMPTY
            if score > best_score:
                best_score = score
                best_move = idx
            alpha = max(alpha, best_score)
            if beta <= alpha:
                break
        return best_score, best_move
    else:
        best_score = float("inf")
        best_move = None
        for idx in empty:
            board[idx] = HUMAN
            score, _ = minimax(board, depth + 1, True, alpha, beta)
            board[idx] = EMPTY
            if score < best_score:
                best_score = score
                best_move = idx
            beta = min(beta, best_score)
            if beta <= alpha:
                break
        return best_score, best_move


def computer_move(board):
    """Choose computer's move using minimax. Returns the index played."""
    empty = get_empty_indices(board)
    if not empty:
        return None
    # On first move, play center or corner randomly for variety
    if len(empty) == 9:
        return random.choice([0, 2, 4, 6, 8])
    if len(empty) == 8 and board[4] == EMPTY:
        return 4
    _, move = minimax(board, 0, True)
    return move if move is not None else random.choice(empty)


def get_human_move(board):
    """Ask the human for a valid move. Returns index 0-8."""
    while True:
        try:
            pos = input("Your move (1-9): ").strip()
            if not pos:
                continue
            n = int(pos)
            if 1 <= n <= 9:
                idx = n - 1
                if board[idx] == EMPTY:
                    return idx
                print("That spot is taken. Try again.")
            else:
                print("Enter a number between 1 and 9.")
        except ValueError:
            print("Please enter a number (1-9).")


def main():
    board = [EMPTY] * 9
    # Randomly choose who goes first
    human_turn = random.choice([True, False])
    if human_turn:
        print("You are X. You go first!")
    else:
        print("You are X. Computer goes first!")

    while True:
        print_board(board)
        winner = get_winner(board)
        if winner is not None:
            if winner == HUMAN:
                print("You win!")
            elif winner == COMPUTER:
                print("Computer wins!")
            else:
                print("It's a tie!")
            break

        if human_turn:
            idx = get_human_move(board)
            board[idx] = HUMAN
        else:
            idx = computer_move(board)
            if idx is not None:
                board[idx] = COMPUTER
                print(f"Computer plays position {idx + 1}.")
        human_turn = not human_turn

    print_board(board)
    again = input("Play again? (y/n): ").strip().lower()
    if again == "y":
        main()
    else:
        print("Thanks for playing!")


if __name__ == "__main__":
    main()
