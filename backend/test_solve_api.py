"""
Direct test for /api/tasks/solve-problem endpoint
"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from os_bridge import os_bridge

def test_solver():
    problems = [
        "Add two numbers: 25 and 35.",
        "Calculate the factorial of 5.",
        "Find whether 17 is a prime number.",
        "Find the largest number among 10, 25, and 15.",
        "Calculate the average of 10, 20, and 30."
    ]

    for p in problems:
        res = os_bridge.solve_problem(p)
        assert res["success"] is True, f"Failed for {p}"
        assert res["status"] == "SUCCESS", f"Status not SUCCESS for {p}"
        print(f"[TEST PASS] Problem: '{p}' -> Final Answer: '{res['final_answer']}'")
        print(f"            Output: {res['execution_output']}, Time: {res['execution_time_ms']}ms")

    # Check task record
    tasks = os_bridge.get_tasks()
    assert len(tasks) >= 5
    print(f"[TEST PASS] Successfully recorded {len(tasks)} tasks in simulation state.")

if __name__ == "__main__":
    test_solver()

