/**
 * @test
 * This file has @test annotation and should be auto-tested
 */

import { assertEquals } from '@std/assert'

function add(a: number, b: number): number {
  return a + b
}

Deno.test('add function works', () => {
  assertEquals(add(1, 2), 3)
})
