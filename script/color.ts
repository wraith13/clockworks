import config from "../resource/config.json";
export module Color
{
    export const getRainbowColor = (index: number, baseIndex = config.rainbowColorSetDefaultIndex) =>
        config.rainbowColorSet[(index +baseIndex) % config.rainbowColorSet.length];
    export const getSolidRainbowColor = (index: number, baseIndex = config.rainbowColorSetDefaultIndex) =>
        getRainbowColor(index *config.rainbowColorSetSolidIndexRate, baseIndex);
    export const toHex = (i : number) : string =>
    {
        let result = Math.round(i).toString(16).toUpperCase();
        if (1 === result.length) {
            result = "0" +result;
        }
        return result;
    };
    export const mixColors = (colorA: string, colorB: string, rate: number) =>
    {
        if (rate <= 0.0)
        {
            return colorA;
        }
        if (1.0 <= rate)
        {
            return colorB;
        }
        const rateA = 1.0 -rate;
        const rateB = rate;
        let r = 0;
        let g = 0;
        let b = 0;
        if (4 === colorA.length)
        {
            r += parseInt(colorA.substr(1,1), 16) *0x11 *rateA;
            g += parseInt(colorA.substr(2,1), 16) *0x11 *rateA;
            b += parseInt(colorA.substr(3,1), 16) *0x11 *rateA;
        }
        if (7 === colorA.length)
        {
            r += parseInt(colorA.substr(1,2), 16) *rateA;
            g += parseInt(colorA.substr(3,2), 16) *rateA;
            b += parseInt(colorA.substr(5,2), 16) *rateA;
        }
        if (4 === colorB.length)
        {
            r += parseInt(colorB.substr(1,1), 16) *0x11 *rateB;
            g += parseInt(colorB.substr(2,1), 16) *0x11 *rateB;
            b += parseInt(colorB.substr(3,1), 16) *0x11 *rateB;
        }
        if (7 === colorB.length)
        {
            r += parseInt(colorB.substr(1,2), 16) *rateB;
            g += parseInt(colorB.substr(3,2), 16) *rateB;
            b += parseInt(colorB.substr(5,2), 16) *rateB;
        }
        const result = "#"
            +toHex(r)
            +toHex(g)
            +toHex(b);
        return result;
    };
}
