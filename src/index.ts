const world = '🗺️';

console.log(world);

export function hello(word: string = world): string {
    console.log(world);
    return `Hello ${world}! `;
}