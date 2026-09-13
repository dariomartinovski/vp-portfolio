import { TestBed } from '@angular/core/testing';
import { TruncatePipe } from './truncate.pipe';

describe('TruncatePipe', () => {
  let pipe: TruncatePipe;

  beforeEach(() => {
    pipe = new TruncatePipe();
  });

  it('creates the pipe', () => {
    expect(pipe).toBeTruthy();
  });

  it('returns short values untouched', () => {
    expect(pipe.transform('hello', 10)).toBe('hello');
  });

  it('returns a value exactly at the limit untouched', () => {
    expect(pipe.transform('12345', 5)).toBe('12345');
  });

  it('truncates and appends the trail', () => {
    expect(pipe.transform('1234567890', 5)).toBe('12345...');
  });

  it('defaults to a limit of 100', () => {
    const at100 = 'x'.repeat(100);
    expect(pipe.transform(at100)).toBe(at100);
    expect(pipe.transform(at100 + 'y')).toBe(at100 + '...');
  });

  it('honours a custom trail', () => {
    expect(pipe.transform('1234567890', 5, ' […]')).toBe('12345 […]');
  });

  it('trims trailing whitespace introduced by the cut', () => {
    expect(pipe.transform('one two three', 8)).toBe('one two...');
  });

  it('coerces empty and nullish input to an empty string', () => {
    expect(pipe.transform('')).toBe('');
    expect(pipe.transform(undefined as unknown as string)).toBe('');
    expect(pipe.transform(null as unknown as string)).toBe('');
  });

  it('is registered in the TestBed injector as a non-standalone pipe', async () => {
    await TestBed.configureTestingModule({ declarations: [TruncatePipe] }).compileComponents();

    expect(TestBed.inject(TruncatePipe, null)).toBeNull();
  });
});
