#/usr/bin/env python3
import math

# Approach to use for the two array of numbers
# Cmd + / to comment out the code
#
# 3 4
# 4 3
# 2 5
# 1 3
# 3 9
# 3 3

input_code = """
3 4
4 3
2 5
1 3
3 9
3 3
"""

# Input Parsing number pairs into.
# I actually have to be O(n) so i guess it doesn't matter if i store it in a list or not.
# But let's be nice and do it in one pass
#
# To solve this: We store the inputs in two min heap objects
# We then pop the smallest element from each heap and calculate the distance
# Return the output solution as the sum of the distances


def naive_solution(input_file):
    # Sort input
    left, right = [], []

    with open(input_file, "r") as f:
        input = f.readlines()

    for row in input:
        left_num, right_num = row.split()
        left.append(int(left_num))
        right.append(int(right_num))

    # TO BE DONE: implement sorting
    left.sort()
    right.sort()
    print("sorted", left)
    print("sorted", right)
    # Calculate total distance
    total_distance = 0
    for left_num, right_num in zip(left,right):
        total_distance += abs(left_num - right_num)
    return total_distance

# print(naive_solution("./input.txt"))

def better_solution(input):

# Correct answer: 1660292
