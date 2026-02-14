"""Tic-Tac-Toe: Play against the computer in your terminal."""

import random


def print_board(board):
    """Display the board with current state."""
    print()
    for i in range(3):
        row = " | ".join(board[i])
        print(f"  {row}")
        if i < 2:
            print(" ---+---+---")
    print()


def check_winner(board, player):
    """Return True if the given player has three in a row."""
    for i in range(3):
        if all(board[i][j] == player for j in range(3)):
            return True
        if all(board[j][i] == player for j in range(3)):
            return True
    if all(board[i][i] == player for i in range(3)):
        return True
    if all(board[i][2 - i] == player for i in range(3)):
        return True
    return False


def available_moves(board):
    """Return a list of (row, col) tuples for empty cells."""
    return [
        (r, c)
        for r in range(3)
        for c in range(3)
        if board[r][c] not in ("X", "O")
    ]


def is_full(board):
    """Return True if no moves remain."""
    return len(available_moves(board)) == 0


# --------------- Minimax AI ---------------

def minimax(board, is_maximizing, ai_mark, human_mark):
    """
    Minimax algorithm so the computer plays optimally.
    Returns a score: +10 for AI win, -10 for human win, 0 for draw.
    """
    if check_winner(board, ai_mark):
        return 10
    if check_winner(board, human_mark):
        return -10
    if is_full(board):
        return 0

    if is_maximizing:
        best = -100
        for r, c in available_moves(board):
            original = board[r][c]
            board[r][c] = ai_mark
            score = minimax(board, False, ai_mark, human_mark)
            board[r][c] = original
            best = max(best, score)
        return best
    else:
        best = 100
        for r, c in available_moves(board):
            original = board[r][c]
            board[r][c] = human_mark
            score = minimax(board, True, ai_mark, human_mark)
            board[r][c] = original
            best = min(best, score)
        return best


def computer_move(board, ai_mark, human_mark):
    """Choose the best move for the computer using minimax."""
    best_score = -100
    best_moves = []
    for r, c in available_moves(board):
        original = board[r][c]
        board[r][c] = ai_mark
        score = minimax(board, False, ai_mark, human_mark)
        board[r][c] = original
        if score > best_score:
            best_score = score
            best_moves = [(r, c)]
        elif score == best_score:
            best_moves.append((r, c))
    return random.choice(best_moves)


# --------------- Game loop ---------------

def choose_difficulty():
    """Let the player pick Easy, Medium, or Hard."""
    print("Choose difficulty:")
    print("  1 - Easy   (computer plays randomly)")
    print("  2 - Medium (mix of random and smart)")
    print("  3 - Hard   (computer plays perfectly)")
    while True:
        choice = input("Enter 1, 2, or 3: ").strip()
        if choice in ("1", "2", "3"):
            return int(choice)
        print("Please enter 1, 2, or 3.")


def computer_move_by_difficulty(board, ai_mark, human_mark, difficulty):
    """Pick a move based on the chosen difficulty."""
    if difficulty == 1:
        # Easy: random move
        return random.choice(available_moves(board))
    elif difficulty == 2:
        # Medium: 50% chance of optimal, 50% random
        if random.random() < 0.5:
            return random.choice(available_moves(board))
        return computer_move(board, ai_mark, human_mark)
    else:
        # Hard: always optimal
        return computer_move(board, ai_mark, human_mark)


def main():
    print("=" * 35)
    print("   TIC-TAC-TOE vs. THE COMPUTER")
    print("=" * 35)

    # Let the player choose X or O
    while True:
        mark = input("\nDo you want to be X or O? ").strip().upper()
        if mark in ("X", "O"):
            break
        print("Please enter X or O.")

    human_mark = mark
    ai_mark = "O" if human_mark == "X" else "X"
    print(f"\nYou are {human_mark}. Computer is {ai_mark}.")

    difficulty = choose_difficulty()
    diff_names = {1: "Easy", 2: "Medium", 3: "Hard"}
    print(f"Difficulty: {diff_names[difficulty]}\n")

    # Board cells labeled 1-9 so the player knows which number to enter
    board = [[str(r * 3 + c + 1) for c in range(3)] for r in range(3)]

    # X always goes first
    current = "X"
    print("Cells are numbered 1-9:")
    print_board(board)

    while True:
        if current == human_mark:
            # --- Human turn ---
            while True:
                try:
                    move = int(input(f"Your turn ({human_mark}). Enter cell (1-9): "))
                except ValueError:
                    print("Invalid input. Enter a number between 1 and 9.")
                    continue
                if move < 1 or move > 9:
                    print("Out of range. Enter a number between 1 and 9.")
                    continue
                row, col = divmod(move - 1, 3)
                if board[row][col] in ("X", "O"):
                    print("That cell is already taken. Try again.")
                    continue
                break
            board[row][col] = human_mark
        else:
            # --- Computer turn ---
            print(f"Computer ({ai_mark}) is thinking...")
            row, col = computer_move_by_difficulty(board, ai_mark, human_mark, difficulty)
            board[row][col] = ai_mark
            print(f"Computer plays cell {row * 3 + col + 1}.")

        print_board(board)

        if check_winner(board, current):
            if current == human_mark:
                print("Congratulations! You win!")
            else:
                print("Computer wins! Better luck next time.")
            break

        if is_full(board):
            print("It's a draw!")
            break

        current = "O" if current == "X" else "X"

    # Play again?
    again = input("\nPlay again? (y/n): ").strip().lower()
    if again == "y":
        print()
        main()
    else:
        print("Thanks for playing! Goodbye.")


if __name__ == "__main__":
    main()
