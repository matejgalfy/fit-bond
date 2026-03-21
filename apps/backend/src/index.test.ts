import { test, expect, describe } from 'bun:test';

describe('Backend API', () => {
    test('should be defined', () => {
        expect(true).toBe(true);
    });

    test('basic arithmetic', () => {
        expect(1 + 1).toBe(2);
        expect(5 - 2).toBe(3);
        expect(3 * 4).toBe(12);
        expect(10 / 2).toBe(5);
    });

    test('string operations', () => {
        const greeting = 'Hello Bun!';
        expect(greeting).toBe('Hello Bun!');
        expect(greeting.length).toBe(10);
        expect(greeting.includes('Bun')).toBe(true);
    });

    test('array operations', () => {
        const numbers = [1, 2, 3, 4, 5];
        expect(numbers.length).toBe(5);
        expect(numbers[0]).toBe(1);
        expect(numbers.includes(3)).toBe(true);
    });

    test('object operations', () => {
        const user = { name: 'Bun User', age: 25 };
        expect(user.name).toBe('Bun User');
        expect(user.age).toBe(25);
        expect(Object.keys(user)).toEqual(['name', 'age']);
    });
});
