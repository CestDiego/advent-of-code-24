#/usr/bin/env python3

import math

from celebration import celebrate

# Approach to use for the two array of numbers
# Cmd + / to comment out the code

input_code = """
3 4
4 3
2 5
1 3
3 9
3 3
"""

def print_heap(arr):
    """
    Pretty prints an array as a binary heap.
    The heap is printed level by level, with proper spacing to show the tree structure.

    Args:
        arr (list): The array to be printed as a heap

    Example:
        heap = [1, 3, 6, 5, 9, 8]
        print_heap(heap)

        Output:
                1
            3       6
        5       9   8
    """
    if not arr:
        print("Empty heap")
        return

    # Calculate the height of the heap
    height = 0
    size = len(arr)
    while (1 << height) - 1 < size:
        height += 1

    # Calculate the maximum width needed
    max_width = (1 << (height - 1)) * 4

    # Print each level
    level_start = 0
    for h in range(height):
        nodes_in_level = min(1 << h, size - ((1 << h) - 1))
        spacing = max_width // (1 << h)

        # Print leading spaces for this level
        print(" " * (spacing // 2), end="")

        # Print nodes at this level
        for i in range(nodes_in_level):
            if level_start + i < size:
                print(f"{arr[level_start + i]:^{spacing}}", end="")

        print()  # New line after each level
        level_start += nodes_in_level

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

import math
import networkx as nx
import matplotlib.pyplot as plt

class MinHeap:
    def __init__(self):
        self._data = []

    @property
    def size(self):
        return len(self._data)

    def _find_parent_idx(self, child_idx):
        return math.floor((child_idx - 1)/2)

    def _find_left_child_idx(self, parent_idx):
        return (2 * parent_idx) + 1

    def _swap(self, left_idx, right_idx):
        "Swaps the value of the array representation for the heap idx"
        tmp = self._data[left_idx]
        self._data[left_idx] = self._data[right_idx]
        self._data[right_idx] = tmp

    def _sift_up(self, idx):
        if idx == 0:
            # yay we are a heap
            return
        parent_idx = self._find_parent_idx(idx)
        child = self._data[idx]  # 20
        parent = self._data[parent_idx]  # 5
        if parent > child:
            self._swap(idx, parent_idx)
            return self._sift_up(parent_idx)
        else:
            return

    def _sift_down(self, idx):
        current = self._data[idx]

        # AKA left child does not exist within the array
        # So no child exists. We celebrate as the heap
        # invariance has been preserved.
        left_child_idx = self._find_left_child_idx(idx)
        if (not (left_child_idx < len(self._data))):
            return
        # left_child is guaranteed to exists
        left_child = self._data[left_child_idx]

        right_child_idx = left_child_idx + 1
        if (not (right_child_idx < len(self._data))):
            # Left child and no right child
            if left_child < current:
                self._swap(left_child_idx, idx)
            return self._sift_down(left_child_idx)

        # Right child is guaranteed to exists. As well as left child
        right_child = self._data[right_child_idx]

        if (left_child < right_child):
            if (left_child < current):
                self._swap(left_child_idx,idx)
            return self._sift_down(left_child_idx)
        else:
            if (right_child < current):
                self._swap(right_child_idx, idx)
            return self._sift_down(right_child_idx)

    def insert(self, val):
        next_idx = len(self._data)
        self._data.append(val)
        self._sift_up(next_idx)

    def load(self, input_array):
        for i in input_array:
            self.insert(i)
        return self

    def extract(self):
        min = self._data[0]
        # Remove one item from the heap and sift it
        # down to preserve the invariance
        last = self._data.pop()

        # If that pop emptied the array, we donezo
        if (self.size > 0):
            self._data[0] = last
            self._sift_down(0)
        return min

    def delete(self):
        pass

    def peek(self):
        pass

    def visualize(self, figsize=(10, 6)):
        """
        Visualizes the heap as a tree using networkx and matplotlib.

        Args:
            figsize (tuple): Figure size in inches (width, height)
        """
        if not self._data:
            print("Empty Heap")
            return

        # Create a new directed graph
        G = nx.Graph()

        # Add nodes and edges
        for i in range(len(self._data)):
            G.add_node(i, value=self._data[i])

            # Add edges to children if they exist
            left_child = 2 * i + 1
            right_child = 2 * i + 2

            if left_child < len(self._data):
                G.add_edge(i, left_child)
            if right_child < len(self._data):
                G.add_edge(i, right_child)

        # Create the plot
        plt.figure(figsize=figsize)

        # Calculate positions for the tree layout
        pos = {}
        level_width = 1
        level_start = 0

        for level in range(int(math.log2(len(self._data)) + 1)):
            nodes_in_level = min(2**level, len(self._data) - level_start)
            for i in range(nodes_in_level):
                node_idx = level_start + i
                if node_idx >= len(self._data):
                    break
                x = (i + 0.5) / (2**level)
                y = 1 - (level / (math.log2(len(self._data)) + 1))
                pos[node_idx] = (x, y)
            level_start += 2**level

        # Draw the graph
        nx.draw(G, pos,
                labels={node: f"{self._data[node]}" for node in G.nodes()},
                node_color='lightblue',
                node_size=1500,
                font_size=16,
                font_weight='bold',
                width=2,
                edge_color='gray')

        plt.title("Min Heap Visualization", pad=20, size=16)
        plt.axis('off')
        plt.show()

    def __str__(self):
        return str(self._data)


def better_solution(input_file):
    left_heap = MinHeap()
    right_heap = MinHeap()

    with open(input_file, "r") as f:
        for line in f:
            left, right = line.split()
            left_heap.insert(int(left))
            right_heap.insert(int(right))

    total_distance = 0
    while (left_heap.size > 0 and right_heap.size > 0):
        total_distance += abs(left_heap.extract() - right_heap.extract())

    return total_distance

# Correct answer: 1660292
if (better_solution("./input.txt") == 1660292):
    celebrate()
else:
    print("booo")
