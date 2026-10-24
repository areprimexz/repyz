import { describe, expect, it } from 'vitest';
import { analyzeWriting, countSentences, countWords, findLinkingWords, splitParagraphs } from './writing';
import { getPrompt } from '../content';

describe('countWords', () => {
  it('counts words and ignores stray punctuation', () => {
    expect(countWords('')).toBe(0);
    expect(countWords('   \n  ')).toBe(0);
    expect(countWords('Hello world')).toBe(2);
    expect(countWords("I'm  happy — really happy!")).toBe(4);
    expect(countWords('A well-known fact, 7.30 a.m.')).toBe(5);
    expect(countWords('Line one\nline two\n\nline three')).toBe(6);
  });
});

describe('sentences and paragraphs', () => {
  it('counts sentences ending in . ! or ?', () => {
    expect(countSentences('Hi Aina,\nThanks! How are you? I am fine.')).toBe(3);
    expect(countSentences('No punctuation here')).toBe(0);
  });

  it('splits paragraphs on blank lines, falling back to single lines', () => {
    expect(splitParagraphs('One.\n\nTwo.\n\n\nThree.')).toHaveLength(3);
    expect(splitParagraphs('Dear Sir,\nI am writing.\nYours sincerely,')).toHaveLength(3);
    expect(splitParagraphs('Just one paragraph.')).toHaveLength(1);
    expect(splitParagraphs('')).toHaveLength(0);
  });
});

describe('analyzeWriting', () => {
  const emailPrompt = getPrompt('email-hobby')!;

  it('detects an empty response', () => {
    const a = analyzeWriting('   ', emailPrompt);
    expect(a.empty).toBe(true);
    expect(a.issues[0].id).toBe('empty');
  });

  it('flags formatting and capitalisation issues', () => {
    const a = analyzeWriting('hi danial,\n\ni think  you should try cycling.it is fun . best wishes', emailPrompt);
    const ids = a.issues.map((i) => i.id);
    expect(ids).toContain('lowercase-i');
    expect(ids).toContain('double-space');
    expect(ids).toContain('space-before-punct');
    expect(ids).toContain('missing-space');
    expect(ids).toContain('lowercase-start');
    expect(ids).toContain('too-short');
  });

  it('checks email greeting and sign-off', () => {
    const missing = analyzeWriting('I recommend cycling because it is fun and you need a bike to start.', emailPrompt);
    expect(missing.issues.map((i) => i.id)).toEqual(expect.arrayContaining(['no-greeting', 'no-sign-off']));
    const ok = analyzeWriting('Hi Danial,\n\nI recommend cycling.\n\nBest wishes,\nAmir', emailPrompt);
    expect(ok.issues.map((i) => i.id)).not.toContain('no-greeting');
    expect(ok.issues.map((i) => i.id)).not.toContain('no-sign-off');
  });

  it('reports common error patterns only as possibilities and respects exceptions', () => {
    const a = analyzeWriting('I am agree with you. She have a cat. Does he have a dog? They was late.');
    const ids = a.issues.map((i) => i.id);
    expect(ids).toContain('pattern-am-agree');
    expect(ids).toContain('pattern-plural-was');
    const heHave = a.issues.find((i) => i.id === 'pattern-he-have');
    expect(heHave?.examples).toHaveLength(1);
    expect(heHave?.title).toMatch(/Mungkin/);
    const clean = analyzeWriting('Does she have a pet? He will have time later.');
    expect(clean.issues.map((i) => i.id)).not.toContain('pattern-he-have');
  });

  it('gives hint-level detection for required points', () => {
    const a = analyzeWriting('Hi,\n\nI recommend chess because you enjoy puzzles.\n\nBest wishes,\nA', emailPrompt);
    const detected = Object.fromEntries(a.points.map((p) => [p.id, p.detected]));
    expect(detected.p1).toBe(true);
    expect(detected.p2).toBe(true);
    expect(detected.p3).toBe(false);
  });

  it('finds linking words as whole phrases', () => {
    expect(findLinkingWords('However, I agree. For example, cats. In conclusion, yes.')).toEqual(['for example', 'however', 'in conclusion']);
    expect(findLinkingWords('Thusly')).toEqual([]);
  });

  it('does not flag a well-formed model answer for basic structure', () => {
    for (const id of ['email-trip', 'essay-reading', 'essay-technology']) {
      const p = getPrompt(id)!;
      const a = analyzeWriting(p.modelAnswer, p);
      const structural = a.issues.filter((i) => i.severity === 'warning');
      expect(structural, `${id}: ${structural.map((i) => i.id).join(',')}`).toHaveLength(0);
    }
  });
});
