#!/usr/bin/env python3
import re

def main(input_file):
    solution = 0
    multiplications =[]
    with open(input_file, "r") as f:
        for line in f:
            multiplications += re.findall(r"mul\((\d+),(\d+)\)", line)

    for a,b in multiplications:
        if len(a) > 3 or len(b) > 3:
            continue
        solution += int(a) * int(b)

    return solution

def main_part_2(input_file):
    solution = 0
    with open(input_file, "r") as f:
        enabled = True
        for line in f:
            matches = re.finditer(r"mul\((\d+),(\d+)\)|don't\(\)|do\(\)", line)
            for match in matches:
                operation = match.string[match.start():match.end()]
                if 'mul' in operation:
                    a, b = match.groups()
                    if len(a) > 3 or len(b) > 3 or not enabled:
                        continue
                    solution += int(a) * int(b)
                elif "don't" in operation:
                    enabled = False
                elif "do" in operation:
                    enabled = True


    return solution

main_part_2("./input.txt")
