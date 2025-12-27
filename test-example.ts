/**
 * @test
 * Test example file with @test annotation
 */

import { assertEquals } from 'jsr:@std/assert'

Deno.test('example test', () => {
  assertEquals(1 + 1, 2)
})

Deno.test('another test', () => {
  assertEquals(2 + 2, 4)
})

Deno.test('third test', () => {
  assertEquals(3 + 3, 6)
})

Deno.test('fourth test', () => {
  assertEquals(4 + 4, 8)
})

Deno.test('fifth test', () => {
  assertEquals(5 + 5, 10)
})

Deno.test('sixth test', () => {
  assertEquals(6 + 6, 12)
})

Deno.test('seventh test', () => {
  assertEquals(7 + 7, 14)
})

Deno.test('failing test', () => {
  assertEquals(2 + 2, 4)
})
