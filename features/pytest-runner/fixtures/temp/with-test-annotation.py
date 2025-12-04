# @test
# This file has @test annotation and should be auto-tested

def add(a, b):
    return a + b

def test_add():
    assert add(1, 2) == 3
