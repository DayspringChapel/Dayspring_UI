import test from 'node:test';
import assert from 'node:assert/strict';
import { formSections, reorderField, moveField, addSection, validFieldOrder, localDateTime, utcDateTime } from '../lib/formStructure.js';
const q = (key, extra = {}) => ({ key, type: 'text', label: key, ...extra });
const section = (key) => q(key, { type: 'section' });
const keys = (fields) => fields.map((field) => field.key);
test('adding sections retains original questions and provides explicit initial grouping', () => {
    const original = [q('name'), q('email')]; const fields = addSection(original);
    assert.deepEqual(formSections(fields).map((group) => group.fields.length), [2, 0]);
    assert.equal(fields[1], original[0]); assert.equal(fields[2], original[1]);
});
test('dragging a section moves its entire block in both directions', () => {
    const fields = [section('s1'), q('a'), q('b'), section('s2'), q('c'), section('s3'), q('d')];
    assert.deepEqual(keys(reorderField(fields, 's1', 's2')), ['s2', 'c', 's1', 'a', 'b', 's3', 'd']);
    assert.deepEqual(keys(reorderField(fields, 's3', 'a')), ['s3', 'd', 's1', 'a', 'b', 's2', 'c']);
    assert.deepEqual(keys(moveField(fields, 's2', -1)), ['s2', 'c', 's1', 'a', 'b', 's3', 'd']);
});
test('questions can move between sections with buttons or drag handles', () => {
    const fields = [section('s1'), q('a'), section('s2'), q('b')];
    assert.deepEqual(keys(moveField(fields, 'b', -1)), ['s1', 'a', 'b', 's2']);
    assert.deepEqual(keys(reorderField(fields, 'a', 's2')), ['s1', 's2', 'a', 'b']);
});
test('moves preserve conditional dependencies and reject an invalid question or section move', () => {
    const fields = [section('s1'), q('answer'), section('s2'), q('followup', { condition: { field: 'answer', value: 'Yes' } })];
    assert.equal(reorderField(fields, 's2', 's1'), null);
    assert.equal(reorderField(fields, 'answer', 'followup'), null);
    assert.equal(validFieldOrder(fields), true);
    assert.deepEqual(keys(fields), ['s1', 'answer', 's2', 'followup']);
});
test('device-local collection dates round-trip to the original UTC instant', () => {
    const value = '2026-11-03T14:30:00.000Z';
    assert.equal(utcDateTime(localDateTime(value)), value);
    assert.equal(utcDateTime(''), null);
});
