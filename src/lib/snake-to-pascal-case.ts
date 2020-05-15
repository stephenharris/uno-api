export function snakeToPascalCase(snake): number {
    return snake.toLowerCase().split('_').map(ucFirst).join('');
}

function ucFirst(string) {
    return string.charAt(0).toUpperCase() + string.slice(1); 
}
