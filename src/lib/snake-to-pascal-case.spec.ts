import { snakeToPascalCase } from "./snake-to-pascal-case";


describe('snake-to-camel-case', () => {
    
    it('it should convert snake_case to camelCase', async () => {
      expect(snakeToPascalCase('snake_case')).toEqual("SnakeCase");
      expect(snakeToPascalCase('SNAKE_CASE')).toEqual("SnakeCase");
      expect(snakeToPascalCase('SNAKE')).toEqual("Snake");
    });

});