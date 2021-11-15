import resource from "../../resource/images.json";
import tektiteResource from "../../tektite/images.json";
export module Resource
{
    export type KeyType = keyof typeof resource | keyof typeof tektiteResource;
    export const loadSvgOrCache = async (key: KeyType): Promise<SVGElement> =>
    {
        try
        {
            return new DOMParser().parseFromString(document.getElementById(key).innerHTML, "image/svg+xml").documentElement as any;
        }
        catch(error)
        {
            console.log({key});
            throw error;
        }
    };
}
