import resource from "../../resource/images.json";
import tektiteResource from "../../tektite.js/images.json";
export module Resource
{
    export type KeyType = keyof typeof resource | keyof typeof tektiteResource;
    export const loadIconOrCache = async (key: KeyType): Promise<SVGElement> => await loadSvgOrCache("tektite-icon", key);
    export const loadSvgOrCache = async (className: string, key: KeyType): Promise<SVGElement> =>
    {
        const sourceDiv = document.getElementById(key) as HTMLDivElement;
        if ( ! sourceDiv)
        {
            throw new Error(`resource: "${key}" svg is not found!`);
        }
        const result: SVGElement = new DOMParser().parseFromString(sourceDiv.innerHTML ?? "", "image/svg+xml").documentElement as any;
        result.classList.add(className);
        return result;
    };
}
