#!/usr/bin/env python3

from functools import reduce


input_code = """
7 6 4 2 1
1 2 7 8 9
9 7 6 2 1
1 3 2 4 5
8 6 4 4 1
1 3 6 7 9
"""

def compare(x, y, is_asc=False):
    if (is_asc):
        return x < y
    else:
        return x > y


def check_report(report):
    is_safe = True
    is_asc = True
    asc_count = 0
    desc_count = 0

    for idx in range(0, len(report) - 1):
        current = report[idx]
        nxt = report[idx + 1]

        if not (1<= abs(current - nxt) <= 3):
            is_safe = False
            continue

        if current < nxt:
            asc_count+=1
        else:
            desc_count+=1

        # if idx == 0:
        #     is_asc = current < nxt
        # if not compare(current, nxt, is_asc) :
        #     is_safe = False
        #     continue

    print(asc_count,desc_count)
    return is_safe and (asc_count * desc_count == 0)

def solve(input_file):
    reports = []
    with open(input_file, "r") as f:
        for line in f:
            reports.append(list(map(lambda x : int(x), line.split())))

    safe_reports = 0
    for report in reports:
        is_dampened_pass_safe = False

        is_first_pass_safe = check_report(report)

        # this is  n^2
        if not is_first_pass_safe:
            for idx, el in enumerate(report):
                if(check_report(report[:idx] + report[idx + 1:])):
                    is_dampened_pass_safe = True
                    break

        if (is_first_pass_safe or is_dampened_pass_safe):
            safe_reports += 1

    return safe_reports

print(solve("./input.txt"))
