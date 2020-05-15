import{mod} from './mod';

describe('mod', () => {
    
    it('it should perform module arithmatic', async () => {
      expect(mod(4, 7)).toEqual(4);
      expect(mod(14, 13)).toEqual(1);
      expect(mod(27, 9)).toEqual(0);
    });

    it('it should return non-negative numbers', async () => {
        expect(mod(-4, 7)).toEqual(3);
        expect(mod(-14, 13)).toEqual(12);
        expect(mod(-27, 9)).toEqual(0);
    });

});