import { stripHtml } from './sanitize';

describe('stripHtml', () => {
  it('should strip HTML tags', () => {
    expect(stripHtml('<script>alert("xss")</script>Hello')).toBe('Hello');
  });

  it('should strip inline tags', () => {
    expect(stripHtml('<b>bold</b> text')).toBe('bold text');
  });

  it('should decode HTML entities', () => {
    expect(stripHtml('&lt;div&gt;test&lt;/div&gt;')).toBe('<div>test</div>');
  });

  it('should preserve plain text', () => {
    expect(stripHtml('Hello from Abuja!')).toBe('Hello from Abuja!');
  });

  it('should preserve emojis and unicode', () => {
    expect(stripHtml('Hello 🌍 from Abuja!')).toBe('Hello 🌍 from Abuja!');
    expect(stripHtml('Ẽmoji tëst 日本語')).toBe('Ẽmoji tëst 日本語');
  });

  it('should trim whitespace', () => {
    expect(stripHtml('  hello  ')).toBe('hello');
  });

  it('should handle empty string', () => {
    expect(stripHtml('')).toBe('');
  });
});
