export module Fullscreen
{
    export const enabled = () => document.fullscreenEnabled ?? (document as any).webkitFullscreenEnabled;
    export const element = () => (document.fullscreenElement ?? ((document as any).webkitFullscreenElement) ?? null);
    export const request = async (element: Element = document.documentElement) =>
    {
        if (element.requestFullscreen)
        {
            await element.requestFullscreen();
        }
        else
        if ((element as any).webkitRequestFullscreen)
        {
            await ((element as any).webkitRequestFullscreen)();
        }
        if ( ! document.body.classList.contains("sleep-mouse"))
        {
            document.body.classList.add("sleep-mouse");
        }
    };
    export const exit = async () =>
    {
        if (document.exitFullscreen)
        {
            await document.exitFullscreen();
        }
        else
        if ((document as any).webkitCancelFullScreen)
        {
            await ((document as any).webkitCancelFullScreen)();
        }
        if (document.body.classList.contains("sleep-mouse"))
        {
            document.body.classList.remove("sleep-mouse");
        }
    };
}
