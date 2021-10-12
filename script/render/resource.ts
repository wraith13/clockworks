import resource from "../../resource/images.json";
export module Resource
{
    export type KeyType = keyof typeof resource;
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
